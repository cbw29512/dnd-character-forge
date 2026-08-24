import test from "node:test";
import assert from "node:assert/strict";
import { rangerProgressionFor } from "../src/rules/ranger.js";

const KNOWN_2014=[0,0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11];
const PREPARED_2024=[0,2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15];
const MARK_CASTS=[0,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];
const EXPECTED_SLOTS={
  1:{1:2},2:{1:2},3:{1:3},4:{1:3},5:{1:4,2:2},6:{1:4,2:2},7:{1:4,2:3},8:{1:4,2:3},9:{1:4,2:3,3:2},10:{1:4,2:3,3:2},11:{1:4,2:3,3:3},12:{1:4,2:3,3:3},13:{1:4,2:3,3:3,4:1},14:{1:4,2:3,3:3,4:1},15:{1:4,2:3,3:3,4:2},16:{1:4,2:3,3:3,4:2},17:{1:4,2:3,3:3,4:3,5:1},18:{1:4,2:3,3:3,4:3,5:1},19:{1:4,2:3,3:3,4:3,5:2},20:{1:4,2:3,3:3,4:3,5:2}
};

test("2014 Ranger all 20 levels match spells-known, slots, and feature breakpoints",()=>{
  for(let level=1;level<=20;level++){
    const p=rangerProgressionFor("2014",level,"hunter",3);assert.equal(p.known,KNOWN_2014[level],`known L${level}`);assert.equal(p.prepared,0);assert.deepEqual(p.slots,level===1?{}:EXPECTED_SLOTS[level],`slots L${level}`);assert.equal(p.fightingStyle,level>=2);assert.equal(p.favoredEnemyCount,level>=14?3:level>=6?2:1);assert.equal(p.naturalExplorerTerrainCount,level>=10?3:level>=6?2:1);assert.equal(p.attacksPerAction,level>=5?2:1);assert.equal(p.landsStride,level>=8);assert.equal(p.hideInPlainSight,level>=10);assert.equal(p.vanish,level>=14);assert.equal(p.feralSenses,level>=18);assert.equal(p.foeSlayer,level>=20);assert.equal(p.masteryCount,0);assert.equal(p.epicBoon,false);
  }
});

test("2024 Ranger all 20 levels match prepared spells, Hunter's Mark, mastery, and exploration breakpoints",()=>{
  for(let level=1;level<=20;level++){
    const p=rangerProgressionFor("2024",level,"hunter",3);assert.equal(p.prepared,PREPARED_2024[level],`prepared L${level}`);assert.equal(p.known,0);assert.deepEqual(p.slots,EXPECTED_SLOTS[level],`slots L${level}`);assert.equal(p.hunterMarkFreeCasts,MARK_CASTS[level]);assert.equal(p.hunterMarkDie,level===20?"d10":"d6");assert.equal(p.masteryCount,2);assert.equal(p.fightingStyle,level>=2);assert.equal(p.expertiseCount,level>=9?3:level>=2?1:0);assert.equal(p.extraLanguages,level>=2?2:0);assert.equal(p.roving,level>=6);assert.equal(p.speedBonus,level>=6?10:0);assert.equal(p.tireless,level>=10);assert.equal(p.relentlessHunter,level>=13);assert.equal(p.natureVeil,level>=14);assert.equal(p.preciseHunter,level>=17);assert.equal(p.blindsightRange,level>=18?30:0);assert.equal(p.epicBoon,level>=19);assert.equal(p.foeSlayer,level>=20);assert.equal(p.superiorHuntersPrey,level>=11);assert.equal(p.superiorHuntersDefense,level>=15);
  }
});
