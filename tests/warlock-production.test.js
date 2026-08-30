import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { CHAIN_FAMILIARS_2024 } from "../src/data/warlock-class.js";
import { invocationCantripTargetIds } from "../src/data/warlock-invocations.js";
import { WARLOCK_SPELLS_2024 } from "../src/data/warlock-spells.js";
import { buildWarlockPremiumPrintModel } from "../src/print/warlock-model.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { warlockProgressionFor } from "../src/rules/warlock.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

function forge(ruleset,level,{subclass="random",classSelections={},spellSelections={}}={}){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.class="warlock";
    state.constraints.level=String(level);
    state.constraints.subclass=subclass;
    if(ruleset==="2024"){
      state.constraints.species="human";
      state.constraints.background="soldier";
    }
    state.classSelections={...classSelections};
    state.spellSelections={...state.spellSelections,...spellSelections};
    return generateCharacter(state);
  }catch(error){console.error(`[warlock-production-test] forge ${ruleset} level ${level} failed`,error);throw error;}
}

const SRD_2024_WARLOCK_SPELLS=Object.freeze({
  0:["Chill Touch","Eldritch Blast","Mage Hand","Minor Illusion","Poison Spray","Prestidigitation","True Strike"],
  1:["Bane","Charm Person","Comprehend Languages","Detect Magic","Expeditious Retreat","Hellish Rebuke","Hex","Hideous Laughter","Illusory Script","Protection from Evil and Good","Speak with Animals","Unseen Servant"],
  2:["Darkness","Enthrall","Hold Person","Invisibility","Mind Spike","Mirror Image","Misty Step","Ray of Enfeeblement","Spider Climb","Suggestion"],
  3:["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Tongues","Vampiric Touch"],
  4:["Banishment","Blight","Charm Monster","Dimension Door","Hallucinatory Terrain"],
  5:["Contact Other Plane","Dream","Hold Monster","Mislead","Planar Binding","Scrying","Teleportation Circle"],
  6:["Circle of Death","Create Undead","Eyebite","True Seeing"],
  7:["Etherealness","Finger of Death","Forcecage","Plane Shift"],
  8:["Befuddlement","Demiplane","Dominate Monster","Glibness","Power Word Stun"],
  9:["Astral Projection","Foresight","Gate","Imprisonment","Power Word Kill","True Polymorph","Weird"]
});

test("2024 Warlock spell catalog exactly matches SRD 5.2.1 pages 74-75",()=>{
  try{
    for(const [level,names] of Object.entries(SRD_2024_WARLOCK_SPELLS))assert.deepEqual(WARLOCK_SPELLS_2024.filter(spell=>spell.level===Number(level)).map(spell=>spell.name),names,`level ${level} SRD Warlock spell list drift`);
    assert.equal(WARLOCK_SPELLS_2024.length,Object.values(SRD_2024_WARLOCK_SPELLS).flat().length);
    assert.equal(WARLOCK_SPELLS_2024.some(spell=>spell.name==="Summon Undead"),false,"non-SRD spell leaked into the production Warlock list");
  }catch(error){console.error("[warlock-production-test] 2024 SRD spell-list oracle failed",error);throw error;}
});

test("2024 repeatable blast invocation target pools enforce SRD cantrip prerequisites",()=>{
  assert.deepEqual(invocationCantripTargetIds("2024","agonizing-blast"),["chill-touch","eldritch-blast","poison-spray","true-strike"]);
  assert.deepEqual(invocationCantripTargetIds("2024","eldritch-spear"),["eldritch-blast","poison-spray"]);
  assert.deepEqual(invocationCantripTargetIds("2024","repelling-blast"),["chill-touch","eldritch-blast","poison-spray","true-strike"]);
});

test("Warlock Pact Magic progression preserves edition-specific prepared/known state",()=>{
  try{
    const legacy=warlockProgressionFor("2014",20,"fiend"),revised=warlockProgressionFor("2024",20,"fiend-patron");
    assert.equal(legacy.known,15);assert.equal(legacy.prepared,null);assert.equal(legacy.invocations,8);assert.equal(legacy.slotCount,4);assert.equal(legacy.slotLevel,5);
    assert.equal(revised.known,null);assert.equal(revised.prepared,15);assert.equal(revised.invocations,10);assert.equal(revised.slotCount,4);assert.equal(revised.slotLevel,5);assert.deepEqual(Object.keys(revised.mysticArcanum),["6","7","8","9"]);
  }catch(error){console.error("[warlock-production-test] progression contract failed",error);throw error;}
});

test("2014 Pact of the Tome and Book of Ancient Secrets generate complete non-duplicate bonus magic",()=>{
  try{
    const character=forge("2014",20,{subclass:"fiend",classSelections:{pactBoon:"tome",eldritchInvocations:["book-of-ancient-secrets"]}});
    assert.equal(character.validation.valid,true);
    assert.equal(character.warlockSelections.pactBoon.id,"tome");
    assert.equal(character.spells.tome.cantrips.length,3);
    assert.equal(character.spells.tome.rituals.length,2);
    const active=[...character.spells.cantrips.all,...character.spells.known.all,...character.spells.tome.cantrips,...character.spells.tome.rituals,...Object.values(character.spells.mysticArcanum)];
    assert.equal(new Set(active).size,active.length);
  }catch(error){console.error("[warlock-production-test] 2014 Tome contract failed",error);throw error;}
});

test("2014 Beguiling Influence applies both granted skill proficiencies",()=>{
  try{
    const character=forge("2014",2,{subclass:"fiend",classSelections:{eldritchInvocations:["beguiling-influence"]}});
    assert.equal(character.validation.valid,true);
    assert.ok(character.skills.includes("deception"));
    assert.ok(character.skills.includes("persuasion"));
    assert.ok(character.skillBonuses.deception>=character.proficiency-1);
    assert.ok(character.skillBonuses.persuasion>=character.proficiency-1);
  }catch(error){console.error("[warlock-production-test] Beguiling Influence contract failed",error);throw error;}
});

test("2024 Pact invocations produce Tome magic, a legal Chain familiar, and a Charisma pact weapon attack",()=>{
  try{
    const character=forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["pact-of-the-tome","pact-of-the-chain","pact-of-the-blade"]}});
    assert.equal(character.validation.valid,true);
    assert.equal(character.spells.tome.cantrips.length,3);
    assert.equal(character.spells.tome.rituals.length,2);
    assert.ok(CHAIN_FAMILIARS_2024.includes(character.warlockSelections.familiarForm));
    const pactAttack=character.attacks.find(attack=>attack.pactWeapon);
    assert.ok(pactAttack,"Pact weapon attack should be present");
    assert.equal(pactAttack.ability,"cha");
    assert.equal(pactAttack.attackBonus,character.proficiency+Math.floor((character.abilities.cha-10)/2));
  }catch(error){console.error("[warlock-production-test] 2024 pact invocation contract failed",error);throw error;}
});

test("2024 Lessons of the First Ones can repeat and grants a different SRD Origin feat each time",()=>{
  try{
    const character=forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["lessons-of-the-first-ones","lessons-of-the-first-ones"]}});
    assert.equal(character.validation.valid,true);
    assert.equal(character.warlockSelections.invocations.all.filter(id=>id==="lessons-of-the-first-ones").length,2);
    assert.equal(character.warlockSelections.lessonsOriginFeats.length,2);
    assert.equal(new Set(character.warlockSelections.lessonsOriginFeats.map(grant=>grant.family)).size,2);
    assert.equal(character.feats.filter(feat=>feat.source==="warlock").length,2);
    const references=buildQuickReference(character).filter(item=>item.id.startsWith("invocation:lessons-of-the-first-ones"));assert.equal(references.length,2);assert.notEqual(references[0].name,references[1].name);
  }catch(error){console.error("[warlock-production-test] repeatable Lessons contract failed",error);throw error;}
});

test("2024 repeated Agonizing Blast stores distinct SRD cantrip targets through validation, restore, and print",()=>{
  try{
    const classSelections={eldritchInvocations:["agonizing-blast","agonizing-blast"],warlockInvocationTargets:["eldritch-blast","poison-spray"]};
    const character=forge("2024",5,{subclass:"fiend-patron",classSelections,spellSelections:{cantrips:["eldritch-blast","poison-spray"]}});
    assert.equal(character.validation.valid,true);
    assert.deepEqual(character.warlockSelections.invocationCantripTargets.slice(0,2),[{slot:0,invocationId:"agonizing-blast",targetCantrip:"eldritch-blast"},{slot:1,invocationId:"agonizing-blast",targetCantrip:"poison-spray"}]);
    assert.ok(character.spells.cantrips.all.includes("eldritch-blast"));assert.ok(character.spells.cantrips.all.includes("poison-spray"));
    const restored=classSelectionsFromCharacter(character);assert.deepEqual(restored.warlockInvocationTargets.slice(0,2),["eldritch-blast","poison-spray"]);
    const refs=buildQuickReference(character).filter(item=>item.id.startsWith("invocation:agonizing-blast"));assert.equal(refs.length,2);assert.ok(refs.some(item=>item.name.includes("Eldritch Blast")));assert.ok(refs.some(item=>item.name.includes("Poison Spray")));
    const model=buildWarlockPremiumPrintModel(character),printed=model.spellPage.warlock.invocationCantripTargets.slice(0,2);assert.deepEqual(printed.map(item=>[item.invocationName,item.targetName]),[["Agonizing Blast","Eldritch Blast"],["Agonizing Blast","Poison Spray"]]);assert.ok(model.quickTurn.some(line=>line.includes("Agonizing Blast → Eldritch Blast")&&line.includes("Agonizing Blast → Poison Spray")));
  }catch(error){console.error("[warlock-production-test] repeated Agonizing target contract failed",error);throw error;}
});

test("2024 repeatable blast invocations reject duplicate or ineligible explicit targets",()=>{
  assert.throws(()=>forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["agonizing-blast","agonizing-blast"],warlockInvocationTargets:["eldritch-blast","eldritch-blast"]}}),/already used by another copy|different eligible cantrip/i);
  assert.throws(()=>forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["repelling-blast"],warlockInvocationTargets:["mage-hand"]}}),/unavailable|cannot target/i);
  assert.throws(()=>forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["eldritch-spear"],warlockInvocationTargets:["true-strike"]}}),/unavailable|cannot target/i);
  assert.doesNotThrow(()=>forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["repelling-blast"],warlockInvocationTargets:["true-strike"]},spellSelections:{cantrips:["true-strike"]}}));
  assert.doesNotThrow(()=>forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["eldritch-spear"],warlockInvocationTargets:["poison-spray"]},spellSelections:{cantrips:["poison-spray"]}}));
});

test("2024 nonrepeatable Eldritch Invocations cannot be selected twice",()=>{
  assert.throws(()=>forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["armor-of-shadows","armor-of-shadows"]}}),/not a repeatable Eldritch Invocation/i);
});

test("2024 Warlock UI uses invocation slots, preserves repeatables, and filters sibling cantrip targets",()=>{
  try{
    const state=createInitialState();state.ruleset="2024";state.constraints.class="warlock";state.constraints.level="5";state.constraints.subclass="fiend-patron";state.constraints.species="human";state.constraints.background="soldier";
    let slots=classChoiceFieldsForState(state).filter(field=>field.key==="eldritchInvocations");
    assert.equal(slots.length,warlockProgressionFor("2024",5,"fiend-patron").invocations);
    assert.ok(slots.every(field=>field.type==="indexed"));
    state.classSelections.eldritchInvocations=["lessons-of-the-first-ones","lessons-of-the-first-ones"];
    slots=classChoiceFieldsForState(state).filter(field=>field.key==="eldritchInvocations");
    assert.ok(slots[0].options.some(option=>option.id==="lessons-of-the-first-ones"));assert.ok(slots[1].options.some(option=>option.id==="lessons-of-the-first-ones"));
    state.classSelections={eldritchInvocations:["agonizing-blast","agonizing-blast"],warlockInvocationTargets:["eldritch-blast",null]};
    const fields=classChoiceFieldsForState(state),targets=fields.filter(field=>field.key==="warlockInvocationTargets");assert.equal(targets.length,2);assert.ok(targets[0].options.some(option=>option.id==="eldritch-blast"));assert.equal(targets[1].options.some(option=>option.id==="eldritch-blast"),false);assert.ok(targets[1].options.some(option=>option.id==="poison-spray"));
  }catch(error){console.error("[warlock-production-test] invocation slot UI contract failed",error);throw error;}
});

test("2024 level-20 Fiend Warlock carries Contact Patron, all Mystic Arcana, and its Epic Boon",()=>{
  try{
    const character=forge("2024",20,{subclass:"fiend-patron"});
    assert.equal(character.validation.valid,true);
    assert.ok(character.features.includes("Contact Patron"));
    assert.ok(character.spells.alwaysPrepared.includes("contact-other-plane"));
    assert.deepEqual(Object.keys(character.spells.mysticArcanum),["6","7","8","9"]);
    assert.ok(character.feats.some(feat=>feat.id==="boon-fate"));
    assert.equal(character.warlock.invocations,10);
  }catch(error){console.error("[warlock-production-test] 2024 capstone contract failed",error);throw error;}
});

test("Warlock premium print inventory is normalized into readable equipment lines",()=>{
  try{
    const character=forge("2024",20,{subclass:"fiend-patron"}),model=buildWarlockPremiumPrintModel(character);
    assert.ok(model.equipment.length>0,"Warlock print model should include equipment");
    assert.ok(model.equipment.every(item=>typeof item==="string"&&item.trim()),"Every Warlock print equipment entry must be a non-empty string");
    assert.equal(model.equipment.some(item=>item.includes("[object Object]")),false,"Warlock print model must never stringify inventory objects implicitly");
    const daggerLines=model.equipment.filter(item=>/\bDagger\b/i.test(item));
    assert.equal(daggerLines.length,1,"All daggers should print on one consolidated equipment line");
    const daggerQuantity=daggerLines[0].match(/^(\d+) × Dagger\b/i);
    assert.ok(daggerQuantity,"Consolidated dagger line should include an explicit quantity");
    assert.ok(Number(daggerQuantity[1])>=2,"The Warlock class package contributes at least two daggers");
  }catch(error){console.error("[warlock-production-test] print equipment contract failed",error);throw error;}
});
