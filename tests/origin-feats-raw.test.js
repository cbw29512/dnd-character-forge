import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { ORIGIN_FEATS_2024 } from "../src/data/origin-feats-2024.js";
import { resolveMagicInitiateChoice, validateMagicInitiateCollection } from "../src/rules/magic-initiate.js";

function humanState(level="1"){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.level=level;
  state.constraints.class="fighter";
  state.constraints.species="human";
  state.constraints.background="criminal";
  return state;
}

test("2024 Human Versatile exposes every Basic Rules Origin feat family",()=>{
  assert.deepEqual(ORIGIN_FEATS_2024.map(feat=>feat.id),["alert","crafter","healer","lucky","magic-initiate","musician","savage-attacker","skilled","tavern-brawler","tough"]);
});

test("2024 Human Versatile honors a fixed Tough choice and applies its HP bonus",()=>{
  const state=humanState("5");
  state.speciesSelections.originFeat="tough";
  const character=generateCharacter(state);
  assert.ok(character.feats.some(feat=>feat.id==="tough"));
  assert.equal(character.toughHpBonus,10);
  assert.equal(character.speciesChoices.originFeat,"tough");
  assert.equal(character.validation.valid,true);
});

test("2024 Skilled can grant a mixed combination of skills and tools",()=>{
  const state=humanState();
  state.speciesSelections={originFeat:"skilled",skill:"perception",skilledProficiency1:"skill:arcana",skilledProficiency2:"tool:Thieves' Tools",skilledProficiency3:"tool:Herbalism Kit"};
  const character=generateCharacter(state);
  assert.ok(character.feats.some(feat=>feat.id==="skilled"));
  assert.ok(character.skills.includes("arcana"));
  assert.ok(character.toolProficiencies.includes("Thieves' Tools"));
  assert.ok(character.toolProficiencies.includes("Herbalism Kit"));
  assert.equal(character.validation.valid,true);
});

test("2024 Human Magic Initiate supports Druid and records complete feat semantics",()=>{
  const state=humanState();
  state.speciesSelections={originFeat:"magic-initiate",magicInitiateList:"druid",originSpellcastingAbility:"wis"};
  const character=generateCharacter(state);
  const magic=character.magicInitiates.find(choice=>choice.source==="species");
  assert.ok(character.feats.some(feat=>feat.id==="magic-initiate-druid"));
  assert.equal(magic.spellList,"druid");
  assert.equal(magic.spellcastingAbility,"wis");
  assert.equal(magic.cantrips.length,2);
  assert.equal(magic.alwaysPrepared,true);
  assert.equal(magic.canCastWithSlots,true);
  assert.equal(magic.freeCastUses,1);
  assert.equal(magic.freeCastReset,"Long Rest");
  assert.equal(magic.replaceOnLevelUp,true);
  assert.equal(magic.replacementSameLevelAndList,true);
  assert.equal(character.validation.valid,true);
});

test("2024 Magic Initiate repeatability rejects the same spell list twice",()=>{
  const first=resolveMagicInitiateChoice("cleric",{}),second=resolveMagicInitiateChoice("cleric",{});
  assert.match(validateMagicInitiateCollection([first,second]).join(" "),/cannot repeat the same spell list/i);
});

test("2024 Human Magic Initiate cannot repeat its background spell list",()=>{
  const state=humanState();
  state.constraints.background="acolyte";
  state.speciesSelections={originFeat:"magic-initiate",magicInitiateList:"cleric"};
  assert.throws(()=>generateCharacter(state),/conflicts|already used|unavailable/i);
});

test("2024 Human cannot take a non-repeatable background Origin feat twice",()=>{
  const state=humanState();
  state.speciesSelections.originFeat="alert";
  assert.throws(()=>generateCharacter(state),/conflicts|cannot take/i);
});
