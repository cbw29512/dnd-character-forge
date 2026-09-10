import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { printLayoutProfile } from "../src/print/layout-profile.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

function characterAt(classId,level="7"){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.level=level;
  state.constraints.class=classId;
  state.constraints.subclass="random";
  state.constraints.species="human";
  state.constraints.background="soldier";
  const character=generateCharacter(state);
  character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe",printMode:"premium"}};
  return character;
}

function render(classId,level="7"){
  const target={innerHTML:""},model=renderPremiumPrintSheet(characterAt(classId,level),target);
  return{html:target.innerHTML,model};
}

test("layout profiles are semantic and reusable across class families",()=>{
  assert.deepEqual(printLayoutProfile("fighter"),["feature-heavy","equipment-light"]);
  assert.deepEqual(printLayoutProfile("rogue"),["skill-heavy","feature-heavy","equipment-light"]);
  assert.ok(printLayoutProfile("wizard").includes("spell-heavy"));
  assert.ok(printLayoutProfile("druid").includes("resource-heavy"));
  assert.deepEqual(printLayoutProfile("unknown"),["balanced"]);
});

test("Deluxe page one prints all three passive senses from generated skill bonuses",()=>{
  const {html}=render("fighter");
  assert.match(html,/ps-passive ps-passive-grid/);
  assert.match(html,/Perception<b>\d+<\/b>/);
  assert.match(html,/Insight<b>\d+<\/b>/);
  assert.match(html,/Investigation<b>\d+<\/b>/);
});

test("equipment-light profiles convert unused gear area into writable loot notes",()=>{
  const {html,model}=render("fighter");
  assert.ok(model.layoutProfile.includes("equipment-light"));
  assert.match(html,/Gear \/ Loot Notes/);
  assert.equal((html.match(/ps-equipment-notes/g)||[]).length,1);
});

test("trackable generated class resources print writable counters without duplicating Barbarian Rage",()=>{
  const fighter=render("fighter").html;
  assert.match(fighter,/ps-resource-trackers/);
  assert.match(fighter,/Second Wind/);
  assert.match(fighter,/Action Surge/);

  const cleric=render("cleric").html;
  assert.match(cleric,/ps-resource-trackers/);
  assert.match(cleric,/Channel/);

  const barbarian=render("barbarian").html;
  assert.match(barbarian,/ps-rage-tracker/);
  assert.doesNotMatch(barbarian,/ps-resource-trackers/);
});

test("Premium V5 print layer loads after the certified capacity layers",()=>{
  const css=readFileSync(new URL("../styles/print/premium-sorcerer.css",import.meta.url),"utf8");
  const table=css.indexOf('premium-table-capacity.css');
  const v5=css.indexOf('premium-v5-layout.css');
  assert.ok(table>=0&&v5>table,"Premium V5 layout must load after certified capacity CSS");
});
