import { bardMagicalSecretsPool } from "../data/bard-magical-secrets.js";
import { clericSpellsFor } from "../data/cleric-spells.js";
import { druidSpellsFor } from "../data/druid-spells.js";
import { paladinSpellsFor } from "../data/paladin-spells.js";
import { rangerSpellsFor, RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024 } from "../data/ranger-spells.js";
import { sorcererSpellsFor } from "../data/sorcerer-spells.js";
import { DRACONIC_SPELLS_2024 } from "../data/sorcerer-draconic-spells.js";
import { warlockAlwaysPrepared2024, warlockSpellsFor } from "../data/warlock-spells.js";
import { wizardSpellsFor } from "../data/wizard-spells.js";

export function spellDisplayCatalog(character){
  try{return new Map(spellDisplayRecords(character).map(spell=>[spell.id,spell]));}
  catch(error){console.error("[spell-display-catalog] catalog build failed",error);throw error;}
}

export function spellDisplayRecords(character){
  try{
    const classId=character?.class?.id,ruleset=character?.ruleset;
    if(!classId||!["2014","2024"].includes(ruleset))throw new Error("A supported spellcasting character is required for display metadata.");
    if(classId==="wizard")return verifiedUnique(wizardSpellsFor(ruleset));
    if(classId==="cleric")return verifiedUnique(clericSpellsFor(ruleset));
    if(classId==="bard")return verifiedUnique(bardMagicalSecretsPool(ruleset));
    if(classId==="druid")return verifiedUnique(druidSpellsFor(ruleset,{includeCircle:true}));
    if(classId==="paladin"){
      const records=[...paladinSpellsFor(ruleset)];
      if(ruleset==="2024")records.push(...clericSpellsFor("2024").filter(spell=>spell.level===0));
      return verifiedUnique(records);
    }
    if(classId==="ranger"){
      const records=[...rangerSpellsFor(ruleset)];
      if(ruleset==="2024")records.push(...RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024);
      return verifiedUnique(records);
    }
    if(classId==="sorcerer"){
      const records=[...sorcererSpellsFor(ruleset)];
      if(ruleset==="2024")for(const spell of DRACONIC_SPELLS_2024)records.push({id:spell.id,name:spell.name,level:spell.spellLevel,school:null});
      return verifiedUnique(records);
    }
    if(classId==="warlock"){
      const records=[...warlockSpellsFor(ruleset,{subclassId:character.subclass?.id})];
      if(ruleset==="2024")records.push(...warlockAlwaysPrepared2024(character.level,character.subclass?.id));
      return verifiedUnique(records);
    }
    throw new Error(`Unsupported spell display class: ${classId}.`);
  }catch(error){console.error("[spell-display-catalog] record resolution failed",error);throw error;}
}

function verifiedUnique(records){
  try{
    const byId=new Map();
    for(const spell of records||[]){
      if(!spell?.id||!spell?.name||!Number.isInteger(spell.level)||spell.level<0||spell.level>9)throw new Error(`Invalid spell display record: ${spell?.id||"unknown"}.`);
      const current=byId.get(spell.id);
      if(current&&current.level!==spell.level)throw new Error(`Conflicting display levels for ${spell.name}: ${current.level} vs ${spell.level}.`);
      if(!current)byId.set(spell.id,Object.freeze({...spell}));
    }
    return Object.freeze([...byId.values()]);
  }catch(error){console.error("[spell-display-catalog] record verification failed",error);throw error;}
}
