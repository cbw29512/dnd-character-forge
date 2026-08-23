import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { validateCharacter } from "../src/rules/validation.js";
import { abilityMod } from "../src/rules/math.js";
import { rogueProgressionFor, rogueSaveProficiencies } from "../src/rules/rogue.js";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { buildQuickTurn } from "../src/print/quick-turn.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { renderCharacter } from "../src/ui/render.js";

const SNEAK={1:1,2:1,3:2,4:2,5:3,6:3,7:4,8:4,9:5,10:5,11:6,12:6,13:7,14:7,15:8,16:8,17:9,18:9,19:10,20:10};
function rogueAt(level){
  const state=createInitialState();state.ruleset="2014";state.constraints.level=String(level);state.constraints.class="rogue";state.constraints.subclass=level>=3?"thief":"random";state.constraints.species="human";state.constraints.background="acolyte";return generateCharacter(state);
}

test("2014 Thief Rogue generates and validates at every level 1 through 20",()=>{
  for(let level=1;level<=20;level++){
    const c=rogueAt(level);assert.equal(c.level,level);assert.equal(c.class.id,"rogue");assert.equal(c.validation.valid,true);assert.equal(c.rogue.sneakAttackDice,SNEAK[level]);assert.equal(c.rogue.expertiseCount,level>=6?4:2);assert.equal(c.expertise.length,level>=6?4:2);assert.equal(c.rogue.masteryCount,0);assert.deepEqual(c.masteryIds,[]);assert.ok(c.toolProficiencies.includes("Thieves' Tools"));assert.ok(c.languages.includes("Thieves’ Cant"));assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),false);if(level>=3)assert.equal(c.subclass.id,"thief");else assert.equal(c.subclass,null);
  }
});

test("2014 Rogue class table and progression are exact and isolated from 2024",()=>{
  const rogueClass=RAW_2014.classes.find(cls=>cls.id==="rogue");assert.equal(rogueClass.maxLevel,20);assert.deepEqual(rogueClass.asiLevels,[4,8,10,12,16,19]);assert.equal(rogueClass.epicBoon,undefined);
  for(let level=1;level<=20;level++){
    const expected=rogueProgressionFor(level,level>=3?"thief":null,"2014"),c=rogueAt(level);assert.deepEqual(c.rogue,expected);assert.equal(c.rogue.maxCunningStrikeEffects,0);assert.deepEqual(c.rogue.cunningStrikeOptions,[]);assert.equal(c.rogue.reliableTalent,level>=11);assert.equal(c.rogue.blindsenseRange,level>=14?10:0);assert.equal(c.rogue.slipperyMind,level>=15);assert.deepEqual(c.rogue.slipperyMindSaves,level>=15?["wis"]:[]);assert.equal(c.rogue.strokeOfLuck,level>=20);assert.equal(c.rogue.thiefReflexes,level>=17);
  }
});

test("2014 Rogue spends all six ASIs without exceeding 20",()=>{
  const one=rogueAt(1),twenty=rogueAt(20),gain=Object.keys(one.abilities).reduce((sum,key)=>sum+twenty.abilities[key]-one.abilities[key],0);assert.equal(gain,12);for(const score of Object.values(twenty.abilities))assert.ok(score<=20);
});

test("2014 Slippery Mind adds Wisdom proficiency only at level 15",()=>{
  const before=rogueAt(14),after=rogueAt(15);assert.deepEqual([...rogueSaveProficiencies(14,"2014")].sort(),["dex","int"]);assert.deepEqual([...before.saves].sort(),["dex","int"]);assert.deepEqual([...after.saves].sort(),["dex","int","wis"]);assert.equal(after.saves.includes("cha"),false);assert.equal(after.saveBonuses.wis,abilityMod(after.abilities.wis)+after.proficiency);assert.equal(after.saveBonuses.cha,abilityMod(after.abilities.cha));
});

test("2014 Rogue and Thief feature breakpoints are exact",()=>{
  const at=level=>rogueAt(level).features;
  assert.ok(!at(1).includes("Cunning Action"));assert.ok(at(2).includes("Cunning Action"));assert.ok(at(3).includes("Fast Hands")&&at(3).includes("Second-Story Work"));assert.ok(!at(4).includes("Uncanny Dodge"));assert.ok(at(5).includes("Uncanny Dodge"));assert.ok(!at(6).includes("Evasion"));assert.ok(at(7).includes("Evasion"));assert.ok(!at(8).includes("Supreme Sneak"));assert.ok(at(9).includes("Supreme Sneak"));assert.ok(!at(10).includes("Reliable Talent"));assert.ok(at(11).includes("Reliable Talent"));assert.ok(!at(12).includes("Use Magic Device"));assert.ok(at(13).includes("Use Magic Device"));assert.ok(at(14).includes("Blindsense"));assert.ok(at(15).includes("Slippery Mind"));assert.ok(!at(16).includes("Thief’s Reflexes"));assert.ok(at(17).includes("Thief’s Reflexes"));assert.ok(at(18).includes("Elusive"));assert.ok(!at(19).includes("Stroke of Luck"));assert.ok(at(20).includes("Stroke of Luck"));
  for(const name of ["Weapon Mastery — Rogue","Steady Aim","Cunning Strike","Improved Cunning Strike","Devious Strikes","Epic Boon"])assert.equal(at(20).includes(name),false,`${name} leaked from 2024`);
});

test("2014 Rogue and Thief play references carry exact SRD 5.1 pages",()=>{
  const refs=buildQuickReference(rogueAt(20)),byName=new Map(refs.map(item=>[item.name,item]));
  for(const name of ["Expertise","Sneak Attack","Thieves’ Cant"])assert.equal(byName.get(name).source.page,"39",name);
  for(const name of ["Cunning Action","Ability Score Improvement","Uncanny Dodge","Evasion","Reliable Talent","Blindsense","Slippery Mind","Elusive","Stroke of Luck"])assert.equal(byName.get(name).source.page,"40",name);
  assert.equal(byName.get("Fast Hands").source.page,"40–41");for(const name of ["Second-Story Work","Supreme Sneak","Use Magic Device","Thief’s Reflexes"])assert.equal(byName.get(name).source.page,"41",name);
  for(const item of refs)assert.equal(item.source.version,"SRD 5.1",item.name);assert.match(byName.get("Blindsense").text,/able to hear/);assert.match(byName.get("Use Magic Device").text,/class, race, and level requirements/);assert.doesNotMatch(byName.get("Use Magic Device").text,/four magic items|Spell Scroll/i);assert.match(byName.get("Thief’s Reflexes").text,/Initiative minus 10/);assert.match(byName.get("Thief’s Reflexes").text,/surprised/);
});

test("2014 Rogue Quick Turn never calls Cunning Strike or Steady Aim",()=>{
  const five=buildQuickTurn(rogueAt(5)).join(" "),seventeen=buildQuickTurn(rogueAt(17)).join(" ");assert.match(five,/Cunning Action/);assert.doesNotMatch(five,/Cunning Strike|Steady Aim/);assert.match(seventeen,/Initiative minus 10/);assert.doesNotMatch(seventeen,/Cunning Strike|Steady Aim/);
});

test("2014 level-20 browser sheet shows legacy resources without functional 2024 leakage",()=>{
  const c=rogueAt(20),target={innerHTML:""};renderCharacter(c,target);assert.match(target.innerHTML,/Rogue Resources/);assert.match(target.innerHTML,/10d6/);assert.match(target.innerHTML,/Reliable Talent/);assert.match(target.innerHTML,/Blindsense/);assert.match(target.innerHTML,/10 ft/);assert.match(target.innerHTML,/Thief’s Reflexes/);assert.match(target.innerHTML,/Wisdom Save/);assert.match(target.innerHTML,/no Weapon Mastery, Steady Aim, or Cunning Strike mechanics/);assert.doesNotMatch(target.innerHTML,/Cunning Strike DC/);assert.doesNotMatch(target.innerHTML,/Effects \/ Sneak Attack/);assert.doesNotMatch(target.innerHTML,/Cunning Strike options/);assert.match(target.innerHTML,/Rules Audit/);
});

test("2014 premium Rogue model exposes legacy resources only",()=>{
  const model=buildPremiumPrintModel(rogueAt(20)),r=model.rogueResources;assert.equal(r.ruleset,"2014");assert.equal(r.sneakAttack,"10d6");assert.match(String(r.expertise),/^(4 skills|3 skills \+ Thieves’ Tools)$/);assert.equal(r.masteries,0);assert.equal(r.cunningStrikeDc,null);assert.equal(r.effectsPerSneak,0);assert.equal(r.reliableTalent,true);assert.equal(r.blindsense,"10 ft");assert.equal(r.thiefReflexes,true);assert.deepEqual(r.options,[]);assert.equal(r.scrollWarning,null);assert.ok(model.appendix.referencePages.flat().some(item=>item.name==="Blindsense"));
});

test("2014 Rogue audit identity is sourced to class page 39 and Thief page 40",()=>{
  const audit=rogueAt(20).audit,mechanics=new Map(audit.mechanics.map(item=>[item.label,item]));assert.equal(mechanics.get("Class").source.page,"39");assert.equal(mechanics.get("Subclass").source.page,"40");assert.equal(audit.status,"PASS");assert.equal(audit.rawIntegrity,true);
});

test("2014 Rogue validation rejects injected 2024 mechanics",()=>{
  const original=rogueAt(20),mastery=structuredClone(original);mastery.masteryIds=["rapier"];mastery.rogue={...mastery.rogue,masteryCount:1};let result=validateCharacter(mastery,mastery.sourceMode);assert.equal(result.valid,false);assert.ok(result.errors.some(error=>/Weapon Mastery/.test(error)));
  const strike=structuredClone(original);strike.features=[...strike.features,"Cunning Strike"];result=validateCharacter(strike,strike.sourceMode);assert.equal(result.valid,false);assert.ok(result.errors.some(error=>/Cunning Strike/.test(error)));
});

test("Random 2014 Rogue can legally reach level 20",()=>{
  const original=Math.random;try{Math.random=()=>0.999999;const state=createInitialState();state.ruleset="2014";state.constraints.class="rogue";state.constraints.level="random";state.constraints.subclass="random";const c=generateCharacter(state);assert.equal(c.class.id,"rogue");assert.equal(c.level,20);assert.equal(c.subclass.id,"thief");assert.equal(c.validation.valid,true);}finally{Math.random=original;}
});
