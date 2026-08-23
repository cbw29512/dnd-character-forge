import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickTurn } from "../src/print/quick-turn.js";

function character(ruleset,classId,subclass,level=20){const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class=classId;state.constraints.subclass=subclass;state.constraints.species=ruleset==="2014"?"human":"dwarf";state.constraints.background=ruleset==="2014"?"acolyte":"criminal";return generateCharacter(state);}

test("2014 Fighter Quick Turn never claims Second Wind repositioning",()=>{
  const text=buildQuickTurn(character("2014","fighter","champion")).join(" ");assert.match(text,/Second Wind/);assert.match(text,/self-healing/);assert.doesNotMatch(text,/reposition/i);
});

test("2014 Wizard Quick Turn uses Arcane Recovery and never advertises Memorize Spell",()=>{
  const text=buildQuickTurn(character("2014","wizard","school-evocation")).join(" ");assert.match(text,/Arcane Recovery/);assert.doesNotMatch(text,/Memorize Spell/);
});

test("2014 Cleric Quick Turn uses Turn Undead and Preserve Life without Divine Spark",()=>{
  const text=buildQuickTurn(character("2014","cleric","life-domain")).join(" ");assert.match(text,/Turn Undead/);assert.match(text,/Preserve Life/);assert.doesNotMatch(text,/Divine Spark/);
});

test("2024 Quick Turn keeps its edition-specific resource guidance",()=>{
  const fighter=buildQuickTurn(character("2024","fighter","champion")).join(" "),wizard=buildQuickTurn(character("2024","wizard","evoker")).join(" "),cleric=buildQuickTurn(character("2024","cleric","life-domain")).join(" ");assert.match(fighter,/repositioning/);assert.match(wizard,/Memorize Spell/);assert.match(cleric,/Divine Spark/);
});
