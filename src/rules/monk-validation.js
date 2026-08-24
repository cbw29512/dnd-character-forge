import { abilityMod } from "./math.js";
import { MONK_TOOL_CHOICES } from "../data/monk-class.js";
import { monkProgressionFor, monkSaveDc, monkWholenessUses } from "./monk.js";
import { speciesSpeed } from "./species.js";

const CORE_KEYS=["martialArtsDie","resourceName","resourcePoints","resourceRecovery","unarmoredMovementBonus","attacksPerAction","flurryOfBlows","flurryStrikeCount","patientDefense","stepOfTheWind","uncannyMetabolism","deflectMissiles","deflectAttacks","slowFall","stunningStrike","stunningStrikeOncePerTurn","empoweredStrikes","evasion","acrobaticMovement","allSaveProficiency","saveReroll","perfectFocus","emptyBody","superiorDefense","epicBoon","bodyAndMind","openHandTechnique","wholenessOfBody","tranquility","fleetStep","quiveringPalm","quiveringPalmCost","quiveringPalmDamage"];

export function validateMonkCharacter(character){
  try{
    const errors=[],actual=character.monk;if(!actual)return["Monk progression data is missing."];
    const expected=monkProgressionFor(character.ruleset,character.level,character.subclass?.id);
    for(const key of CORE_KEYS)if(actual[key]!==expected[key])errors.push(`Monk ${key} should be ${String(expected[key])}.`);
    if(character.equipment?.armor)errors.push("Monk starting equipment cannot contain armor.");
    if(character.equipment?.shield)errors.push("Monk starting equipment cannot contain a shield.");
    validateTool(errors,character);
    validateCombat(errors,character,expected);
    if(character.ruleset==="2014")validate2014(errors,character,expected);else if(character.ruleset==="2024")validate2024(errors,character,expected);else errors.push(`Monk is not verified for ruleset ${character.ruleset}.`);
    return errors;
  }catch(error){console.error("[monk-validation] validation failed",error);throw error;}
}

function validateTool(errors,c){
  try{
    const tool=c.monkSelections?.tool;if(!tool)errors.push("Monk tool selection is missing.");else if(!MONK_TOOL_CHOICES.includes(tool))errors.push(`Unsupported Monk tool proficiency: ${tool}.`);else if(!c.toolProficiencies.includes(tool))errors.push(`Monk tool proficiency ${tool} is missing from Tools.`);
    if(c.ruleset==="2024"&&tool&&!c.equipment.gear.includes(tool))errors.push("2024 Monk starting equipment is missing the chosen tool.");
  }catch(error){console.error("[monk-validation] tool validation failed",error);throw error;}
}

function validateCombat(errors,c,expected){
  try{
    const dex=abilityMod(c.abilities.dex),wis=abilityMod(c.abilities.wis),pb=c.proficiency,expectedAc=10+dex+wis+(c.homebrewAcBonus||0);if(c.ac!==expectedAc)errors.push(`Monk AC should be ${expectedAc}.`);
    const expectedSpeed=speciesSpeed(c)+expected.unarmoredMovementBonus;if(c.speed!==expectedSpeed)errors.push(`Monk speed should be ${expectedSpeed}.`);
    const unarmed=c.attacks.find(attack=>attack.id==="unarmed-strike");if(!unarmed)errors.push("Monk Unarmed Strike is missing from attacks.");else{if(unarmed.damage!==`1${expected.martialArtsDie}`)errors.push(`Monk Unarmed Strike damage should be 1${expected.martialArtsDie}.`);if(unarmed.attackBonus!==dex+pb)errors.push("Monk Unarmed Strike attack bonus is incorrect.");if(unarmed.damageBonus!==dex)errors.push("Monk Unarmed Strike damage bonus is incorrect.");}
    if(expected.allSaveProficiency)for(const ability of ["str","dex","con","int","wis","cha"]){const minimum=abilityMod(c.abilities[ability])+pb;if(c.saveBonuses[ability]!==minimum)errors.push(`Monk ${ability.toUpperCase()} save should include proficiency.`);}
    if(monkSaveDc(c)!==8+pb+wis)errors.push("Monk save DC calculation is incorrect.");
  }catch(error){console.error("[monk-validation] combat validation failed",error);throw error;}
}

function validate2014(errors,c,expected){
  try{
    if(expected.resourceName!=="Ki")errors.push("2014 Monk must use Ki.");for(const name of ["Monk's Focus","Uncanny Metabolism","Deflect Attacks","Heightened Focus","Self-Restoration","Disciplined Survivor","Perfect Focus","Superior Defense","Epic Boon","Body and Mind","Fleet Step"])if(c.features.includes(name))errors.push(`2014 Monk cannot contain 2024 feature ${name}.`);
    if(c.feats.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Monk cannot contain a 2024 Epic Boon.");if(c.level>=20&&!c.features.includes("Perfect Self"))errors.push("2014 Monk is missing Perfect Self.");if(c.level>=6&&c.subclass?.id==="open-hand"&&monkWholenessUses(c)!==1)errors.push("2014 Wholeness of Body must have one use per Long Rest.");
  }catch(error){console.error("[monk-validation] 2014 validation failed",error);throw error;}
}

function validate2024(errors,c,expected){
  try{
    if(expected.resourceName!=="Focus")errors.push("2024 Monk must use Focus Points.");for(const name of ["Ki","Deflect Missiles","Stillness of Mind","Purity of Body","Tongue of the Sun and Moon","Diamond Soul","Timeless Body","Empty Body","Perfect Self","Tranquility"])if(c.features.includes(name))errors.push(`2024 Monk cannot contain legacy feature ${name}.`);
    const boon=c.feats.some(feat=>feat.id==="boon-irresistible-offense");if(c.level>=19&&!boon)errors.push("Level 19+ Monk is missing Boon of Irresistible Offense.");if(c.level<19&&boon)errors.push("Boon of Irresistible Offense appeared before Monk level 19.");
    if(c.level>=20){if(c.abilityMaximums.dex<25||c.abilityMaximums.wis<25)errors.push("Body and Mind must raise Dexterity and Wisdom maximums to at least 25.");if(!c.features.includes("Body and Mind"))errors.push("Level 20 Monk is missing Body and Mind.");}
    if(c.level>=6&&c.subclass?.id==="open-hand"&&monkWholenessUses(c)!==Math.max(1,abilityMod(c.abilities.wis)))errors.push("2024 Wholeness of Body uses must equal Wisdom modifier, minimum one.");
  }catch(error){console.error("[monk-validation] 2024 validation failed",error);throw error;}
}
