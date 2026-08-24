import { rangerSpellsFor, RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024 } from "../data/ranger-spells.js";
import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { rangerMaxSpellLevel, rangerProgressionFor, rangerSpellChoiceCount, rangerSpellSlots } from "./ranger.js";

export function rangerAlwaysPrepared(character){
  try{return character.ruleset==="2024"?["hunters-mark"]:[];}
  catch(error){console.error("[ranger-spellcasting] always-prepared lookup failed",error);throw error;}
}

export function validateRangerSpellSelections(character,selections={}){
  try{
    const known=selections.known||[],prepared=selections.prepared||[],cantrips=selections.cantrips||[],duplicates=[...duplicateValues(known),...duplicateValues(prepared),...duplicateValues(cantrips)];if(duplicates.length)throw new Error(`Duplicate Ranger spell selection: ${duplicates.join(", ")}`);
    const count=rangerSpellChoiceCount(character),maxLevel=rangerMaxSpellLevel(character.ruleset,character.level),catalog=rangerSpellsFor(character.ruleset),legalBase=new Set(catalog.filter(spell=>spell.level>0&&spell.level<=maxLevel&&spell.id!=="hunters-mark").map(spell=>spell.id));
    if(character.ruleset==="2014"){
      if(prepared.length)throw new Error("2014 Ranger uses spells known, not prepared-spell selections.");
      if(character.level<2&&(known.length||cantrips.length))throw new Error("2014 Ranger spellcasting is unavailable before level 2.");
      if(known.length>count)throw new Error(`Choose at most ${count} known Ranger spells.`);
      const bad=known.filter(id=>!legalBase.has(id)&&id!=="hunters-mark");if(bad.length)throw new Error(`Illegal Ranger known-spell selection: ${bad.join(", ")}`);
      if(cantrips.length)throw new Error("2014 Ranger does not learn cantrips from its class.");
      return{valid:true,count,maxLevel};
    }
    if(character.ruleset!=="2024")throw new Error(`Unsupported Ranger spell ruleset: ${character.ruleset}.`);
    if(known.length)throw new Error("2024 Ranger uses prepared spells, not spells-known selections.");
    if(prepared.length>count)throw new Error(`Choose at most ${count} prepared Ranger spells.`);
    const badPrepared=prepared.filter(id=>!legalBase.has(id));if(badPrepared.length)throw new Error(`Illegal Ranger prepared-spell selection: ${badPrepared.join(", ")}`);
    const druidic=hasDruidicWarrior(character);if(!druidic&&cantrips.length)throw new Error("Ranger cantrip selections require Druidic Warrior.");if(cantrips.length>2)throw new Error("Druidic Warrior grants exactly two Druid cantrips.");
    if(druidic){const legalCantrips=new Set(RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024.map(spell=>spell.id)),bad=cantrips.filter(id=>!legalCantrips.has(id));if(bad.length)throw new Error(`Illegal Druidic Warrior cantrip selection: ${bad.join(", ")}`);}
    return{valid:true,count,maxLevel};
  }catch(error){console.error("[ranger-spellcasting] selection validation failed",error);throw error;}
}

export function buildRangerSpellcasting(character,selections={}){
  try{
    validateRangerSpellSelections(character,selections);
    const progression=rangerProgressionFor(character.ruleset,character.level,character.subclass?.id,abilityMod(character.abilities.wis)),slots=rangerSpellSlots(character.ruleset,character.level),maxLevel=rangerMaxSpellLevel(character.ruleset,character.level),catalog=rangerSpellsFor(character.ruleset),basePool=catalog.filter(spell=>spell.level>0&&spell.level<=maxLevel&&spell.id!=="hunters-mark").map(spell=>spell.id),namesById=new Map([...catalog,...RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024].map(spell=>[spell.id,spell.name]));
    if(character.ruleset==="2014"){
      const available=catalog.filter(spell=>spell.level>0&&spell.level<=maxLevel).map(spell=>spell.id),known=resolveSpellChoices({available,selected:selections.known||[],required:progression.known,label:"known Ranger spells"}),cantrips={selected:[],randomized:[],all:[]},all=uniqueStrings(known.all.map(id=>namesById.get(id)||id));
      return{ability:"wis",saveDc:8+character.proficiency+abilityMod(character.abilities.wis),attackBonus:character.proficiency+abilityMod(character.abilities.wis),slots,cantrips,known,prepared:{selected:[],randomized:[],all:[]},alwaysPrepared:[],hunterMarkFreeCasts:0,hunterMarkDie:"d6",all};
    }
    const prepared=resolveSpellChoices({available:basePool,selected:selections.prepared||[],required:progression.prepared,label:"prepared Ranger spells"}),alwaysPrepared=rangerAlwaysPrepared(character),druidic=hasDruidicWarrior(character),cantrips=resolveSpellChoices({available:druidic?RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024.map(spell=>spell.id):[],selected:selections.cantrips||[],required:druidic?2:0,label:"Druidic Warrior cantrips"}),all=uniqueStrings([...cantrips.all,...prepared.all,...alwaysPrepared].map(id=>namesById.get(id)||id));
    return{ability:"wis",saveDc:8+character.proficiency+abilityMod(character.abilities.wis),attackBonus:character.proficiency+abilityMod(character.abilities.wis),slots,cantrips,known:{selected:[],randomized:[],all:[]},prepared,alwaysPrepared,hunterMarkFreeCasts:progression.hunterMarkFreeCasts,hunterMarkDie:progression.hunterMarkDie,all};
  }catch(error){console.error("[ranger-spellcasting] spellcasting build failed",error);throw error;}
}

function hasDruidicWarrior(character){return character.ruleset==="2024"&&(character.fightingStyle?.id==="druidic-warrior"||character.fightingStyles?.some(style=>style.id==="druidic-warrior"));}
