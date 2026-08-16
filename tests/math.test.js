import test from "node:test";
import assert from "node:assert/strict";
import { abilityMod, proficiencyBonus, calculateAc, averageHp } from "../src/rules/math.js";

test("ability modifiers follow the 5e formula", () => {
  try { assert.equal(abilityMod(8),-1); assert.equal(abilityMod(10),0); assert.equal(abilityMod(18),4); }
  catch (error) { console.error("[test] ability modifiers", error); throw error; }
});
test("proficiency bonus progression is correct through level 20", () => {
  try { assert.equal(proficiencyBonus(1),2); assert.equal(proficiencyBonus(5),3); assert.equal(proficiencyBonus(9),4); assert.equal(proficiencyBonus(17),6); }
  catch (error) { console.error("[test] proficiency", error); throw error; }
});
test("armor formulas derive AC instead of guessing", () => {
  try { assert.equal(calculateAc({formula:"fixed",base:16},3,false,0),16); assert.equal(calculateAc({formula:"light",base:12},3,false,0),15); }
  catch (error) { console.error("[test] AC", error); throw error; }
});
test("fighter average HP uses d10 then six per later level", () => {
  try { assert.equal(averageHp(10,1,2),12); assert.equal(averageHp(10,5,2),44); }
  catch (error) { console.error("[test] HP", error); throw error; }
});
