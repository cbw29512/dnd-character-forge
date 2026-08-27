import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";
import { SCHOLAR_SKILLS } from "../src/rules/wizard-selections.js";

function wizardState(ruleset="2024",level=2,scholarExpertise=null){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level=String(level);
    state.constraints.class="wizard";
    state.constraints.subclass=level>=3?(ruleset==="2024"?"evoker":"school-evocation"):"random";
    state.constraints.species="human";
    state.constraints.background=ruleset==="2024"?"sage":"acolyte";
    state.classSelections=scholarExpertise?{scholarExpertise}:{};
    return state;
  }catch(error){
    console.error("[wizard-scholar-controls-test] state fixture failed",error);
    throw error;
  }
}

function scholarField(state){
  try{return classChoiceFieldsForState(state).find(field=>field.key==="scholarExpertise")||null;}
  catch(error){console.error("[wizard-scholar-controls-test] field lookup failed",error);throw error;}
}

test("2024 Wizard exposes Scholar Expertise at level 2 with the RAW skill list",()=>{
  const field=scholarField(wizardState("2024",2));
  assert.ok(field);
  assert.deepEqual(new Set(field.options.map(option=>option.id)),new Set(SCHOLAR_SKILLS));
});

test("Scholar control is absent before level 2 and from 2014 Wizard",()=>{
  assert.equal(scholarField(wizardState("2024",1)),null);
  assert.equal(scholarField(wizardState("2014",2)),null);
});

test("fixed Scholar Expertise can reserve a Wizard skill proficiency",()=>{
  const character=generateCharacter(wizardState("2024",2,"nature"));
  assert.equal(character.validation.valid,true);
  assert.ok(character.skills.includes("nature"));
  assert.deepEqual(character.expertise,["nature"]);
});

test("fixed Scholar Expertise can use an eligible background proficiency without wasting a Wizard skill",()=>{
  const character=generateCharacter(wizardState("2024",2,"history"));
  assert.ok(character.skills.includes("history"));
  assert.deepEqual(character.expertise,["history"]);
  assert.equal(character.skills.length>=4,true);
});

test("random Scholar Expertise always resolves to an eligible proficient skill",()=>{
  for(let i=0;i<40;i++){
    const character=generateCharacter(wizardState("2024",2));
    assert.equal(character.expertise.length,1);
    assert.ok(SCHOLAR_SKILLS.includes(character.expertise[0]));
    assert.ok(character.skills.includes(character.expertise[0]));
  }
});

test("illegal Scholar targets and premature locks are rejected",()=>{
  assert.throws(()=>generateCharacter(wizardState("2024",2,"insight")),/Scholar Expertise cannot use/);
  assert.throws(()=>generateCharacter(wizardState("2024",1,"arcana")),/available only to 2024 Wizards at level 2/);
});

test("saved 2024 Wizard restores Scholar Expertise into Forge state",()=>{
  const character=generateCharacter(wizardState("2024",2,"medicine"));
  assert.equal(classSelectionsFromCharacter(character).scholarExpertise,"medicine");
});
