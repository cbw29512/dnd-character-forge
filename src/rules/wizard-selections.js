import { pick } from "./random.js";

export const SCHOLAR_SKILLS=Object.freeze(["arcana","history","investigation","medicine","nature","religion"]);

export function reserveWizardScholarSkill({ruleset,level,cls,background,selections={},guaranteedSkills=[]}){
  try{
    const requested=selections.scholarExpertise||null;
    if(!requested)return[];
    if(ruleset!=="2024"||Number(level)<2)throw new Error("Scholar Expertise is available only to 2024 Wizards at level 2+.");
    if(!SCHOLAR_SKILLS.includes(requested))throw new Error(`Wizard Scholar Expertise cannot use "${requested}".`);
    const backgroundSkills=background?.skills||[],guaranteed=new Set(guaranteedSkills);
    if(backgroundSkills.includes(requested)||guaranteed.has(requested))return[];
    if(!(cls?.skillChoices||[]).includes(requested))throw new Error(`Wizard Scholar Expertise requires proficiency in ${requested}.`);
    return[requested];
  }catch(error){
    console.error("[wizard-selections] Scholar proficiency reservation failed",error);
    throw error;
  }
}

export function resolveWizardScholarExpertise({ruleset,level,skills=[],selections={}}){
  try{
    if(ruleset!=="2024"||Number(level)<2){
      if(selections.scholarExpertise)throw new Error("Scholar Expertise is unavailable for this Wizard.");
      return[];
    }
    const eligible=skills.filter(skill=>SCHOLAR_SKILLS.includes(skill));
    if(!eligible.length)throw new Error("Wizard Scholar has no eligible proficient skill.");
    const requested=selections.scholarExpertise||null;
    if(requested&&!eligible.includes(requested))throw new Error(`Wizard Scholar Expertise requires proficiency in ${requested}.`);
    return[requested||pick(eligible)];
  }catch(error){
    console.error("[wizard-selections] Scholar Expertise resolution failed",error);
    throw error;
  }
}
