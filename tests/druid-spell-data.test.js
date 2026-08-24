import test from "node:test";
import assert from "node:assert/strict";
import { DRUID_SPELLS_2014, DRUID_SPELLS_2024, DRUID_CIRCLE_SPELLS_2014, DRUID_CIRCLE_SPELLS_2024, druidCircleSpellIds } from "../src/data/druid-spells.js";

test("Druid base spell catalogs match the verified SRD slices",()=>{
  assert.equal(DRUID_SPELLS_2014.length,105);assert.equal(DRUID_SPELLS_2024.length,123);assert.equal(new Set(DRUID_SPELLS_2014.map(s=>s.id)).size,105);assert.equal(new Set(DRUID_SPELLS_2024.map(s=>s.id)).size,123);assert.ok(DRUID_SPELLS_2014.some(s=>s.id==="true-resurrection"&&s.level===9));assert.equal(DRUID_SPELLS_2024.some(s=>s.id==="true-resurrection"),false);
});

test("2014 Circle of the Land SRD slice contains all eight complete land tables",()=>{
  const lands=["arctic","coast","desert","forest","grassland","mountain","swamp","underdark"];assert.equal(DRUID_CIRCLE_SPELLS_2014.length,64);assert.deepEqual([...new Set(DRUID_CIRCLE_SPELLS_2014.map(s=>s.land))].sort(),lands.sort());
  for(const land of lands){assert.deepEqual([2,4,6,8].map(level=>druidCircleSpellIds("2014",land,level).length),[0,2,4,6]);assert.equal(druidCircleSpellIds("2014",land,9).length,8);}
  assert.deepEqual(druidCircleSpellIds("2014","arctic",9),["hold-person","spike-growth","sleet-storm","slow","freedom-of-movement","ice-storm","commune-with-nature","cone-of-cold"]);
  assert.deepEqual(druidCircleSpellIds("2014","underdark",9),["spider-climb","web","gaseous-form","stinking-cloud","greater-invisibility","stone-shape","cloudkill","insect-plague"]);
});

test("2024 Circle land spells unlock at Druid levels 3, 5, 7, and 9",()=>{
  const lands=["arid","polar","temperate","tropical"];assert.equal(DRUID_CIRCLE_SPELLS_2024.length,24);assert.deepEqual([...new Set(DRUID_CIRCLE_SPELLS_2024.map(s=>s.land))].sort(),lands.sort());
  for(const land of lands){assert.equal(druidCircleSpellIds("2024",land,2).length,0);assert.equal(druidCircleSpellIds("2024",land,3).length,3);assert.equal(druidCircleSpellIds("2024",land,5).length,4);assert.equal(druidCircleSpellIds("2024",land,7).length,5);assert.equal(druidCircleSpellIds("2024",land,9).length,6);}
  assert.deepEqual(druidCircleSpellIds("2024","temperate",9),["shocking-grasp","sleep","misty-step","lightning-bolt","freedom-of-movement","tree-stride"]);
});
