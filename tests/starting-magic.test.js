import test from "node:test";
import assert from "node:assert/strict";
import { MAGIC_MODES } from "../src/state.js";
import { generateStartingMagic } from "../src/rules/magic-starting.js";

const ALL_CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];

test("2014 DMG starting magic follows low/standard/high campaign guidance",()=>{
  try{
    const low=generateStartingMagic({ruleset:"2014",level:12,mode:MAGIC_MODES.LOW_MAGIC,classId:"fighter"});
    const normal=generateStartingMagic({ruleset:"2014",level:12,mode:MAGIC_MODES.NORMAL_MAGIC,classId:"fighter"});
    const high=generateStartingMagic({ruleset:"2014",level:12,mode:MAGIC_MODES.HIGH_MAGIC,classId:"fighter"});
    assert.equal(low.items.length,1);
    assert.equal(normal.items.length,2);
    assert.equal(high.items.length,4);
    assert.match(low.gold,/5,000 gp/);
    assert.equal(high.items.filter(item=>item.rarity==="rare").length,1);
  }catch(error){console.error("[test] 2014 starting magic guidance",error);throw error;}
});

test("2024 higher-level starting equipment uses the official table and no-magic is an explicit override",()=>{
  try{
    const normal=generateStartingMagic({ruleset:"2024",level:12,mode:MAGIC_MODES.NORMAL_MAGIC,classId:"wizard"});
    const high=generateStartingMagic({ruleset:"2024",level:12,mode:MAGIC_MODES.HIGH_MAGIC,classId:"wizard"});
    const none=generateStartingMagic({ruleset:"2024",level:12,mode:MAGIC_MODES.NO_MAGIC,classId:"wizard"});
    assert.equal(normal.items.length,6);
    assert.equal(high.items.length,6);
    assert.equal(none.items.length,0);
    assert.match(normal.gold,/5,000 gp/);
    assert.ok(normal.items.every(item=>item.source.includes("2024")));
  }catch(error){console.error("[test] 2024 starting magic guidance",error);throw error;}
});

test("magic candidates remain usable by every supported class",()=>{
  try{
    for(const classId of ALL_CLASSES){
      for(const ruleset of ["2014","2024"]){
        const character=generateStartingMagic({ruleset,level:17,mode:MAGIC_MODES.NORMAL_MAGIC,classId});
        assert.ok(character.items.length>0,`${ruleset} ${classId}`);
        assert.ok(character.items.every(item=>item.name),`${ruleset} ${classId}`);
        assert.ok(!character.items.some(item=>item.id==="weapon-plus-1"&&classId==="wizard"),`${ruleset} ${classId}`);
      }
    }
  }catch(error){console.error("[test] class-usable magic candidates",error);throw error;}
});

test("No Magic never creates starting magic items",()=>{
  try{
    for(const ruleset of ["2014","2024"]){
      const result=generateStartingMagic({ruleset,level:20,mode:MAGIC_MODES.NO_MAGIC,classId:"fighter"});
      assert.deepEqual(result.items,[]);
    }
  }catch(error){console.error("[test] no magic",error);throw error;}
});
