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

for(const ruleset of ["2014","2024"]){
  const data=ruleset==="2014"?FORGE_2014:FORGE_2024;
  for(const cls of data.classes){
    test(`${ruleset} ${cls.name} production checkpoints`,()=>{
      try{
        const levels=new Set([1,cls.subclassLevel||1,cls.maxLevel||20]);
        for(const level of levels){
          if(level<1||level>cls.maxLevel)continue;
          const character=make(ruleset,cls.id,level);
          assert.equal(character.validation.valid,true,`${ruleset} ${cls.id} level ${level}`);
          assert.equal(character.class.id,cls.id);
          assert.ok(Array.isArray(character.equipment),`${cls.id} equipment missing`);
          assert.ok(character.audit,`${cls.id} audit missing`);
        }
        for(const subclass of data.subclasses.filter(item=>item.classId===cls.id)){
          const level=cls.subclassLevel||1;
          if(level>cls.maxLevel)continue;
          const character=make(ruleset,cls.id,level,subclass.id);
          assert.equal(character.validation.valid,true,`${ruleset} ${cls.id}/${subclass.id}`);
          assert.equal(character.subclass.id,subclass.id);
          assert.ok(Array.isArray(character.equipment),`${cls.id}/${subclass.id} equipment missing`);
        }
      }catch(error){console.error(`[test] production matrix ${ruleset} ${cls.id}`,error);throw error;}
    });
  }
}
