import test from "node:test";
import assert from "node:assert/strict";
import { MAGIC_MODES } from "../src/state.js";
import { generateStartingMagic } from "../src/rules/magic-starting.js";

const CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
const LEVELS=[1,2,4,5,10,11,16,17,20];
const MODES=[MAGIC_MODES.NO_MAGIC,MAGIC_MODES.LOW_MAGIC,MAGIC_MODES.NORMAL_MAGIC,MAGIC_MODES.HIGH_MAGIC];

for(const ruleset of ["2014","2024"]){
  test(`${ruleset} starting resources resolve for every class, tier boundary, and explicit magic mode`,()=>{
    for(const classId of CLASSES)for(const level of LEVELS)for(const mode of MODES){
      const plan=generateStartingMagic({ruleset,level,mode,classId});
      assert.equal(plan.ruleset,ruleset,`${ruleset} ${classId} L${level} ${mode}: wrong ruleset`);
      assert.equal(plan.level,level,`${ruleset} ${classId} L${level} ${mode}: wrong level`);
      assert.equal(plan.mode,mode,`${ruleset} ${classId} L${level} ${mode}: explicit mode changed`);
      assert.equal(plan.requestedMode,mode,`${ruleset} ${classId} L${level} ${mode}: requested mode lost`);
      assert.ok(String(plan.gold||"").trim(),`${ruleset} ${classId} L${level} ${mode}: gold guidance missing`);
      assert.ok(String(plan.source||"").trim(),`${ruleset} ${classId} L${level} ${mode}: source guidance missing`);
      if(mode===MAGIC_MODES.NO_MAGIC){
        assert.deepEqual(plan.items,[],`${ruleset} ${classId} L${level}: No Magic created items`);
        continue;
      }
      const expected=Object.values(plan.allowance||{}).reduce((sum,count)=>sum+Number(count||0),0);
      assert.equal(plan.items.length,expected,`${ruleset} ${classId} L${level} ${mode}: allowance count mismatch`);
      assert.equal(new Set(plan.items.map(item=>item.id)).size,plan.items.length,`${ruleset} ${classId} L${level} ${mode}: duplicate magic items`);
      for(const item of plan.items){
        assert.ok(item.id&&item.name&&item.rarity,`${ruleset} ${classId} L${level} ${mode}: incomplete item`);
        assert.equal(item.source,plan.source,`${ruleset} ${classId} L${level} ${mode}: item provenance lost`);
        if(classId==="wizard")assert.notEqual(item.id,"weapon-plus-1",`${ruleset} Wizard received excluded weapon candidate`);
      }
    }
  });
}

test("2024 Low Normal and High intentionally share the same official allocation at every tier boundary",()=>{
  for(const level of LEVELS){
    const plans=[MAGIC_MODES.LOW_MAGIC,MAGIC_MODES.NORMAL_MAGIC,MAGIC_MODES.HIGH_MAGIC].map(mode=>generateStartingMagic({ruleset:"2024",level,mode,classId:"fighter"}));
    assert.deepEqual(plans[0].allowance,plans[1].allowance,`2024 L${level}: Low and Normal diverged`);
    assert.deepEqual(plans[1].allowance,plans[2].allowance,`2024 L${level}: Normal and High diverged`);
    assert.equal(plans[0].gold,plans[2].gold,`2024 L${level}: campaign label changed official gold guidance`);
  }
});
