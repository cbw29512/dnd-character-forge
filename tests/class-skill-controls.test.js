import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { forgeDataFor } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

function stateFor(ruleset,classId,{level=1,background="random",subclass="random",classSelections={}}={}){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level=String(level);
  state.constraints.species="random";
  state.constraints.class=classId;
  state.constraints.subclass=subclass;
  state.constraints.background=background;
  state.classSelections=structuredClone(classSelections);
  return state;
}

test("every supported class exposes its exact base skill-choice capacity in both editions",()=>{
  for(const ruleset of ["2014","2024"]){
    const data=forgeDataFor(ruleset);
    for(const cls of data.classes){
      const field=classChoiceFieldsForState(stateFor(ruleset,cls.id)).find(item=>item.key==="classSkills");
      assert.ok(field,`${ruleset} ${cls.name} is missing class skill controls`);
      assert.equal(field.max,cls.skillCount,`${ruleset} ${cls.name} skill count drifted`);
      assert.deepEqual(new Set(field.options.map(option=>option.id)),new Set(cls.skillChoices),`${ruleset} ${cls.name} skill pool drifted`);
    }
  }
});

test("fixed and partial class skill locks survive generation",()=>{
  const fixed=generateCharacter(stateFor("2024","fighter",{background:"criminal",classSelections:{classSkills:["athletics","perception"]}}));
  assert.deepEqual(new Set(fixed.classSkillChoices),new Set(["athletics","perception"]));
  assert.ok(fixed.skills.includes("athletics"));
  assert.ok(fixed.skills.includes("perception"));

  const partial=generateCharacter(stateFor("2014","fighter",{background:"acolyte",classSelections:{classSkills:["athletics"]}}));
  assert.equal(partial.classSkillChoices.length,partial.class.skillCount);
  assert.ok(partial.classSkillChoices.includes("athletics"));
});

test("Random background generation preserves locked class skills instead of duplicating them",()=>{
  for(let attempt=0;attempt<12;attempt++){
    const character=generateCharacter(stateFor("2024","fighter",{classSelections:{classSkills:["athletics"]}}));
    assert.ok(character.classSkillChoices.includes("athletics"));
    assert.ok(!character.background.skills.includes("athletics"));
  }
});

test("a fixed background conflict fails closed with an actionable class-skill error",()=>{
  assert.throws(()=>generateCharacter(stateFor("2024","fighter",{background:"soldier",classSelections:{classSkills:["athletics"]}})),/class or College of Lore skill is already granted|different class skill\/background combination/);
});

test("Expertise reservations and fixed class skills share the real class proficiency budget",()=>{
  const legal=generateCharacter(stateFor("2024","rogue",{background:"acolyte",classSelections:{classSkills:["acrobatics","athletics","deception"],expertise:["stealth"]}}));
  assert.equal(legal.classSkillChoices.length,4);
  assert.ok(legal.classSkillChoices.includes("stealth"));
  assert.equal(legal.expertise.length,2);
  assert.ok(legal.expertise.includes("stealth"));

  assert.throws(()=>generateCharacter(stateFor("2024","rogue",{background:"acolyte",classSelections:{classSkills:["acrobatics","athletics","deception","intimidation"],expertise:["stealth"]}})),/grants only 4|require 5 class proficiencies/);
});

test("College of Lore cannot duplicate a locked Bard class proficiency",()=>{
  assert.throws(()=>generateCharacter(stateFor("2014","bard",{level:3,background:"acolyte",subclass:"college-lore",classSelections:{classSkills:["arcana"],loreBonusSkills:["arcana"]}})),/College of Lore|new proficiencies|class skill choices must add new proficiencies/);
});

test("Expertise supplied by College of Lore does not consume a second base Bard skill slot",()=>{
  const character=generateCharacter(stateFor("2014","bard",{level:10,background:"acolyte",subclass:"college-lore",classSelections:{classSkills:["acrobatics","deception","performance"],loreBonusSkills:["arcana","history","investigation"],expertise:["arcana"]}}));
  assert.equal(character.classSkillChoices.length,character.class.skillCount);
  assert.deepEqual(new Set(character.classSkillChoices),new Set(["acrobatics","deception","performance"]));
  assert.ok(character.expertise.includes("arcana"));
});

test("saved characters restore the exact resolved base class skills",()=>{
  const character=generateCharacter(stateFor("2024","ranger",{level:2,background:"criminal",classSelections:{classSkills:["nature","perception"],expertise:["nature"]}}));
  const restored=classSelectionsFromCharacter(character);
  assert.deepEqual(restored.classSkills,character.classSkillChoices);
  assert.deepEqual(restored.expertise,character.rangerSelections.expertise);
});
