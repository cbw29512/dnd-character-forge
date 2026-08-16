import { wizardSpellsFor } from "../data/wizard-spells.js";

const LABELS={cantrips:"Cantrips",spellbook:"Spellbook",prepared:"Prepared"};

export function bindSpellPicker(state,showToast){
  try{
    const button=document.getElementById("openSpellPicker"),dialog=document.getElementById("spellDialog");
    button.addEventListener("click",()=>{try{renderPicker(state);dialog.showModal();}catch(error){showToast(error.message,true);}});
    document.getElementById("closeSpellPicker").addEventListener("click",()=>dialog.close());
    document.getElementById("doneSpellPicker").addEventListener("click",()=>dialog.close());
    document.getElementById("spellSearch").addEventListener("input",filterPicker);
    dialog.addEventListener("change",event=>{
      try{
        const input=event.target.closest("input[data-spell-id]");if(!input)return;
        const bucket=input.dataset.bucket,id=input.dataset.spellId,current=new Set(state.spellSelections[bucket]);
        input.checked?current.add(id):current.delete(id);state.spellSelections[bucket]=[...current];updateSummary(state);
      }catch(error){console.error("[spell-picker] choice failed",error);showToast(error.message,true);}
    });
    ["class","level","ruleset"].forEach(id=>document.getElementById(id).addEventListener("change",()=>{state.spellSelections={cantrips:[],spellbook:[],prepared:[]};refreshSpellPicker(state);}));
    refreshSpellPicker(state);
  }catch(error){console.error("[spell-picker] bind failed",error);throw error;}
}
export function refreshSpellPicker(state){
  try{
    const panel=document.getElementById("spellPickerPanel"),button=document.getElementById("openSpellPicker"),wizard=state.constraints.class==="wizard";panel.hidden=!wizard;if(!wizard)return;
    const hasLevel=state.constraints.level!=="random";button.disabled=!hasLevel;button.textContent=hasLevel?"Choose spells":"Select level first";
    document.getElementById("spellPickerHint").textContent=hasLevel?"Pick any spells you want. Forge randomizes every remaining legal choice.":"Leave Level on Random for a fully randomized spell loadout, or choose a level to pick specific spells.";updateSummary(state);
  }catch(error){console.error("[spell-picker] refresh failed",error);throw error;}
}
function renderPicker(state){
  try{
    if(state.constraints.class!=="wizard"||state.constraints.level==="random")throw new Error("Choose Wizard and a specific level before selecting spells.");
    const level=Number(state.constraints.level),maxLevel=Math.ceil(level/2),spells=wizardSpellsFor(state.ruleset).filter(spell=>spell.level===0||spell.level<=maxLevel);
    document.getElementById("spellPickerLists").innerHTML=Object.keys(LABELS).map(bucket=>section(bucket,spells,state)).join("");document.getElementById("spellSearch").value="";updateSummary(state);
  }catch(error){console.error("[spell-picker] render failed",error);throw error;}
}
function section(bucket,spells,state){
  try{
    const pool=bucket==="cantrips"?spells.filter(spell=>spell.level===0):spells.filter(spell=>spell.level>0),selected=new Set(state.spellSelections[bucket]);
    return `<section class="spell-bucket"><div class="spell-bucket-head"><h3>${LABELS[bucket]}</h3><span>${selected.size} fixed · rest Random</span></div><div class="spell-list">${pool.map(spell=>`<label class="spell-option" data-search="${spell.name.toLowerCase()}"><input type="checkbox" data-spell-id="${spell.id}" data-bucket="${bucket}" ${selected.has(spell.id)?"checked":""}><span><strong>${spell.name}</strong><small>${spell.level===0?"Cantrip":`Level ${spell.level}`}${spell.school?` · ${spell.school}`:""}</small></span></label>`).join("")}</div></section>`;
  }catch(error){console.error(`[spell-picker] ${bucket} section failed`,error);throw error;}
}
function filterPicker(){
  try{const query=document.getElementById("spellSearch").value.trim().toLowerCase();document.querySelectorAll(".spell-option").forEach(option=>option.hidden=!!query&&!option.dataset.search.includes(query));}
  catch(error){console.error("[spell-picker] filter failed",error);throw error;}
}
function updateSummary(state){
  try{
    const total=Object.values(state.spellSelections).reduce((sum,values)=>sum+values.length,0),text=total?`${total} spell choice${total===1?"":"s"} fixed · all remaining choices Random`:"All spell choices Random";
    for(const id of ["spellChoiceSummary","spellDialogSummary"]){const node=document.getElementById(id);if(node)node.textContent=text;}
  }catch(error){console.error("[spell-picker] summary failed",error);throw error;}
}
