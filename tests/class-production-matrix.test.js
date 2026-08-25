import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";

function make(ruleset,classId,level,subclassId="random"){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.class=classId;
    state.constraints.level=String(level);
    state.constraints.subclass=subclassId;
    return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} ${classId} level ${level} subclass ${subclassId}`,error);throw error;}
}

function assertCharacterShape(character,label){
  try{
    assert.equal(character.validation.valid,true,`${label} validation failed`);
    assert.equal(character.class.id,label.split("/")[1]?.split(" ")[0]||character.class.id);
    assert.ok(character.equipment && typeof character.equipment==="object",`${label} equipment package missing`);
    assert.ok(Array.isArray(character.equipment.weapons),`${label} weapon selection missing`);
    assert.ok(Array.isArray(character.equipment.gear),`${label} gear selection missing`);
    assert.ok(Array.isArray(character.inventory),`${label} derived inventory missing`);
    assert.ok(character.audit,`${label} audit missing`);
  }catch(error){console.error(`[test] character shape ${label}`,error);throw error;}
}

for(const ruleset of ["2014","2024"]){
  const data=ruleset==="2014"?FORGE_2014:FORGE_2024;
  for(const cls of data.classes){
    test(`${ruleset} ${cls.name} production checkpoints`,()=>{
      try{
        const levels=new Set([1,cls.subclassLevel||1,cls.maxLevel||20]);
        for(const level of levels){
          if(level<1||level>cls.maxLevel)continue;
          const character=make(ruleset,cls.id,level);
          assertCharacterShape(character,`${ruleset}/${cls.id} level ${level}`);
          assert.equal(character.class.id,cls.id);
        }
        for(const subclass of data.subclasses.filter(item=>item.classId===cls.id)){
          const level=cls.subclassLevel||1;
          if(level>cls.maxLevel)continue;
          const character=make(ruleset,cls.id,level,subclass.id);
          assertCharacterShape(character,`${ruleset}/${cls.id}/${subclass.id}`);
          assert.equal(character.subclass.id,subclass.id);
        }
      }catch(error){console.error(`[test] production matrix ${ruleset} ${cls.id}`,error);throw error;}
    });
  }
}
