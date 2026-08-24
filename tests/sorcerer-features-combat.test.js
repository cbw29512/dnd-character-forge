import test from "node:test";
import assert from "node:assert/strict";
import { sorcererArmorClass, sorcererDraconicHpBonus } from "../src/rules/sorcerer-combat.js";
import { sorcererFeatures } from "../src/rules/sorcerer-features.js";

function character(ruleset,level,progression,armor=null) {
  try { return {ruleset,level,class:{id:"sorcerer"},abilities:{dex:16,cha:20},equipment:{armor,shield:false},sorcerer:progression}; }
  catch (error) { console.error("[sorcerer-combat-test] fixture failed",error); throw error; }
}

test("Sorcerer feature lists remain edition-pure across Draconic breakpoints",()=>{
  try {
    const legacy=sorcererFeatures("2014",20,"draconic-bloodline"),revised=sorcererFeatures("2024",20,"draconic-sorcery");
    for(const name of ["Sorcerous Origin","Dragon Ancestor","Draconic Presence","Sorcerous Restoration"])assert.ok(legacy.includes(name));
    for(const forbidden of ["Innate Sorcery","Sorcery Incarnate","Dragon Companion","Arcane Apotheosis","Epic Boon"])assert.equal(legacy.includes(forbidden),false);
    for(const name of ["Innate Sorcery","Sorcery Incarnate","Dragon Companion","Arcane Apotheosis","Epic Boon"])assert.ok(revised.includes(name));
    for(const forbidden of ["Sorcerous Origin","Dragon Ancestor","Draconic Presence"])assert.equal(revised.includes(forbidden),false);
    assert.equal(sorcererFeatures("2024",2,null).includes("Sorcerer Subclass"),false);assert.equal(sorcererFeatures("2024",3,"draconic-sorcery").includes("Draconic Spells"),true);
  } catch (error) { console.error("[sorcerer-combat-test] feature isolation failed",error); throw error; }
});

test("Draconic Resilience derives the exact edition-specific unarmored AC",()=>{
  try {
    assert.equal(sorcererArmorClass(character("2014",10,{draconicResilience:true,draconicHpBonus:10}),13),16);
    assert.equal(sorcererArmorClass(character("2024",10,{draconicResilience:true,draconicHpBonus:10}),13),18);
    assert.equal(sorcererArmorClass(character("2024",10,{draconicResilience:true,draconicHpBonus:10},"leather"),14),14);
    assert.equal(sorcererArmorClass(character("2024",2,{draconicResilience:false,draconicHpBonus:0}),13),13);
  } catch (error) { console.error("[sorcerer-combat-test] AC derivation failed",error); throw error; }
});

test("Draconic Resilience HP bonus is explicit, bounded, and fail-closed",()=>{
  try {
    assert.equal(sorcererDraconicHpBonus(character("2014",20,{draconicResilience:true,draconicHpBonus:20})),20);
    assert.equal(sorcererDraconicHpBonus(character("2024",3,{draconicResilience:true,draconicHpBonus:3})),3);
    assert.equal(sorcererDraconicHpBonus(character("2024",2,{draconicResilience:false,draconicHpBonus:0})),0);
    assert.throws(()=>sorcererDraconicHpBonus(character("2024",3,{draconicResilience:true,draconicHpBonus:4})),/Invalid Draconic Resilience HP bonus/);
  } catch (error) { console.error("[sorcerer-combat-test] HP derivation failed",error); throw error; }
});
