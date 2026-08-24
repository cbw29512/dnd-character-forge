import { pick } from "./random.js";

export function resolveMonkTool(cls,selections={}){
  try{
    if(!cls||cls.id!=="monk")throw new Error("Monk tool selection requires Monk class data.");
    const choices=cls.toolChoices||[];
    if(!choices.length)throw new Error("Monk tool choices are unavailable.");
    const requested=selections.monkTool;
    if(requested&&!choices.includes(requested))throw new Error(`Monk tool proficiency "${requested}" is unavailable.`);
    return requested||pick(choices);
  }catch(error){console.error("[monk] tool selection failed",error);throw error;}
}

export function resolveMonkEquipment(cls,baseEquipment,tool){
  try{
    if(!cls||cls.id!=="monk")throw new Error("Monk equipment resolution requires Monk class data.");
    if(!baseEquipment)throw new Error("Monk starting equipment package is unavailable.");
    if(!tool||(cls.toolChoices||[]).includes(tool)===false)throw new Error("Monk starting tool is invalid.");
    if(!cls.startingToolInEquipment)return baseEquipment;
    return Object.freeze({...baseEquipment,gear:Object.freeze([...(baseEquipment.gear||[]),tool])});
  }catch(error){console.error("[monk] equipment resolution failed",error);throw error;}
}
