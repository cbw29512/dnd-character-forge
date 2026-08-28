import { sample } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { rangerProgressionFor } from "./ranger.js";

export const RANGER_LANGUAGE_OPTIONS_2024=Object.freeze([
  "Common Sign Language","Draconic","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc",
  "Abyssal","Celestial","Deep Speech","Druidic","Infernal","Primordial","Sylvan","Thieves’ Cant","Undercommon"
]);

export function reserveRangerExpertiseSkills({ruleset,level,subclassId=null,cls,background,selections={},guaranteedSkills=[]}){
  try{
    const requested=[...(selections.expertise||[])];
    if(!requested.length)return[];
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).expertiseCount;
    if(!count)throw new Error("Ranger Expertise is unavailable before level 2.");
    if(requested.length>count)throw new Error(`Choose at most ${count} Ranger Expertise option${count===1?"":"s"}.`);
    const backgroundSkills=background?.skills||[],guaranteed=new Set(guaranteedSkills),reserved=uniqueStrings(requested.filter(skill=>!backgroundSkills.includes(skill)&&!guaranteed.has(skill)&&(cls?.skillChoices||[]).includes(skill))),unsupported=requested.filter(skill=>!backgroundSkills.includes(skill)&&!guaranteed.has(skill)&&!(cls?.skillChoices||[]).includes(skill));
    if(unsupported.length)throw new Error(`Fixed Ranger Expertise must come from a fixed background, species-granted skill, or Ranger skill choice: ${unsupported.join(", ")}.`);
    return reserved;
  }catch(error){
    console.error("[ranger-explorer] Expertise reservation failed",error);
    throw error;
  }
}

export function resolveRangerExpertise({ruleset,level,subclassId=null,skills=[],selections={}}){
  try{
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).expertiseCount,requested=[...(selections.expertise||[])],duplicates=duplicateValues(requested);
    if(duplicates.length)throw new Error(`Duplicate Ranger Expertise choice: ${duplicates.join(", ")}.`);
    if(!count){if(requested.length)throw new Error("Ranger Expertise is unavailable before level 2.");return[];}
    if(requested.length>count)throw new Error(`Choose at most ${count} Ranger Expertise option${count===1?"":"s"}.`);
    const illegal=requested.filter(skill=>!skills.includes(skill));
    if(illegal.length)throw new Error(`Ranger Expertise requires an existing skill proficiency: ${illegal.join(", ")}.`);
    return uniqueStrings([...requested,...sample(skills,count-requested.length,requested)]);
  }catch(error){
    console.error("[ranger-explorer] Expertise resolution failed",error);
    throw error;
  }
}

export function resolveRangerExplorerLanguages({ruleset,level,subclassId=null,baseLanguages=[],selections={}}){
  try{
    if(ruleset!=="2024")return[];
    const count=rangerProgressionFor(ruleset,level,subclassId).extraLanguages,requested=[...(selections.deftExplorerLanguages||[])],duplicates=duplicateValues(requested);
    if(duplicates.length)throw new Error(`Duplicate Deft Explorer language: ${duplicates.join(", ")}.`);
    if(!count){if(requested.length)throw new Error("Deft Explorer languages are unavailable before Ranger level 2.");return[];}
    if(requested.length>count)throw new Error(`Choose at most ${count} Deft Explorer language${count===1?"":"s"}.`);
    const illegal=requested.filter(language=>!RANGER_LANGUAGE_OPTIONS_2024.includes(language));
    if(illegal.length)throw new Error(`Unsupported Deft Explorer language: ${illegal.join(", ")}.`);
    const pool=RANGER_LANGUAGE_OPTIONS_2024.filter(language=>!baseLanguages.includes(language));
    const unavailable=requested.filter(language=>!pool.includes(language));
    if(unavailable.length)throw new Error(`Deft Explorer language is already known: ${unavailable.join(", ")}.`);
    return uniqueStrings([...requested,...sample(pool,count-requested.length,requested)]);
  }catch(error){
    console.error("[ranger-explorer] language resolution failed",error);
    throw error;
  }
}
