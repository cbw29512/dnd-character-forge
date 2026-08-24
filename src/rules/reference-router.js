import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { buildBarbarianQuickReference } from "./barbarian-reference.js";
import { buildDruidQuickReference } from "./druid-reference.js";
import { buildPaladinQuickReference } from "./paladin-reference.js";
import { buildRangerQuickReference } from "./ranger-reference.js";

export function buildQuickReference(character){
  try{
    if(character?.class?.id==="barbarian")return buildBarbarianQuickReference(character);
    if(character?.class?.id==="druid")return buildDruidQuickReference(character);
    if(character?.class?.id==="paladin")return buildPaladinQuickReference(character);
    if(character?.class?.id==="ranger")return buildRangerQuickReference(character);
    return buildCoreQuickReference(character);
  }catch(error){console.error("[reference-router] build failed",error);throw error;}
}
