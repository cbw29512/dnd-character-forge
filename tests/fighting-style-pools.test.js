import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function character(ruleset,classId,level,subclass,background,classSelections={}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class=classId;state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background=background;state.classSelections=classSelections;return generateCharacter(state);
}

test("2014 Champion additional Fighting Style never leaks Paladin-only styles",()=>{
  const allowed=new Set(["defense","archery","great-weapon"]);
  for(let i=0;i<200;i++){const c=character("2014","fighter",20,"champion","acolyte");assert.equal(c.fightingStyles.length,2);for(const style of c.fightingStyles)assert.ok(allowed.has(style.id),`illegal 2014 Fighter style ${style.id}`);assert.equal(c.fightingStyles.some(style=>["dueling","protection"].includes(style.id)),false);}
});

test("2024 Champion additional Fighting Style never leaks Blessed Warrior",()=>{
  const allowed=new Set(["defense","archery","great-weapon","two-weapon"]);
  for(let i=0;i<200;i++){const c=character("2024","fighter",20,"champion","criminal");assert.equal(c.fightingStyles.length,2);for(const style of c.fightingStyles)assert.ok(allowed.has(style.id),`illegal 2024 Fighter style ${style.id}`);assert.equal(c.fightingStyles.some(style=>style.id==="blessed-warrior"),false);}
});

test("Paladin style selections are class-legal in both editions",()=>{
  const pools={"2014":["defense","dueling","great-weapon","protection"],"2024":["archery","defense","great-weapon","two-weapon","blessed-warrior"]};
  for(const ruleset of ["2014","2024"])for(const styleId of pools[ruleset]){const c=character(ruleset,"paladin",2,"random",ruleset==="2014"?"acolyte":"soldier",{fightingStyle:styleId});assert.equal(c.fightingStyles.length,1);assert.equal(c.fightingStyle.id,styleId);assert.ok(c.class.styleChoices.includes(styleId));}
});
