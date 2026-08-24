import test from "node:test";
import assert from "node:assert/strict";
import { bardProgressionFor, bardPickerLimits, maxBardSpellLevel } from "../src/rules/bard.js";
import { BARD_SPELLS_2014, BARD_SPELLS_2024 } from "../src/data/bard-spells.js";

const SLOT_ROWS={1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}};
const CANTRIPS=[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4];
const KNOWN_2014=[4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22];
const PREPARED_2024=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];

test("2014 Bard progression matches all 20 SRD table rows",()=>{
  for(let level=1;level<=20;level++){
    const p=bardProgressionFor("2014",level,"college-lore");
    assert.equal(p.cantrips,CANTRIPS[level-1]);assert.equal(p.known,KNOWN_2014[level-1]);assert.equal(p.prepared,null);assert.deepEqual(p.slots,SLOT_ROWS[level]);
    assert.equal(p.expertiseCount,level<3?0:level<10?2:4);assert.equal(p.countercharm,level>=6);assert.equal(p.fontOfInspiration,level>=5);assert.equal(p.songOfRestDie,level<2?null:level<9?"d6":level<13?"d8":level<17?"d10":"d12");
    assert.equal(p.magicalSecretsCount,level<10?0:level<14?2:level<18?4:6);assert.equal(p.loreMagicalSecretsCount,level>=6?2:0);assert.equal(p.superiorInspiration,level>=20);assert.equal(p.wordsOfCreation,false);
  }
});

test("2024 Bard progression matches all 20 SRD table rows",()=>{
  for(let level=1;level<=20;level++){
    const p=bardProgressionFor("2024",level,"college-lore");
    assert.equal(p.cantrips,CANTRIPS[level-1]);assert.equal(p.prepared,PREPARED_2024[level-1]);assert.equal(p.known,null);assert.deepEqual(p.slots,SLOT_ROWS[level]);
    assert.equal(p.expertiseCount,level<2?0:level<9?2:4);assert.equal(p.countercharm,level>=7);assert.equal(p.fontOfInspiration,level>=5);assert.equal(p.songOfRestDie,null);assert.equal(p.magicalSecrets,level>=10);assert.equal(p.magicalDiscoveriesCount,level>=6?2:0);assert.equal(p.superiorInspiration,level>=18);assert.equal(p.superiorInspirationFloor,level>=18?2:0);assert.equal(p.wordsOfCreation,level>=20);assert.equal(p.epicBoon,level>=19);
  }
});

test("Bardic Inspiration die and College of Lore timing stay edition-correct",()=>{
  for(const ruleset of ["2014","2024"]){assert.equal(bardProgressionFor(ruleset,1,"college-lore").bardicInspirationDie,"d6");assert.equal(bardProgressionFor(ruleset,5,"college-lore").bardicInspirationDie,"d8");assert.equal(bardProgressionFor(ruleset,10,"college-lore").bardicInspirationDie,"d10");assert.equal(bardProgressionFor(ruleset,15,"college-lore").bardicInspirationDie,"d12");assert.equal(bardProgressionFor(ruleset,3,"college-lore").loreBonusSkills,3);assert.equal(bardProgressionFor(ruleset,3,"college-lore").cuttingWords,true);assert.equal(bardProgressionFor(ruleset,14,"college-lore").peerlessSkill,true);}
});

test("Bard spell catalogs are exact verified SRD lists by level",()=>{
  const counts2014=[9,20,19,15,8,16,7,10,5,3],counts2024=[10,23,22,17,10,17,8,11,6,5];
  assert.equal(BARD_SPELLS_2014.length,112);assert.equal(BARD_SPELLS_2024.length,129);
  for(let level=0;level<=9;level++){assert.equal(BARD_SPELLS_2014.filter(spell=>spell.level===level).length,counts2014[level]);assert.equal(BARD_SPELLS_2024.filter(spell=>spell.level===level).length,counts2024[level]);}
  for(const list of [BARD_SPELLS_2014,BARD_SPELLS_2024]){assert.equal(new Set(list.map(spell=>spell.id)).size,list.length);assert.equal(new Set(list.map(spell=>spell.name)).size,list.length);}
  assert.equal(BARD_SPELLS_2014.some(spell=>spell.name==="Starry Wisp"),false);assert.equal(BARD_SPELLS_2024.some(spell=>spell.name==="Starry Wisp"),true);assert.equal(BARD_SPELLS_2014.some(spell=>spell.name==="Power Word Heal"),false);assert.equal(BARD_SPELLS_2024.some(spell=>spell.name==="Power Word Heal"),true);
  assert.ok(BARD_SPELLS_2024.every(spell=>spell.school));
});

test("Bard picker limits and maximum spell level expose the shared generator contract",()=>{
  assert.deepEqual(bardPickerLimits({ruleset:"2014",level:20,subclassId:"college-lore"}),{cantrips:4,known:22,prepared:null,magicalSecrets:6,loreDiscoveries:2});
  assert.deepEqual(bardPickerLimits({ruleset:"2024",level:20,subclassId:"college-lore"}),{cantrips:4,known:null,prepared:22,magicalSecrets:0,loreDiscoveries:2});
  assert.equal(maxBardSpellLevel(1),1);assert.equal(maxBardSpellLevel(3),2);assert.equal(maxBardSpellLevel(17),9);assert.equal(maxBardSpellLevel(20),9);
});
