import { RAW_2014 } from "./raw-2014.js";
import { RAW_2024 } from "./raw-2024.js";
import { BARBARIAN_FORGE_SUBCLASSES_2014, BARBARIAN_FORGE_SUBCLASSES_2024 } from "./barbarian-subclasses.js";
import { BARD_CLASS_2014, BARD_CLASS_2024, BARD_SUBCLASS_2014, BARD_SUBCLASS_2024 } from "./bard-class.js";
import { MONK_CLASS_2014, MONK_CLASS_2024, MONK_SUBCLASS_2014, MONK_SUBCLASS_2024, MONK_WEAPONS_2014, MONK_WEAPONS_2024 } from "./monk-class.js";
import { SORCERER_CLASS_2014, SORCERER_CLASS_2024, SORCERER_SUBCLASS_2014, SORCERER_SUBCLASS_2024 } from "./sorcerer-class.js";
import { WARLOCK_CLASS_2014, WARLOCK_CLASS_2024, WARLOCK_SUBCLASS_2014, WARLOCK_SUBCLASS_2024 } from "./warlock-class.js";

function extend(raw,classExtensions,subclassExtensions,weaponAdditions){
  try{
    for(const extension of classExtensions){const classId=extension.id;if(raw.classes.some(item=>item.id===classId)||raw.subclasses.some(item=>item.classId===classId))throw new Error(`Base ${raw.ruleset} RAW catalog already contains ${classId}; remove the extension instead of duplicating it.`);}
    for(const extension of subclassExtensions){if(raw.subclasses.some(item=>item.id===extension.id&&item.classId===extension.classId))throw new Error(`Base ${raw.ruleset} RAW catalog already contains subclass ${extension.id}; remove the extension instead of duplicating it.`);}
    for(const weaponId of Object.keys(weaponAdditions||{}))if(raw.weapons[weaponId])throw new Error(`Base ${raw.ruleset} RAW catalog already contains weapon ${weaponId}; remove the extension instead of duplicating it.`);
    return Object.freeze({...raw,classes:Object.freeze([...raw.classes,...classExtensions]),subclasses:Object.freeze([...raw.subclasses,...subclassExtensions]),weapons:Object.freeze({...raw.weapons,...weaponAdditions})});
  }catch(error){console.error(`[forge-data] ${raw?.ruleset||"unknown"} extension failed`,error);throw error;}
}

export const FORGE_2014=extend(RAW_2014,[BARD_CLASS_2014,MONK_CLASS_2014,SORCERER_CLASS_2014,WARLOCK_CLASS_2014],[...BARBARIAN_FORGE_SUBCLASSES_2014,BARD_SUBCLASS_2014,MONK_SUBCLASS_2014,SORCERER_SUBCLASS_2014,WARLOCK_SUBCLASS_2014],MONK_WEAPONS_2014);
export const FORGE_2024=extend(RAW_2024,[BARD_CLASS_2024,MONK_CLASS_2024,SORCERER_CLASS_2024,WARLOCK_CLASS_2024],[...BARBARIAN_FORGE_SUBCLASSES_2024,BARD_SUBCLASS_2024,MONK_SUBCLASS_2024,SORCERER_SUBCLASS_2024,WARLOCK_SUBCLASS_2024],MONK_WEAPONS_2024);
export function forgeDataFor(ruleset){try{if(ruleset==="2014")return FORGE_2014;if(ruleset==="2024")return FORGE_2024;throw new Error(`Unsupported forge ruleset: ${ruleset}.`);}catch(error){console.error("[forge-data] ruleset lookup failed",error);throw error;}}
