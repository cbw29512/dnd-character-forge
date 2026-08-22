import test from "node:test";
import assert from "node:assert/strict";
import { lifeDomainAlwaysPrepared } from "../src/rules/cleric.js";

test("2014 Life Domain always-prepared progression completes at Cleric level 9",()=>{
  assert.deepEqual(lifeDomainAlwaysPrepared("2014",1),["bless","cure-wounds"]);
  assert.deepEqual(lifeDomainAlwaysPrepared("2014",7),["bless","cure-wounds","lesser-restoration","spiritual-weapon","beacon-of-hope","revivify","death-ward","guardian-of-faith"]);
  assert.deepEqual(lifeDomainAlwaysPrepared("2014",9),["bless","cure-wounds","lesser-restoration","spiritual-weapon","beacon-of-hope","revivify","death-ward","guardian-of-faith","mass-cure-wounds","raise-dead"]);
});

test("2024 Life Domain always-prepared progression completes at Cleric level 9",()=>{
  assert.deepEqual(lifeDomainAlwaysPrepared("2024",3),["aid","bless","cure-wounds","lesser-restoration"]);
  assert.deepEqual(lifeDomainAlwaysPrepared("2024",7),["aid","bless","cure-wounds","lesser-restoration","mass-healing-word","revivify","aura-of-life","death-ward"]);
  assert.deepEqual(lifeDomainAlwaysPrepared("2024",9),["aid","bless","cure-wounds","lesser-restoration","mass-healing-word","revivify","aura-of-life","death-ward","greater-restoration","mass-cure-wounds"]);
});
