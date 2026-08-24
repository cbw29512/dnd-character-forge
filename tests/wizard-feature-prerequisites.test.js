import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { WIZARD_SPELLS_2014, WIZARD_SPELLS_2024, WIZARD_SPELL_MASTERY_ACTION_IDS_2024 } from "../src/data/wizard-spells.js";

const ACTION_MASTERY_2024=new Set(WIZARD_SPELL_MASTERY_ACTION_IDS_2024);
const CASES=[
  {ruleset:"2014",subclass:"school-evocation",species:"human",background:"acolyte",spells:WIZARD_SPELLS_2014},
  {ruleset:"2024",subclass:"evoker",species:"dwarf",background:"criminal",spells:WIZARD_SPELLS_2024}
];

function wizardAt(config){
  try{
    const state=createInitialState();
    state.ruleset=config.ruleset;
    state.constraints.level="20";
    state.constraints.class="wizard";
    state.constraints.subclass=config.subclass;
    state.constraints.species=config.species;
    state.constraints.background=config.background;
    return generateCharacter(state);
  }catch(error){
    console.error(`[test] ${config.ruleset} Wizard feature prerequisite generation failed`,error);
    throw error;
  }
}

function assertFeaturePrerequisites(character,config){
  try{
    const byId=new Map(config.spells.map(spell=>[spell.id,spell]));
    const book=new Set(character.spells.spellbook.all);
    const mastery=character.spells.spellMastery;
    const signatures=character.spells.signatureSpells;

    assert.ok(mastery,`${config.ruleset}: missing Spell Mastery`);
    assert.equal(byId.get(mastery.level1)?.level,1,`${config.ruleset}: mastery level 1`);
    assert.equal(byId.get(mastery.level2)?.level,2,`${config.ruleset}: mastery level 2`);
    assert.ok(book.has(mastery.level1),`${config.ruleset}: mastery level 1 absent from spellbook`);
    assert.ok(book.has(mastery.level2),`${config.ruleset}: mastery level 2 absent from spellbook`);
    if(config.ruleset==="2024"){
      assert.ok(ACTION_MASTERY_2024.has(mastery.level1),"2024: level-1 mastery must have an Action casting time");
      assert.ok(ACTION_MASTERY_2024.has(mastery.level2),"2024: level-2 mastery must have an Action casting time");
    }

    assert.equal(signatures.length,2,`${config.ruleset}: Signature Spells count`);
    assert.equal(new Set(signatures).size,2,`${config.ruleset}: Signature Spells must be distinct`);
    for(const id of signatures){
      assert.equal(byId.get(id)?.level,3,`${config.ruleset}: ${id} must be level 3`);
      assert.ok(book.has(id),`${config.ruleset}: ${id} absent from spellbook`);
    }
  }catch(error){
    console.error(`[test] ${config.ruleset} Wizard feature prerequisite assertion failed`,error);
    throw error;
  }
}

test("random level-20 Wizards always contain legal feature spell prerequisites",()=>{
  for(const config of CASES){
    for(let iteration=0;iteration<100;iteration++)assertFeaturePrerequisites(wizardAt(config),config);
  }
});
