import { SKILLS } from "../schema.js";
import { canonicalSkillId, canonicalizeSkillValues } from "./skill-ids.js";
import { uniqueStrings } from "./duplicates.js";

const ALL_SKILLS=Object.freeze(Object.keys(SKILLS));
const INHERENT=Object.freeze({
  "2014":Object.freeze({elf:Object.freeze(["perception"]),"half-orc":Object.freeze(["intimidation"])}),
  "2024":Object.freeze({})
});
const SELECTED_FIELDS=Object.freeze({
  "2014":Object.freeze({"half-elf":Object.freeze(["skill1","skill2"])}),
  "2024":Object.freeze({human:Object.freeze(["skill"]),elf:Object.freeze(["keenSense"])})
});

export function inherentSpeciesSkillIds(ruleset,speciesId){
  try{
    validateRuleset(ruleset);
    return Object.freeze([...(INHERENT[ruleset][speciesId]||[])]);
  }catch(error){console.error("[species-skill-proficiencies] inherent lookup failed",error);throw error;}
}

export function guaranteedSpeciesSkillIds({ruleset,speciesId,selections={}}={}){
  try{
    validateRuleset(ruleset);
    if(!speciesId||speciesId==="random")return Object.freeze([]);
    const selected=[];
    for(const key of SELECTED_FIELDS[ruleset][speciesId]||[]){
      const skill=canonicalSkillId(selections?.[key],ALL_SKILLS);
      if(skill)selected.push(skill);
    }
    return Object.freeze(uniqueStrings([...inherentSpeciesSkillIds(ruleset,speciesId),...selected]));
  }catch(error){console.error("[species-skill-proficiencies] guaranteed lookup failed",error);throw error;}
}

export function speciesPreservesFixedSourceSkills({ruleset,speciesId,fixedSourceSkills=[]}={}){
  try{
    const fixed=new Set(canonicalizeSkillValues(fixedSourceSkills,ALL_SKILLS).filter(value=>ALL_SKILLS.includes(value)));
    return inherentSpeciesSkillIds(ruleset,speciesId).every(skill=>!fixed.has(skill));
  }catch(error){console.error("[species-skill-proficiencies] fixed-source compatibility failed",error);throw error;}
}

function validateRuleset(ruleset){
  if(!Object.hasOwn(INHERENT,ruleset))throw new Error(`Unsupported species skill ruleset: ${ruleset}.`);
}
