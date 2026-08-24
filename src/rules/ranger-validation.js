import { abilityMod } from "./math.js";
import { rangerAlwaysPrepared } from "./ranger-spellcasting.js";
import { FAVORED_ENEMY_LANGUAGE_OPTIONS_2014, HUNTER_DEFENSE_2014, HUNTER_DEFENSE_2024, HUNTER_MULTIATTACK_2014, HUNTER_PREY_2014, HUNTER_PREY_2024, HUNTER_SUPERIOR_DEFENSE_2014, rangerProgressionFor } from "./ranger.js";

const KEYS=["known","prepared","hunterMarkFreeCasts","hunterMarkDie","masteryCount","fightingStyle","favoredEnemyCount","naturalExplorerTerrainCount","primevalAwareness","attacksPerAction","landsStride","hideInPlainSight","roving","speedBonus","expertiseCount","extraLanguages","tireless","tirelessUses","vanish","relentlessHunter","natureVeil","natureVeilUses","preciseHunter","feralSenses","blindsightRange","epicBoon","foeSlayer","huntersLore","superiorHuntersPrey","superiorHuntersDefense","hunter"];

export function validateRangerCharacter(character){
  try{
    const errors=[],actual=character.ranger;if(!actual)return["Ranger progression data is missing."];
    const expected=rangerProgressionFor(character.ruleset,character.level,character.subclass?.id,abilityMod(character.abilities.wis));
    for(const key of KEYS)if(actual[key]!==expected[key])errors.push(`Ranger ${key} should be ${String(expected[key])}.`);
    if(JSON.stringify(actual.slots)!==JSON.stringify(expected.slots))errors.push("Ranger spell-slot progression is incorrect.");
    const styles=character.fightingStyles||[];if(expected.fightingStyle&&styles.length!==1)errors.push("Ranger should have exactly one Fighting Style choice at this level.");if(!expected.fightingStyle&&styles.length)errors.push("Ranger Fighting Style appeared before its legal level.");
    if((character.masteryIds||[]).length!==expected.masteryCount)errors.push(`Ranger should have ${expected.masteryCount} Weapon Mastery choices.`);
    if((character.expertise||[]).length!==expected.expertiseCount)errors.push(`Ranger should have ${expected.expertiseCount} Expertise choices.`);
    validateHunterChoices(errors,character,expected);
    if(character.ruleset==="2014")validate2014(errors,character,expected);else if(character.ruleset==="2024")validate2024(errors,character,expected);else errors.push(`Ranger is not verified for ruleset ${character.ruleset}.`);
    return errors;
  }catch(error){console.error("[ranger-validation] validation failed",error);throw error;}
}

function validate2014(errors,c,expected){
  try{
    if(c.level<2&&c.spells)errors.push("2014 Ranger cannot have Spellcasting before level 2.");if(c.level>=2&&!c.spells)errors.push("2014 Ranger is missing Spellcasting at level 2+.");
    if(c.spells){if((c.spells.known?.all||[]).length!==expected.known)errors.push(`2014 Ranger should know ${expected.known} spells.`);if((c.spells.prepared?.all||[]).length)errors.push("2014 Ranger cannot contain prepared class spells.");if((c.spells.cantrips?.all||[]).length)errors.push("2014 Ranger cannot contain class cantrips.");if(c.spells.alwaysPrepared?.length)errors.push("2014 Ranger cannot contain always-prepared class spells.");}
    if((c.masteryIds||[]).length)errors.push("2014 Ranger cannot contain Weapon Mastery.");if(c.feats.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Ranger cannot contain a 2024 Epic Boon.");
    const enemies=c.rangerSelections?.favoredEnemies||[],enemyLanguages=c.rangerSelections?.favoredEnemyLanguages||[];if(enemies.length!==expected.favoredEnemyCount)errors.push("2014 Favored Enemy count is incorrect.");if(enemyLanguages.length!==enemies.length)errors.push("2014 Favored Enemy language state must align with Favored Enemy choices.");
    enemies.forEach((enemy,index)=>{const language=enemyLanguages[index]||null,legal=FAVORED_ENEMY_LANGUAGE_OPTIONS_2014[enemy]||[];if(!legal.length&&language)errors.push(`${enemy} cannot carry an invented Favored Enemy language.`);if(language&&!legal.includes(language))errors.push(`${language} is not legal for Favored Enemy ${enemy}.`);if(language&&!c.languages.includes(language))errors.push(`Favored Enemy language ${language} is missing from Languages.`);if(legal.length&&!language)errors.push(`Favored Enemy ${enemy} should grant one verified associated language.`);});
    if((c.rangerSelections?.naturalExplorerTerrains||[]).length!==expected.naturalExplorerTerrainCount)errors.push("2014 Natural Explorer terrain count is incorrect.");
    for(const name of ["Weapon Mastery — Ranger","Deft Explorer","Roving","Expertise","Tireless","Relentless Hunter","Nature's Veil","Precise Hunter","Hunter's Lore","Superior Hunter's Prey","Epic Boon"])if(c.features.includes(name))errors.push(`2014 Ranger cannot contain 2024 feature ${name}.`);
  }catch(error){console.error("[ranger-validation] 2014 validation failed",error);throw error;}
}

function validate2024(errors,c,expected){
  try{
    if(!c.spells)errors.push("2024 Ranger is missing level-1 Spellcasting.");
    if(c.spells){if((c.spells.prepared?.all||[]).length!==expected.prepared)errors.push(`2024 Ranger should have ${expected.prepared} normally prepared spells.`);if((c.spells.known?.all||[]).length)errors.push("2024 Ranger cannot contain spells-known class state.");for(const id of rangerAlwaysPrepared(c))if(!c.spells.alwaysPrepared.includes(id))errors.push(`2024 Ranger is missing always-prepared spell ${id}.`);if(c.spells.hunterMarkFreeCasts!==expected.hunterMarkFreeCasts)errors.push("Favored Enemy free Hunter's Mark casts are incorrect.");if(c.spells.hunterMarkDie!==expected.hunterMarkDie)errors.push("Hunter's Mark damage die is incorrect.");}
    if((c.masteryIds||[]).length!==2)errors.push("2024 Ranger must have two Weapon Mastery choices.");
    const druidic=(c.fightingStyles||[]).some(style=>style.id==="druidic-warrior"),cantripCount=c.spells?.cantrips?.all?.length||0;if(druidic&&cantripCount!==2)errors.push("Druidic Warrior must grant exactly two Druid cantrips.");if(!druidic&&cantripCount)errors.push("Ranger has class cantrips without Druidic Warrior.");
    const boon=c.feats.some(feat=>feat.id==="boon-dimensional-travel");if(c.level>=19&&!boon)errors.push("Level 19+ Ranger is missing Boon of Dimensional Travel.");if(c.level<19&&boon)errors.push("Boon of Dimensional Travel appeared before Ranger level 19.");if(boon&&(!c.epicBoonAbility||c.abilityMaximums[c.epicBoonAbility]!==30))errors.push("Boon of Dimensional Travel ability increase/max is incomplete.");
    for(const name of ["Natural Explorer","Primeval Awareness","Land's Stride","Hide in Plain Sight","Vanish","Multiattack"])if(c.features.includes(name))errors.push(`2024 Ranger cannot contain 2014 feature ${name}.`);
  }catch(error){console.error("[ranger-validation] 2024 validation failed",error);throw error;}
}

function validateHunterChoices(errors,c,expected){
  try{
    const s=c.rangerSelections||{};if(!expected.hunter){if(s.huntersPrey||s.defensiveTactics||s.multiattack||s.superiorDefense)errors.push("Hunter subclass choices appeared without an active Hunter subclass.");return;}
    const prey=c.ruleset==="2014"?HUNTER_PREY_2014:HUNTER_PREY_2024,defense=c.ruleset==="2014"?HUNTER_DEFENSE_2014:HUNTER_DEFENSE_2024;if(!prey[s.huntersPrey])errors.push("Hunter's Prey selection is missing or illegal.");
    if(c.level>=7&&!defense[s.defensiveTactics])errors.push("Defensive Tactics selection is missing or illegal.");if(c.level<7&&s.defensiveTactics)errors.push("Defensive Tactics appeared before level 7.");
    if(c.ruleset==="2014"){if(c.level>=11&&!HUNTER_MULTIATTACK_2014[s.multiattack])errors.push("Hunter Multiattack selection is missing or illegal.");if(c.level<11&&s.multiattack)errors.push("Hunter Multiattack appeared before level 11.");if(c.level>=15&&!HUNTER_SUPERIOR_DEFENSE_2014[s.superiorDefense])errors.push("Superior Hunter's Defense selection is missing or illegal.");if(c.level<15&&s.superiorDefense)errors.push("Superior Hunter's Defense appeared before level 15.");}
    else if(s.multiattack||s.superiorDefense)errors.push("2024 Hunter cannot contain legacy Hunter option state.");
  }catch(error){console.error("[ranger-validation] Hunter choice validation failed",error);throw error;}
}
