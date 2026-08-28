import { pick } from "./random.js";
import { uniqueStrings } from "./duplicates.js";
import { canonicalSkillId, canonicalizeSkillValues } from "./skill-ids.js";

function activePrimalKnowledge(ruleset,level,cls){
  return ruleset==="2024"&&cls?.id==="barbarian"&&Number(level)>=3;
}

function requestedPrimalKnowledgeSkill(cls,selections={}){
  try{
    const requested=canonicalSkillId(selections.primalKnowledgeSkill,cls?.skillChoices||[]);
    return requested||(typeof selections.primalKnowledgeSkill==="string"?null:null);
  }catch(error){
    console.error("[barbarian-selections] Primal Knowledge request normalization failed",error);
    throw error;
  }
}

export function reservePrimalKnowledgeSkill({ruleset,level,cls,background,selections={},guaranteedSkills=[]}){
  try{
    if(!activePrimalKnowledge(ruleset,level,cls))return[];
    const requested=requestedPrimalKnowledgeSkill(cls,selections);
    if(!requested)return[];
    const alreadyCommitted=new Set([
      ...canonicalizeSkillValues(background?.skills||[]),
      ...canonicalizeSkillValues(selections.classSkills||[]),
      ...canonicalizeSkillValues(guaranteedSkills)
    ]);
    return alreadyCommitted.has(requested)?[]:[requested];
  }catch(error){
    console.error("[barbarian-selections] Primal Knowledge reservation failed",error);
    throw error;
  }
}

export function resolvePrimalKnowledgeSkill({ruleset,level,cls,skills=[],selections={}}){
  try{
    if(!activePrimalKnowledge(ruleset,level,cls))return null;
    const pool=uniqueStrings(cls.skillChoices||[]),existing=new Set(canonicalizeSkillValues(skills)),requested=requestedPrimalKnowledgeSkill(cls,selections);
    if(requested&&!existing.has(requested))return requested;
    const legal=pool.filter(skill=>!existing.has(skill));
    if(!legal.length)throw new Error("Primal Knowledge has no legal new Barbarian skill proficiency remaining.");
    return pick(legal);
  }catch(error){
    console.error("[barbarian-selections] Primal Knowledge resolution failed",error);
    throw error;
  }
}
