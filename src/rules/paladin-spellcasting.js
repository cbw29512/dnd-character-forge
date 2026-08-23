import { paladinSpellsFor } from "../data/paladin-spells.js";
import { clericSpellsFor } from "../data/cleric-spells.js";
import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { paladinMaxSpellLevel, paladinPreparedCount, paladinSpellSlots } from "./paladin.js";

const DEVOTION_2014=Object.freeze([[3,["protection-from-evil-and-good","sanctuary"]],[5,["lesser-restoration","zone-of-truth"]],[9,["beacon-of-hope","dispel-magic"]],[13,["freedom-of-movement","guardian-of-faith"]],[17,["commune","flame-strike"]]]);
const DEVOTION_2024=Object.freeze([[3,["protection-from-evil-and-good","shield-of-faith"]],[5,["aid","zone-of-truth"]],[9,["beacon-of-hope","dispel-magic"]],[13,["freedom-of-movement","guardian-of-faith"]],[17,["commune","flame-strike"]]]);

export function devotionAlwaysPrepared(ruleset,level,subclassId){
  try{if(subclassId!=="oath-devotion")return[];return uniqueStrings((ruleset==="2014"?DEVOTION_2014:DEVOTION_2024).filter(([minimum])=>Number(level)>=minimum).flatMap(([,ids])=>ids));}
  catch(error){console.error("[paladin-spellcasting] Devotion spell lookup failed",error);throw error;}
}

export function paladinAlwaysPrepared(character){
  try{
    const always=devotionAlwaysPrepared(character.ruleset,character.level,character.subclass?.id);
    if(character.ruleset==="2024"&&character.level>=2)always.push("divine-smite");
    if(character.ruleset==="2024"&&character.level>=5)always.push("find-steed");
    return uniqueStrings(always);
  }catch(error){console.error("[paladin-spellcasting] always-prepared resolution failed",error);throw error;}
}

export function validatePaladinSpellSelections(character,selections={}){
  try{
    const prepared=selections.prepared||[],cantrips=selections.cantrips||[],duplicates=[...duplicateValues(prepared),...duplicateValues(cantrips)];if(duplicates.length)throw new Error(`Duplicate Paladin spell selection: ${duplicates.join(", ")}`);
    const preparedLimit=paladinPreparedCount(character),maxLevel=paladinMaxSpellLevel(character.ruleset,character.level),catalog=paladinSpellsFor(character.ruleset),always=new Set(paladinAlwaysPrepared(character));
    if(prepared.length>preparedLimit)throw new Error(`Choose at most ${preparedLimit} prepared Paladin spells.`);
    if(character.ruleset==="2014"&&character.level<2&&prepared.length)throw new Error("2014 Paladin spellcasting is unavailable before level 2.");
    const legalPrepared=new Set(catalog.filter(spell=>spell.level>0&&spell.level<=maxLevel&&!always.has(spell.id)).map(spell=>spell.id)),badPrepared=prepared.filter(id=>!legalPrepared.has(id));if(badPrepared.length)throw new Error(`Illegal Paladin prepared-spell selection: ${badPrepared.join(", ")}`);
    const blessed=character.fightingStyle?.id==="blessed-warrior"||character.fightingStyles?.some(style=>style.id==="blessed-warrior");
    if(!blessed&&cantrips.length)throw new Error("Paladin cantrip selections require Blessed Warrior.");
    if(cantrips.length>2)throw new Error("Blessed Warrior grants exactly two Cleric cantrips.");
    if(blessed){const legalCantrips=new Set(clericSpellsFor("2024").filter(spell=>spell.level===0).map(spell=>spell.id)),bad=cantrips.filter(id=>!legalCantrips.has(id));if(bad.length)throw new Error(`Illegal Blessed Warrior cantrip selection: ${bad.join(", ")}`);}
    return{valid:true,preparedLimit,maxLevel};
  }catch(error){console.error("[paladin-spellcasting] selection validation failed",error);throw error;}
}

export function buildPaladinSpellcasting(character,selections={}){
  try{
    validatePaladinSpellSelections(character,selections);
    const slots=paladinSpellSlots(character.ruleset,character.level),preparedCount=paladinPreparedCount(character),maxLevel=paladinMaxSpellLevel(character.ruleset,character.level),catalog=paladinSpellsFor(character.ruleset),alwaysPrepared=paladinAlwaysPrepared(character),always=new Set(alwaysPrepared),normalPool=catalog.filter(spell=>spell.level>0&&spell.level<=maxLevel&&!always.has(spell.id)).map(spell=>spell.id);
    const prepared=resolveSpellChoices({available:normalPool,selected:selections.prepared||[],required:preparedCount,label:"prepared Paladin spells"});
    const blessed=character.ruleset==="2024"&&(character.fightingStyle?.id==="blessed-warrior"||character.fightingStyles?.some(style=>style.id==="blessed-warrior")),cantripPool=clericSpellsFor("2024").filter(spell=>spell.level===0).map(spell=>spell.id),cantrips=resolveSpellChoices({available:blessed?cantripPool:[],selected:selections.cantrips||[],required:blessed?2:0,label:"Blessed Warrior cantrips"});
    const namesById=new Map([...catalog,...clericSpellsFor("2024").filter(spell=>spell.level===0)].map(spell=>[spell.id,spell.name])),all=uniqueStrings([...cantrips.all,...prepared.all,...alwaysPrepared].map(id=>namesById.get(id)||id));
    return{ability:"cha",saveDc:8+character.proficiency+abilityMod(character.abilities.cha),attackBonus:character.proficiency+abilityMod(character.abilities.cha),slots,cantrips,prepared,alwaysPrepared,all};
  }catch(error){console.error("[paladin-spellcasting] spellcasting build failed",error);throw error;}
}
