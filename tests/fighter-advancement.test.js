import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { generateCharacter } from "../src/rules/generator.js";
import { applyFighterAdvancement } from "../src/rules/fighter-advancement.js";

function fighterState(ruleset,level="random"){const state=createInitialState();state.ruleset=ruleset;state.constraints.class="fighter";state.constraints.level=String(level);return state;}

test("locked Fighter advancement becomes a hard generation constraint",()=>{
  const state=fighterState("2024",12);state.advancementSelections[6]="grappler";
  for(let i=0;i<100;i++){
    const character=generateCharacter(state),choice=character.advancementChoices.find(item=>item.level===6);
    assert.equal(choice.id,"grappler");assert.equal(choice.locked,true);assert.ok(character.feats.some(feat=>feat.id==="grappler"));
    assert.notEqual(character.advancementChoices.find(item=>item.level===4)?.id,"grappler");
  }
});

test("locked level-19 Fighter boon constrains a Random level to 19 or 20",()=>{
  const state=fighterState("2024");state.advancementSelections[19]="boon-combat-prowess";
  for(let i=0;i<50;i++){const character=generateCharacter(state);assert.ok(character.level>=19);assert.equal(character.advancementChoices.find(item=>item.level===19).id,"boon-combat-prowess");}
});

test("locked 2024 Grappler remains legal when STR and DEX are already 20 without inventing an increase",()=>{
  const fighter={ruleset:"2024",level:4,class:{id:"fighter"},abilities:{str:20,dex:20,con:14,int:10,wis:10,cha:8},abilityMaximums:{str:20,dex:20,con:20,int:20,wis:20,cha:20},feats:[],advancementChoices:[]};
  const result=applyFighterAdvancement(fighter,RAW_2024,{4:"grappler"}),choice=result.advancementChoices[0];
  assert.equal(choice.id,"grappler");assert.deepEqual(choice.increases,{});assert.equal(result.abilities.str,20);assert.equal(result.abilities.dex,20);
});

test("duplicate locked Grappler selections fail closed before random resolution",()=>{
  const state=fighterState("2024",12);state.advancementSelections[4]="grappler";state.advancementSelections[6]="grappler";
  assert.throws(()=>generateCharacter(state),/cannot be selected more than once/i);
});

test("illegal Fighter advancement choices fail closed",()=>{
  const state=fighterState("2024",8);state.advancementSelections[6]="boon-fate";
  assert.throws(()=>generateCharacter(state),/Illegal 2024 Fighter General feat/i);
});
