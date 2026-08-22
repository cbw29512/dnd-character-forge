import test from "node:test";
import assert from "node:assert/strict";
import { FULL_CASTER_TABLE, fullCasterCantrips, fullCasterSlots, maxFullCasterSpellLevel } from "../src/rules/full-caster.js";

test("full-caster table covers every level 1 through 20",()=>{
  assert.equal(Object.keys(FULL_CASTER_TABLE).length,20);
  for(let level=1;level<=20;level++)assert.ok(Object.keys(fullCasterSlots(level)).length>=1);
});

test("full-caster slot breakpoints match SRD progression",()=>{
  assert.deepEqual(fullCasterSlots(1),{1:2});
  assert.deepEqual(fullCasterSlots(5),{1:4,2:3,3:2});
  assert.deepEqual(fullCasterSlots(9),{1:4,2:3,3:3,4:3,5:1});
  assert.deepEqual(fullCasterSlots(17),{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1});
  assert.deepEqual(fullCasterSlots(20),{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1});
});

test("maximum spell level is derived from available slots",()=>{
  const expected={1:1,2:1,3:2,5:3,7:4,9:5,11:6,13:7,15:8,17:9,20:9};
  for(const [level,max] of Object.entries(expected))assert.equal(maxFullCasterSpellLevel(Number(level)),max);
});

test("Cleric and Wizard cantrip progression breakpoints are shared",()=>{
  assert.equal(fullCasterCantrips(1),3);assert.equal(fullCasterCantrips(3),3);assert.equal(fullCasterCantrips(4),4);assert.equal(fullCasterCantrips(9),4);assert.equal(fullCasterCantrips(10),5);assert.equal(fullCasterCantrips(20),5);
});

test("invalid full-caster levels fail closed",()=>{
  for(const level of [0,21,1.5,"garbage"])assert.throws(()=>fullCasterSlots(level),/integer from 1 to 20/i);
});
