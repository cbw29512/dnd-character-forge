import { ABILITIES, SOURCE } from "../schema.js";
import { abilityMod } from "./math.js";
import { lifeDomainAlwaysPrepared } from "./cleric.js";
import { duplicateValues } from "./duplicates.js";

const CLERIC_CANTRIPS={1:3,2:3,3:3,4:4,5:4},CLERIC_PREPARED_2024={1:4,2:5,3:6,4:7,5:9};
export function validateCharacter(character,mode){
  try{
    const errors=[];if(mode===SOURCE.RAW&&character.homebrew.length)errors.push("RAW characters cannot contain Homebrew content.");if(character.level<1||character.level>5)errors.push("Launch slice currently validates levels 1-5 only.");
    for(const ability of ABILITIES){const max=character.abilityMaximums[ability]??20;if(character.abilities[ability]>max)errors.push(`${ability.toUpperCase()} exceeds its maximum.`);if(character.abilities[ability]<1)errors.push(`${ability.toUpperCase()} is below 1.`);}
    checkDuplicates(errors,"skill proficiencies",character.skills);checkDuplicates(errors,"expertise entries",character.expertise);checkDuplicates(errors,"saving throw proficiencies",character.saves);checkDuplicates(errors,"languages",character.languages);checkDuplicates(errors,"feats",character.feats,item=>item.id);checkDuplicates(errors,"feat names",character.feats,item=>item.name);checkDuplicates(errors,"Homebrew entries",character.homebrew,item=>item.id);checkDuplicates(errors,"Homebrew names",character.homebrew,item=>item.name);checkDuplicates(errors,"weapon masteries",character.masteryIds);checkDuplicates(errors,"attack entries",character.attacks,item=>item.name);checkDuplicates(errors,"features",character.features);
    if(character.skills.length<character.class.skillCount)errors.push(`${character.class.name} is missing skill proficiencies.`);if(character.subclass&&character.level<character.class.subclassLevel)errors.push(`${character.class.name} subclass cannot be active before level ${character.class.subclassLevel}.`);if(character.expertise.some(skill=>!character.skills.includes(skill)))errors.push("Expertise requires an existing skill proficiency.");
    if(character.class.spellcasting==="wizard")validateWizard(errors,character);if(character.class.spellcasting==="cleric")validateCleric(errors,character);if(!Number.isInteger(character.ac)||character.ac<1)errors.push("Armor Class failed calculation.");if(!Number.isInteger(character.hp)||character.hp<1)errors.push("Hit Points failed calculation.");return{valid:errors.length===0,errors};
  }catch(error){console.error("[validation] character validation failed",error);throw error;}
}
function validateWizard(errors,character){
  try{if(!character.spells){errors.push("Wizard spellcasting data is missing.");return;}checkDuplicates(errors,"Wizard cantrips",character.spells.cantrips.all);checkDuplicates(errors,"Wizard spellbook spells",character.spells.spellbook.all);checkDuplicates(errors,"prepared Wizard spells",character.spells.prepared.all);const book=new Set(character.spells.spellbook.all),outside=character.spells.prepared.all.filter(id=>!book.has(id));if(outside.length)errors.push(`Prepared Wizard spells missing from spellbook: ${outside.join(", ")}.`);if(!Number.isInteger(character.spells.saveDc)||!Number.isInteger(character.spells.attackBonus))errors.push("Wizard spellcasting math failed.");}
  catch(error){console.error("[validation] Wizard validation failed",error);throw error;}
}
function validateCleric(errors,character){
  try{
    if(!character.spells){errors.push("Cleric spellcasting data is missing.");return;}const spells=character.spells,always=spells.alwaysPrepared||[];checkDuplicates(errors,"Cleric cantrips",spells.cantrips.all);checkDuplicates(errors,"prepared Cleric spells",spells.prepared.all);checkDuplicates(errors,"always-prepared Cleric spells",always);
    const overlap=spells.prepared.all.filter(id=>always.includes(id));if(overlap.length)errors.push(`Life Domain spells must not consume normal prepared slots: ${overlap.join(", ")}.`);
    const expectedCantrips=CLERIC_CANTRIPS[character.level]+(character.ruleset==="2024"&&character.divineOrder==="thaumaturge"?1:0),expectedPrepared=character.ruleset==="2024"?CLERIC_PREPARED_2024[character.level]:Math.max(1,character.level+abilityMod(character.abilities.wis)),expectedAlways=lifeDomainAlwaysPrepared(character.ruleset,character.level);
    if(spells.cantrips.all.length!==expectedCantrips)errors.push(`Cleric cantrip count should be ${expectedCantrips}.`);if(spells.prepared.all.length!==expectedPrepared)errors.push(`Cleric prepared-spell count should be ${expectedPrepared}.`);if(always.length!==expectedAlways.length||expectedAlways.some(id=>!always.includes(id)))errors.push("Life Domain always-prepared spells are incomplete.");
    if(character.ruleset==="2024"&&!['protector','thaumaturge'].includes(character.divineOrder))errors.push("2024 Cleric Divine Order is invalid.");if(!Number.isInteger(spells.saveDc)||!Number.isInteger(spells.attackBonus))errors.push("Cleric spellcasting math failed.");
  }catch(error){console.error("[validation] Cleric validation failed",error);throw error;}
}
function checkDuplicates(errors,label,values,keyFn=value=>value){try{const duplicates=duplicateValues(values||[],keyFn);if(duplicates.length)errors.push(`Duplicate ${label} detected: ${duplicates.join(", ")}.`);}catch(error){console.error(`[validation] duplicate check failed for ${label}`,error);throw error;}}
