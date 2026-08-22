import test from "node:test";
import assert from "node:assert/strict";
import { BARBARIAN_TABLES, barbarianFeatures, barbarianProgression, barbarianResources } from "../src/rules/barbarian.js";

const RAGES_2014=[2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,"Unlimited"];
const RAGE_DAMAGE=[2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4];
const RAGES_2024=[2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6];
const MASTERY_2024=[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4];

test("Barbarian progression covers every level 1-20 in both editions",()=>{
  try{
    for(const ruleset of ["2014","2024"]){
      assert.equal(Object.keys(BARBARIAN_TABLES[ruleset]).length,20);
      for(let level=1;level<=20;level++)assert.ok(barbarianProgression(ruleset,level));
    }
  }catch(error){console.error("[test] Barbarian level coverage",error);throw error;}
});

test("2014 Rage uses and damage match the edition table exactly",()=>{
  try{
    for(let level=1;level<=20;level++){
      const row=barbarianProgression("2014",level);
      assert.equal(row.rages,RAGES_2014[level-1],`2014 level ${level} Rages`);
      assert.equal(row.rageDamage,RAGE_DAMAGE[level-1],`2014 level ${level} Rage Damage`);
      assert.equal("masteries" in row,false);
    }
  }catch(error){console.error("[test] 2014 Barbarian table",error);throw error;}
});

test("2024 Rage uses, damage, and Weapon Mastery match the edition table exactly",()=>{
  try{
    for(let level=1;level<=20;level++){
      const row=barbarianProgression("2024",level);
      assert.equal(row.rages,RAGES_2024[level-1],`2024 level ${level} Rages`);
      assert.equal(row.rageDamage,RAGE_DAMAGE[level-1],`2024 level ${level} Rage Damage`);
      assert.equal(row.masteries,MASTERY_2024[level-1],`2024 level ${level} masteries`);
    }
  }catch(error){console.error("[test] 2024 Barbarian table",error);throw error;}
});

test("level 20 preserves the critical edition difference in Rage uses",()=>{
  try{
    assert.equal(barbarianProgression("2014",20).rages,"Unlimited");
    assert.equal(barbarianProgression("2024",20).rages,6);
  }catch(error){console.error("[test] Barbarian level 20 edition difference",error);throw error;}
});

test("Berserker subclass feature timing stays edition-correct",()=>{
  try{
    const old10=barbarianFeatures("2014",10,"path-berserker");
    const new10=barbarianFeatures("2024",10,"path-berserker");
    assert.ok(old10.includes("Intimidating Presence"));
    assert.ok(!old10.includes("Retaliation"));
    assert.ok(new10.includes("Retaliation"));
    assert.ok(!new10.includes("Intimidating Presence"));
    assert.ok(barbarianFeatures("2014",14,"path-berserker").includes("Retaliation"));
    assert.ok(barbarianFeatures("2024",14,"path-berserker").includes("Intimidating Presence"));
  }catch(error){console.error("[test] Berserker timing",error);throw error;}
});

test("Barbarian sheet resources are derived from current level rather than constants",()=>{
  try{
    const old20=Object.fromEntries(barbarianResources("2014",20).map(item=>[item.id,item.value]));
    const new10=Object.fromEntries(barbarianResources("2024",10).map(item=>[item.id,item.value]));
    assert.equal(old20["rage-uses"],"Unlimited");
    assert.equal(old20["rage-damage"],"+4");
    assert.equal(old20["weapon-masteries"],undefined);
    assert.equal(new10["rage-uses"],"4");
    assert.equal(new10["rage-damage"],"+3");
    assert.equal(new10["weapon-masteries"],"4");
  }catch(error){console.error("[test] Barbarian resources",error);throw error;}
});

test("invalid Barbarian editions and levels fail closed",()=>{
  try{
    assert.throws(()=>barbarianProgression("2024",0),/1 to 20/i);
    assert.throws(()=>barbarianProgression("2024",21),/1 to 20/i);
    assert.throws(()=>barbarianProgression("2099",1),/Unsupported Barbarian ruleset/i);
  }catch(error){console.error("[test] Barbarian fail-closed validation",error);throw error;}
});
