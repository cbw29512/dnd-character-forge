import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { clericProgressionFor, lifeDomainAlwaysPrepared } from "../src/rules/cleric.js";
import { CLERIC_SPELLS_2014 } from "../src/data/cleric-spells.js";
import { buildQuickReference } from "../src/rules/reference.js";

const CANTRIPS={1:3,2:3,3:3,4:4,5:4,6:4,7:4,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5};
const SLOTS={1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}};
const LEVEL_COUNTS={0:7,1:15,2:17,3:19,4:8,5:13,6:10,7:8,8:4,9:4};
function clericAt(level,spellSelections={}){
  try{const state=createInitialState();state.ruleset="2014";state.constraints.level=String(level);state.constraints.class="cleric";state.constraints.subclass="life-domain";state.constraints.species="human";state.constraints.background="acolyte";state.spellSelections={...state.spellSelections,...spellSelections};return generateCharacter(state);}catch(error){console.error(`[test] 2014 Cleric level ${level}`,error);throw error;}
}

test("2014 Life Cleric generates and validates at every level 1 through 20",()=>{
  for(let level=1;level<=20;level++){const c=clericAt(level);assert.equal(c.level,level);assert.equal(c.class.id,"cleric");assert.equal(c.subclass.id,"life-domain");assert.equal(c.validation.valid,true);assert.equal(c.divineOrder,null);assert.equal(c.blessedStrikes,null);assert.ok(c.cleric);}
});

test("2014 Cleric cantrips, slots, Channel Divinity, Destroy Undead, and Divine Intervention match the SRD table",()=>{
  for(let level=1;level<=20;level++){
    const expected=clericProgressionFor("2014",level),c=clericAt(level);
    assert.equal(expected.cantrips,CANTRIPS[level],`level ${level} cantrips`);assert.deepEqual(expected.slots,SLOTS[level],`level ${level} slots`);assert.equal(c.spells.cantrips.all.length,CANTRIPS[level],`level ${level} generated cantrips`);assert.deepEqual(c.spells.slots,SLOTS[level],`level ${level} generated slots`);assert.equal(c.cleric.channelDivinityUses,level<2?0:level<6?1:level<18?2:3,`level ${level} Channel Divinity`);
    const cr=level<5?null:level<8?"1/2":level<11?"1":level<14?"2":level<17?"3":"4";assert.equal(c.cleric.destroyUndeadCr,cr,`level ${level} Destroy Undead`);
    const intervention=level<10?null:level>=20?"automatic":level;assert.equal(c.cleric.divineInterventionThreshold,intervention,`level ${level} Divine Intervention`);
  }
});

test("2014 Cleric normal prepared count remains Wisdom modifier plus Cleric level",()=>{
  for(const level of [1,5,10,15,20]){const c=clericAt(level),expected=Math.max(1,level+Math.floor((c.abilities.wis-10)/2));assert.equal(c.spells.prepared.all.length,expected,`level ${level} prepared count`);for(const id of c.spells.alwaysPrepared)assert.ok(!c.spells.prepared.all.includes(id),`${id} consumed a normal prepared slot`);}
});

test("2014 Life Domain always-prepared spells are exact through level 20",()=>{
  const expected={1:["bless","cure-wounds"],3:["bless","cure-wounds","lesser-restoration","spiritual-weapon"],5:["bless","cure-wounds","lesser-restoration","spiritual-weapon","beacon-of-hope","revivify"],7:["bless","cure-wounds","lesser-restoration","spiritual-weapon","beacon-of-hope","revivify","death-ward","guardian-of-faith"],9:["bless","cure-wounds","lesser-restoration","spiritual-weapon","beacon-of-hope","revivify","death-ward","guardian-of-faith","mass-cure-wounds","raise-dead"]};
  for(const [level,ids] of Object.entries(expected)){assert.deepEqual(lifeDomainAlwaysPrepared("2014",Number(level)),ids);assert.deepEqual(clericAt(Number(level)).spells.alwaysPrepared,ids);}
  assert.deepEqual(clericAt(20).spells.alwaysPrepared,expected[9]);
});

test("2014 Cleric spell catalog is the exact 105-spell SRD 5.1 class list through level 9",()=>{
  assert.equal(CLERIC_SPELLS_2014.length,105);assert.equal(new Set(CLERIC_SPELLS_2014.map(spell=>spell.id)).size,105);
  for(const [level,count] of Object.entries(LEVEL_COUNTS))assert.equal(CLERIC_SPELLS_2014.filter(spell=>spell.level===Number(level)).length,count,`spell level ${level}`);
  for(const name of ["Aura of Life","Sunbeam","Sunburst","Power Word Heal"])assert.equal(CLERIC_SPELLS_2014.some(spell=>spell.name===name),false,`${name} leaked from 2024`);
  for(const name of ["Guardian of Faith","Mass Cure Wounds","Heroes’ Feast","Conjure Celestial","Holy Aura","True Resurrection"])assert.equal(CLERIC_SPELLS_2014.some(spell=>spell.name===name),true,`${name} missing`);
});

test("2014 Life Domain high-level feature breakpoints remain edition-correct",()=>{
  const at=level=>clericAt(level).features;
  assert.ok(!at(5).includes("Blessed Healer"));assert.ok(at(6).includes("Blessed Healer"));assert.ok(!at(7).includes("Divine Strike"));assert.ok(at(8).includes("Divine Strike"));assert.ok(!at(9).includes("Divine Intervention"));assert.ok(at(10).includes("Divine Intervention"));assert.ok(!at(16).includes("Supreme Healing"));assert.ok(at(17).includes("Supreme Healing"));
  for(const name of ["Blessed Strikes","Improved Blessed Strikes","Epic Boon","Greater Divine Intervention","Divine Spark"])assert.equal(at(20).includes(name),false,`${name} leaked from 2024`);
});

test("2014 Channel Divinity and Destroy Undead references expose the current tier only",()=>{
  for(const [level,uses,cr] of [[5,1,"1/2"],[8,2,"1"],[11,2,"2"],[14,2,"3"],[17,2,"4"],[18,3,"4"]]){
    const c=clericAt(level),refs=buildQuickReference(c),channel=refs.find(item=>item.name.startsWith("Channel Divinity (")&&!item.name.includes("Preserve")),destroy=refs.find(item=>item.name.startsWith("Destroy Undead"));assert.ok(channel);assert.match(channel.text,new RegExp(`${uses} use`));assert.doesNotMatch(channel.text,/Divine Spark/);assert.equal(channel.source.page,"16");assert.ok(destroy);assert.match(destroy.text,new RegExp(`CR ${cr.replace("/","\\/")}`));assert.equal(destroy.source.page,"17");assert.equal(refs.filter(item=>item.name.startsWith("Destroy Undead")).length,1);
  }
});

test("2014 Divine Strike scales from 1d8 at level 8 to 2d8 at level 14",()=>{
  const eight=buildQuickReference(clericAt(8)).find(item=>item.name==="Divine Strike"),fourteen=buildQuickReference(clericAt(14)).find(item=>item.name==="Divine Strike");assert.match(eight.text,/1d8 Radiant/);assert.doesNotMatch(eight.text,/2d8/);assert.match(fourteen.text,/2d8 Radiant/);assert.equal(eight.source.page,"17");assert.equal(fourteen.source.page,"17");
});

test("2014 Divine Intervention uses percentile threshold and becomes automatic at level 20",()=>{
  const ten=buildQuickReference(clericAt(10)).find(item=>item.name==="Divine Intervention"),nineteen=buildQuickReference(clericAt(19)).find(item=>item.name==="Divine Intervention"),twenty=buildQuickReference(clericAt(20)).find(item=>item.name==="Divine Intervention");assert.match(ten.text,/10 or lower/);assert.match(nineteen.text,/19 or lower/);assert.match(nineteen.text,/7 days/);assert.match(nineteen.text,/Long Rest/);assert.match(twenty.text,/succeeds automatically/);assert.doesNotMatch(twenty.text,/percentile/i);assert.equal(twenty.source.page,"17");
});

test("2014 Blessed Healer and Supreme Healing do not borrow 2024 slot or Channel Divinity wording",()=>{
  const six=buildQuickReference(clericAt(6)).find(item=>item.name==="Blessed Healer"),seventeen=buildQuickReference(clericAt(17)).find(item=>item.name==="Supreme Healing");assert.match(six.text,/spell of level 1 or higher/);assert.match(six.text,/spell's level/);assert.doesNotMatch(six.text,/slot's level/);assert.match(seventeen.text,/with a spell/);assert.doesNotMatch(seventeen.text,/Channel Divinity/);assert.equal(six.source.page,"17");assert.equal(seventeen.source.page,"17");
});

test("2014 level 20 Life Cleric has complete spell state and no 2024-only mechanics",()=>{
  const c=clericAt(20);assert.equal(c.proficiency,6);assert.equal(c.spells.cantrips.all.length,5);assert.equal(c.spells.alwaysPrepared.length,10);assert.deepEqual(c.spells.slots,{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1});assert.equal(c.cleric.channelDivinityUses,3);assert.equal(c.cleric.destroyUndeadCr,"4");assert.equal(c.cleric.divineInterventionThreshold,"automatic");assert.equal(c.divineOrder,null);assert.equal(c.blessedStrikes,null);assert.equal(c.epicBoonAbility,null);assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),false);
  const refs=buildQuickReference(c);for(const item of refs){assert.equal(item.source.version,"SRD 5.1",item.name);assert.ok(item.source.page,item.name);}for(const name of ["Blessed Healer","Divine Strike","Divine Intervention","Supreme Healing"]){const item=refs.find(ref=>ref.name===name);assert.ok(item,name);assert.equal(item.source.page,"17");}
});

test("Random 2014 Cleric level can legally span 1 through 20",()=>{
  const state=createInitialState();state.ruleset="2014";state.constraints.class="cleric";state.constraints.subclass="life-domain";const levels=new Set();for(let i=0;i<500;i++){const c=generateCharacter(state);assert.ok(c.level>=1&&c.level<=20);levels.add(c.level);}assert.ok([...levels].some(level=>level>5));assert.ok([...levels].some(level=>level>=17));
});
