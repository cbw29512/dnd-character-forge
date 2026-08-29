import { CHAIN_FAMILIARS_2014, CHAIN_FAMILIARS_2024, PACT_BOONS_2014 } from "../data/warlock-class.js";
import { invocationCantripTargetIds, warlockInvocationById, warlockInvocationsFor } from "../data/warlock-invocations.js";
import { warlockAlwaysPrepared2024 } from "../data/warlock-spells.js";
import { warlockPactWeaponId } from "./warlock-combat.js";
import { originFeatFamilyId } from "./origin-feats.js";
import { activeMysticArcanumLevels, warlockProgressionFor } from "./warlock.js";

const CORE_KEYS=["cantrips","known","prepared","invocations","slotCount","slotLevel","maxPactSpellLevel","pactBoon","magicalCunning","contactPatron","epicBoon","eldritchMaster","darkOnesBlessing","darkOnesOwnLuck","fiendishResilience","hurlThroughHell","fiendSpells"];

export function validateWarlockCharacter(character){
  try{
    const errors=[],actual=character.warlock;
    if(!actual)return["Warlock progression data is missing."];
    const expected=warlockProgressionFor(character.ruleset,character.level,character.subclass?.id);
    for(const key of CORE_KEYS)if(actual[key]!==expected[key])errors.push(`Warlock ${key} should be ${String(expected[key])}.`);
    if(JSON.stringify(actual.slots)!==JSON.stringify(expected.slots))errors.push("Warlock Pact Magic slot progression is incorrect.");
    if(JSON.stringify(actual.mysticArcanum)!==JSON.stringify(expected.mysticArcanum))errors.push("Warlock Mystic Arcanum progression is incorrect.");
    validateSelections(errors,character,expected);validateSpells(errors,character,expected);validateCombat(errors,character);validateEdition(errors,character,expected);return errors;
  }catch(error){console.error("[warlock-validation] validation failed",error);throw error;}
}

function validateSelections(errors,character,expected){
  try{
    const state=character.warlockSelections;if(!state){errors.push("Warlock selection state is missing.");return;}
    const invocations=state.invocations?.all||[],catalog=new Set(warlockInvocationsFor(character.ruleset).map(item=>item.id));
    if(invocations.length!==expected.invocations)errors.push(`Warlock should have ${expected.invocations} Eldritch Invocations.`);
    const counts=new Map();for(const id of invocations)counts.set(id,(counts.get(id)||0)+1);for(const [id,count] of counts){if(count<=1||!catalog.has(id))continue;const option=warlockInvocationById(character.ruleset,id);if(!option.repeatable)errors.push(`${option.name} is not repeatable but appears ${count} times.`);}
    for(const id of invocations){
      if(!catalog.has(id)){errors.push(`Warlock has unknown Eldritch Invocation ${id}.`);continue;}
      const option=warlockInvocationById(character.ruleset,id);
      if(option.minLevel>character.level)errors.push(`${option.name} appears before its minimum Warlock level.`);
      if(character.ruleset==="2014"&&option.pact&&option.pact!==state.pactBoon?.id)errors.push(`${option.name} does not match the selected Pact Boon.`);
      if(character.ruleset==="2024"&&option.requiresInvocation&&!invocations.includes(option.requiresInvocation))errors.push(`${option.name} is missing prerequisite invocation ${option.requiresInvocation}.`);
    }
    validateLessons(errors,character,state,invocations);validateInvocationTargets(errors,character,state,invocations);
    if(character.ruleset==="2014"){
      const legalPact=new Set(PACT_BOONS_2014.map(item=>item.id));
      if(character.level>=3&&!legalPact.has(state.pactBoon?.id))errors.push("2014 Warlock is missing a legal Pact Boon.");
      if(character.level<3&&state.pactBoon)errors.push("2014 Pact Boon appeared before Warlock level 3.");
    }else if(state.pactBoon)errors.push("2024 Warlock cannot contain legacy Pact Boon state.");
    const chain=character.ruleset==="2014"?state.pactBoon?.id==="chain":invocations.includes("pact-of-the-chain"),familiarPool=character.ruleset==="2014"?CHAIN_FAMILIARS_2014:CHAIN_FAMILIARS_2024;
    if(chain&&!familiarPool.includes(state.familiarForm))errors.push("Pact of the Chain is missing a legal familiar form.");
    if(!chain&&state.familiarForm)errors.push("Warlock familiar form exists without Pact of the Chain.");
    const beguiling=character.ruleset==="2014"&&invocations.includes("beguiling-influence");
    for(const skill of ["deception","persuasion"]){if(beguiling&&!character.skills.includes(skill))errors.push(`Beguiling Influence is missing ${skill} proficiency.`);if(!beguiling&&(state.bonusSkills||[]).includes(skill))errors.push(`Warlock has ${skill} invocation proficiency without Beguiling Influence.`);}
  }catch(error){console.error("[warlock-validation] selection validation failed",error);throw error;}
}

function validateLessons(errors,character,state,invocations){
  try{
    const count=character.ruleset==="2024"?invocations.filter(id=>id==="lessons-of-the-first-ones").length:0,grants=state.lessonsOriginFeats||[];
    if(grants.length!==count)errors.push(`Lessons of the First Ones should grant ${count} Origin feat${count===1?"":"s"}.`);
    if(!count&&grants.length)return;
    const families=grants.map(grant=>grant.family||originFeatFamilyId(grant.id));if(new Set(families).size!==families.length)errors.push("Each Lessons of the First Ones choice must grant a different Origin feat.");
    const warlockFeats=(character.feats||[]).filter(feat=>feat.source==="warlock");
    for(const grant of grants){const family=grant.family||originFeatFamilyId(grant.id);if(!warlockFeats.some(feat=>originFeatFamilyId(feat)===family))errors.push(`Lessons of the First Ones is missing its ${grant.name||family} feat grant.`);}
    if(warlockFeats.length!==count)errors.push("Warlock-sourced Origin feat count does not match Lessons of the First Ones selections.");
  }catch(error){console.error("[warlock-validation] Lessons validation failed",error);throw error;}
}

function validateInvocationTargets(errors,character,state,invocations){
  try{
    const records=state.invocationCantripTargets||[],expectedSlots=invocations.map((id,slot)=>({id,slot,pool:invocationCantripTargetIds(character.ruleset,id)})).filter(item=>item.pool.length),bySlot=new Map();
    if(records.length!==expectedSlots.length)errors.push(`Warlock should have ${expectedSlots.length} invocation cantrip target selection${expectedSlots.length===1?"":"s"}.`);
    const usedByInvocation=new Map(),known=new Set(character.spells?.cantrips?.all||[]);
    for(const record of records){
      if(!Number.isInteger(record?.slot)||record.slot<0||record.slot>=invocations.length){errors.push("Warlock invocation cantrip target has an invalid slot.");continue;}
      if(bySlot.has(record.slot)){errors.push(`Warlock invocation slot ${record.slot+1} has duplicate cantrip target records.`);continue;}bySlot.set(record.slot,record);
      const invocationId=invocations[record.slot];if(record.invocationId!==invocationId){errors.push(`Warlock invocation target slot ${record.slot+1} does not match ${invocationId}.`);continue;}
      const pool=invocationCantripTargetIds(character.ruleset,invocationId);if(!pool.includes(record.targetCantrip))errors.push(`${warlockInvocationById(character.ruleset,invocationId).name} has illegal cantrip target ${record.targetCantrip}.`);
      if(!known.has(record.targetCantrip))errors.push(`${warlockInvocationById(character.ruleset,invocationId).name} target ${record.targetCantrip} is not a known Warlock cantrip.`);
      const used=usedByInvocation.get(invocationId)||new Set();if(used.has(record.targetCantrip))errors.push(`${warlockInvocationById(character.ruleset,invocationId).name} repeats cantrip target ${record.targetCantrip}.`);used.add(record.targetCantrip);usedByInvocation.set(invocationId,used);
    }
    for(const expected of expectedSlots)if(!bySlot.has(expected.slot))errors.push(`${warlockInvocationById(character.ruleset,expected.id).name} in slot ${expected.slot+1} is missing its cantrip target.`);
    const spellRecords=character.spells?.invocationCantripTargets||[];if(JSON.stringify(spellRecords)!==JSON.stringify(records))errors.push("Warlock spellcasting invocation-target state drifted from class selections.");
  }catch(error){console.error("[warlock-validation] invocation target validation failed",error);throw error;}
}

function validateSpells(errors,character,expected){
  try{
    const spells=character.spells;if(!spells){errors.push("Warlock spellcasting data is missing.");return;}
    if(JSON.stringify(spells.slots)!==JSON.stringify(expected.slots))errors.push("Warlock Pact Magic slots do not match progression.");
    if(spells.pactMagic?.slotLevel!==expected.slotLevel||spells.pactMagic?.slotCount!==expected.slotCount)errors.push("Warlock Pact Magic slot level/count state is incorrect.");
    if((spells.cantrips?.all||[]).length!==expected.cantrips)errors.push(`Warlock should know ${expected.cantrips} normal cantrips.`);
    if(character.ruleset==="2014"){
      if((spells.known?.all||[]).length!==expected.known)errors.push(`2014 Warlock should know ${expected.known} leveled spells.`);
      if((spells.prepared?.all||[]).length)errors.push("2014 Warlock cannot contain prepared class-spell state.");
      if((spells.alwaysPrepared||[]).length)errors.push("2014 Fiend expanded spells are options, not always-prepared spells.");
    }else{
      if((spells.known?.all||[]).length)errors.push("2024 Warlock cannot contain spells-known class state.");
      if((spells.prepared?.all||[]).length!==expected.prepared)errors.push(`2024 Warlock should have ${expected.prepared} normally prepared spells.`);
      const automatic=warlockAlwaysPrepared2024(character.level,character.subclass?.id).map(item=>item.id),actual=spells.alwaysPrepared||[];
      if(actual.length!==automatic.length)errors.push("2024 Warlock always-prepared spell count is incorrect.");
      for(const id of automatic)if(!actual.includes(id))errors.push(`2024 Warlock is missing always-prepared spell ${id}.`);
      for(const id of actual)if((spells.prepared?.all||[]).includes(id))errors.push(`2024 always-prepared spell ${id} illegally consumes a normal prepared slot.`);
    }
    const invocations=character.warlockSelections?.invocations?.all||[],legacyTome=character.ruleset==="2014"&&character.warlockSelections?.pactBoon?.id==="tome",revisedTome=character.ruleset==="2024"&&invocations.includes("pact-of-the-tome"),bookSecrets=character.ruleset==="2014"&&invocations.includes("book-of-ancient-secrets");
    const tomeCantrips=spells.tome?.cantrips||[],tomeRituals=spells.tome?.rituals||[];
    if((legacyTome||revisedTome)&&tomeCantrips.length!==3)errors.push("Pact of the Tome must grant exactly three bonus cantrips.");
    if(!legacyTome&&!revisedTome&&tomeCantrips.length)errors.push("Tome cantrips exist without Pact of the Tome.");
    if((revisedTome||bookSecrets)&&tomeRituals.length!==2)errors.push("Book of Shadows must start with exactly two verified level-1 rituals.");
    if(!revisedTome&&!bookSecrets&&tomeRituals.length)errors.push("Tome rituals exist without a feature that grants them.");
    const allSpellIds=[...(spells.cantrips?.all||[]),...(spells.known?.all||[]),...(spells.prepared?.all||[]),...(spells.alwaysPrepared||[]),...tomeCantrips,...tomeRituals,...(spells.invocationSpells||[]),...Object.values(spells.mysticArcanum||{})];
    if(new Set(allSpellIds).size!==allSpellIds.length)errors.push("Warlock active spell state contains duplicate spell ids across feature buckets.");
    const active=activeMysticArcanumLevels(character.level),actualLevels=Object.keys(spells.mysticArcanum||{}).map(Number).sort((a,b)=>a-b);
    if(JSON.stringify(actualLevels)!==JSON.stringify(active))errors.push("Warlock Mystic Arcanum spell levels are incorrect.");
    for(const level of active)if(!spells.mysticArcanum?.[level])errors.push(`Warlock is missing level-${level} Mystic Arcanum.`);
  }catch(error){console.error("[warlock-validation] spell validation failed",error);throw error;}
}

function validateCombat(errors,character){
  try{
    if(character.ruleset!=="2024")return;
    const hasBlade=character.warlockSelections?.invocations?.all?.includes("pact-of-the-blade"),pactId=warlockPactWeaponId(character);
    if(hasBlade){const attack=character.attacks?.find(item=>item.id===pactId);if(!attack)errors.push("Pact of the Blade generated weapon attack is missing.");else{if(attack.ability!=="cha")errors.push("2024 Pact of the Blade weapon must use Charisma in the generated attack state.");if(!attack.pactWeapon)errors.push("2024 Pact of the Blade weapon is not marked as the pact weapon.");}}
    else if(character.attacks?.some(item=>item.pactWeapon))errors.push("A pact weapon attack exists without Pact of the Blade.");
  }catch(error){console.error("[warlock-validation] combat validation failed",error);throw error;}
}

function validateEdition(errors,character,expected){
  try{
    if(character.ruleset==="2014"){
      for(const name of ["Magical Cunning","Contact Patron","Warlock Subclass","Fiend Spells","Epic Boon"])if(character.features.includes(name))errors.push(`2014 Warlock cannot contain 2024 feature ${name}.`);
      if(character.feats?.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Warlock cannot contain a 2024 Epic Boon.");
    }else if(character.ruleset==="2024"){
      for(const name of ["Otherworldly Patron","Pact Boon: Pact of the Chain","Pact Boon: Pact of the Blade","Pact Boon: Pact of the Tome"])if(character.features.includes(name))errors.push(`2024 Warlock cannot contain legacy feature ${name}.`);
      const boon=character.feats?.some(feat=>feat.id==="boon-fate");if(character.level>=19&&!boon)errors.push("Level 19+ Warlock is missing Boon of Fate.");if(character.level<19&&boon)errors.push("Boon of Fate appeared before Warlock level 19.");if(expected.eldritchMaster&&!character.features.includes("Eldritch Master"))errors.push("Level 20 Warlock is missing Eldritch Master.");
    }else errors.push(`Warlock is not verified for ruleset ${character.ruleset}.`);
  }catch(error){console.error("[warlock-validation] edition isolation failed",error);throw error;}
}
