import { validateCharacter as validateCoreCharacter } from "./validation-core.js";
import { duplicateValues } from "./duplicates.js";

export function validateCharacter(character,mode){
  try{
    const core=validateCoreCharacter(character,mode),errors=[...core.errors];
    validateProficiencies(errors,character);
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
        const inventoryNames=new Set((character.inventory||[]).map(item=>item.name));
        for(const tool of chosen)if(!inventoryNames.has(tool))errors.push(`2024 Monk starting equipment is missing the chosen tool: ${tool}.`);
      }
    }
    if(character.class?.id==="rogue"&&!character.tools.includes("Thieves' Tools"))errors.push("Rogue is missing Thieves' Tools proficiency.");
  }catch(error){console.error("[validation] proficiency validation failed",error);throw error;}
}
