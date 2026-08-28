import { forgeDataFor } from "../data/forge-data.js";
import { canonicalSkillId, canonicalizeSkillValues } from "../rules/skill-ids.js";
import { sanitizeClassSelectionsForCurrentState } from "./class-options.js";

export function sanitizeClassSelectionsForBackgroundChange(state){
  try{
    state.classSelections=state.classSelections||{};
    normalizeBackgroundSensitiveSkillState(state.classSelections);
    sanitizeBardLoreDependencies(state);
    sanitizeClassSelectionsForCurrentState(state);
    sanitizeBardLoreDependencies(state);
    sanitizeClassSelectionsForCurrentState(state);
    return state.classSelections;
  }catch(error){
    console.error("[class-background-transition] class-choice sanitization failed",error);
    throw error;
  }
}

function normalizeBackgroundSensitiveSkillState(selections){
  try{
    normalizeSkillList(selections,"classSkills");
    normalizeSkillList(selections,"loreBonusSkills");
    normalizeSkillSingle(selections,"primalKnowledgeSkill");
    normalizeSkillSingle(selections,"scholarExpertise");
  }catch(error){
    console.error("[class-background-transition] skill-state normalization failed",error);
    throw error;
  }
}

function sanitizeBardLoreDependencies(state){
  try{
    if(state.constraints.class!=="bard")return;
    const backgroundSkills=new Set(currentBackgroundSkills(state)),classSkills=new Set(normalizedSkillList(state.classSelections.classSkills));
    const blocked=new Set([...backgroundSkills,...classSkills]),lore=normalizedSkillList(state.classSelections.loreBonusSkills).filter(skill=>!blocked.has(skill));
    if(lore.length)state.classSelections.loreBonusSkills=lore;else delete state.classSelections.loreBonusSkills;
  }catch(error){
    console.error("[class-background-transition] Bard Lore sanitization failed",error);
    throw error;
  }
}

function currentBackgroundSkills(state){
  try{
    const backgroundId=state.constraints.background;
    if(!backgroundId||backgroundId==="random")return[];
    const background=forgeDataFor(state.ruleset).backgrounds.find(item=>item.id===backgroundId);
    if(!background)throw new Error(`Unknown ${state.ruleset} background during class-choice transition: ${backgroundId}.`);
    return normalizedSkillList(background.skills);
  }catch(error){
    console.error("[class-background-transition] background skill lookup failed",error);
    throw error;
  }
}

function normalizeSkillList(selections,key){
  try{
    const values=normalizedSkillList(selections[key]);
    if(values.length)selections[key]=values;else delete selections[key];
    return values;
  }catch(error){
    console.error(`[class-background-transition] ${key} normalization failed`,error);
    throw error;
  }
}

function normalizedSkillList(values){
  try{
    const canonical=canonicalizeSkillValues(Array.isArray(values)?values:[]).map(value=>canonicalSkillId(value)).filter(Boolean);
    return [...new Set(canonical)];
  }catch(error){
    console.error("[class-background-transition] skill-list canonicalization failed",error);
    throw error;
  }
}

function normalizeSkillSingle(selections,key){
  try{
    if(!selections[key])return;
    const canonical=canonicalSkillId(selections[key]);
    if(canonical)selections[key]=canonical;else delete selections[key];
  }catch(error){
    console.error(`[class-background-transition] ${key} canonicalization failed`,error);
    throw error;
  }
}
