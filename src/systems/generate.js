import { DND_SYSTEM_ID } from "./dnd.js";
import { systemFor } from "./registry.js";
import { generateCharacter as generateDndCharacter } from "../rules/generator.js";

const generators=Object.freeze({[DND_SYSTEM_ID]:generateDndCharacter});

export function generateForSystem(state){
  try{
    const systemId=state?.systemId||DND_SYSTEM_ID;
    systemFor(systemId);
    const generator=generators[systemId];
    if(!generator)throw new Error(`No character generator is installed for system: ${systemId}`);
    const character=generator(state);
    return{...character,systemId};
  }catch(error){console.error("[systems] generation dispatch failed",error);throw error;}
}
