import test from "node:test";
import assert from "node:assert/strict";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { SRD_COVERAGE } from "../src/data/srd-coverage.js";

function assertSubset(label, exposed, allowed) {
  try { const target=new Set(allowed),outside=exposed.filter(id=>!target.has(id));assert.deepEqual(outside,[],`${label} exposes non-SRD IDs: ${outside.join(", ")}`); }
  catch(error){console.error(`[test] SRD subset check failed for ${label}`,error);throw error;}
}
function ids(values){try{return values.map(value=>value.id);}catch(error){console.error("[test] failed to read data IDs",error);throw error;}}

test("SRD completion manifest has the expected high-level release targets",()=>{
  try{
    assert.equal(SRD_COVERAGE["2014"].races.length,9);assert.equal(SRD_COVERAGE["2014"].backgrounds.length,1);assert.equal(SRD_COVERAGE["2014"].classes.length,12);assert.equal(SRD_COVERAGE["2014"].subclasses.length,12);assert.equal(SRD_COVERAGE["2014"].feats.length,1);assert.deepEqual(SRD_COVERAGE["2014"].levels,{min:1,max:20});
    assert.equal(SRD_COVERAGE["2024"].species.length,9);assert.equal(SRD_COVERAGE["2024"].backgrounds.length,4);assert.equal(SRD_COVERAGE["2024"].classes.length,12);assert.equal(SRD_COVERAGE["2024"].subclasses.length,12);assert.equal(SRD_COVERAGE["2024"].feats.length,17);assert.deepEqual(SRD_COVERAGE["2024"].levels,{min:1,max:20});
  }catch(error){console.error("[test] SRD completion manifest target counts",error);throw error;}
});

test("currently exposed 2014 character options are all inside the SRD 5.1 target",()=>{
  try{const target=SRD_COVERAGE["2014"];assertSubset("2014 races",ids(RAW_2014.species),target.races);assertSubset("2014 backgrounds",ids(RAW_2014.backgrounds),target.backgrounds);assertSubset("2014 classes",ids(RAW_2014.classes),target.classes);assertSubset("2014 subclasses",ids(RAW_2014.subclasses),target.subclasses);assertSubset("2014 feats",ids(RAW_2014.feats||[]),target.feats);}
  catch(error){console.error("[test] 2014 exposed SRD boundary",error);throw error;}
});

test("currently exposed 2024 character options are all inside the SRD 5.2.1 target",()=>{
  try{const target=SRD_COVERAGE["2024"];assertSubset("2024 species",ids(RAW_2024.species),target.species);assertSubset("2024 backgrounds",ids(RAW_2024.backgrounds),target.backgrounds);assertSubset("2024 classes",ids(RAW_2024.classes),target.classes);assertSubset("2024 subclasses",ids(RAW_2024.subclasses),target.subclasses);assertSubset("2024 feats",ids(RAW_2024.feats),target.feats);}
  catch(error){console.error("[test] 2024 exposed SRD boundary",error);throw error;}
});
