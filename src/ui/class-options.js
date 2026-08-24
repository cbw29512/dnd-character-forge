import { validateClericClassSelections } from "../rules/cleric.js";
import { LAND_2014, LAND_2024, PRIMAL_ORDERS_2024, ELEMENTAL_FURY_2024 } from "../rules/druid.js";
import { DRACONIC_AFFINITIES_2024, DRACONIC_ANCESTRIES_2014 } from "../data/sorcerer-class.js";
import { forgeDataFor } from "../data/forge-data.js";
import { spellPickerConfigForState } from "./spell-picker.js";

const DIVINE_ORDERS=[{id:"protector",name:"Protector"},{id:"thaumaturge",name:"Thaumaturge"}];
const BLESSED_STRIKES=[{id:"divine-strike",name:"Divine Strike"},{id:"potent-spellcasting",name:"Potent Spellcasting"}];
const pretty=value=>String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());
const asOptions=values=>values.map(value=>typeof value==="string"?{id:value,name:pretty(value)}:{id:value.id,name:value.name||pretty(value.id)});

export function bindClassOptions(state,{onChange=()=>{},showToast=()=>{}}={}){
  try{
    const panel=document.getElementById("classChoicePanel");if(!panel)throw new Error("Class options panel is missing.");
    panel.addEventListener("change",event=>{
      const select=event.target.closest("[data-class-choice]");if(!select)return;
      const previous={...(state.classSelections||{})},proposed={...previous},key=select.dataset.classChoice;
      try{
        if(select.value==="random")delete proposed[key];else proposed[key]=select.value;
        state.classSelections=proposed;validateClassChoiceState(state);validateCurrentSpellChoices(state);renderClassOptions(state);onChange();
      }catch(error){state.classSelections=previous;console.error("[class-ui] change blocked",error);renderClassOptions(state);showToast(error.message,true);}
    });
    renderClassOptions(state);
  }catch(error){console.error("[class-ui] bind failed",error);throw error;}
}
export function resetClassOptions(state){try{state.classSelections={};renderClassOptions(state);}catch(error){console.error("[class-ui] reset failed",error);throw error;}}
export function renderClassOptions(state){
  try{
    const panel=document.getElementById("classChoicePanel"),fieldsNode=document.getElementById("classChoiceFields"),summary=document.getElementById("classChoiceSummary");if(!panel||!fieldsNode||!summary)throw new Error("Class option UI is incomplete.");
    const fields=classChoiceFieldsForState(state);panel.hidden=fields.length===0;fieldsNode.innerHTML=fields.map(field=>fieldHtml(field,state.classSelections||{})).join("");summary.textContent=fields.length?summaryText(fields,state.classSelections||{}):"";
  }catch(error){console.error("[class-ui] render failed",error);throw error;}
}
export function clearIllegalClassSelectionsForLevel(state){
  try{
    const level=resolvedLevel(state),classId=state.constraints.class,subclassId=resolvedSubclassId(state);
    if(classId==="cleric"&&(state.ruleset!=="2024"||level<7))delete state.classSelections.blessedStrikes;
    if(classId==="druid"){
      if(state.ruleset!=="2024")delete state.classSelections.primalOrder;
      if(state.ruleset!=="2024"||level<7)delete state.classSelections.elementalFury;
      const threshold=state.ruleset==="2014"?2:3;if(subclassId!=="circle-land"||level<threshold)delete state.classSelections.circleLand;
    }
    if(!["paladin","ranger"].includes(classId)||state.ruleset!=="2024"||level<2)delete state.classSelections.fightingStyle;
    if(classId==="sorcerer"){
      if(state.ruleset!=="2014"||subclassId!=="draconic-bloodline")delete state.classSelections.draconicAncestry;
      if(state.ruleset!=="2024"||subclassId!=="draconic-sorcery"||level<6)delete state.classSelections.elementalAffinity;
    }
    renderClassOptions(state);
  }catch(error){console.error("[class-ui] level cleanup failed",error);throw error;}
}
export function classChoiceFieldsForState(state){
  try{
    const classId=state.constraints.class,level=resolvedLevel(state),subclassId=resolvedSubclassId(state),data=forgeDataFor(state.ruleset),cls=data.classes.find(item=>item.id===classId);if(!cls)return[];
    if(classId==="cleric"&&state.ruleset==="2024"){const fields=[{key:"divineOrder",label:"Divine Order",options:DIVINE_ORDERS}];if(level>=7)fields.push({key:"blessedStrikes",label:"Blessed Strikes",options:BLESSED_STRIKES});return fields;}
    if(classId==="druid"){
      const fields=[];if(state.ruleset==="2024")fields.push({key:"primalOrder",label:"Primal Order",options:asOptions(PRIMAL_ORDERS_2024)});
      const threshold=state.ruleset==="2014"?2:3;if(subclassId==="circle-land"&&level>=threshold)fields.push({key:"circleLand",label:"Circle Land",options:asOptions(state.ruleset==="2014"?LAND_2014:LAND_2024)});
      if(state.ruleset==="2024"&&level>=7)fields.push({key:"elementalFury",label:"Elemental Fury",options:asOptions(ELEMENTAL_FURY_2024)});return fields;
    }
    if(["paladin","ranger"].includes(classId)&&state.ruleset==="2024"&&level>=2)return[{key:"fightingStyle",label:"Fighting Style",options:(cls.styleChoices||[]).map(id=>({id,name:data.fightingStyles[id]?.name||pretty(id)}))}];
    if(classId==="monk"&&(cls.toolChoices||[]).length)return[{key:"monkTool",label:"Monk Tool",options:asOptions(cls.toolChoices)}];
    if(classId==="sorcerer"){
      if(state.ruleset==="2014"&&subclassId==="draconic-bloodline")return[{key:"draconicAncestry",label:"Dragon Ancestor",options:asOptions(DRACONIC_ANCESTRIES_2014)}];
      if(state.ruleset==="2024"&&subclassId==="draconic-sorcery"&&level>=6)return[{key:"elementalAffinity",label:"Elemental Affinity",options:asOptions(DRACONIC_AFFINITIES_2024)}];
    }
    return[];
  }catch(error){console.error("[class-ui] field definition failed",error);throw error;}
}
function validateClassChoiceState(state){
  try{
    const fields=classChoiceFieldsForState(state),allowed=new Map(fields.map(field=>[field.key,new Set(field.options.map(option=>option.id))]));for(const field of fields){const value=state.classSelections?.[field.key];if(value&&!allowed.get(field.key).has(value))throw new Error(`${field.label} choice "${value}" is unavailable.`);}
    if(state.constraints.class==="cleric")validateClericClassSelections({ruleset:state.ruleset,level:resolvedLevel(state),selections:state.classSelections||{},spellSelections:state.spellSelections||{}});
  }catch(error){console.error("[class-ui] class choice validation failed",error);throw error;}
}
function validateCurrentSpellChoices(state){
  try{if(state.constraints.level==="random")return;const classId=state.constraints.class;if(!["wizard","cleric","bard","druid","paladin","ranger","sorcerer"].includes(classId))return;const config=spellPickerConfigForState(state);config.validate(state.spellSelections||{});}catch(error){console.error("[class-ui] spell compatibility validation failed",error);throw error;}
}
function fieldHtml(field,selections){try{const value=selections[field.key]||"random",options=[`<option value="random">Random</option>`,...field.options.map(option=>`<option value="${option.id}"${value===option.id?" selected":""}>${option.name}</option>`)].join("");return `<label class="class-choice-field">${field.label}<select data-class-choice="${field.key}">${options}</select></label>`;}catch(error){console.error(`[class-ui] ${field.key} field failed`,error);throw error;}}
function summaryText(fields,selections){try{const fixed=fields.filter(field=>selections[field.key]).length;return fixed?`${fixed} class option${fixed===1?"":"s"} fixed · every other class choice stays Random`:`All class choices Random`;}catch(error){console.error("[class-ui] summary failed",error);throw error;}}
function resolvedLevel(state){const level=Number(state.constraints.level);return Number.isInteger(level)?level:1;}
function resolvedSubclassId(state){
  try{if(state.constraints.subclass&&state.constraints.subclass!=="random")return state.constraints.subclass;const data=forgeDataFor(state.ruleset),cls=data.classes.find(item=>item.id===state.constraints.class),level=resolvedLevel(state);if(!cls||level<cls.subclassLevel)return null;const options=data.subclasses.filter(item=>item.classId===cls.id);return options.length===1?options[0].id:null;}catch(error){console.error("[class-ui] subclass resolution failed",error);throw error;}
}
