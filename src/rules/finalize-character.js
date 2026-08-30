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
    const character=structuredClone(input);
    delete character.validation;
    delete character.audit;
    const data=forgeDataFor(character.ruleset);
    const derived=deriveCharacter(character,data);
    const baseValidation=validateCharacter(derived,derived.sourceMode),extraErrors=classSpecificErrors(derived);
    const validation=Object.freeze({valid:baseValidation.errors.length+extraErrors.length===0,errors:Object.freeze([...baseValidation.errors,...extraErrors])});
    if(!validation.valid)throw new Error(`Saved character failed current validation: ${validation.errors.join(" ")}`);
    const audit=buildRulesAudit(derived,validation);
    return{...derived,validation,audit};
  }catch(error){console.error("[finalize-character] saved character rejected",error);throw error;}
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
