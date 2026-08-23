import test from "node:test";
import assert from "node:assert/strict";
import { DRUID_FORMS_2014, DRUID_FORMS_2024, legalDruidForms, druidFormById } from "../src/data/druid-forms.js";

for(const [ruleset,forms] of [["2014",DRUID_FORMS_2014],["2024",DRUID_FORMS_2024]])test(`${ruleset} Druid form catalog has unique sourced Beast records`,()=>{
  assert.equal(new Set(forms.map(f=>f.id)).size,forms.length);assert.equal(new Set(forms.map(f=>f.name.toLowerCase())).size,forms.length);
  for(const form of forms){assert.equal(form.type,"Beast");assert.ok(form.source?.version);assert.ok(form.source?.page);assert.ok(form.ac>0);assert.ok(form.hp>0);assert.ok(form.actions.length>0);}
});

test("2014 verified catalog supports a four-form level-2 field shortlist",()=>{
  const level2=legalDruidForms("2014",{maxCr:.25,allowSwim:false,allowFly:false});assert.ok(level2.length>=4);assert.deepEqual(level2.map(f=>f.id),["rat","riding-horse","wolf","panther"]);assert.equal(druidFormById("2014","panther").source.page,"385");
});

test("2024 known-form pool supports every RAW count breakpoint",()=>{
  const level2=legalDruidForms("2024",{maxCr:.25,allowSwim:true,allowFly:false}),level4=legalDruidForms("2024",{maxCr:.5,allowSwim:true,allowFly:false}),level8=legalDruidForms("2024",{maxCr:1,allowSwim:true,allowFly:true});
  assert.ok(level2.length>=4);assert.ok(level4.length>=6);assert.ok(level8.length>=8);assert.equal(DRUID_FORMS_2024.some(f=>f.id==="giant-eagle"),false);assert.equal(druidFormById("2024","pteranodon").type,"Beast");assert.ok(druidFormById("2024","pteranodon").speeds.fly>0);
});
