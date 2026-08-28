import { pick } from "./random.js";
import { uniqueStrings } from "./duplicates.js";

export function reservePrimalKnowledgeSkill({ruleset,level,cls,selections={}}){
  try{
    if(ruleset!=="2024"||cls?.id!=="barbarian"||level<3)return[];
    const requested=selections.primalKnowledgeSkill;
    if(!requested)return[];
    if(!Array.isArray(cls.skillChoices)||!cls.skillChoices.includes(requested))throw new Error(`Primal Knowledge must use a Barbarian level-1 skill: ${requested}.`);
    return[requested];
  }catch(error){console.error("[barbarian-selections] Primal Knowledge reservation failed",error);throw error;}
}

export function resolvePrimalKnowledgeSkill({ruleset,level,cls,skills=[],selections={}}){
  try{
    if(ruleset!=="2024"||cls?.id!=="barbarian"||level<3)return null;
    const pool=uniqueStrings(cls.skillChoices||[]),existing=new Set(skills),requested=selections.primalKnowledgeSkill;
    if(requested){
      if(!pool.includes(requested))throw new Error(`Primal Knowledge must use a Barbarian level-1 skill: ${requested}.`);
      if(existing.has(requested))throw new Error(`Primal Knowledge must grant another skill proficiency. ${requested} is already proficient.`);
      return requested;
    }
    const legal=pool.filter(skill=>!existing.has(skill));
    if(!legal.length)throw new Error("Primal Knowledge has no legal new Barbarian skill proficiency remaining.");
    return pick(legal);
  }catch(error){console.error("[barbarian-selections] Primal Knowledge resolution failed",error);throw error;}
}
