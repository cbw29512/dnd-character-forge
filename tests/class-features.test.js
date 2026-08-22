import test from "node:test";
import assert from "node:assert/strict";
import { resolveClassFeatures, supportedFeatureClasses } from "../src/rules/class-features.js";

test("feature registry contains only currently verified classes", () => {
  try { assert.deepEqual([...supportedFeatureClasses()].sort(), ["barbarian","cleric","fighter","wizard"]); }
  catch(error){console.error("[test] feature registry classes",error);throw error;}
});

test("feature registry fails closed for an unimplemented class", () => {
  try { assert.throws(()=>resolveClassFeatures({ruleset:"2024",classId:"bard",level:1}),/not implemented/i); }
  catch(error){console.error("[test] feature registry fail closed",error);throw error;}
});

test("feature registry resolves verified classes", () => {
  try {
    assert.ok(resolveClassFeatures({ruleset:"2024",classId:"barbarian",level:1}).includes("Rage"));
    assert.ok(resolveClassFeatures({ruleset:"2024",classId:"fighter",level:1}).includes("Second Wind"));
    assert.ok(resolveClassFeatures({ruleset:"2024",classId:"wizard",level:1}).includes("Spellcasting"));
    assert.ok(resolveClassFeatures({ruleset:"2024",classId:"cleric",level:1,divineOrder:"protector"}).includes("Spellcasting"));
  }catch(error){console.error("[test] feature registry supported classes",error);throw error;}
});
