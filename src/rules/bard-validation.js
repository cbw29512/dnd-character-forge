import { abilityMod } from "./math.js";
import { bardAlwaysPrepared, bard2024NonBardCapacity } from "./bard-spellcasting.js";
import { bardProgressionFor } from "./bard.js";
import { BARD_INSTRUMENTS } from "../data/bard-class.js";
import { bardSpellsFor } from "../data/bard-spells.js";

const CORE_KEYS=["bardicInspirationDie","bardicInspirationRecovery","jackOfAllTrades","expertiseCount","songOfRestDie","fontOfInspiration","countercharm","superiorInspiration","superiorInspirationFloor","wordsOfCreation","epicBoon","loreBonusSkills","cuttingWords","peerlessSkill"];

export function validateBardCharacter(character){
  try{
    const errors=[],actual=character.bard;if(!actual)return["Bard progression data is missing."];const expected=bardProgressionFor(character.ruleset,character.level,character.subclass?.id);
    for(const key of CORE_KEYS)if(actual[key]!==expected[key])errors.push(`Bard ${key} should be ${String(expected[key])}.`);if(JSON.stringify(actual.slots)!==JSON.stringify(expected.slots))errors.push("Bard spell-slot progression is incorrect.");
    const selections=character.bardSelections||{},instruments=selections.instruments||[],loreSkills=selections.loreBonusSkills||[];if(instruments.length!==3)errors.push("Bard must have exactly three musical-instrument proficiencies.");for(const instrument of instruments){if(!BARD_INSTRUMENTS.includes(instrument))errors.push(`Unsupported Bard instrument proficiency: ${instrument}.`);if(!character.toolProficiencies.includes(instrument))errors.push(`Bard instrument proficiency ${instrument} is missing from Tools.`);}if(loreSkills.length!==expected.loreBonusSkills)errors.push(`College of Lore should grant ${expected.loreBonusSkills} bonus skills.`);for(const skill of loreSkills)if(!character.skills.includes(skill))errors.push(`College of Lore bonus skill ${skill} is missing from Skills.`);
    if(character.expertise.length!==expected.expertiseCount)errors.push(`Bard should have ${expected.expertiseCount} Expertise choices.`);if(JSON.stringify(selections.expertise||[])!==JSON.stringify(character.expertise))errors.push("Bard Expertise selection state does not match applied Expertise.");
    if(character.ruleset==="2024"&&loreSkills.length){const loreExpertise=character.expertise.filter(skill=>loreSkills.includes(skill)).length,capacity=character.level>=9?2:0;if(loreExpertise>capacity)errors.push(`2024 Bard Expertise illegally reaches ${loreExpertise} College of Lore skill(s) before their historical Expertise window.`);}
    if(!character.spells)errors.push("Bard spellcasting data is missing.");else validateSpells(errors,character,expected);
    if(character.ruleset==="2014")validate2014(errors,character,expected);else if(character.ruleset==="2024")validate2024(errors,character,expected);else errors.push(`Bard is not verified for ruleset ${character.ruleset}.`);
    const expectedUses=Math.max(1,abilityMod(character.abilities.cha));if(!Number.isInteger(expectedUses)||expectedUses<1)errors.push("Bardic Inspiration uses failed Charisma calculation.");return errors;
  }catch(error){console.error("[bard-validation] validation failed",error);throw error;}
}

function validateSpells(errors,c,expected){
  try{
    const spells=c.spells;if(JSON.stringify(spells.slots)!==JSON.stringify(expected.slots))errors.push("Bard spell slots do not match progression.");if((spells.cantrips?.all||[]).length!==expected.cantrips)errors.push(`Bard should have ${expected.cantrips} cantrips.`);
    const buckets=[spells.cantrips?.all||[],spells.known?.all||[],spells.prepared?.all||[],spells.alwaysPrepared||[]];for(const values of buckets)if(new Set(values).size!==values.length)errors.push("Bard spell bucket contains duplicate spell ids.");
    if(c.ruleset==="2014"){
      const loreCount=expected.loreMagicalSecretsCount||0,standardSecrets=expected.magicalSecretsCount||0;if((spells.known?.all||[]).length!==expected.known+loreCount)errors.push(`2014 Bard should carry ${expected.known+loreCount} total known class spells including Lore additions.`);if((spells.prepared?.all||[]).length)errors.push("2014 Bard cannot contain prepared class-spell state.");if((spells.alwaysPrepared||[]).length)errors.push("2014 Bard cannot contain always-prepared class-spell state.");if((spells.magicalSecrets||[]).length!==standardSecrets)errors.push(`2014 Bard should have ${standardSecrets} standard Magical Secrets.`);if((spells.loreDiscoveries||[]).length!==loreCount)errors.push(`2014 College of Lore should have ${loreCount} Additional Magical Secrets.`);
    }else{
      if((spells.known?.all||[]).length)errors.push("2024 Bard cannot contain spells-known class state.");if((spells.prepared?.all||[]).length!==expected.prepared)errors.push(`2024 Bard should have ${expected.prepared} normally prepared spells.`);const always=bardAlwaysPrepared(c),actualAlways=spells.alwaysPrepared||[];if(actualAlways.length!==always.length+(spells.loreDiscoveries||[]).length)errors.push("2024 Bard always-prepared spell count is incorrect.");for(const id of [...always,...(spells.loreDiscoveries||[])])if(!actualAlways.includes(id))errors.push(`2024 Bard is missing always-prepared spell ${id}.`);const baseIds=new Set(bardSpellsFor("2024").map(spell=>spell.id)),outside=(spells.prepared?.all||[]).filter(id=>!baseIds.has(id));if(outside.length>bard2024NonBardCapacity(c.level))errors.push("2024 Magical Secrets exceeds the historically reachable outside-list capacity.");if(c.level<10&&outside.length)errors.push("2024 Bard has outside-list prepared spells before Magical Secrets.");
    }
  }catch(error){console.error("[bard-validation] spell validation failed",error);throw error;}
}
function validate2014(errors,c,expected){
  try{if(c.feats.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Bard cannot contain a 2024 Epic Boon.");for(const name of ["Magical Discoveries","Words of Creation","Epic Boon"])if(c.features.includes(name))errors.push(`2014 Bard cannot contain 2024 feature ${name}.`);if(c.level>=2&&!c.features.includes("Song of Rest"))errors.push("2014 Bard is missing Song of Rest.");if(expected.loreMagicalSecretsCount&&!c.features.includes("Additional Magical Secrets"))errors.push("2014 Lore Bard is missing Additional Magical Secrets.");}
  catch(error){console.error("[bard-validation] 2014 validation failed",error);throw error;}
}
function validate2024(errors,c,expected){
  try{
    if(c.features.includes("Song of Rest"))errors.push("2024 Bard cannot contain legacy Song of Rest.");if(c.features.includes("Additional Magical Secrets"))errors.push("2024 Bard must use Magical Discoveries, not Additional Magical Secrets.");const boon=c.feats.some(feat=>feat.id==="boon-spell-recall");if(c.level>=19&&!boon)errors.push("Level 19+ Bard is missing Boon of Spell Recall.");if(c.level<19&&boon)errors.push("Boon of Spell Recall appeared before Bard level 19.");if(boon&&(!["int","wis","cha"].includes(c.epicBoonAbility)||c.abilityMaximums[c.epicBoonAbility]!==30))errors.push("Boon of Spell Recall ability increase/max is incomplete.");
    const words=["power-word-heal","power-word-kill"],always=c.spells?.alwaysPrepared||[],lore=new Set(c.spells?.loreDiscoveries||[]);for(const id of words){if(c.level>=20&&!always.includes(id))errors.push(`Words of Creation is missing ${id}.`);if(c.level<20&&always.includes(id)&&!lore.has(id))errors.push(`Words of Creation spell ${id} appeared before level 20.`);}if(expected.magicalDiscoveriesCount&&!c.features.includes("Magical Discoveries"))errors.push("2024 Lore Bard is missing Magical Discoveries.");
  }catch(error){console.error("[bard-validation] 2024 validation failed",error);throw error;}
}
