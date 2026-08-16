import { loadPregens, removePregen } from "../library/local-library.js";

const escapeHtml=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
let callbacks={};

export function bindPregenLibrary(options={}){
  try{
    callbacks=options;["pregenSearch","pregenRuleset","pregenSource"].forEach(id=>document.getElementById(id)?.addEventListener("input",renderPregenLibrary));
    document.getElementById("pregenGrid")?.addEventListener("click",event=>{
      try{
        const view=event.target.closest("[data-view-pregen]"),remove=event.target.closest("[data-remove-pregen]");
        if(view){const entry=loadPregens().find(item=>item.id===view.dataset.viewPregen);if(!entry)throw new Error("Saved pregen was not found.");callbacks.onView?.(entry);return;}
        if(remove){removePregen(remove.dataset.removePregen);renderPregenLibrary();callbacks.showToast?.("Pregen removed.");}
      }catch(error){console.error("[library-ui] action failed",error);callbacks.showToast?.(error.message,true);}
    });renderPregenLibrary();
  }catch(error){console.error("[library-ui] bind failed",error);throw error;}
}
export function renderPregenLibrary(){
  try{
    const search=document.getElementById("pregenSearch")?.value.trim().toLowerCase()||"",ruleset=document.getElementById("pregenRuleset")?.value||"all",source=document.getElementById("pregenSource")?.value||"all";
    const items=loadPregens().filter(item=>{const haystack=`${item.name} ${item.className} ${item.speciesName} ${item.backgroundName}`.toLowerCase();return(!search||haystack.includes(search))&&(ruleset==="all"||item.ruleset===ruleset)&&(source==="all"||item.sourceMode===source);});
    const grid=document.getElementById("pregenGrid"),count=document.getElementById("pregenCount");if(count)count.textContent=`${items.length} saved`;if(!grid)return;
    grid.innerHTML=items.length?items.map(card).join(""):`<div class="library-empty"><span>✦</span><h3>No matching pregens yet</h3><p>Forge a character, then choose <strong>Save to Pregens</strong>. Exact mechanical duplicates are blocked automatically.</p></div>`;
  }catch(error){console.error("[library-ui] render failed",error);throw error;}
}
function card(item){
  try{
    const raw=item.sourceMode==="RAW";return `<article class="library-card"><div class="library-card-top"><span class="library-badge ${raw?"raw":"hb"}">${raw?"✓ RAW":"HB"}</span><span class="library-level">Level ${item.level}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.speciesName)} ${escapeHtml(item.className)} · ${escapeHtml(item.backgroundName)}</p><div class="library-meta"><span>${escapeHtml(item.ruleset)}</span><span>Fingerprint ${item.fingerprint.slice(0,8)}</span></div><div class="library-actions"><button class="library-open" type="button" data-view-pregen="${item.id}">Open character</button><button class="library-remove" type="button" data-remove-pregen="${item.id}">Remove</button></div></article>`;
  }catch(error){console.error("[library-ui] card failed",error);throw error;}
}
