import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function fighter(ruleset,style){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level="1";
  state.constraints.class="fighter";
  state.constraints.species="human";
  state.constraints.background=ruleset==="2014"?"acolyte":"criminal";
  state.classSelections={fightingStyle:style};
  return generateCharacter(state);
}
function quantity(character,name){return character.inventory.find(item=>item.name===name)?.quantity||0;}

test("2014 Fighter two-handaxe choice produces exactly two Handaxes",()=>{
  const c=fighter("2014","great-weapon");
  assert.equal(c.equipment.id,"greatsword");
  assert.equal(quantity(c,"Handaxe"),2);
});

test("2024 Fighter package A produces exactly eight Javelins",()=>{
  const c=fighter("2024","great-weapon");
  assert.equal(c.equipment.id,"heavy");
  assert.equal(quantity(c,"Javelin"),8);
  assert.equal(quantity(c,"Greatsword"),1);
  assert.equal(quantity(c,"Flail"),1);
  assert.equal(quantity(c,"Dungeoneer's Pack"),1);
  assert.equal(quantity(c,"4 GP"),1);
});

test("2024 Fighter package B retains the exact SRD weapon/ammunition loadout",()=>{
  const c=fighter("2024","archery");
  assert.equal(c.equipment.id,"light");
  assert.equal(quantity(c,"Scimitar"),1);
  assert.equal(quantity(c,"Shortsword"),1);
  assert.equal(quantity(c,"Longbow"),1);
  assert.equal(quantity(c,"Arrows"),20);
  assert.equal(quantity(c,"Quiver"),1);
  assert.equal(quantity(c,"Dungeoneer's Pack"),1);
  assert.equal(quantity(c,"11 GP"),1);
});
