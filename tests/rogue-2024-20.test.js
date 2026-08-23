import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { abilityMod } from "../src/rules/math.js";
import { CUNNING_STRIKE_OPTIONS_2024, rogueCunningStrikeDc, rogueProgressionFor } from "../src/rules/rogue.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { renderCharacter } from "../src/ui/render.js";

const SNEAK={1:1,2:1,3:2,4:2,5:3,6:3,7:4,8:4,9:5,10:5,11:6,12:6,13:7,14:7,15:8,16:8,17:9,18:9,19:10,20:10};
function rogueAt(level,{background="criminal",species="halfling"}={}){
  const state=createInitialState();state.ruleset="2024";state.constraints.level=String(level);state.constraints.class="rogue";state.constraints.subclass=level>=3?"thief":"random";state.constraints.species=species;state.constraints.background=background;return generateCharacter(state);
}

test("2024 Thief Rogue generates and validates at every level 1 through 20",()=>{
  for(let level=1;level<=20;level++){
    const c=rogueAt(level);assert.equal(c.level,level);assert.equal(c.class.id,"rogue");assert.equal(c.validation.valid,true);assert.equal(c.rogue.sneakAttackDice,SNEAK[level]);assert.equal(c.rogue.expertiseCount,level>=6?4:2);assert.equal(c.expertise.length,level>=6?4:2);assert.equal(c.rogue.masteryCount,2);assert.equal(c.masteryIds.length,2);assert.ok(c.toolProficiencies.includes("Thieves' Tools"));assert.ok(c.languages.includes("Thieves’ Cant"));if(level>=3)assert.equal(c.subclass.id,"thief");else assert.equal(c.subclass,null);
  }
});

test("Rogue class table and Cunning Strike breakpoints are exact",()=>{
  const rogueClass=RAW_2024.classes.find(cls=>cls.id==="rogue");assert.equal(rogueClass.maxLevel,20);assert.deepEqual(rogueClass.asiLevels,[4,8,10,12,16]);assert.deepEqual(rogueClass.epicBoon,{level:19,feat:"boon-night-spirit"});
  for(let level=1;level<=20;level++){
    const expected=rogueProgressionFor(level,level>=3?"thief":null),c=rogueAt(level);assert.deepEqual(c.rogue,expected);assert.equal(c.rogue.maxCunningStrikeEffects,level<5?0:level<11?1:2);assert.equal(c.rogue.reliableTalent,level>=7);assert.equal(c.rogue.slipperyMind,level>=15);assert.equal(c.rogue.strokeOfLuck,level>=20);assert.equal(c.rogue.thiefReflexes,level>=17);
  }
});

test("Cunning Strike options unlock only at their RAW levels with exact costs and requirements",()=>{
  assert.deepEqual(rogueAt(4).rogue.cunningStrikeOptions,[]);
  assert.deepEqual(rogueAt(5).rogue.cunningStrikeOptions,["poison","trip","withdraw"]);
  assert.deepEqual(rogueAt(9).rogue.cunningStrikeOptions,["poison","trip","withdraw","stealth-attack"]);
  assert.deepEqual(rogueAt(14).rogue.cunningStrikeOptions,["poison","trip","withdraw","stealth-attack","daze","knock-out","obscure"]);
  const byId=new Map(CUNNING_STRIKE_OPTIONS_2024.map(option=>[option.id,option]));assert.equal(byId.get("poison").cost,1);assert.equal(byId.get("poison").requires,"Poisoner's Kit");assert.equal(byId.get("trip").save,"dex");assert.equal(byId.get("withdraw").save,null);assert.equal(byId.get("stealth-attack").subclass,"thief");assert.equal(byId.get("daze").cost,2);assert.equal(byId.get("knock-out").cost,6);assert.equal(byId.get("obscure").cost,3);
});

test("Cunning Strike DC uses Dexterity plus Proficiency Bonus",()=>{
  for(const level of [5,9,14,20]){const c=rogueAt(level),expected=8+abilityMod(c.abilities.dex)+c.proficiency;assert.equal(rogueCunningStrikeDc(c),expected);}
});

test("Slippery Mind adds Wisdom and Charisma save proficiency only at level 15",()=>{
  const before=rogueAt(14),after=rogueAt(15);assert.deepEqual([...before.saves].sort(),["dex","int"]);assert.deepEqual([...after.saves].sort(),["cha","dex","int","wis"]);assert.equal(after.saveBonuses.wis,abilityMod(after.abilities.wis)+after.proficiency);assert.equal(after.saveBonuses.cha,abilityMod(after.abilities.cha)+after.proficiency);
});

test("Thief subclass feature timing is exact",()=>{
  const f3=rogueAt(3).features,f8=rogueAt(8).features,f9=rogueAt(9).features,f12=rogueAt(12).features,f13=rogueAt(13).features,f16=rogueAt(16).features,f17=rogueAt(17).features;
  assert.ok(f3.includes("Fast Hands")&&f3.includes("Second-Story Work"));assert.ok(!f8.includes("Supreme Sneak"));assert.ok(f9.includes("Supreme Sneak"));assert.ok(!f12.includes("Use Magic Device"));assert.ok(f13.includes("Use Magic Device"));assert.ok(!f16.includes("Thief’s Reflexes"));assert.ok(f17.includes("Thief’s Reflexes"));
});

test("Boon of the Night Spirit appears at 19 with legal ability maximum",()=>{
  assert.ok(!rogueAt(18).feats.some(feat=>feat.id==="boon-night-spirit"));const c=rogueAt(19),boon=c.feats.find(feat=>feat.id==="boon-night-spirit");assert.ok(boon);assert.ok(c.epicBoonAbility);assert.equal(c.abilityMaximums[c.epicBoonAbility],30);const ref=buildQuickReference(c).find(item=>item.name==="Boon of the Night Spirit");assert.equal(ref.source.version,"SRD 5.2.1");assert.equal(ref.source.page,"88");assert.match(ref.text,/Invisible/);assert.match(ref.text,/Psychic and Radiant/);
});

test("Rogue and Thief play references carry exact verified SRD pages",()=>{
  const refs=buildQuickReference(rogueAt(20)),byName=new Map(refs.map(item=>[item.name,item]));
  for(const name of ["Expertise","Sneak Attack"])assert.equal(byName.get(name).source.page,"61",name);
  for(const name of ["Thieves’ Cant","Weapon Mastery — Rogue","Cunning Action","Steady Aim"])assert.equal(byName.get(name).source.page,"62",name);
  for(const name of ["Ability Score Improvement","Cunning Strike","Uncanny Dodge","Evasion","Reliable Talent","Improved Cunning Strike","Devious Strikes","Slippery Mind","Elusive","Epic Boon","Stroke of Luck"])assert.equal(byName.get(name).source.page,"63",name);
  for(const name of ["Fast Hands","Second-Story Work","Supreme Sneak","Use Magic Device","Thief’s Reflexes"])assert.equal(byName.get(name).source.page,"64",name);
  assert.equal(byName.get("Weapon Mastery — Rogue").category,"Rogue");assert.match(byName.get("Cunning Strike").text,/Rogue Resources/);assert.match(byName.get("Use Magic Device").text,/four magic items/);assert.match(byName.get("Thief’s Reflexes").text,/Initiative minus 10/);
});

test("level 20 Rogue sheet renders complete current resources and audit",()=>{
  const c=rogueAt(20),target={innerHTML:""};renderCharacter(c,target);assert.match(target.innerHTML,/Rogue Resources/);assert.match(target.innerHTML,/10d6/);assert.match(target.innerHTML,/Cunning Strike DC/);assert.match(target.innerHTML,/Effects \/ Sneak Attack/);assert.match(target.innerHTML,/Reliable Talent/);assert.match(target.innerHTML,/Poisoner&#39;s Kit/);assert.match(target.innerHTML,/Knock Out/);assert.match(target.innerHTML,/Thief’s Reflexes/);assert.match(target.innerHTML,/Rules Audit/);
});

test("Rogue audit identity is sourced to class page 61 and Thief page 64",()=>{
  const audit=rogueAt(20).audit,mechanics=new Map(audit.mechanics.map(item=>[item.label,item]));assert.equal(mechanics.get("Class").source.page,"61");assert.equal(mechanics.get("Subclass").source.page,"64");assert.equal(audit.status,"PASS");assert.equal(audit.rawIntegrity,true);
});

test("Random 2024 Rogue can legally reach level 20",()=>{
  const original=Math.random;try{Math.random=()=>0.999999;const state=createInitialState();state.ruleset="2024";state.constraints.class="rogue";state.constraints.level="random";state.constraints.subclass="random";const c=generateCharacter(state);assert.equal(c.class.id,"rogue");assert.equal(c.level,20);assert.equal(c.validation.valid,true);}finally{Math.random=original;}
});

test("2014 remains fail-closed for unsupported Rogue selection",()=>{
  const state=createInitialState();state.ruleset="2014";state.constraints.class="rogue";state.constraints.level="1";assert.throws(()=>generateCharacter(state),/unavailable for this ruleset/i);
});
