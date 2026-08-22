import { validateCharacter as validateCoreCharacter } from "./validation-core.js";
import { duplicateValues } from "./duplicates.js";
import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { monkProgression } from "./monk.js";
import { monkWeaponDamage } from "./monk-attacks.js";

export function validateCharacter(character,mode){
  try{
    const core=validateCoreCharacter(character,mode),errors=[...core.errors];
    validateProficiencies(errors,character);
    validateMonkWeaponAttacks(errors,character);
    return{valid:errors.length===0,errors};
  }catch(error){console.error("[validation] wrapped character validation failed",error);throw error;}
}

function validateProficiencies(errors,character){
  try{
    if(!Array.isArray(character.languages)||!character.languages.length)errors.push("Character languages are missing.");
    if(!Array.isArray(character.tools))errors.push("Character tool proficiencies are missing.");
    const duplicates=duplicateValues(character.tools||[]);if(duplicates.length)errors.push(`Duplicate tool proficiencies detected: ${duplicates.join(", ")}.`);
    if(character.background?.tool&&!character.tools.includes(character.background.tool))errors.push(`Background tool proficiency is missing: ${character.background.tool}.`);
    for(const tool of character.class?.tools||[])if(!character.tools.includes(tool))errors.push(`${character.class.name} tool proficiency is missing: ${tool}.`);
    if(character.class?.toolCount){
      const legal=new Set(character.class.toolChoices||[]),chosen=character.tools.filter(tool=>legal.has(tool));
      if(chosen.length<character.class.toolCount)errors.push(`${character.class.name} requires ${character.class.toolCount} class tool proficiency choice${character.class.toolCount===1?"":"s"}.`);
      if(chosen.length>character.class.toolCount)errors.push(`${character.class.name} has too many class tool proficiency choices.`);
      if(character.ruleset==="2024"&&character.class.id==="monk"){
        for(const tool of chosen){const item=(character.inventory||[]).find(entry=>entry.name===tool);if(!item)errors.push(`2024 Monk starting equipment is missing the chosen tool: ${tool}.`);else if(item.quantity!==1)errors.push(`2024 Monk should have exactly one chosen class tool: ${tool}.`);}
      }
    }
    if(character.class?.id==="rogue"&&!character.tools.includes("Thieves' Tools"))errors.push("Rogue is missing Thieves' Tools proficiency.");
    if(character.ruleset==="2024"&&character.background?.tool){const item=(character.inventory||[]).find(entry=>entry.name===character.background.tool);if(item&&item.quantity!==1)errors.push(`Background starting equipment should contain exactly one ${character.background.tool}.`);}
  }catch(error){console.error("[validation] proficiency validation failed",error);throw error;}
}

function validateMonkWeaponAttacks(errors,character){
  try{
    if(character.class?.id!=="monk")return;
    const data=character.ruleset==="2014"?RAW_2014:RAW_2024,row=monkProgression(character.ruleset,character.level);
    for(const weaponId of character.equipment?.weapons||[]){
      const rawWeapon=data.weapons[weaponId],attack=(character.attacks||[]).find(item=>item.id===weaponId);
      if(!rawWeapon){errors.push(`Monk RAW weapon record is missing: ${weaponId}.`);continue;}
      if(!attack){errors.push(`Monk attack entry is missing: ${weaponId}.`);continue;}
      const expected=monkWeaponDamage(weaponId,rawWeapon,row.martialArts);
      if(attack.damage!==expected)errors.push(`${attack.name} should use ${expected} damage for this Monk level.`);
    }
  }catch(error){console.error("[validation] Monk weapon attack validation failed",error);throw error;}
}
