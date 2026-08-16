import { wizardSpellsFor } from "../data/wizard-spells.js";
import { validateWizardSelections, wizardPickerLimits } from "../rules/wizard.js";

const LABELS={cantrips:"Cantrips",spellbook:"Spellbook",prepared:"Prepared"};
const subclassId=state=>state.constraints.subclass==="random"?null:state.constraints.subclass;
const profile=state=>({ruleset:state.ruleset,level:Number(state.constraints.level),subclassId:subclassId(state)});

export function bindSpellPicker(state,showToast){
  try{
    const button=document.getElementById("openSpellPicker"),dialog=document.getElementById("spellDialog");
    button.addEventListener("click",()=>{try{renderPicker(state);dialog.showModal();}catch(error){showToast(error.message,true);}});
    document.getElementById("closeSpellPicker").addEventListener("click",()=>dialog.close());document.getElementById("doneSpellPicker").addEventListener("click",()=>dialog.close());document.getElementById("spellSearch").addEventListener("input",filterPicker);
    dialog.addEventListener("change",event=>{
      const input=event.target.closest("input[data-spell-id]");if(!input)return;
      const bucket=input.dataset.bucket,id=input.dataset.spellId,previous=new Set(state.spellSelections[bucket]),next=new Set(previous);input.checked?next.add(id):next.delete(id);
      const proposed={...state.spellSelections,[bucket]:[...next]};
      try{validateWizardSelections({...profile(state),selections:proposed});state.spellSelections=proposed;renderPicker(state);}
      catch(error){input.checked=previous.has(id);console.error("[spell-picker] choice blocked",error);showToast(error.message,true);}
    });
    ["class","level","ruleset","subclass"].forEach(id=>document.getElementById(id).addEventListener("change",()=>{state.spellSelections={cantrips:[],spellbook:[],prepared:[]};refreshSpellPicker(state);}));refreshSpellPicker(state);
  }catch(error){console.error("[spell-picker] bind failed",error);throw error;}
}
export function refreshSpellPicker(state){
  try{
    const panel=document.getElementById("spellPickerPanel"),button=document.getElementById("openSpellPicker"),wizard=state.constraints.class==="wizard";panel.hidden=!wizard;if(!wizard)return;
    const hasLevel=state.constraints.level!=="random";button.disabled=!hasLevel;button.textContent=hasLevel?"Choose spells":"Select level first";
    document.getElementById("spellPickerHint").textContent=hasLevel?"Choose only what matters. Illegal or excessive choices are blocked immediately.":"Leave Level on Random for a fully randomized spell loadout, or choose a level to pick specific spells.";updateSummary(state);
  }catch(error){console.error("[spell-picker] refresh failed",error);throw error;}
}
function renderPicker(state){
  try{
    if(state.constraints.class!=="wizard"||state.constraints.level==="random")throw new Error("Choose Wizard and a specific level before selecting spells.");
    const level=Number(state.constraints.level),maxLevel=Math.ceil(level/2),spells=wizardSpellsFor(state.ruleset).filter(spell=>spell.level===0||spell.level<=maxLevel),limits=wizardPickerLimits(profile(state));
    document.getElementById("spellPickerLists").innerHTML=Object.keys(LABELS).map(bucket=>section(bucket,spells,state,limits)).join("");document.getElementById("spellSearch").value="";updateSummary(state);
  }catch(error){console.error("[spell-picker] render failed",error);throw error;}
}
function section(bucket,spells,state,limits){
  try{
    const pool=bucket==="cantrips"?spells.filter(spell=>spell.level===0):spells.filter(spell=>spell.level>0),selected=new Set(state.spellSelections[bucket]),limit=limits[bucket],limitText=limit===null?"INT-based limit":`${selected.size} / ${limit} fixed`;
    return `<section class="spell-bucket"><div class="spell-bucket-head"><h3>${LABELS[bucket]}</h3><span>${limitText} · rest Random</span></div><div class="spell-list">${pool.map(spell=>`<label class="spell-option" data-search="${spell.name.toLowerCase()}"><input type="checkbox" data-spell-id="${spell.id}" data-bucket="${bucket}" ${selected.has(spell.id)?"checked":""}><span><strong>${spell.name}</strong><small>${spell.level===0?"Cantrip":`Level ${spell.level}`}${spell.school?` · ${spell.school}`:""}</small></span></label>`).join("")}</div></section>`;
  }catch(error){console.error(`[spell-picker] ${bucket} section failed`,error);throw error;}
}
function filterPicker(){try{const query=document.getElementById("spellSearch").value.trim().toLowerCase();document.querySelectorAll(".spell-option").forEach(option=>option.hidden=!!query&&!option.dataset.search.includes(query));}catch(error){console.error("[spell-picker] filter failed",error);throw error;}}
function updateSummary(state){
  try{
    const total=Object.values(state.spellSelections).reduce((sum,values)=>sum+values.length,0),text=total?`${total} choice${total===1?"":"s"} fixed · Forge fills every remaining legal slot`:"All spell choices Random";
    for(const id of ["spellChoiceSummary","spellDialogSummary"]){const node=document.getElementById(id);if(node)node.textContent=text;}
  }catch(error){console.error("[spell-picker] summary failed",error);throw error;}
}
