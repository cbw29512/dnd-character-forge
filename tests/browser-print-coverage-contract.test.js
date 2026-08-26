import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read=name=>readFileSync(new URL(`./${name}`,import.meta.url),"utf8");
const generic=read("browser-print-gate.mjs");
const fighter=read("fighter-browser-print-gate.mjs");
const bard=read("bard-browser-print-gate.mjs");
const monk=read("monk-browser-print-gate.mjs");
const sorcerer=read("sorcerer-browser-print-gate.mjs");
const warlock=read("warlock-browser-print-gate.mjs");
const workflow=readFileSync(new URL("../.github/workflows/test.yml",import.meta.url),"utf8");

const CORE=["barbarian","cleric","druid","paladin","ranger","rogue","wizard"];

test("real Chrome PDF gates cover every core class in both rulesets",()=>{
  for(const ruleset of ["2014","2024"]){
    for(const classId of CORE){
      const pattern=new RegExp(`ruleset:\\"${ruleset}\\",classId:\\"${classId}\\"`);
      assert.match(generic,pattern,`${ruleset} ${classId} is missing from the generic browser PDF gate`);
    }
  }
  assert.match(generic,/ruleset:"2024",classId:"fighter"/,"2024 Fighter browser PDF case missing");
  assert.match(fighter,/state\.ruleset="2014"/,"2014 Fighter browser PDF case missing");
  assert.match(fighter,/state\.constraints\.class="fighter"/);
});

test("extension-class Chrome PDF gates cover both rulesets",()=>{
  for(const [name,source] of [["Bard",bard],["Monk",monk],["Sorcerer",sorcerer],["Warlock",warlock]]){
    assert.match(source,/ruleset:"2014"/,`${name} 2014 browser PDF case missing`);
    assert.match(source,/ruleset:"2024"/,`${name} 2024 browser PDF case missing`);
  }
});

test("workflow executes every class-specific browser PDF gate and retains visual artifacts",()=>{
  for(const file of ["fighter-browser-print-gate.mjs","bard-browser-print-gate.mjs","monk-browser-print-gate.mjs","sorcerer-browser-print-gate.mjs","warlock-browser-print-gate.mjs"]){
    assert.ok(workflow.includes(`node tests/${file}`),`workflow does not execute ${file}`);
  }
  assert.match(workflow,/premium-print-review/);
  assert.match(workflow,/tests\/\.browser-print\/\*\.pdf/);
  assert.match(workflow,/tests\/\.browser-print\/\*\.png/);
});
