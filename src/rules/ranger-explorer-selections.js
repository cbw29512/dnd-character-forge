import { sample } from "./random.js";
import { uniqueStrings } from "./duplicates.js";
import { rangerProgressionFor } from "./ranger.js";

export const RANGER_LANGUAGE_OPTIONS_2024=Object.freeze([
  "Common Sign Language","Draconic","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc",
  "Abyssal","Celestial","Deep Speech","Druidic","Infernal","Primordial","Sylvan","Thieves’ Cant","Undercommon"
]);

const requestedList=value=>Array.isArray(value)?uniqueStrings(value.filter(item=>typeof item==="string"&&item.trim())):[];

export function reserveRangerExpertiseSkills({ruleset,level,subclassId=null,cls,background,selections={},guaranteedSkills=[]}){
  try{
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).expertiseCount;
    if(!count)return[];
    const requested=requestedList(selections.expertise).slice(0,count),backgroundSkills=new Set(background?.skills||[]),guaranteed=new Set(guaranteedSkills),classPool=new Set(cls?.skillChoices||[]);
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
    const pool=uniqueStrings(skills),legal=new Set(pool),requested=requestedList(selections.expertise).filter(skill=>legal.has(skill)).slice(0,count);
    return uniqueStrings([...requested,...sample(pool,count-requested.length,requested)]).slice(0,count);
  }catch(error){
    console.error("[ranger-explorer] Expertise resolution failed",error);
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
