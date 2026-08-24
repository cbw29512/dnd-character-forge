import test from "node:test";
import assert from "node:assert/strict";
import { draconicSpellsForLevel } from "../src/data/sorcerer-draconic-spells.js";
import { buildSorcererSpellcasting, validateSorcererSpellSelections } from "../src/rules/sorcerer-spellcasting.js";

function sorcerer(ruleset,level,subclassId) {
  try { return {ruleset,level,proficiency:level>=17?6:level>=13?5:level>=9?4:level>=5?3:2,abilities:{str:8,dex:14,con:16,int:10,wis:12,cha:20},subclass:subclassId?{id:subclassId}:null}; }
  catch (error) { console.error("[sorcerer-spellcasting-test] character fixture failed",error); throw error; }
}

test("2014 Sorcerer keeps spells known and never creates prepared or Draconic spell buckets",()=>{
  try {
    const character=sorcerer("2014",5,"draconic-bloodline"),casting=buildSorcererSpellcasting(character,{cantrips:["fire-bolt"],known:["magic-missile","shield"]});
    assert.equal(casting.cantrips.all.length,5);assert.ok(casting.cantrips.all.includes("fire-bolt"));assert.equal(casting.known.all.length,6);assert.ok(casting.known.all.includes("magic-missile"));assert.ok(casting.known.all.includes("shield"));
    assert.deepEqual(casting.prepared.all,[]);assert.deepEqual(casting.alwaysPrepared,[]);assert.equal(casting.saveDc,16);assert.equal(casting.attackBonus,8);
    assert.throws(()=>validateSorcererSpellSelections(character,{prepared:["magic-missile"]}),/uses spells known/);
  } catch (error) { console.error("[sorcerer-spellcasting-test] 2014 known-spell contract failed",error); throw error; }
});

test("2024 Draconic Spells unlock at 3, 5, 7, and 9 without consuming normal preparation",()=>{
  try {
    assert.deepEqual(draconicSpellsForLevel(2).map(item=>item.name),[]);
    assert.deepEqual(draconicSpellsForLevel(3).map(item=>item.name),["Alter Self","Chromatic Orb","Command","Dragon’s Breath"]);
    assert.deepEqual(draconicSpellsForLevel(5).map(item=>item.name).slice(-2),["Fear","Fly"]);assert.equal(draconicSpellsForLevel(7).length,8);assert.equal(draconicSpellsForLevel(9).length,10);
    const casting=buildSorcererSpellcasting(sorcerer("2024",9,"draconic-sorcery"),{cantrips:["sorcerous-burst"],prepared:["magic-missile","shield"]});
    assert.equal(casting.prepared.all.length,14);assert.equal(casting.alwaysPrepared.length,10);assert.ok(casting.prepared.all.includes("magic-missile"));assert.ok(casting.alwaysPrepared.includes("command"));assert.ok(casting.alwaysPrepared.includes("summon-dragon"));assert.equal(casting.all.filter(name=>name==="Command").length,1);assert.equal(casting.all.filter(name=>name==="Summon Dragon").length,1);
  } catch (error) { console.error("[sorcerer-spellcasting-test] 2024 Draconic spell contract failed",error); throw error; }
});

test("2024 normal prepared slots cannot duplicate Draconic always-prepared spells",()=>{
  try {
    const character=sorcerer("2024",3,"draconic-sorcery");
    for(const id of ["alter-self","chromatic-orb","dragons-breath"]) assert.throws(()=>validateSorcererSpellSelections(character,{prepared:[id]}),/already always prepared by Draconic Spells/);
    assert.throws(()=>validateSorcererSpellSelections(character,{known:["magic-missile"]}),/uses prepared spells/);
  } catch (error) { console.error("[sorcerer-spellcasting-test] prepared duplication guard failed",error); throw error; }
});

test("fixed Sorcerer spell choices remain fixed while Random completes the legal allotment",()=>{
  try {
    const legacy=buildSorcererSpellcasting(sorcerer("2014",20,"draconic-bloodline"),{cantrips:["fire-bolt","ray-of-frost"],known:["wish","meteor-swarm"]});assert.equal(legacy.cantrips.all.length,6);assert.equal(legacy.known.all.length,15);assert.ok(legacy.known.all.includes("wish"));assert.ok(legacy.known.all.includes("meteor-swarm"));
    const revised=buildSorcererSpellcasting(sorcerer("2024",20,"draconic-sorcery"),{cantrips:["sorcerous-burst"],prepared:["wish","meteor-swarm"]});assert.equal(revised.cantrips.all.length,6);assert.equal(revised.prepared.all.length,22);assert.equal(revised.alwaysPrepared.length,10);assert.ok(revised.prepared.all.includes("wish"));assert.ok(revised.prepared.all.includes("meteor-swarm"));
  } catch (error) { console.error("[sorcerer-spellcasting-test] constrained spell completion failed",error); throw error; }
});
