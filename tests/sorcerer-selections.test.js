import test from "node:test";
import assert from "node:assert/strict";
import { resolveSorcererSelections } from "../src/rules/sorcerer-selections.js";

function resolved(ruleset,level,subclassId,selections={}) {
  try { return resolveSorcererSelections({ruleset,level,subclassId,selections}); }
  catch (error) { console.error(`[sorcerer-selections-test] ${ruleset} level ${level} failed`,error); throw error; }
}

test("fixed Metamagic choices stay fixed while Random fills the legal remainder",()=>{
  try {
    const low2014=resolved("2014",3,"draconic-bloodline",{metamagic:["quickened-spell"]});
    assert.deepEqual(low2014.metamagic.selected,["quickened-spell"]);assert.equal(low2014.metamagic.all.length,2);assert.equal(new Set(low2014.metamagic.all).size,2);
    const high2014=resolved("2014",17,"draconic-bloodline",{metamagic:["quickened-spell","subtle-spell"]});assert.equal(high2014.metamagic.all.length,4);
    const low2024=resolved("2024",2,null,{metamagic:["seeking-spell"]});assert.deepEqual(low2024.metamagic.selected,["seeking-spell"]);assert.equal(low2024.metamagic.all.length,2);
    const high2024=resolved("2024",17,"draconic-sorcery",{metamagic:["transmuted-spell","twinned-spell"]});assert.equal(high2024.metamagic.all.length,6);
  } catch (error) { console.error("[sorcerer-selections-test] constrained Metamagic fill failed",error); throw error; }
});

test("Metamagic selections reject duplicates, over-selection, and edition leakage",()=>{
  try {
    assert.throws(()=>resolved("2014",3,"draconic-bloodline",{metamagic:["quickened-spell","quickened-spell"]}),/Duplicate Metamagic choices/);
    assert.throws(()=>resolved("2014",3,"draconic-bloodline",{metamagic:["quickened-spell","subtle-spell","careful-spell"]}),/Choose at most 2 Metamagic options/);
    assert.throws(()=>resolved("2014",17,"draconic-bloodline",{metamagic:["seeking-spell"]}),/Illegal 2014 Metamagic choice/);
    assert.throws(()=>resolved("2024",10,"draconic-sorcery",{metamagic:["imaginary-metamagic"]}),/Illegal 2024 Metamagic choice/);
  } catch (error) { console.error("[sorcerer-selections-test] Metamagic fail-closed contract failed",error); throw error; }
});

test("2014 Dragon Ancestor is fixed or randomized and drives Elemental Affinity",()=>{
  try {
    const red=resolved("2014",6,"draconic-bloodline",{draconicAncestry:"red"});assert.equal(red.draconic.ancestry.name,"Red");assert.equal(red.draconic.elementalAffinity,"Fire");
    const early=resolved("2014",1,"draconic-bloodline",{draconicAncestry:"white"});assert.equal(early.draconic.ancestry.damageType,"Cold");assert.equal(early.draconic.elementalAffinity,null);
    const random=resolved("2014",20,"draconic-bloodline");assert.ok(random.draconic.ancestry);assert.ok(["Acid","Cold","Fire","Lightning","Poison"].includes(random.draconic.elementalAffinity));
    assert.throws(()=>resolved("2014",6,"draconic-bloodline",{draconicAncestry:"plaid"}),/Illegal 2014 Draconic ancestry/);
    assert.throws(()=>resolved("2014",6,"draconic-bloodline",{elementalAffinity:"Fire"}),/2024-only selection/);
  } catch (error) { console.error("[sorcerer-selections-test] 2014 Draconic selection failed",error); throw error; }
});

test("2024 Elemental Affinity unlocks only at level 6 and never creates a Dragon Ancestor",()=>{
  try {
    const fire=resolved("2024",6,"draconic-sorcery",{elementalAffinity:"Fire"});assert.equal(fire.draconic.ancestry,null);assert.equal(fire.draconic.elementalAffinity,"Fire");
    assert.equal(resolved("2024",5,"draconic-sorcery").draconic.elementalAffinity,null);
    assert.throws(()=>resolved("2024",5,"draconic-sorcery",{elementalAffinity:"Fire"}),/unavailable before Sorcerer level 6/);
    assert.throws(()=>resolved("2024",6,"draconic-sorcery",{elementalAffinity:"Thunder"}),/Illegal 2024 Elemental Affinity/);
    assert.throws(()=>resolved("2024",6,"draconic-sorcery",{draconicAncestry:"red"}),/2014-only/);
  } catch (error) { console.error("[sorcerer-selections-test] 2024 Draconic selection failed",error); throw error; }
});
