import { CLERIC_SPELLS_2024 } from "../data/cleric-spells.js";
import { DRUID_SPELLS_2024 } from "../data/druid-spells.js";
import { WIZARD_SPELLS_2024 } from "../data/wizard-spells.js";
import { MAGIC_INITIATE_LISTS_2024 } from "../data/origin-feats-2024.js";
import { pick } from "./random.js";

export const MAGIC_INITIATE_ABILITIES_2024=Object.freeze(["int","wis","cha"]);
const CATALOGS=Object.freeze({cleric:CLERIC_SPELLS_2024,druid:DRUID_SPELLS_2024,wizard:WIZARD_SPELLS_2024});

export function resolveMagicInitiate(background,selections={}){
  try{
    const list=background?.magicInitiateList;
    if(!list)return null;
    return resolveMagicInitiateChoice(list,selections);
  }catch(error){console.error("[magic-initiate] background resolution failed",error);throw error;}
}

export function resolveMagicInitiateChoice(list,selections={}){
  try{
    if(!MAGIC_INITIATE_LISTS_2024.includes(list))throw new Error(`Unsupported Magic Initiate spell list: ${list}.`);
    const catalog=CATALOGS[list];
    const cantrips=catalog.filter(spell=>spell.level===0),level1=catalog.filter(spell=>spell.level===1);
    if(cantrips.length<2||!level1.length)throw new Error(`Magic Initiate ${prettyList(list)} catalog is incomplete.`);
    const ability=selectValue(MAGIC_INITIATE_ABILITIES_2024,selections.spellcastingAbility,"Magic Initiate spellcasting ability");
    const first=selectSpell(cantrips,selections.cantrip1,"Magic Initiate first cantrip");
    const second=selectSpell(cantrips.filter(spell=>spell.id!==first.id),selections.cantrip2,"Magic Initiate second cantrip");
    const spell=selectSpell(level1,selections.level1Spell,"Magic Initiate level-1 spell");
    return Object.freeze({
      spellList:list,
      spellListName:prettyList(list),
      spellcastingAbility:ability,
      cantrips:Object.freeze([first.id,second.id]),
      cantripNames:Object.freeze([first.name,second.name]),
      level1Spell:spell.id,
      level1SpellName:spell.name,
      alwaysPrepared:true,
      canCastWithSlots:true,
      freeCastUses:1,
      freeCastReset:"Long Rest",
      replaceOnLevelUp:true,
      replacementSameLevelAndList:true,
      repeatableDifferentSpellList:true
    });
  }catch(error){console.error("[magic-initiate] choice resolution failed",error);throw error;}
}

export function validateMagicInitiate(character){
  try{
    const expectedList=character?.background?.magicInitiateList,actual=character?.magicInitiate;
    if(!expectedList)return actual&&actual.source==="background"?["Magic Initiate state appeared on a background that does not grant it."]:[];
    if(!actual)return[`${character.background.name} is missing Magic Initiate choices.`];
    return validateMagicInitiateChoice(actual,expectedList);
  }catch(error){console.error("[magic-initiate] background validation failed",error);throw error;}
}

export function validateMagicInitiateChoice(actual,expectedList=null){
  try{
    const errors=[];
    if(!actual){errors.push("Magic Initiate choices are missing.");return errors;}
    const list=actual.spellList,catalog=CATALOGS[list];
    if(!MAGIC_INITIATE_LISTS_2024.includes(list)||!catalog){errors.push(`Magic Initiate spell list ${list||"unknown"} is invalid.`);return errors;}
    if(expectedList&&list!==expectedList)errors.push(`Magic Initiate spell list should be ${expectedList}.`);
    if(!MAGIC_INITIATE_ABILITIES_2024.includes(actual.spellcastingAbility))errors.push("Magic Initiate spellcasting ability is invalid.");
    if(!Array.isArray(actual.cantrips)||actual.cantrips.length!==2||new Set(actual.cantrips).size!==2)errors.push("Magic Initiate must contain two distinct cantrips.");
    for(const id of actual.cantrips||[])if(!catalog.some(spell=>spell.id===id&&spell.level===0))errors.push(`Magic Initiate cantrip ${id} is not on the ${list} list.`);
    if(!catalog.some(spell=>spell.id===actual.level1Spell&&spell.level===1))errors.push(`Magic Initiate level-1 spell ${actual.level1Spell} is not on the ${list} list.`);
    if(actual.freeCastUses!==1||actual.freeCastReset!=="Long Rest")errors.push("Magic Initiate free-cast state is incorrect.");
    if(actual.alwaysPrepared!==true||actual.canCastWithSlots!==true)errors.push("Magic Initiate prepared/slot-casting state is incomplete.");
    if(actual.replaceOnLevelUp!==true||actual.replacementSameLevelAndList!==true)errors.push("Magic Initiate spell-replacement state is incomplete.");
    if(actual.repeatableDifferentSpellList!==true)errors.push("Magic Initiate repeatability restriction is missing.");
    return errors;
  }catch(error){console.error("[magic-initiate] choice validation failed",error);throw error;}
}

export function validateMagicInitiateCollection(choices=[]){
  try{
    const errors=[],lists=[];
    for(const choice of choices||[]){errors.push(...validateMagicInitiateChoice(choice));if(choice?.spellList)lists.push(choice.spellList);}
    const duplicates=lists.filter((list,index)=>lists.indexOf(list)!==index);
    if(duplicates.length)errors.push(`Magic Initiate cannot repeat the same spell list: ${[...new Set(duplicates)].join(", ")}.`);
    return errors;
  }catch(error){console.error("[magic-initiate] collection validation failed",error);throw error;}
}

export function magicInitiateCatalog(list){
  try{const catalog=CATALOGS[list];if(!catalog)throw new Error(`Unsupported Magic Initiate spell list: ${list}.`);return catalog;}
  catch(error){console.error("[magic-initiate] catalog lookup failed",error);throw error;}
}

function selectSpell(spells,requested,label){
  try{if(!requested)return pick(spells);const spell=spells.find(item=>item.id===requested);if(!spell)throw new Error(`${label} "${requested}" is unavailable.`);return spell;}
  catch(error){console.error(`[magic-initiate] ${label} selection failed`,error);throw error;}
}
function selectValue(values,requested,label){
  try{if(!requested)return pick(values);if(!values.includes(requested))throw new Error(`${label} "${requested}" is unavailable.`);return requested;}
  catch(error){console.error(`[magic-initiate] ${label} selection failed`,error);throw error;}
}
function prettyList(list){return String(list||"").replace(/^./,char=>char.toUpperCase());}
