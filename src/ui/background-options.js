import { FORGE_2024 } from "../data/forge-data.js";
import { magicInitiateCatalog } from "../rules/magic-initiate.js";
import { sanitizeClassSelectionsForBackgroundChange } from "./class-background-transition.js";

const SPELL_ABILITIES=[{id:"int",name:"Intelligence"},{id:"wis",name:"Wisdom"},{id:"cha",name:"Charisma"}];

export function bindBackgroundOptions(state){
  try{
    const panel=document.getElementById("backgroundChoicePanel");if(!panel)throw new Error("Background options panel is missing.");
    panel.addEventListener("change",event=>{
      try{const select=event.target.closest("[data-background-choice]");if(!select)return;const key=select.dataset.backgroundChoice,value=select.value;if(value==="random")delete state.backgroundSelections[key];else state.backgroundSelections[key]=value;if(key==="cantrip1"&&value===state.backgroundSelections.cantrip2)delete state.backgroundSelections.cantrip2;if(key==="cantrip2"&&value===state.backgroundSelections.cantrip1)delete state.backgroundSelections.cantrip1;renderBackgroundOptions(state);}catch(error){console.error("[background-ui] change failed",error);throw error;}
    });
    renderBackgroundOptions(state);
  }catch(error){console.error("[background-ui] bind failed",error);throw error;}
}
export function resetBackgroundOptions(state){try{state.backgroundSelections={};sanitizeClassSelectionsForBackgroundChange(state);renderBackgroundOptions(state);}catch(error){console.error("[background-ui] reset failed",error);throw error;}}
export function renderBackgroundOptions(state){
  try{
    const panel=document.getElementById("backgroundChoicePanel"),fieldsNode=document.getElementById("backgroundChoiceFields"),summary=document.getElementById("backgroundChoiceSummary");if(!panel||!fieldsNode||!summary)throw new Error("Background option UI is incomplete.");
    const background=state.ruleset==="2024"?FORGE_2024.backgrounds.find(item=>item.id===state.constraints.background):null,fields=fieldsFor(background,state.backgroundSelections||{});panel.hidden=fields.length===0;fieldsNode.innerHTML=fields.map(field=>fieldHtml(field,state.backgroundSelections||{})).join("");summary.textContent=fields.length?summaryText(background,fields,state.backgroundSelections||{}):"";
  }catch(error){console.error("[background-ui] render failed",error);throw error;}
}
function fieldsFor(background,selections){
  try{
    if(!background)return[];
    if(background.magicInitiateList){
      const catalog=magicInitiateCatalog(background.magicInitiateList),cantrips=catalog.filter(spell=>spell.level===0),level1=catalog.filter(spell=>spell.level===1),first=cantrips.filter(spell=>spell.id!==selections.cantrip2),second=cantrips.filter(spell=>spell.id!==selections.cantrip1);
      return[{key:"spellcastingAbility",label:"Magic Initiate ability",options:SPELL_ABILITIES},{key:"cantrip1",label:"Cantrip 1",options:first},{key:"cantrip2",label:"Cantrip 2",options:second},{key:"level1Spell",label:"Level-1 spell",options:level1}];
    }
    if(background.toolChoices?.length)return[{key:"gamingSet",label:"Gaming Set",options:background.toolChoices.map(value=>({id:value,name:value}))}];
    return[];
  }catch(error){console.error("[background-ui] field definition failed",error);throw error;}
}
function fieldHtml(field,selections){try{const value=selections[field.key]||"random",options=[`<option value="random">Random</option>`,...field.options.map(option=>`<option value="${escapeHtml(option.id)}"${value===option.id?" selected":""}>${escapeHtml(option.name)}</option>`)].join("");return `<label class="background-choice-field">${escapeHtml(field.label)}<select data-background-choice="${escapeHtml(field.key)}">${options}</select></label>`;}catch(error){console.error(`[background-ui] ${field.key} field failed`,error);throw error;}}
function summaryText(background,fields,selections){try{const fixed=fields.filter(field=>selections[field.key]).length,source=background?.contentKind==="forge-original"?"Forge Original · 5E Compatible":"SRD";return fixed?`${source} · ${fixed} background option${fixed===1?"":"s"} fixed · every other background choice stays Random`:`${source} · all background choices Random`;}catch(error){console.error("[background-ui] summary failed",error);throw error;}}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}
