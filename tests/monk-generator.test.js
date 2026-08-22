import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { monkFlurryStrikes, monkProgression, monkSpeed, monkUnarmoredAc } from "../src/rules/monk.js";

function monkState(ruleset,level="random"){const state=createInitialState();state.ruleset=ruleset;state.constraints.class="monk";state.constraints.level=String(level);return state;}

test("both editions generate valid Open Hand Monks at every level 1-20",()=>{
  for(const ruleset of ["2014","2024"])for(let level=1;level<=20;level++){
    const character=generateCharacter(monkState(ruleset,level)),row=monkProgression(ruleset,level);
    assert.equal(character.class.id,"monk");assert.equal(character.level,level);assert.equal(character.validation.valid,true);
    if(level>=3)assert.equal(character.subclass.id,"open-hand");else assert.equal(character.subclass,null);
    const unarmed=character.attacks.find(attack=>attack.id==="unarmed-strike");assert.ok(unarmed);assert.equal(unarmed.damage,row.martialArts);assert.equal(unarmed.ability,"dex");
    assert.equal(character.ac,monkUnarmoredAc(character.abilities));assert.equal(character.speed,monkSpeed(character.species.speed,ruleset,level));assert.equal(character.masteryIds.length,0);
  }
});

test("Monk weapon attacks use the best legal normal or Martial Arts damage die",()=>{
  const old1=generateCharacter(monkState("2014",1)),old17=generateCharacter(monkState("2014",17));
  assert.equal(old1.attacks.find(attack=>attack.id==="quarterstaff").damage,"1d8");
  assert.equal(old17.attacks.find(attack=>attack.id==="quarterstaff").damage,"1d10");
  const new1=generateCharacter(monkState("2024",1)),new11=generateCharacter(monkState("2024",11)),new17=generateCharacter(monkState("2024",17));
  assert.equal(new1.attacks.find(attack=>attack.id==="spear").damage,"1d8");
  assert.equal(new1.attacks.find(attack=>attack.id==="dagger").damage,"1d6");
  assert.equal(new11.attacks.find(attack=>attack.id==="spear").damage,"1d10");
  assert.equal(new11.attacks.find(attack=>attack.id==="dagger").damage,"1d10");
  assert.equal(new17.attacks.find(attack=>attack.id==="spear").damage,"1d12");
  assert.equal(new17.attacks.find(attack=>attack.id==="dagger").damage,"1d12");
});

test("level 14 Monk generation is proficient in all saving throws",()=>{
  for(const ruleset of ["2014","2024"]){const character=generateCharacter(monkState(ruleset,14));assert.deepEqual([...character.saves].sort(),["cha","con","dex","int","str","wis"]);for(const value of Object.values(character.saveBonuses))assert.ok(Number.isInteger(value));}
});

test("2024 level 10 Monk exposes three-strike Flurry",()=>{const character=generateCharacter(monkState("2024",10)),resource=character.classResources.find(item=>item.id==="flurry-strikes");assert.equal(monkFlurryStrikes("2024",10),3);assert.equal(resource.value,"3 strikes");});

test("2024 level 20 Body and Mind remains inside raised Dexterity and Wisdom maxima",()=>{for(let i=0;i<100;i++){const character=generateCharacter(monkState("2024",20));assert.ok(character.abilityMaximums.dex>=25);assert.ok(character.abilityMaximums.wis>=25);assert.ok(character.abilities.dex<=character.abilityMaximums.dex);assert.ok(character.abilities.wis<=character.abilityMaximums.wis);assert.ok(character.features.includes("Body and Mind"));}});

test("1000 randomized Monks per edition pass validation",()=>{for(const ruleset of ["2014","2024"])for(let i=0;i<1000;i++){const character=generateCharacter(monkState(ruleset));assert.equal(character.validation.valid,true);}});

test("Monk quick references are complete once the reference layer is active",()=>{for(const ruleset of ["2014","2024"]){const character=generateCharacter(monkState(ruleset,20));assert.doesNotThrow(()=>buildQuickReference(character));}});
