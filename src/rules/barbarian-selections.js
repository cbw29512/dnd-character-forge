import { pick } from "./random.js";

export function resolvePrimalKnowledgeSkill({ruleset,level,cls,skills=[],selections={}}){
  try{
    const requested=selections.primalKnowledgeSkill||null;
    if(ruleset!=="2024"||Number(level)<3){
      if(requested)throw new Error("Primal Knowledge skill is unavailable before 2024 Barbarian level 3.");
      return null;
    }
    if(cls?.id!=="barbarian")throw new Error("Primal Knowledge is only available to Barbarians.");
    if(requested&&!cls.skillChoices.includes(requested))throw new Error(`Illegal Primal Knowledge skill: ${requested}.`);
    const available=cls.skillChoices.filter(skill=>!skills.includes(skill));
    if(requested&&!available.includes(requested))throw new Error(`Primal Knowledge must grant another skill proficiency; ${requested} is already known.`);
    if(!available.length)throw new Error("No legal Primal Knowledge skill remains after existing proficiencies.");
    return requested||pick(available);
  }catch(error){
    console.error("[barbarian-selections] Primal Knowledge resolution failed",error);
    throw error;
  }
}
