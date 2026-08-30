import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { averageHp, abilityMod } from "../src/rules/math.js";

function generated(ruleset,level,{classSelections={},spellSelections={}}={}) {
  try {
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="sorcerer";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"sage";
    state.constraints.subclass=ruleset==="2014"||level>=3?(ruleset==="2014"?"draconic-bloodline":"draconic-sorcery"):"random";
    state.classSelections={...classSelections};state.spellSelections={...spellSelections};return generateCharacter(state);
  } catch (error) { console.error(`[sorcerer-generation-test] ${ruleset} level ${level} failed`,error); throw error; }
}

test("2014 Draconic Sorcerer generates and validates at every level 1 through 20",()=>{
  try {
    for(let level=1;level<=20;level++){
      const character=generated("2014",level,{classSelections:{draconicAncestry:"red"}});assert.equal(character.validation.valid,true);assert.equal(character.class.id,"sorcerer");assert.equal(character.subclass.id,"draconic-bloodline");assert.equal(character.sorcererSelections.draconic.ancestry.id,"red");assert.ok(character.languages.includes("Draconic"));
      assert.equal(character.sorcerer.draconicHpBonus,level);assert.equal(character.draconicHpBonus,level);assert.equal(character.hp,averageHp(6,level,abilityMod(character.abilities.con))+character.speciesHpBonus+level);assert.equal(character.ac,13+abilityMod(character.abilities.dex));assert.equal(character.spells.known.all.length,character.sorcerer.known);assert.equal(character.spells.prepared.all.length,0);
    }
  } catch (error) { console.error("[sorcerer-generation-test] 2014 level matrix failed",error); throw error; }
});

test("2024 Sorcerer generates and validates at every level 1 through 20",()=>{
  try {
    for(let level=1;level<=20;level++){
      const selections=level>=6?{elementalAffinity:"Fire"}:{};const character=generated("2024",level,{classSelections:selections});assert.equal(character.validation.valid,true);assert.equal(character.class.id,"sorcerer");assert.equal(character.subclass?.id||null,level>=3?"draconic-sorcery":null);
      const draconic=level>=3,toughHpBonus=character.toughHpBonus||0;assert.equal(character.draconicHpBonus,draconic?level:0);assert.ok(Number.isFinite(character.hp));assert.equal(character.hp,averageHp(6,level,abilityMod(character.abilities.con))+character.speciesHpBonus+(draconic?level:0)+toughHpBonus);assert.equal(character.ac,draconic?10+abilityMod(character.abilities.dex)+abilityMod(character.abilities.cha):10+abilityMod(character.abilities.dex));
      assert.equal(character.spells.prepared.all.length,character.sorcerer.prepared);assert.equal(character.spells.known.all.length,0);assert.equal(character.spells.alwaysPrepared.length,level<3?0:level<5?4:level<7?6:level<9?8:10);if(level>=6)assert.equal(character.sorcererSelections.draconic.elementalAffinity,"Fire");
    }
  } catch (error) { console.error("[sorcerer-generation-test] 2024 level matrix failed",error); throw error; }
});

test("level-20 Sorcerers preserve fixed spells, Metamagic, subclass choices, and edition caps",()=>{
  try {
    const legacy=generated("2014",20,{classSelections:{draconicAncestry:"red",metamagic:["quickened-spell","subtle-spell"]},spellSelections:{cantrips:["fire-bolt"],known:["wish","meteor-swarm"]}});assert.ok(legacy.sorcererSelections.metamagic.all.includes("quickened-spell"));assert.ok(legacy.sorcererSelections.metamagic.all.includes("subtle-spell"));assert.equal(legacy.sorcererSelections.metamagic.all.length,4);assert.ok(legacy.spells.known.all.includes("wish"));assert.equal(legacy.features.includes("Arcane Apotheosis"),false);assert.equal(legacy.feats.some(feat=>feat.category==="Epic Boon"),false);
    const revised=generated("2024",20,{classSelections:{elementalAffinity:"Fire",metamagic:["seeking-spell","transmuted-spell"]},spellSelections:{cantrips:["sorcerous-burst"],prepared:["wish","meteor-swarm"]}});assert.equal(revised.sorcererSelections.metamagic.all.length,6);assert.ok(revised.sorcererSelections.metamagic.all.includes("seeking-spell"));assert.ok(revised.spells.prepared.all.includes("wish"));assert.ok(revised.spells.alwaysPrepared.includes("summon-dragon"));assert.ok(revised.features.includes("Arcane Apotheosis"));assert.ok(revised.feats.some(feat=>feat.id==="boon-dimensional-travel"));assert.equal(revised.abilityMaximums[revised.epicBoonAbility],30);
  } catch (error) { console.error("[sorcerer-generation-test] level-20 constrained contract failed",error); throw error; }
});
