import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { fighterProgression } from "../src/rules/fighter.js";
import { FIGHTER_ADVANCEMENT } from "../src/rules/fighter-advancement.js";

function fighterState(ruleset,level="random"){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.class="fighter";state.constraints.level=String(level);return state;
}

test("both editions generate valid Champion Fighters at every level 1-20",()=>{
  try{
    for(const ruleset of ["2014","2024"])for(let level=1;level<=20;level++){
      const character=generateCharacter(fighterState(ruleset,level));
      assert.equal(character.class.id,"fighter");assert.equal(character.level,level);assert.equal(character.validation.valid,true);
      if(level>=3)assert.equal(character.subclass.id,"champion");else assert.equal(character.subclass,null);
      assert.doesNotThrow(()=>buildQuickReference(character),`${ruleset} Fighter ${level} reference`);
      const row=fighterProgression(ruleset,level),resources=Object.fromEntries(character.classResources.map(item=>[item.id,item.value]));
      assert.equal(resources["attacks-per-action"],String(row.attacks));
      if(row.actionSurge)assert.equal(resources["action-surge"],String(row.actionSurge));
      if(row.indomitable)assert.equal(resources.indomitable,String(row.indomitable));
      if(ruleset==="2024"){assert.equal(resources["second-wind"],String(row.secondWind));assert.equal(character.masteryIds.length,row.masteries);}
    }
  }catch(error){console.error("[test] Fighter full vertical slice",error);throw error;}
});

test("Champion receives exactly one second distinct Fighting Style at edition-correct level",()=>{
  try{
    const old9=generateCharacter(fighterState("2014",9)),old10=generateCharacter(fighterState("2014",10)),new6=generateCharacter(fighterState("2024",6)),new7=generateCharacter(fighterState("2024",7));
    assert.equal(old9.fightingStyles.length,1);assert.equal(old10.fightingStyles.length,2);assert.notEqual(old10.fightingStyles[0].id,old10.fightingStyles[1].id);
    assert.equal(new6.fightingStyles.length,1);assert.equal(new7.fightingStyles.length,2);assert.notEqual(new7.fightingStyles[0].id,new7.fightingStyles[1].id);
    assert.ok(buildQuickReference(old10).some(item=>item.name===`Additional Fighting Style: ${old10.fightingStyles[1].name}`));
    assert.ok(buildQuickReference(new7).some(item=>item.name===`Additional Fighting Style: ${new7.fightingStyles[1].name}`));
  }catch(error){console.error("[test] Champion multiple styles",error);throw error;}
});

test("Fighter advancement uses all extra Fighter feat levels",()=>{
  try{
    const old=generateCharacter(fighterState("2014",20)),modern=generateCharacter(fighterState("2024",20));
    assert.deepEqual(old.advancementChoices.map(choice=>choice.level),[4,6,8,12,14,16,19]);
    assert.deepEqual(modern.advancementChoices.map(choice=>choice.level),[4,6,8,12,14,16,19]);
    assert.ok(old.advancementChoices.every(choice=>choice.type==="asi"||choice.id==="grappler"));
    for(const choice of modern.advancementChoices.slice(0,6))assert.ok(["ability-score-improvement","grappler"].includes(choice.id));
    assert.ok(FIGHTER_ADVANCEMENT.epicBoons.includes(modern.advancementChoices[6].id));
  }catch(error){console.error("[test] Fighter advancement sequence",error);throw error;}
});

test("Fighter high-level combat resources scale at 11, 17, and 20",()=>{
  try{
    for(const ruleset of ["2014","2024"]){
      const eleven=generateCharacter(fighterState(ruleset,11)),seventeen=generateCharacter(fighterState(ruleset,17)),twenty=generateCharacter(fighterState(ruleset,20));
      assert.equal(Object.fromEntries(eleven.classResources.map(r=>[r.id,r.value]))["attacks-per-action"],"3");
      assert.equal(Object.fromEntries(seventeen.classResources.map(r=>[r.id,r.value]))["action-surge"],"2");
      assert.equal(Object.fromEntries(seventeen.classResources.map(r=>[r.id,r.value])).indomitable,"3");
      assert.equal(Object.fromEntries(twenty.classResources.map(r=>[r.id,r.value]))["attacks-per-action"],"4");
    }
  }catch(error){console.error("[test] Fighter high-level resources",error);throw error;}
});

test("2024 Fighter mastery count reaches five at 10 and six at 16",()=>{
  try{assert.equal(generateCharacter(fighterState("2024",9)).masteryIds.length,4);assert.equal(generateCharacter(fighterState("2024",10)).masteryIds.length,5);assert.equal(generateCharacter(fighterState("2024",16)).masteryIds.length,6);}
  catch(error){console.error("[test] Fighter mastery scaling",error);throw error;}
});

test("1000 randomized Fighters per edition pass validation and play references",()=>{
  try{for(const ruleset of ["2014","2024"])for(let i=0;i<1000;i++){const character=generateCharacter(fighterState(ruleset));assert.equal(character.validation.valid,true);assert.doesNotThrow(()=>buildQuickReference(character));}}
  catch(error){console.error("[test] Fighter torture generation",error);throw error;}
});
