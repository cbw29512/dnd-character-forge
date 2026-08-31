import test from "node:test";
import assert from "node:assert/strict";
import { getSpellReference, resolveCantripReference } from "../src/rules/spell-reference.js";

const character=level=>({ruleset:"2024",level});

test("Eldritch Blast preserves SRD separate-beam scaling",()=>{
  try{
    const ref=getSpellReference("2024","eldritch-blast");
    assert.equal(ref.name,"Eldritch Blast");assert.equal(ref.school,"Evocation");assert.equal(ref.castingTime,"Action");assert.equal(ref.range,"120 ft");assert.equal(ref.components,"V, S");assert.equal(ref.duration,"Instantaneous");assert.equal(ref.resolution,"Ranged spell attack");assert.equal(ref.srdPage,127);assert.equal(ref.damage.die,10);assert.equal(ref.damage.type,"Force");assert.equal(ref.beamScaling,true);
    for(const [level,beams] of [[1,1],[5,2],[11,3],[17,4]]){const resolved=resolveCantripReference(character(level),"eldritch-blast");assert.match(resolved.currentEffect,new RegExp(`^${beams} beam${beams===1?"":"s"}`));assert.match(resolved.currentEffect,/separate ranged spell attack/);assert.match(resolved.currentEffect,/1d10 Force/);assert.match(resolved.currentEffect,/same or different targets/);assert.doesNotMatch(resolved.currentEffect,/^[234]d10/);}
  }catch(error){console.error("[class-exclusive-cantrip-test] Eldritch Blast failed",error);throw error;}
});

test("Shillelagh preserves its SRD weapon-die progression",()=>{
  try{
    const ref=getSpellReference("2024","shillelagh");assert.equal(ref.castingTime,"Bonus Action");assert.equal(ref.range,"Self");assert.equal(ref.components,"V, S, M");assert.equal(ref.duration,"1 minute");assert.equal(ref.srdPage,162);assert.equal(ref.shillelaghScaling,true);
    for(const [level,die] of [[1,"d8"],[5,"d10"],[11,"d12"],[17,"2d6"]]){const resolved=resolveCantripReference(character(level),"shillelagh");assert.match(resolved.currentEffect,new RegExp(`damage die ${die}`));assert.match(resolved.currentEffect,/spellcasting ability/);assert.match(resolved.currentEffect,/Force or its normal damage type/);}
  }catch(error){console.error("[class-exclusive-cantrip-test] Shillelagh failed",error);throw error;}
});

test("Bard and Druid exclusive attack cantrips preserve SRD metadata and damage scaling",()=>{
  try{
    const produce=getSpellReference("2024","produce-flame"),starry=getSpellReference("2024","starry-wisp"),mockery=getSpellReference("2024","vicious-mockery"),druidcraft=getSpellReference("2024","druidcraft");
    assert.equal(produce.castingTime,"Bonus Action");assert.equal(produce.duration,"10 minutes");assert.equal(produce.attackRange,"60 ft");assert.equal(produce.srdPage,156);assert.match(resolveCantripReference(character(17),"produce-flame").currentEffect,/4d8 Fire/);
    assert.equal(starry.range,"60 ft");assert.equal(starry.srdPage,165);assert.match(starry.effect,/Invisible condition/);assert.match(resolveCantripReference(character(11),"starry-wisp").currentEffect,/3d8 Radiant/);
    assert.equal(mockery.components,"V");assert.equal(mockery.resolution,"WIS save");assert.equal(mockery.srdPage,171);assert.match(mockery.effect,/Disadvantage/);assert.match(resolveCantripReference(character(5),"vicious-mockery").currentEffect,/2d6 Psychic/);
    assert.equal(druidcraft.srdPage,126);assert.equal(druidcraft.resolution,"Utility");assert.match(druidcraft.effect,/weather prediction/);assert.match(druidcraft.effect,/campfire/);
  }catch(error){console.error("[class-exclusive-cantrip-test] Bard/Druid cantrips failed",error);throw error;}
});
