import test from "node:test";
import assert from "node:assert/strict";
import { paladinProgressionFor } from "../src/rules/paladin.js";

const SLOT_SIG_2014=["","1:2","1:3","1:3","1:4,2:2","1:4,2:2","1:4,2:3","1:4,2:3","1:4,2:3,3:2","1:4,2:3,3:2","1:4,2:3,3:3","1:4,2:3,3:3","1:4,2:3,3:3,4:1","1:4,2:3,3:3,4:1","1:4,2:3,3:3,4:2","1:4,2:3,3:3,4:2","1:4,2:3,3:3,4:3,5:1","1:4,2:3,3:3,4:3,5:1","1:4,2:3,3:3,4:3,5:2","1:4,2:3,3:3,4:3,5:2"];
const SLOT_SIG_2024=["1:2","1:2","1:3","1:3","1:4,2:2","1:4,2:2","1:4,2:3","1:4,2:3","1:4,2:3,3:2","1:4,2:3,3:2","1:4,2:3,3:3","1:4,2:3,3:3","1:4,2:3,3:3,4:1","1:4,2:3,3:3,4:1","1:4,2:3,3:3,4:2","1:4,2:3,3:3,4:2","1:4,2:3,3:3,4:3,5:1","1:4,2:3,3:3,4:3,5:1","1:4,2:3,3:3,4:3,5:2","1:4,2:3,3:3,4:3,5:2"];
const PREPARED_2024=[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15];
const sig=slots=>Object.entries(slots).map(([level,count])=>`${level}:${count}`).join(",");

test("2014 Paladin spell slots and formula-based preparation match every class-table level",()=>{
  for(let level=1;level<=20;level++){const p=paladinProgressionFor("2014",level,"oath-devotion",3);assert.equal(sig(p.slots),SLOT_SIG_2014[level-1],`2014 level ${level} slots`);assert.equal(p.prepared,level===1?0:Math.floor(level/2)+3,`2014 level ${level} prepared`);assert.equal(p.masteryCount,0);assert.equal(p.channelDivinityUses,level>=3?1:0);assert.equal(p.attacksPerAction,level>=5?2:1);assert.equal(p.auraRange,level>=18?30:level>=6?10:0);assert.equal(p.improvedDivineSmite,level>=11);assert.equal(p.cleansingTouchUses,level>=14?3:0);}
});

test("2024 Paladin slots, prepared spells, and Channel Divinity match every class-table level",()=>{
  for(let level=1;level<=20;level++){const p=paladinProgressionFor("2024",level,"oath-devotion",3);assert.equal(sig(p.slots),SLOT_SIG_2024[level-1],`2024 level ${level} slots`);assert.equal(p.prepared,PREPARED_2024[level-1],`2024 level ${level} prepared`);assert.equal(p.masteryCount,2);assert.equal(p.channelDivinityUses,level<3?0:level<11?2:3);assert.equal(p.attacksPerAction,level>=5?2:1);assert.equal(p.auraRange,level>=18?30:level>=6?10:0);assert.equal(p.faithfulSteed,level>=5);assert.equal(p.abjureFoes,level>=9);assert.equal(p.radiantStrikes,level>=11);assert.equal(p.restoringTouch,level>=14);assert.equal(p.epicBoon,level>=19);}
});

test("Devotion subclass breakpoints stay edition-correct",()=>{
  for(const ruleset of ["2014","2024"])for(let level=1;level<=20;level++){const p=paladinProgressionFor(ruleset,level,"oath-devotion",3);assert.equal(p.sacredWeapon,level>=3);assert.equal(p.auraDevotion,level>=7);assert.equal(p.holyNimbus,level>=20);if(ruleset==="2014"){assert.equal(p.purityOfSpirit,level>=15);assert.equal(p.smiteOfProtection,false);}else{assert.equal(p.purityOfSpirit,false);assert.equal(p.smiteOfProtection,level>=15);}}
});
