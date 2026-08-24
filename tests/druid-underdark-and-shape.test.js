import test from "node:test";
import assert from "node:assert/strict";
import { LAND_2014, druidProgressionFor, legalFormsForProgression, resolveDruidSelections } from "../src/rules/druid.js";
import { druidCircleSpellIds } from "../src/data/druid-spells.js";

test("2014 Circle of the Land includes the complete Underdark option",()=>{
  assert.ok(LAND_2014.includes("underdark"));
  const selections=resolveDruidSelections("2014",20,"circle-land",{circleLand:"underdark",fieldForms:["wolf","black-bear","brown-bear","giant-eagle"]});
  assert.equal(selections.circleLand,"underdark");
  assert.deepEqual(druidCircleSpellIds("2014","underdark",3),["spider-climb","web"]);
  assert.deepEqual(druidCircleSpellIds("2014","underdark",5),["spider-climb","web","gaseous-form","stinking-cloud"]);
  assert.deepEqual(druidCircleSpellIds("2014","underdark",9),["spider-climb","web","gaseous-form","stinking-cloud","greater-invisibility","stone-shape","cloudkill","insect-plague"]);
});

test("2014 Wild Shape keeps old movement gates and unlimited level-20 use",()=>{
  const level2=druidProgressionFor("2014",2,"circle-land"),level4=druidProgressionFor("2014",4,"circle-land"),level8=druidProgressionFor("2014",8,"circle-land"),level20=druidProgressionFor("2014",20,"circle-land");
  assert.equal(level2.maxCr,.25);assert.equal(level2.allowSwim,false);assert.equal(level2.allowFly,false);assert.equal(level4.maxCr,.5);assert.equal(level4.allowSwim,true);assert.equal(level4.allowFly,false);assert.equal(level8.maxCr,1);assert.equal(level8.allowFly,true);assert.equal(level20.unlimitedWildShape,true);
  assert.equal(legalFormsForProgression("2014",level2).some(form=>form.id==="reef-shark"),false);
  assert.equal(legalFormsForProgression("2014",level8).some(form=>form.id==="giant-eagle"),true);
});

test("2024 Wild Shape uses known-form counts and excludes legacy Giant Eagle",()=>{
  const level2=druidProgressionFor("2024",2,"circle-land"),level4=druidProgressionFor("2024",4,"circle-land"),level8=druidProgressionFor("2024",8,"circle-land"),level17=druidProgressionFor("2024",17,"circle-land");
  assert.equal(level2.wildShapeUses,2);assert.equal(level2.knownFormCount,4);assert.equal(level2.maxCr,.25);assert.equal(level2.allowFly,false);
  assert.equal(level4.knownFormCount,6);assert.equal(level4.maxCr,.5);
  assert.equal(level8.knownFormCount,8);assert.equal(level8.maxCr,1);assert.equal(level8.allowFly,true);
  assert.equal(level17.wildShapeUses,4);
  const legal8=legalFormsForProgression("2024",level8).map(form=>form.id);assert.ok(legal8.includes("pteranodon"));assert.equal(legal8.includes("giant-eagle"),false);
});
