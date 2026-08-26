import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";

// Data schema for this audit: each ruleset is tested with one fixed legal
// species/background so failures identify class/subclass progression rather
// than unrelated random catalog choices.
const EDITIONS=Object.freeze([
  Object.freeze({ruleset:"2014",data:FORGE_2014}),
  Object.freeze({ruleset:"2024",data:FORGE_2024})
]);
const FINITE_FIELDS=Object.freeze(["ac","hp","initiative","speed","passivePerception","proficiency"]);

// State logic: only class, level, and subclass vary inside the matrix. All
// remaining choices stay under the generator's normal legal Random resolver.
function stateFor({ruleset,data,classId,level,subclassId="random"}){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints={
      ...state.constraints,
      level:String(level),
      class:classId,
      subclass:subclassId,
      species:data.species[0].id,
      background:data.backgrounds[0].id,
      name:`Audit ${ruleset} ${classId} ${level}`
    };
    return state;
  }catch(error){
    console.error(`[full-level-matrix] state build failed: ${ruleset} ${classId} L${level} ${subclassId}`,error);
    throw error;
  }
}

function assertProductionCharacter(character,{ruleset,classId,level,subclassId=null}){
  try{
    const label=`${ruleset} ${classId} L${level}${subclassId?` ${subclassId}`:""}`;
    assert.equal(character.ruleset,ruleset,`${label}: ruleset drift`);
    assert.equal(character.level,level,`${label}: level drift`);
    assert.equal(character.class.id,classId,`${label}: class drift`);
    if(subclassId)assert.equal(character.subclass?.id,subclassId,`${label}: subclass drift`);

    assert.equal(character.validation?.valid,true,`${label}: validation failed: ${(character.validation?.errors||[]).join(" | ")}`);
    assert.equal(character.audit?.status,"PASS",`${label}: Rules Audit did not pass`);
    assert.equal(character.audit?.rawIntegrity,true,`${label}: RAW integrity failed`);

    for(const field of FINITE_FIELDS){
      assert.equal(Number.isFinite(character[field]),true,`${label}: ${field} is not finite (${character[field]})`);
    }
    for(const ability of ["str","dex","con","int","wis","cha"]){
      assert.equal(Number.isFinite(character.abilities?.[ability]),true,`${label}: ${ability} score is not finite`);
      assert.equal(Number.isFinite(character.saveBonuses?.[ability]),true,`${label}: ${ability} save is not finite`);
    }

    assert.ok(character.equipment&&typeof character.equipment==="object",`${label}: equipment package missing`);
    assert.ok(Array.isArray(character.equipment.weapons),`${label}: equipment weapons missing`);
    assert.ok(Array.isArray(character.equipment.gear),`${label}: equipment gear missing`);
    assert.ok(Array.isArray(character.inventory),`${label}: derived inventory missing`);
    for(const item of character.inventory){
      assert.equal(typeof item,"object",`${label}: inventory item is not structured`);
      assert.equal(typeof item.name,"string",`${label}: inventory item name missing`);
      assert.ok(item.name.trim(),`${label}: inventory item name blank`);
      assert.equal(Number.isFinite(item.quantity),true,`${label}: inventory quantity invalid for ${item.name}`);
      assert.ok(item.quantity>0,`${label}: inventory quantity must be positive for ${item.name}`);
    }

    assert.ok(Array.isArray(character.attacks),`${label}: attacks missing`);
    for(const attack of character.attacks){
      assert.equal(Number.isFinite(attack.attackBonus),true,`${label}: attack bonus invalid for ${attack.name}`);
      assert.equal(Number.isFinite(attack.damageBonus),true,`${label}: damage bonus invalid for ${attack.name}`);
    }
  }catch(error){
    console.error(`[full-level-matrix] production assertion failed: ${ruleset} ${classId} L${level} ${subclassId||"random"}`,error);
    throw error;
  }
}

for(const {ruleset,data} of EDITIONS){
  for(const cls of data.classes){
    test(`${ruleset} ${cls.name} is production-valid at every level 1-${cls.maxLevel}`,()=>{
      try{
        for(let level=1;level<=cls.maxLevel;level++){
          const character=generateCharacter(stateFor({ruleset,data,classId:cls.id,level}));
          assertProductionCharacter(character,{ruleset,classId:cls.id,level});
        }
      }catch(error){
        console.error(`[full-level-matrix] class sweep failed: ${ruleset} ${cls.id}`,error);
        throw error;
      }
    });

    for(const subclass of data.subclasses.filter(item=>item.classId===cls.id)){
      test(`${ruleset} ${cls.name}/${subclass.name} is production-valid from unlock through level ${cls.maxLevel}`,()=>{
        try{
          const unlock=Math.max(Number(cls.subclassLevel||1),Number(subclass.level||1));
          for(let level=unlock;level<=cls.maxLevel;level++){
            const character=generateCharacter(stateFor({ruleset,data,classId:cls.id,level,subclassId:subclass.id}));
            assertProductionCharacter(character,{ruleset,classId:cls.id,level,subclassId:subclass.id});
          }
        }catch(error){
          console.error(`[full-level-matrix] subclass sweep failed: ${ruleset} ${cls.id}/${subclass.id}`,error);
          throw error;
        }
      });
    }
  }
}
