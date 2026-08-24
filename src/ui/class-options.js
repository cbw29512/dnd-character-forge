import { validateClericClassSelections } from "../rules/cleric.js";
import { bardProgressionFor } from "../rules/bard.js";
import { LAND_2014, LAND_2024, PRIMAL_ORDERS_2024, ELEMENTAL_FURY_2024, druidProgressionFor, legalFormsForProgression } from "../rules/druid.js";
import { DRACONIC_AFFINITIES_2024, DRACONIC_ANCESTRIES_2014 } from "../data/sorcerer-class.js";
import { metamagicOptionsFor } from "../data/sorcerer-metamagic.js";
import { sorcererProgressionFor } from "../rules/sorcerer.js";
import { FAVORED_ENEMY_TYPES_2014, FAVORED_ENEMY_LANGUAGE_OPTIONS_2014, NATURAL_EXPLORER_TERRAINS_2014, HUNTER_PREY_2014, HUNTER_DEFENSE_2014, HUNTER_MULTIATTACK_2014, HUNTER_SUPERIOR_DEFENSE_2014, HUNTER_PREY_2024, HUNTER_DEFENSE_2024, rangerProgressionFor } from "../rules/ranger.js";
import { forgeDataFor } from "../data/forge-data.js";
import { spellPickerConfigForState } from "./spell-picker-config.js";

const DIVINE_ORDERS=[{id:"protector",name:"Protector"},{id:"thaumaturge",name:"Thaumaturge"}];
const BLESSED_STRIKES=[{id:"divine-strike",name:"Divine Strike"},{id:"potent-spellcasting",name:"Potent Spellcasting"}];
const CLASS_SELECTION_KEYS=Object.freeze(["divineOrder","blessedStrikes","instruments","loreBonusSkills","expertise","primalOrder","circleLand","elementalFury","fieldForms","knownForms","fightingStyle","favoredEnemies","favoredEnemyLanguages","naturalExplorerTerrains","huntersPrey","defensiveTactics","multiattack","superiorDefense","monkTool","metamagic","draconicAncestry","elementalAffinity"]);
const pretty=value=>String(value||"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());
const asOptions=values=>values.map(value=>typeof value==="string"?{id:value,name:pretty(value)}:{id:value.id,name:value.name||pretty(value.id)});
const mapOptions=map=>Object.entries(map).map(([id,name])=>({id,name}));

export function bindClassOptions(state,{onChange=()=>{},showToast=()=>{}}={}){
  try{
    const panel=document.getElementById("classChoicePanel");if(!panel)throw new Error("Class options panel is missing.");
    panel.addEventListener("change",event=>{
      const single=event.target.closest("[data-class-choice]"),multi=event.target.closest("[data-class-multi]"),indexed=event.target.closest("[data-class-index-choice]");if(!single&&!multi&&!indexed)return;
      const previous=structuredClone(state.classSelections||{}),proposed=structuredClone(previous);
      try{
        if(single){const key=single.dataset.classChoice;if(single.value==="random")delete proposed[key];else proposed[key]=single.value;}
        if(multi){const key=multi.dataset.classMulti,value=multi.value,current=[...(proposed[key]||[])];proposed[key]=multi.checked?[...new Set([...current,value])]:current.filter(item=>item!==value);if(!proposed[key].length)delete proposed[key];}
        if(indexed){const key=indexed.dataset.classIndexChoice,index=Number(indexed.dataset.index),current=[...(proposed[key]||[])];while(current.length<=index)current.push(null);current[index]=indexed.value==="random"?null:indexed.value;while(current.length&&current.at(-1)==null)current.pop();if(current.length)proposed[key]=current;else delete proposed[key];}
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
    const fields=classChoiceFieldsForState(state),active=new Set(fields.map(field=>field.key));for(const key of CLASS_SELECTION_KEYS)if(key!=="favoredEnemyLanguages"&&!active.has(key))delete state.classSelections[key];
    for(const field of fields)if(field.type==="multi"&&Array.isArray(state.classSelections[field.key])&&state.classSelections[field.key].length>field.max)state.classSelections[field.key]=state.classSelections[field.key].slice(0,field.max);
    if(state.constraints.class!=="ranger"||state.ruleset!=="2014"||!(state.classSelections.favoredEnemies||[]).length)delete state.classSelections.favoredEnemyLanguages;else if(Array.isArray(state.classSelections.favoredEnemyLanguages))state.classSelections.favoredEnemyLanguages=state.classSelections.favoredEnemyLanguages.slice(0,state.classSelections.favoredEnemies.length);
    validateClassChoiceState(state);renderClassOptions(state);
  }catch(error){console.error("[class-ui] level cleanup failed",error);state.classSelections={};renderClassOptions(state);}
}
export function classChoiceFieldsForState(state){
  try{
    const classId=state.constraints.class,level=resolvedLevel(state),subclassId=resolvedSubclassId(state),data=forgeDataFor(state.ruleset),cls=data.classes.find(item=>item.id===classId);if(!cls)return[];
    if(classId==="cleric"&&state.ruleset==="2024"){const fields=[single("divineOrder","Divine Order",DIVINE_ORDERS)];if(level>=7)fields.push(single("blessedStrikes","Blessed Strikes",BLESSED_STRIKES));return fields;}
    if(classId==="bard"){
      const p=bardProgressionFor(state.ruleset,level,subclassId),fields=[multi("instruments","Instrument Proficiencies",asOptions(cls.instrumentChoices||[]),cls.instrumentCount||0)];
      if(p.loreBonusSkills)fields.push(multi("loreBonusSkills","College of Lore Bonus Skills",asOptions(cls.skillChoices||[]),p.loreBonusSkills));if(p.expertiseCount)fields.push(multi("expertise","Expertise",asOptions(cls.skillChoices||[]),p.expertiseCount));return fields;
    }
    if(classId==="druid"){
      const p=druidProgressionFor(state.ruleset,level,subclassId),fields=[];if(state.ruleset==="2024")fields.push(single("primalOrder","Primal Order",asOptions(PRIMAL_ORDERS_2024)));
      const threshold=state.ruleset==="2014"?2:3;if(subclassId==="circle-land"&&level>=threshold)fields.push(single("circleLand","Circle Land",asOptions(state.ruleset==="2014"?LAND_2014:LAND_2024)));
      if(state.ruleset==="2024"&&level>=7)fields.push(single("elementalFury","Elemental Fury",asOptions(ELEMENTAL_FURY_2024)));
      const forms=asOptions(legalFormsForProgression(state.ruleset,p));if(state.ruleset==="2014"&&level>=2)fields.push(multi("fieldForms","Wild Shape Field Forms",forms,Math.min(4,forms.length)));if(state.ruleset==="2024"&&p.knownFormCount)fields.push(multi("knownForms","Known Wild Shape Forms",forms,p.knownFormCount));return fields;
    }
    if(classId==="paladin"&&state.ruleset==="2024"&&level>=2)return[single("fightingStyle","Fighting Style",(cls.styleChoices||[]).map(id=>({id,name:data.fightingStyles[id]?.name||pretty(id)})))];
    if(classId==="ranger")return rangerFields(state,cls,data,level,subclassId);
    if(classId==="monk"&&(cls.toolChoices||[]).length)return[single("monkTool","Monk Tool",asOptions(cls.toolChoices))];
    if(classId==="sorcerer"){
      const p=sorcererProgressionFor(state.ruleset,level,subclassId),fields=[];if(p.metamagicCount)fields.push(multi("metamagic","Metamagic",asOptions(metamagicOptionsFor(state.ruleset)),p.metamagicCount));
      if(state.ruleset==="2014"&&subclassId==="draconic-bloodline")fields.push(single("draconicAncestry","Dragon Ancestor",asOptions(DRACONIC_ANCESTRIES_2014)));if(state.ruleset==="2024"&&subclassId==="draconic-sorcery"&&level>=6)fields.push(single("elementalAffinity","Elemental Affinity",asOptions(DRACONIC_AFFINITIES_2024)));return fields;
    }
    return[];
  }catch(error){console.error("[class-ui] field definition failed",error);throw error;}
}
function rangerFields(state,cls,data,level,subclassId){
  const p=rangerProgressionFor(state.ruleset,level,subclassId),fields=[];
  if(state.ruleset==="2024"&&level>=2)fields.push(single("fightingStyle","Fighting Style",(cls.styleChoices||[]).map(id=>({id,name:data.fightingStyles[id]?.name||pretty(id)}))));
  if(state.ruleset==="2014"){
    fields.push(multi("favoredEnemies","Favored Enemies",asOptions(FAVORED_ENEMY_TYPES_2014),p.favoredEnemyCount));fields.push(multi("naturalExplorerTerrains","Natural Explorer Terrains",asOptions(NATURAL_EXPLORER_TERRAINS_2014),p.naturalExplorerTerrainCount));
    for(const [index,enemy] of (state.classSelections?.favoredEnemies||[]).entries()){const languages=FAVORED_ENEMY_LANGUAGE_OPTIONS_2014[enemy]||[];if(languages.length>1)fields.push(indexed("favoredEnemyLanguages",`Favored Enemy Language — ${pretty(enemy)}`,asOptions(languages),index));}
    if(p.hunter){fields.push(single("huntersPrey","Hunter's Prey",mapOptions(HUNTER_PREY_2014)));if(level>=7)fields.push(single("defensiveTactics","Defensive Tactics",mapOptions(HUNTER_DEFENSE_2014)));if(level>=11)fields.push(single("multiattack","Multiattack",mapOptions(HUNTER_MULTIATTACK_2014)));if(level>=15)fields.push(single("superiorDefense","Superior Hunter's Defense",mapOptions(HUNTER_SUPERIOR_DEFENSE_2014)));}
  }else if(p.hunter){fields.push(single("huntersPrey","Hunter's Prey",mapOptions(HUNTER_PREY_2024)));if(level>=7)fields.push(single("defensiveTactics","Defensive Tactics",mapOptions(HUNTER_DEFENSE_2024)));}
  return fields;
}
function validateClassChoiceState(state){
  try{
    const fields=classChoiceFieldsForState(state),seenMulti=new Set();for(const field of fields){const legal=new Set(field.options.map(option=>option.id));if(field.type==="single"){const value=state.classSelections?.[field.key];if(value&&!legal.has(value))throw new Error(`${field.label} choice "${value}" is unavailable.`);}else if(field.type==="multi"&&!seenMulti.has(field.key)){seenMulti.add(field.key);const values=state.classSelections?.[field.key]||[];if(!Array.isArray(values))throw new Error(`${field.label} choices must be a list.`);if(new Set(values).size!==values.length)throw new Error(`Duplicate ${field.label} choice.`);if(values.length>field.max)throw new Error(`Choose at most ${field.max} ${field.label}.`);const bad=values.filter(value=>!legal.has(value));if(bad.length)throw new Error(`Illegal ${field.label}: ${bad.join(", ")}.`);}else if(field.type==="indexed"){const value=(state.classSelections?.[field.key]||[])[field.index];if(value&&!legal.has(value))throw new Error(`${field.label} choice "${value}" is unavailable.`);}}
    validateBardChoiceDependencies(state);
    if(state.constraints.class==="cleric")validateClericClassSelections({ruleset:state.ruleset,level:resolvedLevel(state),selections:state.classSelections||{},spellSelections:state.spellSelections||{}});
  }catch(error){console.error("[class-ui] class choice validation failed",error);throw error;}
}
function validateBardChoiceDependencies(state){
  if(state.constraints.class!=="bard")return;const level=resolvedLevel(state),subclassId=resolvedSubclassId(state),p=bardProgressionFor(state.ruleset,level,subclassId),selections=state.classSelections||{},lore=selections.loreBonusSkills||[],expertise=selections.expertise||[],data=forgeDataFor(state.ruleset),background=state.constraints.background&&state.constraints.background!=="random"?data.backgrounds.find(item=>item.id===state.constraints.background):null,backgroundSkills=background?.skills||[];
  const duplicateLore=lore.filter(skill=>backgroundSkills.includes(skill));if(duplicateLore.length)throw new Error(`College of Lore bonus skills must add new proficiencies: ${duplicateLore.join(", ")}.`);if(state.ruleset==="2024"&&level<9&&expertise.some(skill=>lore.includes(skill)))throw new Error("Before Bard level 9, Expertise cannot rely on a College of Lore proficiency gained later than the early Expertise choices.");const baseNeeded=expertise.filter(skill=>!backgroundSkills.includes(skill)&&!lore.includes(skill));if(baseNeeded.length>(data.classes.find(item=>item.id==="bard")?.skillCount||3))throw new Error("Those fixed Expertise choices require more base Bard skill proficiencies than the class can choose.");if(lore.length>p.loreBonusSkills||expertise.length>p.expertiseCount)throw new Error("A fixed Bard skill choice is unavailable at this level.");
}
function validateCurrentSpellChoices(state){try{if(state.constraints.level==="random")return;const classId=state.constraints.class;if(!["wizard","cleric","bard","druid","paladin","ranger","sorcerer"].includes(classId))return;const config=spellPickerConfigForState(state);config.validate(state.spellSelections||{});}catch(error){console.error("[class-ui] spell compatibility validation failed",error);throw error;}}
function single(key,label,options){return{type:"single",key,label,options};}
function multi(key,label,options,max){return{type:"multi",key,label,options,max};}
function indexed(key,label,options,index){return{type:"indexed",key,label,options,index};}
function fieldHtml(field,selections){
  try{
    if(field.type==="multi"){const selected=new Set(selections[field.key]||[]);return `<fieldset class="class-choice-field class-choice-multi"><legend>${field.label}</legend><small>${selected.size} / ${field.max} fixed · rest Random</small><div class="class-choice-checks">${field.options.map(option=>`<label><input type="checkbox" data-class-multi="${field.key}" value="${option.id}"${selected.has(option.id)?" checked":""}><span>${option.name}</span></label>`).join("")}</div></fieldset>`;}
    const value=field.type==="indexed"?(selections[field.key]||[])[field.index]||"random":selections[field.key]||"random",attribute=field.type==="indexed"?`data-class-index-choice="${field.key}" data-index="${field.index}"`:`data-class-choice="${field.key}"`,options=[`<option value="random">Random</option>`,...field.options.map(option=>`<option value="${option.id}"${value===option.id?" selected":""}>${option.name}</option>`)].join("");return `<label class="class-choice-field">${field.label}<select ${attribute}>${options}</select></label>`;
  }catch(error){console.error(`[class-ui] ${field.key} field failed`,error);throw error;}
}
function summaryText(fields,selections){try{const keys=[...new Set(fields.map(field=>field.key))],fixed=keys.reduce((sum,key)=>sum+(Array.isArray(selections[key])?selections[key].filter(Boolean).length:selections[key]?1:0),0);return fixed?`${fixed} class choice${fixed===1?"":"s"} fixed · every other class choice stays Random`:`All class choices Random`;}catch(error){console.error("[class-ui] summary failed",error);throw error;}}
function resolvedLevel(state){const level=Number(state.constraints.level);return Number.isInteger(level)?level:1;}
function resolvedSubclassId(state){try{if(state.constraints.subclass&&state.constraints.subclass!=="random")return state.constraints.subclass;const data=forgeDataFor(state.ruleset),cls=data.classes.find(item=>item.id===state.constraints.class),level=resolvedLevel(state);if(!cls||level<cls.subclassLevel)return null;const options=data.subclasses.filter(item=>item.classId===cls.id);return options.length===1?options[0].id:null;}catch(error){console.error("[class-ui] subclass resolution failed",error);throw error;}}
