import test from "node:test";
import assert from "node:assert/strict";
import { resolveSpellChoices, resolveSpellLoadout } from "../src/rules/spells.js";

const AVAILABLE = ["a","b","c","d","e","f"];

test("player-selected spells stay fixed and remaining choices randomize",()=>{
  try {
    const result = resolveSpellChoices({ available:AVAILABLE, selected:["a","c"], required:4, label:"spells" });
    assert.deepEqual(result.selected,["a","c"]);
    assert.equal(result.all.length,4);
    assert.equal(new Set(result.all).size,4);
    assert.ok(result.all.includes("a"));
    assert.ok(result.all.includes("c"));
  } catch (error) { console.error("[test] fixed spell choices failed", error); throw error; }
});

test("fully selected spell allotment performs no random fill",()=>{
  try {
    const result = resolveSpellChoices({ available:AVAILABLE, selected:["a","b","c"], required:3, label:"cantrips" });
    assert.deepEqual(result.randomized,[]);
    assert.deepEqual(result.all,["a","b","c"]);
  } catch (error) { console.error("[test] full spell selection failed", error); throw error; }
});

test("duplicate or illegal spell choices fail closed",()=>{
  try {
    assert.throws(()=>resolveSpellChoices({ available:AVAILABLE, selected:["a","a"], required:2 }),/Duplicate/);
    assert.throws(()=>resolveSpellChoices({ available:AVAILABLE, selected:["z"], required:2 }),/Illegal/);
    assert.throws(()=>resolveSpellChoices({ available:AVAILABLE, selected:["a","b","c"], required:2 }),/Too many/);
  } catch (error) { console.error("[test] spell validation failed", error); throw error; }
});

test("spell loadout resolves separate class-specific buckets",()=>{
  try {
    const profile = { buckets:{ cantrips:{available:["a","b","c"],required:2}, spellbook:{available:AVAILABLE,required:4} } };
    const result = resolveSpellLoadout(profile,{ cantrips:["a"], spellbook:["b","d"] });
    assert.equal(result.cantrips.all.length,2);
    assert.equal(result.spellbook.all.length,4);
    assert.equal(new Set(result.spellbook.all).size,4);
  } catch (error) { console.error("[test] spell loadout buckets failed", error); throw error; }
});
