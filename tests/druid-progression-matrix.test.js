import test from "node:test";
import assert from "node:assert/strict";
import { druidProgressionFor } from "../src/rules/druid.js";

const PREPARED_2024=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];
const WS_2024=[0,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4];
const FORMS_2024=[0,4,4,6,6,6,6,8,8,8,8,8,8,8,8,8,8,8,8,8];
const CANTRIPS=[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4];

for(const ruleset of ["2014","2024"])test(`${ruleset} Druid progression is internally complete at levels 1-20`,()=>{
  for(let level=1;level<=20;level++){
    const p=druidProgressionFor(ruleset,level,"circle-land");assert.ok(p.slots[1]>=2);assert.equal(Object.keys(p.slots).map(Number).at(-1),Math.min(9,Math.ceil(level/2)));assert.equal(p.durationHours,level<2?0:Math.floor(level/2));
    if(ruleset==="2014"){
      assert.equal(p.wildShapeUses,level<2?0:2);assert.equal(p.unlimitedWildShape,level===20);assert.equal(p.wildShapeTempHp,null);assert.equal(p.knownFormCount,null);assert.equal(p.cantrips,CANTRIPS[level-1]+(level>=2?1:0));assert.equal(p.maxCr,level<2?0:level<4?.25:level<8?.5:1);assert.equal(p.allowSwim,level>=4);assert.equal(p.allowFly,level>=8);assert.equal(p.naturalRecovery,level>=2?Math.ceil(level/2):0);
    }else{
      assert.equal(p.wildShapeUses,WS_2024[level-1]);assert.equal(p.wildShapeTempHp,level<2?0:level);assert.equal(p.knownFormCount,FORMS_2024[level-1]);assert.equal(p.prepared,PREPARED_2024[level-1]);assert.equal(p.cantrips,CANTRIPS[level-1]);assert.equal(p.maxCr,level<2?0:level<4?.25:level<8?.5:1);assert.equal(p.allowSwim,level>=2);assert.equal(p.allowFly,level>=8);assert.equal(p.wildCompanion,level>=2);assert.equal(p.wildResurgence,level>=5);assert.equal(p.elementalFury,level>=7);assert.equal(p.improvedElementalFury,level>=15);assert.equal(p.epicBoon,level>=19);assert.equal(p.archdruid,level>=20);
    }
  }
});

test("Circle of the Land subclass breakpoints stay edition-specific",()=>{
  const old6=druidProgressionFor("2014",6,"circle-land"),old14=druidProgressionFor("2014",14,"circle-land"),new3=druidProgressionFor("2024",3,"circle-land"),new14=druidProgressionFor("2024",14,"circle-land");
  assert.equal(old6.landsStride,true);assert.equal(old14.naturesSanctuary,true);assert.equal(new3.landsAidDice,2);assert.equal(new14.landsAidDice,4);assert.equal(new14.naturesSanctuary,true);assert.equal(new3.naturalRecovery,0);assert.equal(druidProgressionFor("2024",6,"circle-land").naturalRecovery,3);
});
