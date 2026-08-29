import { SKILLS } from "../schema.js";
import { MAGIC_INITIATE_LISTS_2024, ORIGIN_FEATS_2024, TOOLS_2024, originFeatById2024 } from "../data/origin-feats-2024.js";
import { resolveMagicInitiateChoice } from "./magic-initiate.js";
import { pick, sample } from "./random.js";

const SKILL_IDS=Object.freeze(Object.keys(SKILLS));
export const HUMAN_ORIGIN_FEAT_OPTIONS_2024=ORIGIN_FEATS_2024.map(feat=>Object.freeze({id:feat.id,name:feat.name}));
export const SKILLED_PROFICIENCY_OPTIONS_2024=Object.freeze([
  ...SKILL_IDS.map(id=>Object.freeze({id:`skill:${id}`,name:`Skill — ${prettySkill(id)}`})),
  ...TOOLS_2024.map(name=>Object.freeze({id:`tool:${name}`,name:`Tool — ${name}`}))
]);

export function resolveHumanVersatileOriginFeat({selections={},existingFeats=[],existingMagicInitiates=[],skills=[],tools=[]}={}){
  try{
    const existingFamilies=existingFeats.map(originFeatFamilyId),eligible=ORIGIN_FEATS_2024.filter(feat=>feat.repeatable||!existingFamilies.includes(feat.id));
    if(!eligible.length)throw new Error("Human Versatile has no legal SRD Origin feat remaining.");
    const requested=selections.originFeat;
    const featBase=requested?originFeatById2024(requested):pick(eligible);
    if(!featBase)throw new Error(`Unsupported Human Versatile SRD Origin feat: ${requested}.`);
    if(!featBase.repeatable&&existingFamilies.includes(featBase.id))throw new Error(`Human Versatile cannot take non-repeatable Origin feat ${featBase.name} twice.`);
    const result={feat:Object.freeze({...featBase,source:"species"}),addedSkills:[],addedTools:[],magicInitiate:null,choices:{originFeat:featBase.id},resources:{}};
    if(featBase.id==="magic-initiate")resolveMagicInitiate(result,selections,existingMagicInitiates);
    if(featBase.id==="skilled")resolveSkilled(result,selections,skills,tools);
    return Object.freeze({...result,addedSkills:Object.freeze(result.addedSkills),addedTools:Object.freeze(result.addedTools),choices:Object.freeze(result.choices),resources:Object.freeze(result.resources)});
  }catch(error){console.error("[origin-feats] Human Versatile resolution failed",error);throw error;}
}

export function originFeatFamilyId(feat){
  try{const id=typeof feat==="string"?feat:feat?.id;return String(id||"").startsWith("magic-initiate-")?"magic-initiate":id;}
  catch(error){console.error("[origin-feats] family lookup failed",error);throw error;}
}

export function originFeatInstanceKey(feat){
  try{
    const family=originFeatFamilyId(feat);
    if(family==="magic-initiate")return `${family}:${feat.spellList||String(feat.id).replace("magic-initiate-","")}`;
    if(feat?.repeatable&&feat?.source)return `${family}:${feat.source}`;
    return family;
  }catch(error){console.error("[origin-feats] instance key failed",error);throw error;}
}

function resolveMagicInitiate(result,selections,existingMagicInitiates){
  const usedLists=existingMagicInitiates.map(choice=>choice?.spellList).filter(Boolean),available=MAGIC_INITIATE_LISTS_2024.filter(list=>!usedLists.includes(list));
  if(!available.length)throw new Error("Magic Initiate has no unused spell list remaining.");
  const requested=selections.magicInitiateList;
  if(requested&&!available.includes(requested))throw new Error(`Magic Initiate spell list ${requested} is unavailable or already used.`);
  const list=requested||pick(available),magic=resolveMagicInitiateChoice(list,{spellcastingAbility:selections.originSpellcastingAbility,cantrip1:selections.originCantrip1,cantrip2:selections.originCantrip2,level1Spell:selections.originLevel1Spell});
  result.magicInitiate=Object.freeze({...magic,source:"species"});
  result.feat=Object.freeze({id:`magic-initiate-${list}`,name:`Magic Initiate (${magic.spellListName})`,category:"Origin",repeatable:true,spellList:list,source:"species"});
  Object.assign(result.choices,{magicInitiateList:list,originSpellcastingAbility:magic.spellcastingAbility,originCantrip1:magic.cantrips[0],originCantrip2:magic.cantrips[1],originLevel1Spell:magic.level1Spell});
}

function resolveSkilled(result,selections,skills,tools){
  const existing=new Set([...skills.map(id=>`skill:${id}`),...tools.map(name=>`tool:${name}`)]),selected=[];
  for(let index=1;index<=3;index++){
    const key=`skilledProficiency${index}`,requested=selections[key];
    if(requested){if(existing.has(requested)||selected.includes(requested)||!SKILLED_PROFICIENCY_OPTIONS_2024.some(option=>option.id===requested))throw new Error(`Skilled proficiency ${requested} is unavailable or duplicated.`);selected.push(requested);}
  }
  const pool=SKILLED_PROFICIENCY_OPTIONS_2024.map(option=>option.id).filter(id=>!existing.has(id)&&!selected.includes(id));
  selected.push(...sample(pool,3-selected.length));
  if(selected.length!==3)throw new Error("Skilled requires exactly three available skill/tool proficiencies.");
  selected.forEach((value,index)=>{result.choices[`skilledProficiency${index+1}`]=value;if(value.startsWith("skill:"))result.addedSkills.push(value.slice(6));else result.addedTools.push(value.slice(5));});
}

function prettySkill(value){return String(value).replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}
