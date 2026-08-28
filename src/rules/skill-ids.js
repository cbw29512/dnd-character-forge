import { SKILLS } from "../schema.js";

const ALL_SKILL_IDS=Object.freeze(Object.keys(SKILLS));

function normalizedToken(value){
  try{
    return typeof value==="string"?value.trim().replace(/[^a-z0-9]/gi,"").toLowerCase():"";
  }catch(error){
    console.error("[skill-ids] token normalization failed",error);
    throw error;
  }
}

export function canonicalSkillId(value,candidates=ALL_SKILL_IDS){
  try{
    if(typeof value!=="string"||!value.trim())return null;
    const legal=Array.isArray(candidates)?candidates:ALL_SKILL_IDS,needle=normalizedToken(value);
    return legal.find(skill=>normalizedToken(skill)===needle)||null;
  }catch(error){
    console.error("[skill-ids] canonicalization failed",error);
    throw error;
  }
}

export function canonicalizeSkillValues(values,candidates=ALL_SKILL_IDS){
  try{
    if(!Array.isArray(values))return[];
    return values.map(value=>canonicalSkillId(value,candidates)||value);
  }catch(error){
    console.error("[skill-ids] list canonicalization failed",error);
    throw error;
  }
}
