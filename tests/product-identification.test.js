import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRODUCT_INFO } from "../src/product-info.js";

const packageJson=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
const stateSource=readFileSync(new URL("../src/state.js",import.meta.url),"utf8");

test("application version has one matching package and runtime identity",()=>{
  try{
    assert.equal(PRODUCT_INFO.name,"Character Forge");
    assert.equal(PRODUCT_INFO.version,packageJson.version);
    assert.match(PRODUCT_INFO.version,/^\d+\.\d+\.\d+-audit\.\d+$/);
    assert.equal(PRODUCT_INFO.channel,"audit");
  }catch(error){console.error("[test] product identity mismatch",error);throw error;}
});

test("state bootstrap loads the product identity module",()=>{
  try{assert.match(stateSource,/import "\.\/product-info\.js";/);}
  catch(error){console.error("[test] product identity bootstrap missing",error);throw error;}
});
