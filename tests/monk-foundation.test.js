import test from "node:test";
import assert from "node:assert/strict";
import { applyBodyAndMind, monkProgressionFor, monkSaveDc, monkWholenessUses } from "../src/rules/monk.js";

const POINTS=[0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const MOVEMENT=[0,10,10,10,10,15,15,15,15,20,20,20,20,25,25,25,25,30,30,30];
const MARTIAL_2014=["d4","d4","d4","d4","d6","d6","d6","d6","d6","d6","d8","d8","d8","d8","d8","d8","d10","d10","d10","d10"];
const MARTIAL_2024=["d6","d6","d6","d6","d8","d8","d8","d8","d8","d8","d10","d10","d10","d10","d10","d10","d12","d12","d12","d12"];

function assertSharedRow(progression,level,die){
  try{
    assert.equal(progression.martialArtsDie,die);
    assert.equal(progression.resourcePoints,POINTS[level-1]);
    assert.equal(progression.unarmoredMovementBonus,MOVEMENT[level-1]);
    assert.equal(progression.attacksPerAction,level>=5?2:1);
    assert.equal(progression.flurryOfBlows,level>=2);
    assert.equal(progression.patientDefense,level>=2);
    assert.equal(progression.stepOfTheWind,level>=2);
    assert.equal(progression.slowFall,level>=4);
    assert.equal(progression.stunningStrike,level>=5);
    assert.equal(progression.empoweredStrikes,level>=6);
    assert.equal(progression.evasion,level>=7);
    assert.equal(progression.acrobaticMovement,level>=9);
    assert.equal(progression.allSaveProficiency,level>=14);
    assert.equal(progression.saveReroll,level>=14);
  }catch(error){console.error(`[monk-test] shared progression row ${level} failed`,error);throw error;}
}

test("2014 Monk progression matches all 20 SRD rows",()=>{
  try{
    for(let level=1;level<=20;level++){
      const p=monkProgressionFor("2014",level,"open-hand");
      assertSharedRow(p,level,MARTIAL_2014[level-1]);
      assert.equal(p.resourceName,"Ki");
      assert.equal(p.flurryStrikeCount,level>=2?2:0);
      assert.equal(p.uncannyMetabolism,false);
      assert.equal(p.deflectMissiles,level>=3);
      assert.equal(p.deflectAttacks,false);
      assert.equal(p.stunningStrikeOncePerTurn,false);
      assert.equal(p.stillnessOfMind,level>=7);
      assert.equal(p.purityOfBody,level>=10);
      assert.equal(p.tongueOfSunAndMoon,level>=13);
      assert.equal(p.deflectEnergy,false);
      assert.equal(p.timelessBody,level>=15);
      assert.equal(p.perfectFocus,false);
      assert.equal(p.initiativeResourceFloor,level>=20?4:0);
      assert.equal(p.emptyBody,level>=18);
      assert.equal(p.superiorDefense,false);
      assert.equal(p.epicBoon,false);
      assert.equal(p.bodyAndMind,false);
      assert.equal(p.openHandTechnique,level>=3);
      assert.equal(p.wholenessOfBody,level>=6);
      assert.equal(p.wholenessAction,level>=6?"Action":null);
      assert.equal(p.wholenessUses,level>=6?1:0);
      assert.equal(p.tranquility,level>=11);
      assert.equal(p.fleetStep,false);
      assert.equal(p.quiveringPalm,level>=17);
      assert.equal(p.quiveringPalmCost,level>=17?3:0);
      assert.equal(p.quiveringPalmDamage,level>=17?"Fail: 0 HP; Success: 10d10 Necrotic":null);
    }
  }catch(error){console.error("[monk-test] 2014 progression matrix failed",error);throw error;}
});

test("2024 Monk progression matches all 20 SRD 5.2.1 rows",()=>{
  try{
    for(let level=1;level<=20;level++){
      const p=monkProgressionFor("2024",level,"open-hand");
      assertSharedRow(p,level,MARTIAL_2024[level-1]);
      assert.equal(p.resourceName,"Focus");
      assert.equal(p.flurryStrikeCount,level>=10?3:level>=2?2:0);
      assert.equal(p.uncannyMetabolism,level>=2);
      assert.equal(p.deflectMissiles,false);
      assert.equal(p.deflectAttacks,level>=3);
      assert.equal(p.stunningStrikeOncePerTurn,level>=5);
      assert.equal(p.stillnessOfMind,false);
      assert.equal(p.heightenedFocus,level>=10);
      assert.equal(p.selfRestoration,level>=10);
      assert.equal(p.purityOfBody,false);
      assert.equal(p.tongueOfSunAndMoon,false);
      assert.equal(p.deflectEnergy,level>=13);
      assert.equal(p.timelessBody,false);
      assert.equal(p.perfectFocus,level>=15);
      assert.equal(p.initiativeResourceFloor,level>=15?4:0);
      assert.equal(p.emptyBody,false);
      assert.equal(p.superiorDefense,level>=18);
      assert.equal(p.epicBoon,level>=19);
      assert.equal(p.bodyAndMind,level>=20);
      assert.equal(p.bodyAndMindMaximum,level>=20?25:20);
      assert.equal(p.openHandTechnique,level>=3);
      assert.equal(p.wholenessOfBody,level>=6);
      assert.equal(p.wholenessAction,level>=6?"Bonus Action":null);
      assert.equal(p.wholenessUses,null);
      assert.equal(p.tranquility,false);
      assert.equal(p.fleetStep,level>=11);
      assert.equal(p.quiveringPalm,level>=17);
      assert.equal(p.quiveringPalmCost,level>=17?4:0);
      assert.equal(p.quiveringPalmDamage,level>=17?"Fail: 10d12 Force; Success: half":null);
    }
  }catch(error){console.error("[monk-test] 2024 progression matrix failed",error);throw error;}
});

test("Monk calculations stay fail-closed and edition-correct",()=>{
  try{
    assert.throws(()=>monkProgressionFor("2014",0),/Unsupported 2014 Monk level 0/);
    assert.throws(()=>monkProgressionFor("2024",21),/Unsupported 2024 Monk level 21/);
    assert.throws(()=>monkProgressionFor("2030",5),/Unsupported Monk ruleset/);
    assert.equal(monkSaveDc({level:5,abilities:{wis:16}}),14);
    assert.equal(monkWholenessUses({ruleset:"2014",level:6,subclass:{id:"open-hand"},abilities:{wis:18}}),1);
    assert.equal(monkWholenessUses({ruleset:"2024",level:6,subclass:{id:"open-hand"},abilities:{wis:18}}),4);
  }catch(error){console.error("[monk-test] calculation contract failed",error);throw error;}
});

test("2024 Body and Mind applies only at level 20 and caps its increase at 25",()=>{
  try{
    const scores={str:10,dex:20,con:14,int:10,wis:18,cha:8};
    const maximums={str:20,dex:20,con:20,int:20,wis:20,cha:20};
    const before=applyBodyAndMind(scores,maximums,"2024",19);
    assert.deepEqual(before.scores,scores);assert.deepEqual(before.maximums,maximums);
    const after=applyBodyAndMind(scores,maximums,"2024",20);
    assert.equal(after.scores.dex,24);assert.equal(after.scores.wis,22);assert.equal(after.maximums.dex,25);assert.equal(after.maximums.wis,25);
    const capped=applyBodyAndMind({...scores,dex:24,wis:23},maximums,"2024",20);
    assert.equal(capped.scores.dex,25);assert.equal(capped.scores.wis,25);
  }catch(error){console.error("[monk-test] Body and Mind contract failed",error);throw error;}
});
