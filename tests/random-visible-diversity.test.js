import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { pick, resetRandomHistory } from "../src/rules/random.js";

const classes=Array.from({length:6},(_,index)=>({id:`class-${index+1}`,hitDie:10,skillChoices:["athletics"],primary:["str"]}));
const species=Array.from({length:6},(_,index)=>({id:`species-${index+1}`,speed:30,size:"Medium"}));
const subclasses=Array.from({length:6},(_,index)=>({id:`fighter-subclass-${index+1}`,classId:"fighter",level:3}));
const backgrounds=Array.from({length:4},(_,index)=>({id:`background-${index+1}`,skills:["athletics"],equipment:["pack"]}));

function withConstantRandom(callback){
  const originalRandom=Math.random;
  try{Math.random=()=>0;return callback();}
  finally{Math.random=originalRandom;resetRandomHistory();}
}

function randomState(){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.level="7";
  state.constraints.class="random";
  state.constraints.subclass="random";
  state.constraints.species="random";
  state.constraints.background="random";
  state.constraints.name="";
  return state;
}

test("visible Random categories avoid their recent choices even with a constant RNG",()=>withConstantRandom(()=>{
  for(const [label,pool,count] of [["class",classes,5],["species",species,5],["subclass",subclasses,5],["background",backgrounds,4]]){
    resetRandomHistory();
    const choices=Array.from({length:count},()=>pick(pool).id);
    assert.equal(new Set(choices).size,count,`${label} repeated inside its protected recent window`);
  }
}));

test("subclass history is isolated per class",()=>withConstantRandom(()=>{
  resetRandomHistory();
  const fighter=[{id:"champion",classId:"fighter",level:3},{id:"battle-master",classId:"fighter",level:3}];
  const cleric=[{id:"life",classId:"cleric",level:3},{id:"light",classId:"cleric",level:3}];
  assert.equal(pick(fighter).id,"champion");
  assert.equal(pick(fighter).id,"battle-master");
  assert.equal(pick(cleric).id,"life");
  assert.equal(pick(cleric).id,"light");
}));

test("four consecutive fully Random 2024 pregens vary class, species, and SRD background",()=>{
  resetRandomHistory();
  const characters=Array.from({length:4},()=>generateCharacter(randomState()));
  assert.equal(characters.every(character=>character.validation.valid),true);
  assert.equal(new Set(characters.map(character=>character.class.id)).size,4,"classes repeated too quickly");
  assert.equal(new Set(characters.map(character=>character.species.id)).size,4,"species repeated too quickly");
  assert.equal(new Set(characters.map(character=>character.background.id)).size,4,"backgrounds repeated before the strict SRD pool was exhausted");
  resetRandomHistory();
});

test("explicit visible selections remain authoritative",()=>{
  resetRandomHistory();
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.level="1";
  state.constraints.class="fighter";
  state.constraints.species="dwarf";
  state.constraints.background="soldier";
  state.constraints.name="Fixed Choice";
  const one=generateCharacter(state),two=generateCharacter(state);
  assert.equal(one.class.id,"fighter");assert.equal(two.class.id,"fighter");
  assert.equal(one.species.id,"dwarf");assert.equal(two.species.id,"dwarf");
  assert.equal(one.background.id,"soldier");assert.equal(two.background.id,"soldier");
  assert.equal(one.name,"Fixed Choice");assert.equal(two.name,"Fixed Choice");
  resetRandomHistory();
});
