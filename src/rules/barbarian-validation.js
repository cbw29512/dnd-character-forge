import { abilityMod } from "./math.js";
import { speciesSpeed } from "./species.js";
import { barbarianProgressionFor } from "./barbarian.js";
import { barbarianOriginalFeatureNames, barbarianOriginalFeaturesFor, isBarbarianForgeOriginal } from "../data/barbarian-subclasses.js";

const PROGRESSION_KEYS=["rageUses","unlimitedRage","rageDamage","masteryCount","attacksPerAction","speedBonus","initiativeAdvantage","primalKnowledge","instinctivePounce","brutalCriticalDice","brutalStrikeDice","brutalStrikeEffectCount","relentlessRage","relentlessRageHp","persistentRage","indomitableMight","primalChampion","primalChampionMaximum","frenzy","mindlessRage","retaliation","intimidatingPresence"];
const ORIGINAL_FEATURE_NAMES=barbarianOriginalFeatureNames();

export function validateBarbarianCharacter(character){
  try{
    const errors=[],expected=barbarianProgressionFor(character.ruleset,character.level,character.subclass?.id),actual=character.barbarian;
    if(!actual)return["Barbarian progression data is missing."];
    for(const key of PROGRESSION_KEYS)if(actual[key]!==expected[key])errors.push(`Barbarian ${key} should be ${String(expected[key])}.`);
    if(JSON.stringify(actual.brutalStrikeEffects)!==JSON.stringify(expected.brutalStrikeEffects))errors.push("Barbarian Brutal Strike options are incorrect.");
    if(character.masteryIds.length!==expected.masteryCount)errors.push(`Barbarian should have ${expected.masteryCount} Weapon Mastery choices.`);
    if(Boolean(character.initiativeAdvantage)!==Boolean(expected.initiativeAdvantage))errors.push("Barbarian Feral Instinct initiative state is incorrect.");
    const expectedSpeed=speciesSpeed(character)+expected.speedBonus+Number(character.advancementSpeedBonus||0);if(character.speed!==expectedSpeed)errors.push(`Barbarian Speed should be ${expectedSpeed} ft.`);
    if(!character.equipment.armor){const expectedAc=10+abilityMod(character.abilities.dex)+abilityMod(character.abilities.con)+(character.equipment.shield?2:0)+(character.homebrewAcBonus||0);if(character.ac!==expectedAc)errors.push(`Barbarian Unarmored Defense AC should be ${expectedAc}.`);}
    validateSubclassFeatures(errors,character);
    if(character.ruleset==="2014")validate2014(errors,character,expected);else if(character.ruleset==="2024")validate2024(errors,character,expected);else errors.push(`Barbarian is not verified for ruleset ${character.ruleset}.`);
    return errors;
  }catch(error){console.error("[barbarian-validation] validation failed",error);throw error;}
}
function validateSubclassFeatures(errors,character){
  try{
    const expected=new Set(barbarianOriginalFeaturesFor(character.ruleset,character.level,character.subclass?.id)),present=new Set((character.features||[]).filter(name=>ORIGINAL_FEATURE_NAMES.has(name)));
    for(const name of expected)if(!present.has(name))errors.push(`Barbarian subclass feature ${name} is missing.`);
    for(const name of present)if(!expected.has(name))errors.push(`Barbarian subclass feature ${name} is illegal for ${character.subclass?.name||"this subclass"} at level ${character.level}.`);
    if(isBarbarianForgeOriginal(character.subclass)&&!character.subclass.displayName?.includes("Forge Original"))errors.push("Forge-original Barbarian subclass is missing its explicit content label.");
  }catch(error){console.error("[barbarian-validation] subclass validation failed",error);throw error;}
}
function validate2014(errors,character,progression){
  try{
    if(character.masteryIds.length)errors.push("2014 Barbarian cannot contain Weapon Mastery.");
    if(character.barbarianSelections?.primalKnowledgeSkill)errors.push("2014 Barbarian cannot contain a Primal Knowledge skill choice.");
    if(character.feats.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Barbarian cannot contain a 2024 Epic Boon.");
    if(progression.primalChampion){if(character.abilityMaximums.str!==24||character.abilityMaximums.con!==24)errors.push("2014 Primal Champion must set Strength and Constitution maximums to 24.");}
    for(const name of ["Weapon Mastery — Barbarian","Primal Knowledge","Instinctive Pounce","Brutal Strike","Improved Brutal Strike","Epic Boon"])if(character.features.includes(name))errors.push(`2014 Barbarian cannot contain 2024 feature ${name}.`);
  }catch(error){console.error("[barbarian-validation] 2014 validation failed",error);throw error;}
}
function validate2024(errors,character,progression){
  try{
    const primalSkill=character.barbarianSelections?.primalKnowledgeSkill||null;
    if(character.level>=3){
      if(character.skills.length<5)errors.push("2024 Barbarian Primal Knowledge is missing its extra skill proficiency.");
      if(!primalSkill)errors.push("2024 Barbarian Primal Knowledge choice is not recorded.");
      else{
        if(!(character.class.skillChoices||[]).includes(primalSkill))errors.push(`2024 Barbarian Primal Knowledge cannot choose ${primalSkill}.`);
        if(!character.skills.includes(primalSkill))errors.push(`2024 Barbarian Primal Knowledge skill ${primalSkill} is missing from proficiencies.`);
        if((character.background.skills||[]).includes(primalSkill)||(character.classSkillChoices||[]).includes(primalSkill))errors.push(`2024 Barbarian Primal Knowledge must grant another skill; ${primalSkill} was already proficient.`);
      }
    }else if(primalSkill)errors.push("2024 Barbarian Primal Knowledge appeared before level 3.");
    const legalMasteries=new Set(character.class.masteryChoices||[]);if(!legalMasteries.size)errors.push("2024 Barbarian legal Weapon Mastery pool is missing.");else for(const weaponId of character.masteryIds)if(!legalMasteries.has(weaponId))errors.push(`2024 Barbarian cannot choose Weapon Mastery for ${weaponId}.`);
    const boon=character.feats.some(feat=>feat.id==="boon-irresistible-offense");
    if(character.level>=19&&!boon)errors.push("Level 19+ Barbarian is missing Boon of Irresistible Offense.");
    if(character.level<19&&boon)errors.push("Boon of Irresistible Offense appeared before Barbarian level 19.");
    if(boon&&(!["str","dex"].includes(character.epicBoonAbility)||character.abilityMaximums[character.epicBoonAbility]!==30))errors.push("Boon of Irresistible Offense ability increase/max is incomplete.");
    if(progression.primalChampion&&character.abilityMaximums.con<25)errors.push("2024 Primal Champion must raise the Constitution maximum to at least 25.");
    for(const name of ["Brutal Critical"])if(character.features.includes(name))errors.push(`2024 Barbarian cannot contain 2014 feature ${name}.`);
  }catch(error){console.error("[barbarian-validation] 2024 validation failed",error);throw error;}
}