import { sample } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { rogueProgressionFor } from "./rogue.js";

export function resolveRogueExpertise({ruleset,level,subclassId=null,skills=[],selections={}}){
  try{
    const progression=rogueProgressionFor(level,subclassId,ruleset),requested=[...(selections.expertise||[])];
    const duplicates=duplicateValues(requested);
    if(duplicates.length)throw new Error(`Duplicate Rogue Expertise choice: ${duplicates.join(", ")}.`);
    if(requested.length>progression.expertiseCount)throw new Error(`Choose at most ${progression.expertiseCount} Rogue Expertise option${progression.expertiseCount===1?"":"s"}.`);
    if(ruleset==="2024"&&requested.includes("Thieves' Tools"))throw new Error("2024 Rogue Expertise can only select skill proficiencies.");
    const legal=uniqueStrings([...skills,...(ruleset==="2014"?["Thieves' Tools"]:[])]),illegal=requested.filter(value=>!legal.includes(value));
    if(illegal.length)throw new Error(`Rogue Expertise requires an existing skill or supported tool proficiency: ${illegal.join(", ")}.`);
    return uniqueStrings([...requested,...sample(legal,progression.expertiseCount-requested.length,requested)]);
  }catch(error){
    console.error("[rogue-selections] Expertise resolution failed",error);
    throw error;
  }
}

export function reserveRogueExpertiseSkills(cls,background,selections={},guaranteedSkills=[]){
  try{
    const backgroundSkills=[...(background?.skills||[])],guaranteed=new Set(guaranteedSkills),requested=[...(selections.expertise||[])],requestedSkills=requested.filter(value=>value!=="Thieves' Tools"),reserved=uniqueStrings(requestedSkills.filter(skill=>!backgroundSkills.includes(skill)&&!guaranteed.has(skill)&&cls.skillChoices.includes(skill))),unsupported=requestedSkills.filter(skill=>!backgroundSkills.includes(skill)&&!guaranteed.has(skill)&&!cls.skillChoices.includes(skill));
    if(unsupported.length)throw new Error(`Fixed Rogue Expertise must come from a fixed background, species-granted skill, or Rogue skill choice: ${unsupported.join(", ")}.`);
    if(reserved.length>cls.skillCount)throw new Error("Fixed Rogue Expertise requires more Rogue skill proficiencies than the class can choose.");
    return{backgroundSkills,reserved};
  }catch(error){
    console.error("[rogue-selections] skill reservation failed",error);
    throw error;
  }
}
