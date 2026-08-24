import { RAW_2014 } from "./raw-2014.js";
import { RAW_2024 } from "./raw-2024.js";
import { BARD_CLASS_2014, BARD_CLASS_2024, BARD_SUBCLASS_2014, BARD_SUBCLASS_2024 } from "./bard-class.js";

function extend(raw,bardClass,bardSubclass){
  try{
    if(raw.classes.some(item=>item.id==="bard")||raw.subclasses.some(item=>item.classId==="bard"))throw new Error(`Base ${raw.ruleset} RAW catalog already contains Bard; remove the extension instead of duplicating it.`);
    return Object.freeze({...raw,classes:Object.freeze([...raw.classes,bardClass]),subclasses:Object.freeze([...raw.subclasses,bardSubclass])});
  }catch(error){console.error(`[forge-data] ${raw?.ruleset||"unknown"} extension failed`,error);throw error;}
}

export const FORGE_2014=extend(RAW_2014,BARD_CLASS_2014,BARD_SUBCLASS_2014);
export const FORGE_2024=extend(RAW_2024,BARD_CLASS_2024,BARD_SUBCLASS_2024);
export function forgeDataFor(ruleset){try{if(ruleset==="2014")return FORGE_2014;if(ruleset==="2024")return FORGE_2024;throw new Error(`Unsupported forge ruleset: ${ruleset}.`);}catch(error){console.error("[forge-data] ruleset lookup failed",error);throw error;}}
