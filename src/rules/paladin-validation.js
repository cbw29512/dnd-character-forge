import { abilityMod } from "./math.js";
import { paladinProgressionFor } from "./paladin.js";
import { paladinAlwaysPrepared } from "./paladin-spellcasting.js";

const KEYS=["layOnHandsPool","divineSenseUses","masteryCount","prepared","fightingStyle","divineSmite","channelDivinityUses","divineHealth","attacksPerAction","auraProtection","auraRange","auraCourage","radiantStrikes","improvedDivineSmite","cleansingTouchUses","abjureFoes","restoringTouch","faithfulSteed","paladinsSmite","epicBoon","sacredWeapon","auraDevotion","purityOfSpirit","smiteOfProtection","holyNimbus"];

export function validatePaladinCharacter(character){
  try{
    const errors=[],actual=character.paladin;if(!actual)return["Paladin progression data is missing."];
    const expected=paladinProgressionFor(character.ruleset,character.level,character.subclass?.id,abilityMod(character.abilities.cha));
    for(const key of KEYS)if(actual[key]!==expected[key])errors.push(`Paladin ${key} should be ${String(expected[key])}.`);
    if(JSON.stringify(actual.slots)!==JSON.stringify(expected.slots))errors.push("Paladin spell-slot progression is incorrect.");
    const styles=character.fightingStyles||[];if(expected.fightingStyle&&styles.length!==1)errors.push("Paladin should have exactly one Fighting Style choice at this level.");if(!expected.fightingStyle&&styles.length)errors.push("Paladin Fighting Style appeared before level 2.");
    if(character.masteryIds.length!==expected.masteryCount)errors.push(`Paladin should have ${expected.masteryCount} Weapon Mastery choices.`);
    if(character.spells){if(character.spells.prepared?.all?.length!==expected.prepared)errors.push(`Paladin should have ${expected.prepared} normally prepared spells.`);if(JSON.stringify(character.spells.slots)!==JSON.stringify(expected.slots))errors.push("Paladin spellcasting slots do not match class progression.");const always=paladinAlwaysPrepared(character);for(const id of always)if(!character.spells.alwaysPrepared.includes(id))errors.push(`Paladin is missing always-prepared spell ${id}.`);}
    if(character.ruleset==="2014")validate2014(errors,character,expected);else if(character.ruleset==="2024")validate2024(errors,character,expected);else errors.push(`Paladin is not verified for ruleset ${character.ruleset}.`);
    return errors;
  }catch(error){console.error("[paladin-validation] validation failed",error);throw error;}
}
function validate2014(errors,c,expected){
  try{
    if(c.level<2&&c.spells)errors.push("2014 Paladin cannot have Spellcasting before level 2.");if(c.level>=2&&!c.spells)errors.push("2014 Paladin is missing Spellcasting at level 2+.");
    if(c.masteryIds.length)errors.push("2014 Paladin cannot contain Weapon Mastery.");if(c.feats.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Paladin cannot contain a 2024 Epic Boon.");
    for(const name of ["Weapon Mastery — Paladin","Paladin’s Smite","Faithful Steed","Abjure Foes","Radiant Strikes","Restoring Touch","Smite of Protection","Aura Expansion","Epic Boon"])if(c.features.includes(name))errors.push(`2014 Paladin cannot contain 2024 feature ${name}.`);
    if(c.level>=6&&expected.auraProtection&&expected.auraRange!==c.paladin.auraRange)errors.push("2014 Aura of Protection range is incorrect.");
  }catch(error){console.error("[paladin-validation] 2014 validation failed",error);throw error;}
}
function validate2024(errors,c,expected){
  try{
    if(!c.spells)errors.push("2024 Paladin is missing level-1 Spellcasting.");if(c.level>=1&&c.masteryIds.length!==2)errors.push("2024 Paladin must have two Weapon Mastery choices.");
    const boon=c.feats.some(feat=>feat.id==="boon-truesight");if(c.level>=19&&!boon)errors.push("Level 19+ Paladin is missing Boon of Truesight.");if(c.level<19&&boon)errors.push("Boon of Truesight appeared before Paladin level 19.");if(boon&&(!c.epicBoonAbility||c.abilityMaximums[c.epicBoonAbility]!==30))errors.push("Boon of Truesight ability increase/max is incomplete.");
    if(c.level>=2&&!c.spells.alwaysPrepared.includes("divine-smite"))errors.push("Paladin’s Smite must always prepare Divine Smite.");if(c.level>=5&&!c.spells.alwaysPrepared.includes("find-steed"))errors.push("Faithful Steed must always prepare Find Steed.");
    for(const name of ["Divine Smite","Divine Health","Improved Divine Smite","Cleansing Touch","Purity of Spirit","Turn the Unholy","Aura Improvements"])if(c.features.includes(name))errors.push(`2024 Paladin cannot contain 2014 feature ${name}.`);
    if(expected.auraProtection&&c.paladin.auraRange!==(c.level>=18?30:10))errors.push("2024 Aura of Protection range is incorrect.");
  }catch(error){console.error("[paladin-validation] 2024 validation failed",error);throw error;}
}
