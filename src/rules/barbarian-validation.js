import { abilityMod } from "./math.js";
import { speciesSpeed } from "./species.js";
import { barbarianProgressionFor } from "./barbarian.js";

const PROGRESSION_KEYS=["rageUses","unlimitedRage","rageDamage","masteryCount","attacksPerAction","speedBonus","initiativeAdvantage","primalKnowledge","instinctivePounce","brutalCriticalDice","brutalStrikeDice","brutalStrikeEffectCount","relentlessRage","relentlessRageHp","persistentRage","indomitableMight","primalChampion","primalChampionMaximum","frenzy","mindlessRage","retaliation","intimidatingPresence"];

export function validateBarbarianCharacter(character){
  try{
    const errors=[],expected=barbarianProgressionFor(character.ruleset,character.level,character.subclass?.id),actual=character.barbarian;
    if(!actual)return["Barbarian progression data is missing."];
    for(const key of PROGRESSION_KEYS)if(actual[key]!==expected[key])errors.push(`Barbarian ${key} should be ${String(expected[key])}.`);
    if(JSON.stringify(actual.brutalStrikeEffects)!==JSON.stringify(expected.brutalStrikeEffects))errors.push("Barbarian Brutal Strike options are incorrect.");
    if(character.masteryIds.length!==expected.masteryCount)errors.push(`Barbarian should have ${expected.masteryCount} Weapon Mastery choices.`);
    if(Boolean(character.initiativeAdvantage)!==Boolean(expected.initiativeAdvantage))errors.push("Barbarian Feral Instinct initiative state is incorrect.");
    const expectedSpeed=speciesSpeed(character)+expected.speedBonus;if(character.speed!==expectedSpeed)errors.push(`Barbarian Speed should be ${expectedSpeed} ft.`);
    if(!character.equipment.armor){const expectedAc=10+abilityMod(character.abilities.dex)+abilityMod(character.abilities.con)+(character.equipment.shield?2:0)+(character.homebrewAcBonus||0);if(character.ac!==expectedAc)errors.push(`Barbarian Unarmored Defense AC should be ${expectedAc}.`);}
    if(character.ruleset==="2014")validate2014(errors,character,expected);else if(character.ruleset==="2024")validate2024(errors,character,expected);else errors.push(`Barbarian is not verified for ruleset ${character.ruleset}.`);
    return errors;
  }catch(error){console.error("[barbarian-validation] validation failed",error);throw error;}
}
function validate2014(errors,character,progression){
  try{
    if(character.masteryIds.length)errors.push("2014 Barbarian cannot contain Weapon Mastery.");
    if(character.feats.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Barbarian cannot contain a 2024 Epic Boon.");
    if(progression.primalChampion){if(character.abilityMaximums.str!==24||character.abilityMaximums.con!==24)errors.push("2014 Primal Champion must set Strength and Constitution maximums to 24.");}
    for(const name of ["Weapon Mastery — Barbarian","Primal Knowledge","Instinctive Pounce","Brutal Strike","Improved Brutal Strike","Epic Boon"])if(character.features.includes(name))errors.push(`2014 Barbarian cannot contain 2024 feature ${name}.`);
  }catch(error){console.error("[barbarian-validation] 2014 validation failed",error);throw error;}
}
function validate2024(errors,character,progression){
  try{
    if(character.level>=3&&character.skills.length<5)errors.push("2024 Barbarian Primal Knowledge is missing its extra skill proficiency.");
    const boon=character.feats.some(feat=>feat.id==="boon-irresistible-offense");
    if(character.level>=19&&!boon)errors.push("Level 19+ Barbarian is missing Boon of Irresistible Offense.");
    if(character.level<19&&boon)errors.push("Boon of Irresistible Offense appeared before Barbarian level 19.");
    if(boon&&(!["str","dex"].includes(character.epicBoonAbility)||character.abilityMaximums[character.epicBoonAbility]!==30))errors.push("Boon of Irresistible Offense ability increase/max is incomplete.");
    if(progression.primalChampion&&character.abilityMaximums.con<25)errors.push("2024 Primal Champion must raise the Constitution maximum to at least 25.");
    for(const name of ["Brutal Critical"])if(character.features.includes(name))errors.push(`2024 Barbarian cannot contain 2014 feature ${name}.`);
  }catch(error){console.error("[barbarian-validation] 2024 validation failed",error);throw error;}
}
