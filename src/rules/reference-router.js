import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { buildBarbarianQuickReference } from "./barbarian-reference.js";

export function buildQuickReference(character){
  try{return character?.class?.id==="barbarian"?buildBarbarianQuickReference(character):buildCoreQuickReference(character);}
  catch(error){console.error("[reference-router] build failed",error);throw error;}
}
