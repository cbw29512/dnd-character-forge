import test from "node:test";
import assert from "node:assert/strict";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { warlockProgressionFor } from "../src/data/warlock-class.js";

test("2014 RAW Warlock catalog",()=>{
  try{
    const warlock=FORGE_2014.classes.find(item=>item.id==="warlock");
    assert.ok(warlock);
    assert.equal(FORGE_2014.classes.length,12);
    assert.deepEqual(FORGE_2014.subclasses.filter(item=>item.classId==="warlock").map(item=>item.id),["archfey","fiend","great-old-one"]);
    assert.equal(warlock.subclassLevel,1);
  }catch(error){console.error("[test] 2014 Warlock failed",error);throw error;}
});

test("2024 RAW Warlock catalog",()=>{
  try{
    const warlock=FORGE_2024.classes.find(item=>item.id==="warlock");
    assert.ok(warlock);
    assert.equal(FORGE_2024.classes.length,12);
    assert.deepEqual(FORGE_2024.subclasses.filter(item=>item.classId==="warlock").map(item=>item.id),["fiend"]);
    assert.equal(warlock.subclassLevel,3);
  }catch(error){console.error("[test] 2024 Warlock failed",error);throw error;}
});

test("Warlock 2014/2024 progression",()=>{
  try{
    assert.equal(warlockProgressionFor("2014",1).spellsKnown,2);
    assert.equal(warlockProgressionFor("2014",20).invocationsKnown,8);
    assert.equal(warlockProgressionFor("2014",20).pactMagic.slots,4);
    assert.equal(warlockProgressionFor("2014",20).pactMagic.slotLevel,5);
    assert.equal(warlockProgressionFor("2024",1).invocationsKnown,1);
    assert.equal(warlockProgressionFor("2024",3).subclassLevel,3);
    assert.equal(warlockProgressionFor("2024",9).contactPatron,true);
    assert.equal(warlockProgressionFor("2024",19).epicBoon,true);
    assert.equal(warlockProgressionFor("2024",20).invocationsKnown,10);
  }catch(error){console.error("[test] Warlock progression failed",error);throw error;}
});
