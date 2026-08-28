import { sample } from "./random.js";
import { uniqueStrings } from "./duplicates.js";
import { rangerProgressionFor } from "./ranger.js";
import { canonicalSkillId, canonicalizeSkillValues } from "./skill-ids.js";

export const RANGER_LANGUAGE_OPTIONS_2024=Object.freeze([
  "Common Sign Language","Draconic","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc",
  "Abyssal","Celestial","Deep Speech","Druidic","Infernal","Primordial","Sylvan","Thieves’ Cant","Undercommon"
]);

const requestedList=value=>Array.isArray(value)?uniqueStrings(value.filter(item=>typeof item==="string"&&item.trim())):[];

function requestedSkillList(value,legalSkills=null){
  try{
    const canonical=skill=>Array.isArray(legalSkills)?canonicalSkillId(skill,legalSkills):canonicalSkillId(skill);
    return uniqueStrings(requestedList(value).map(canonical).filter(Boolean));
  }catch(error){
    console.error("[ranger-explorer] Expertise request normalization failed",error);
    throw error;
  }
}

export function reserveRangerExpertiseSkills({ruleset,level,subclassId=null,cls,background,selections={},guaranteedSkills=[]}){
  try{
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).expertiseCount;
    if(!count)return[];

    // Deft Explorer can target any proficiency the Ranger actually has. A requested
    // class-pool skill may need to reserve one of the class proficiency slots, while
    // a background/species proficiency must not consume that class budget.
    const requested=requestedSkillList(selections.expertise).slice(0,count),
      backgroundSkills=new Set(canonicalizeSkillValues(background?.skills||[])),
      guaranteed=new Set(canonicalizeSkillValues(guaranteedSkills)),
      classPool=new Set(cls?.skillChoices||[]);
    return requested.filter(skill=>!backgroundSkills.has(skill)&&!guaranteed.has(skill)&&classPool.has(skill));
  }catch(error){
    console.error("[ranger-explorer] Expertise reservation failed",error);
    throw error;
  }
}

export function resolveRangerExpertise({ruleset,level,subclassId=null,skills=[],selections={}}){
  try{
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).expertiseCount;
    if(!count)return[];
    const pool=uniqueStrings(canonicalizeSkillValues(skills)),legal=new Set(pool),requested=requestedSkillList(selections.expertise,pool).filter(skill=>legal.has(skill)).slice(0,count);
    return uniqueStrings([...requested,...sample(pool,count-requested.length,requested)]).slice(0,count);
  }catch(error){
    console.error("[ranger-explorer] Expertise resolution failed",error);
    throw error;
  }
}

export function reserveRangerExplorerLanguages({ruleset,level,subclassId=null,selections={}}){
  try{
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).extraLanguages;
    if(!count)return[];
    const legal=new Set(RANGER_LANGUAGE_OPTIONS_2024);
    return requestedList(selections.deftExplorerLanguages).filter(language=>legal.has(language)).slice(0,count);
  }catch(error){
    console.error("[ranger-explorer] language reservation failed",error);
    throw error;
  }
}

export function resolveRangerExplorerLanguages({ruleset,level,subclassId=null,baseLanguages=[],selections={}}){
  try{
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).extraLanguages;
    if(!count)return[];
    const known=new Set(baseLanguages),pool=RANGER_LANGUAGE_OPTIONS_2024.filter(language=>!known.has(language)),legal=new Set(pool),requested=requestedList(selections.deftExplorerLanguages).filter(language=>legal.has(language)).slice(0,count);
    if(pool.length<count)throw new Error(`Deft Explorer requires ${count} new languages, but only ${pool.length} verified choices remain.`);
    return uniqueStrings([...requested,...sample(pool,count-requested.length,requested)]).slice(0,count);
  }catch(error){
    console.error("[ranger-explorer] language resolution failed",error);
    throw error;
  }
}
