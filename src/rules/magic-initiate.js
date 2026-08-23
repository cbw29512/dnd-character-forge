import { CLERIC_SPELLS_2024 } from "../data/cleric-spells.js";
import { WIZARD_SPELLS_2024 } from "../data/wizard-spells.js";
import { pick } from "./random.js";

const SPELL_ABILITIES=Object.freeze(["int","wis","cha"]);
const CATALOGS=Object.freeze({cleric:CLERIC_SPELLS_2024,wizard:WIZARD_SPELLS_2024});

export function resolveMagicInitiate(background,selections={}){
  try{
    const list=background?.magicInitiateList;
    if(!list)return null;
    const catalog=CATALOGS[list];if(!catalog)throw new Error(`Unsupported Magic Initiate spell list: ${list}.`);
    const cantrips=catalog.filter(spell=>spell.level===0),level1=catalog.filter(spell=>spell.level===1);
    const ability=selectValue(SPELL_ABILITIES,selections.spellcastingAbility,"Magic Initiate spellcasting ability");
    const first=selectSpell(cantrips,selections.cantrip1,"Magic Initiate first cantrip");
    const secondPool=cantrips.filter(spell=>spell.id!==first.id),second=selectSpell(secondPool,selections.cantrip2,"Magic Initiate second cantrip");
    const spell=selectSpell(level1,selections.level1Spell,"Magic Initiate level-1 spell");
    return Object.freeze({
      spellList:list,
      spellListName:list==="cleric"?"Cleric":"Wizard",
      spellcastingAbility:ability,
      cantrips:Object.freeze([first.id,second.id]),
      cantripNames:Object.freeze([first.name,second.name]),
      level1Spell:spell.id,
      level1SpellName:spell.name,
      freeCastUses:1,
      freeCastReset:"Long Rest"
    });
  }catch(error){console.error("[magic-initiate] resolution failed",error);throw error;}
}

export function validateMagicInitiate(character){
  try{
    const expectedList=character?.background?.magicInitiateList,actual=character?.magicInitiate;
    if(!expectedList)return actual?["Magic Initiate state appeared on a background that does not grant it."]:[];
    const errors=[],catalog=CATALOGS[expectedList];
    if(!actual){errors.push(`${character.background.name} is missing Magic Initiate choices.`);return errors;}
    if(actual.spellList!==expectedList)errors.push("Magic Initiate spell list is incorrect.");
    if(!SPELL_ABILITIES.includes(actual.spellcastingAbility))errors.push("Magic Initiate spellcasting ability is invalid.");
    if(!Array.isArray(actual.cantrips)||actual.cantrips.length!==2||new Set(actual.cantrips).size!==2)errors.push("Magic Initiate must contain two distinct cantrips.");
    for(const id of actual.cantrips||[])if(!catalog.some(spell=>spell.id===id&&spell.level===0))errors.push(`Magic Initiate cantrip ${id} is not on the ${expectedList} list.`);
    if(!catalog.some(spell=>spell.id===actual.level1Spell&&spell.level===1))errors.push(`Magic Initiate level-1 spell ${actual.level1Spell} is not on the ${expectedList} list.`);
    if(actual.freeCastUses!==1||actual.freeCastReset!=="Long Rest")errors.push("Magic Initiate free-cast state is incorrect.");
    return errors;
  }catch(error){console.error("[magic-initiate] validation failed",error);throw error;}
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
