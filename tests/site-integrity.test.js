import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("website contains no duplicate element IDs",()=>{
  try{
    const ids=[...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match=>match[1]),seen=new Set(),duplicates=new Set();
    for(const id of ids){if(seen.has(id))duplicates.add(id);seen.add(id);}
    assert.deepEqual([...duplicates],[]);
  }catch(error){console.error("[test] duplicate HTML IDs",error);throw error;}
});

test("local website assets referenced by index exist",()=>{
  try{
    const paths=[...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(match=>match[1]).filter(path=>!path.startsWith("#")&&!/^https?:/.test(path));
    for(const path of paths){const clean=path.split(/[?#]/)[0];assert.ok(existsSync(new URL(`../${clean}`,import.meta.url)),`Missing local asset: ${clean}`);}
  }catch(error){console.error("[test] website asset integrity",error);throw error;}
});
