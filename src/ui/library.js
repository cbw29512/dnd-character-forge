import { loadPregens, removePregen } from "../library/local-library.js";
import { registeredSystems, systemFor } from "../systems/registry.js";
import "../systems/dnd.js";

const escapeHtml=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
let callbacks={};

export function bindPregenLibrary(options={}){
  try{
    callbacks=options;
    for(const id of ["pregenSearch","pregenSystem","pregenRuleset","pregenClass","pregenLevel"]){
      const element=document.getElementById(id);if(element){element.addEventListener("input",renderPregenLibrary);element.addEventListener("change",renderPregenLibrary);}
    }
    document.getElementById("pregenGrid")?.addEventListener("click",event=>{
      try{
        const view=event.target.closest("[data-view-pregen]"),remove=event.target.closest("[data-remove-pregen]");
        if(view){const entry=loadPregens().find(item=>item.id===view.dataset.viewPregen);if(!entry)throw new Error("Saved pregen was not found.");if(entry.sourceMode!=="RAW"||entry.character?.homebrew?.length)throw new Error("Production Character Forge opens RAW pregens only.");callbacks.onView?.(entry);return;}
        if(remove){removePregen(remove.dataset.removePregen);renderPregenLibrary();callbacks.showToast?.("Pregen removed.");}
      }catch(error){console.error("[library-ui] action failed",error);callbacks.showToast?.(error.message,true);}
    });
    renderPregenLibrary();
  }catch(error){console.error("[library-ui] bind failed",error);throw error;}
}

export function renderPregenLibrary(){
  try{
    const all=loadPregens().filter(isProductionPregen);
    syncFilterOptions(all);
    const filters=readFilters();
    const items=all.filter(item=>matches(item,filters));
    const grid=document.getElementById("pregenGrid"),count=document.getElementById("pregenCount");
    if(count)count.textContent=items.length===all.length?`${all.length} RAW saved`:`${items.length} matching · ${all.length} saved`;
    if(!grid)return;
    grid.innerHTML=items.length?items.map(card).join(""):`<div class="library-empty"><span>✦</span><h3>No matching RAW pregens</h3><p>Change a filter, or forge a new character and choose <strong>Save to Pregens</strong>. Mechanical duplicates are blocked automatically.</p></div>`;
  }catch(error){console.error("[library-ui] render failed",error);throw error;}
}

function isProductionPregen(item){return item?.sourceMode==="RAW"&&!item.character?.homebrew?.length;}
function normalizedSystem(item){return item.systemId||item.character?.systemId||"dnd";}
function normalizedClass(item){return item.character?.class?.id||slug(item.className);}

function readFilters(){return{
  search:document.getElementById("pregenSearch")?.value.trim().toLowerCase()||"",
  system:document.getElementById("pregenSystem")?.value||"all",
  ruleset:document.getElementById("pregenRuleset")?.value||"all",
  classId:document.getElementById("pregenClass")?.value||"all",
  level:document.getElementById("pregenLevel")?.value||"all"
};}

function matches(item,filters){
  const character=item.character||{},haystack=[item.name,item.className,item.speciesName,item.backgroundName,character.subclass?.name,character.class?.name,character.species?.name,character.background?.name].filter(Boolean).join(" ").toLowerCase();
  return(!filters.search||haystack.includes(filters.search))
    &&(filters.system==="all"||normalizedSystem(item)===filters.system)
    &&(filters.ruleset==="all"||item.ruleset===filters.ruleset)
    &&(filters.classId==="all"||normalizedClass(item)===filters.classId)
    &&(filters.level==="all"||String(item.level)===filters.level);
}

function syncFilterOptions(items){
  try{
    const systems=new Map(registeredSystems().map(system=>[system.id,system.name]));
    for(const item of items)if(!systems.has(normalizedSystem(item)))systems.set(normalizedSystem(item),normalizedSystem(item));
    setSelectOptions("pregenSystem",[...["all","All systems"]],systems);

    const classes=new Map();for(const item of items)classes.set(normalizedClass(item),item.className||item.character?.class?.name||normalizedClass(item));
    setSelectOptions("pregenClass",["all","All classes"],classes,true);

    const levels=[...new Set(items.map(item=>Number(item.level)).filter(Number.isInteger))].sort((a,b)=>a-b);
    const levelMap=new Map(levels.map(level=>[String(level),`Level ${level}`]));setSelectOptions("pregenLevel",["all","All levels"],levelMap);

    const rulesets=new Map();for(const item of items)rulesets.set(item.ruleset,editionLabel(normalizedSystem(item),item.ruleset));
    setSelectOptions("pregenRuleset",["all","All editions"],rulesets);
  }catch(error){console.error("[library-ui] filter sync failed",error);throw error;}
}

function setSelectOptions(id,allOption,values,sortByLabel=false){
  const element=document.getElementById(id);if(!element)return;const current=element.value||"all",entries=[...values.entries()];if(sortByLabel)entries.sort((a,b)=>a[1].localeCompare(b[1]));
  element.innerHTML=`<option value="${escapeHtml(allOption[0])}">${escapeHtml(allOption[1])}</option>${entries.map(([value,label])=>`<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}`;
  element.value=[...element.options].some(option=>option.value===current)?current:"all";
}

function card(item){
  try{
    const systemId=normalizedSystem(item),systemName=safeSystemName(systemId),edition=editionLabel(systemId,item.ruleset),subclass=item.character?.subclass?.name;
    return `<article class="library-card"><div class="library-card-top"><div class="library-badge-row"><span class="library-badge raw">✓ RAW</span><span class="library-badge system">${escapeHtml(systemName)}</span></div><span class="library-level">Level ${item.level}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.speciesName)} ${escapeHtml(item.className)}${subclass?` · ${escapeHtml(subclass)}`:""}<br>${escapeHtml(item.backgroundName)}</p><div class="library-meta"><span>${escapeHtml(edition)}</span><span>${escapeHtml(item.fingerprint.slice(0,8))}</span></div><div class="library-actions"><button class="library-open" type="button" data-view-pregen="${escapeHtml(item.id)}">Open & play</button><button class="library-remove" type="button" data-remove-pregen="${escapeHtml(item.id)}">Remove</button></div></article>`;
  }catch(error){console.error("[library-ui] card failed",error);throw error;}
}

function safeSystemName(id){try{return systemFor(id).name;}catch{return id;}}
function editionLabel(systemId,ruleset){try{return systemFor(systemId).editions.find(item=>item.id===ruleset)?.label||ruleset;}catch{return ruleset;}}
function slug(value){return String(value||"unknown").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
