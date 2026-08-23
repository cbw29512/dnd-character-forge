import { validateClericClassSelections } from "../rules/cleric.js";

const DIVINE_ORDERS=[{id:"protector",name:"Protector"},{id:"thaumaturge",name:"Thaumaturge"}];
const BLESSED_STRIKES=[{id:"divine-strike",name:"Divine Strike"},{id:"potent-spellcasting",name:"Potent Spellcasting"}];

export function bindClassOptions(state,onChange=()=>{}){
  try{
    const panel=document.getElementById("classChoicePanel");if(!panel)throw new Error("Class options panel is missing.");
    panel.addEventListener("change",event=>{
      try{
        const select=event.target.closest("[data-class-choice]");if(!select)return;const key=select.dataset.classChoice,previous={...(state.classSelections||{})},proposed={...previous};if(select.value==="random")delete proposed[key];else proposed[key]=select.value;
        validateClericClassSelections({ruleset:state.ruleset,level:resolvedLevel(state),selections:proposed,spellSelections:state.spellSelections||{}});state.classSelections=proposed;renderClassOptions(state);onChange();
      }catch(error){console.error("[class-ui] change blocked",error);renderClassOptions(state);throw error;}
    });
    renderClassOptions(state);
  }catch(error){console.error("[class-ui] bind failed",error);throw error;}
}
export function resetClassOptions(state){try{state.classSelections={};renderClassOptions(state);}catch(error){console.error("[class-ui] reset failed",error);throw error;}}
export function renderClassOptions(state){
  try{
    const panel=document.getElementById("classChoicePanel"),fieldsNode=document.getElementById("classChoiceFields"),summary=document.getElementById("classChoiceSummary");if(!panel||!fieldsNode||!summary)throw new Error("Class option UI is incomplete.");
    const fields=fieldsFor(state);panel.hidden=fields.length===0;fieldsNode.innerHTML=fields.map(field=>fieldHtml(field,state.classSelections||{})).join("");summary.textContent=fields.length?summaryText(fields,state.classSelections||{}):"";
  }catch(error){console.error("[class-ui] render failed",error);throw error;}
}
export function clearIllegalClassSelectionsForLevel(state){
  try{const level=Number(state.constraints.level);if(state.constraints.level==="random"||!Number.isInteger(level)||level<7)delete state.classSelections.blessedStrikes;renderClassOptions(state);}catch(error){console.error("[class-ui] level cleanup failed",error);throw error;}
}
function fieldsFor(state){
  try{
    if(state.ruleset!=="2024"||state.constraints.class!=="cleric")return[];
    const fields=[{key:"divineOrder",label:"Divine Order",options:DIVINE_ORDERS}];const level=Number(state.constraints.level);if(Number.isInteger(level)&&level>=7)fields.push({key:"blessedStrikes",label:"Blessed Strikes",options:BLESSED_STRIKES});return fields;
  }catch(error){console.error("[class-ui] field definition failed",error);throw error;}
}
function fieldHtml(field,selections){try{const value=selections[field.key]||"random",options=[`<option value="random">Random</option>`,...field.options.map(option=>`<option value="${option.id}"${value===option.id?" selected":""}>${option.name}</option>`)].join("");return `<label class="class-choice-field">${field.label}<select data-class-choice="${field.key}">${options}</select></label>`;}catch(error){console.error(`[class-ui] ${field.key} field failed`,error);throw error;}}
function summaryText(fields,selections){try{const fixed=fields.filter(field=>selections[field.key]).length;return fixed?`${fixed} class option${fixed===1?"":"s"} fixed · every other class choice stays Random`:`All class choices Random`;}catch(error){console.error("[class-ui] summary failed",error);throw error;}}
function resolvedLevel(state){const level=Number(state.constraints.level);return Number.isInteger(level)?level:1;}
