import { forgeDataFor } from "../data/forge-data.js";
import { deriveCharacter } from "./derive.js";
import { validateCharacter } from "./validation.js";
import { validateBarbarianCharacter } from "./barbarian-validation.js";
import { validateBardCharacter } from "./bard-validation.js";
import { validateSorcererCharacter } from "./sorcerer-validation.js";
import { validateWarlockCharacter } from "./warlock-validation.js";
import { validateDruidCharacter } from "./druid-validation.js";
import { validatePaladinCharacter } from "./paladin-validation.js";
import { validateRangerCharacter } from "./ranger-validation.js";
import { buildRulesAudit } from "./audit-router.js";

export function finalizeExistingCharacter(input){
  try{
    if(!input||typeof input!=="object")throw new Error("Saved character payload is missing.");
    const saved=structuredClone(input);
    delete saved.validation;
    delete saved.audit;
    const data=forgeDataFor(saved.ruleset);
    // A backup is an untrusted transport format. Its IDs are fingerprinted, but
    // the embedded catalog objects are not authoritative. Rehydrate those
    // objects from the current Forge catalog before any derivation or rendering
    // so edited labels or mechanical fields cannot cross the trust boundary.
    const character=restoreCatalogObjects(saved,data);
    const derived=deriveCharacter(character,data);
    const baseValidation=validateCharacter(derived,derived.sourceMode),extraErrors=classSpecificErrors(derived);
    const validation=Object.freeze({valid:baseValidation.errors.length+extraErrors.length===0,errors:Object.freeze([...baseValidation.errors,...extraErrors])});
    if(!validation.valid)throw new Error(`Saved character failed current validation: ${validation.errors.join(" ")}`);
    const audit=buildRulesAudit(derived,validation);
    return{...derived,validation,audit};
  }catch(error){console.error("[finalize-character] saved character rejected",error);throw error;}
}

function restoreCatalogObjects(character,data){
  try{
    const cls=requireCatalogEntry(data.classes,character.class?.id,"class");
    const species=requireCatalogEntry(data.species,character.species?.id,"species");
    const background=requireCatalogEntry(data.backgrounds,character.background?.id,"background");
    let subclass=null;
    if(character.subclass){
      subclass=data.subclasses.find(item=>item.id===character.subclass?.id&&item.classId===cls.id)||null;
      if(!subclass)throw new Error(`Saved subclass is unavailable for ${cls.name}: ${String(character.subclass?.id||"unknown")}.`);
    }
    return{...character,class:cls,species,background,subclass};
  }catch(error){console.error("[finalize-character] catalog restoration failed",error);throw error;}
}

function requireCatalogEntry(entries,id,label){
  try{
    const entry=entries.find(item=>item.id===id);
    if(!entry)throw new Error(`Saved ${label} is unavailable in the current Forge catalog: ${String(id||"unknown")}.`);
    return entry;
  }catch(error){console.error(`[finalize-character] ${label} lookup failed`,error);throw error;}
}

function classSpecificErrors(character){
  try{
    if(character.class?.id==="barbarian")return validateBarbarianCharacter(character);
    if(character.class?.id==="bard")return validateBardCharacter(character);
    if(character.class?.id==="sorcerer")return validateSorcererCharacter(character);
    if(character.class?.id==="warlock")return validateWarlockCharacter(character);
    if(character.class?.id==="druid")return validateDruidCharacter(character);
    if(character.class?.id==="paladin")return validatePaladinCharacter(character);
    if(character.class?.id==="ranger")return validateRangerCharacter(character);
    return[];
  }catch(error){console.error("[finalize-character] class validation failed",error);throw error;}
}
