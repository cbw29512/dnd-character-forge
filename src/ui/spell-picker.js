import { wizardSpellsFor } from "../data/wizard-spells.js";
import { clericSpellsFor } from "../data/cleric-spells.js";
import { validateWizardSelections, wizardPickerLimits } from "../rules/wizard.js";
import { clericPickerLimits, lifeDomainAlwaysPrepared, validateClericSelections } from "../rules/cleric.js";

const LABELS={cantrips:"Cantrips",spellbook:"Spellbook",prepared:"Prepared"},subclassId=state=>state.constraints.subclass==="random"?null:state.constraints.subclass,profile=state=>({ruleset:state.ruleset,level:Number(state.constraints.level),subclassId:subclassId(state)});
export function bindSpellPicker(state,showToast){
  try{
    const button=document.getElementById("openSpellPicker"),dialog=document.getElementById("spellDialog");button.addEventListener("click",()=>{try{renderPicker(state);dialog.showModal();}catch(error){showToast(error.message,true);}});document.getElementById("closeSpellPicker").addEventListener("click",()=>dialog.close());document.getElementById("doneSpellPicker").addEventListener("click",()=>dialog.close());document.getElementById("spellSearch").addEventListener("input",filterPicker);
    dialog.addEventListener("change",event=>{const input=event.target.closest("input[data-spell-id]");if(!input)return;const bucket=input.dataset.bucket,id=input.dataset.spellId,previous=new Set(state.spellSelections[bucket]),next=new Set(previous);input.checked?next.add(id):next.delete(id);const proposed={...state.spellSelections,[bucket]:[...next]};try{configFor(state).validate(proposed);state.spellSelections=proposed;renderPicker(state);}catch(error){input.checked=previous.has(id);console.error("[spell-picker] choice blocked",error);showToast(error.message,true);}});
    ["class","level","ruleset","subclass"].forEach(id=>document.getElementById(id).addEventListener("change",()=>{state.spellSelections={cantrips:[],spellbook:[],prepared:[]};refreshSpellPicker(state);}));refreshSpellPicker(state);
  }catch(error){console.error("[spell-picker] bind failed",error);throw error;}
}
export function refreshSpellPicker(state){
  try{const panel=document.getElementById("spellPickerPanel"),button=document.getElementById("openSpellPicker"),caster=["wizard","cleric"].includes(state.constraints.class);panel.hidden=!caster;if(!caster)return;const hasLevel=state.constraints.level!=="random";button.disabled=!hasLevel;button.textContent=hasLevel?"Choose spells":"Select level first";document.getElementById("spellPickerHint").textContent=hasLevel?"Choose only what matters. Illegal or excessive choices are blocked immediately.":"Leave Level on Random for a fully randomized spell loadout, or choose a level to pick specific spells.";updateSummary(state);}
  catch(error){console.error("[spell-picker] refresh failed",error);throw error;}
}
function configFor(state){
  try{
    const p=profile(state);if(state.constraints.class==="wizard")return{spells:wizardSpellsFor(state.ruleset),buckets:["cantrips","spellbook","prepared"],limits:wizardPickerLimits(p),dynamicLimit:"INT-based limit",always:new Set(),validate:selections=>validateWizardSelections({...p,selections})};
    if(state.constraints.class==="cleric")return{spells:clericSpellsFor(state.ruleset),buckets:["cantrips","prepared"],limits:clericPickerLimits(p),dynamicLimit:"WIS-based limit",always:new Set(lifeDomainAlwaysPrepared(state.ruleset,p.level)),validate:selections=>validateClericSelections({...p,selections})};
    throw new Error("Choose a supported spellcasting class first.");
  }catch(error){console.error("[spell-picker] config failed",error);throw error;}
}
function renderPicker(state){
  try{if(!["wizard","cleric"].includes(state.constraints.class)||state.constraints.level==="random")throw new Error("Choose a supported spellcasting class and a specific level before selecting spells.");const config=configFor(state),maxLevel=Math.ceil(Number(state.constraints.level)/2),spells=config.spells.filter(spell=>spell.level===0||spell.level<=maxLevel);let html=config.buckets.map(bucket=>section(bucket,spells,state,config)).join("");if(config.always.size)html+=alwaysSection(spells,config.always);document.getElementById("spellPickerLists").innerHTML=html;document.getElementById("spellSearch").value="";updateSummary(state);}
  catch(error){console.error("[spell-picker] render failed",error);throw error;}
}
function section(bucket,spells,state,config){
  try{let pool=bucket==="cantrips"?spells.filter(spell=>spell.level===0):spells.filter(spell=>spell.level>0);if(bucket==="prepared"&&config.always.size)pool=pool.filter(spell=>!config.always.has(spell.id));const selected=new Set(state.spellSelections[bucket]),limit=config.limits[bucket],special=state.constraints.class==="cleric"&&bucket==="cantrips"&&state.ruleset==="2024"?" max · 4th forces Thaumaturge":"",limitText=limit===null?config.dynamicLimit:`${selected.size} / ${limit}${special}`;return `<section class="spell-bucket"><div class="spell-bucket-head"><h3>${LABELS[bucket]}</h3><span>${limitText} · rest Random</span></div><div class="spell-list">${pool.map(spell=>spellOption(spell,bucket,selected)).join("")}</div></section>`;}
  catch(error){console.error(`[spell-picker] ${bucket} section failed`,error);throw error;}
}
function spellOption(spell,bucket,selected){return `<label class="spell-option" data-search="${spell.name.toLowerCase()}"><input type="checkbox" data-spell-id="${spell.id}" data-bucket="${bucket}" ${selected.has(spell.id)?"checked":""}><span><strong>${spell.name}</strong><small>${spell.level===0?"Cantrip":`Level ${spell.level}`}${spell.school?` · ${spell.school}`:""}</small></span></label>`;}
function alwaysSection(spells,always){const values=spells.filter(spell=>always.has(spell.id));return `<section class="spell-bucket"><div class="spell-bucket-head"><h3>Always Prepared</h3><span>Life Domain · does not use prepared slots</span></div><div class="spell-list">${values.map(spell=>`<div class="spell-option is-fixed"><span><strong>${spell.name}</strong><small>Level ${spell.level}</small></span></div>`).join("")}</div></section>`;}
function filterPicker(){try{const query=document.getElementById("spellSearch").value.trim().toLowerCase();document.querySelectorAll(".spell-option").forEach(option=>option.hidden=!!query&&!option.dataset.search?.includes(query)&&!option.textContent.toLowerCase().includes(query));}catch(error){console.error("[spell-picker] filter failed",error);throw error;}}
function updateSummary(state){try{const total=Object.values(state.spellSelections).reduce((sum,values)=>sum+values.length,0),text=total?`${total} choice${total===1?"":"s"} fixed · Forge fills every remaining legal slot`:"All spell choices Random";for(const id of ["spellChoiceSummary","spellDialogSummary"]){const node=document.getElementById(id);if(node)node.textContent=text;}}catch(error){console.error("[spell-picker] summary failed",error);throw error;}}
