import test from "node:test";
import assert from "node:assert/strict";
import { monkWeaponDamage } from "../src/rules/monk-attacks.js";

test("Monk uses the best legal normal or Martial Arts damage die",()=>{
  const quarterstaff={damage:"1d6"},spear={damage:"1d6"},dagger={damage:"1d4"};
  assert.equal(monkWeaponDamage("quarterstaff",quarterstaff,"1d4"),"1d8");
  assert.equal(monkWeaponDamage("quarterstaff",quarterstaff,"1d10"),"1d10");
  assert.equal(monkWeaponDamage("spear",spear,"1d6"),"1d8");
  assert.equal(monkWeaponDamage("spear",spear,"1d12"),"1d12");
  assert.equal(monkWeaponDamage("dagger",dagger,"1d6"),"1d6");
  assert.equal(monkWeaponDamage("dagger",dagger,"1d10"),"1d10");
});

test("unsupported Monk weapon damage expressions fail closed",()=>{assert.throws(()=>monkWeaponDamage("mystery",{damage:"2d6"},"1d8"),/Unsupported Monk weapon damage/i);});
