import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { inherentSpeciesSkillIds, guaranteedSpeciesSkillIds } from "../src/rules/species-skill-proficiencies.js";
import { sanitizeClassSelectionsForCurrentState } from "../src/ui/class-options.js";

function seeded(seed){let value=seed>>>0;return()=>{value=(value+0x6D2B79F5)>>>0;let t=value;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function stateFor(ruleset,classId,level,species,background,subclass="random"){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.class=classId;state.constraints.level=String(level);state.constraints.subclass=subclass;state.constraints.species=species;state.constraints.background=background;return state;
}

test("species skill provenance exposes 2014 inherent and selected skill proficiencies canonically",()=>{
  assert.deepEqual([...inherentSpeciesSkillIds("2014","elf")],["perception"]);
  assert.deepEqual([...inherentSpeciesSkillIds("2014","half-orc")],["intimidation"]);
  assert.deepEqual([...guaranteedSpeciesSkillIds({ruleset:"2014",speciesId:"half-elf",selections:{skill1:"Athletics",skill2:"Perception"}})],["athletics","perception"]);
  assert.deepEqual([...guaranteedSpeciesSkillIds({ruleset:"2024",speciesId:"human",selections:{skill:"Nature"}})],["nature"]);
});

test("2014 Elf Perception never consumes a Fighter class proficiency slot",()=>{
  const original=Math.random;
  try{for(let seed=1;seed<=64;seed++){
    Math.random=seeded(seed);const state=stateFor("2014","fighter",1,"elf","acolyte");state.classSelections={classSkills:["athletics"]};const character=generateCharacter(state);
    assert.equal(character.validation.valid,true);assert.equal(character.classSkillChoices.length,2);assert.ok(character.classSkillChoices.includes("athletics"));assert.equal(character.classSkillChoices.includes("perception"),false,`seed ${seed} spent a Fighter slot on Elf Perception`);assert.ok(character.skills.includes("perception"));
  }}finally{Math.random=original;}
});

test("2014 Half-Orc Intimidation never consumes a Fighter class proficiency slot",()=>{
  const original=Math.random;
  try{for(let seed=1;seed<=64;seed++){
    Math.random=seeded(seed);const state=stateFor("2014","fighter",1,"half-orc","acolyte");state.classSelections={classSkills:["athletics"]};const character=generateCharacter(state);
    assert.equal(character.validation.valid,true);assert.equal(character.classSkillChoices.length,2);assert.equal(character.classSkillChoices.includes("intimidation"),false,`seed ${seed} spent a Fighter slot on Half-Orc Intimidation`);assert.ok(character.skills.includes("intimidation"));
  }}finally{Math.random=original;}
});

test("Random 2014 species avoids unavoidable racial collisions with fixed class-source skills",()=>{
  const original=Math.random;
  try{for(let seed=1;seed<=96;seed++){
    Math.random=seeded(seed);const state=stateFor("2014","fighter",1,"random","acolyte");state.classSelections={classSkills:["perception","athletics"]};const character=generateCharacter(state);
    assert.equal(character.validation.valid,true);assert.notEqual(character.species.id,"elf",`seed ${seed} chose Elf despite fixed class Perception`);assert.deepEqual(new Set(character.classSkillChoices),new Set(["perception","athletics"]));
  }}finally{Math.random=original;}
});

test("2014 inherent species skill transition removes only the conflicting class lock",()=>{
  const state=stateFor("2014","fighter",1,"elf","acolyte");state.classSelections={classSkills:["perception","survival"]};const clean=sanitizeClassSelectionsForCurrentState(state);
  assert.deepEqual(clean.classSkills,["survival"]);const character=generateCharacter(state);assert.equal(character.validation.valid,true);assert.ok(character.skills.includes("perception"));assert.ok(character.classSkillChoices.includes("survival"));
});

test("2014 Half-Elf Skill Versatility transition repairs class locks without wasting a slot",()=>{
  const state=stateFor("2014","fighter",1,"half-elf","acolyte");state.speciesSelections={skill1:"athletics",skill2:"perception"};state.classSelections={classSkills:["athletics","survival"]};const clean=sanitizeClassSelectionsForCurrentState(state);
  assert.deepEqual(clean.classSkills,["survival"]);const character=generateCharacter(state);assert.equal(character.validation.valid,true);assert.ok(character.skills.includes("athletics"));assert.ok(character.skills.includes("perception"));assert.equal(character.classSkillChoices.includes("athletics"),false);
});

test("2024 Human Skillful transition repairs class and College of Lore skill locks",()=>{
  const fighter=stateFor("2024","fighter",1,"human","criminal");fighter.speciesSelections={skill:"athletics"};fighter.classSelections={classSkills:["athletics","perception"]};assert.deepEqual(sanitizeClassSelectionsForCurrentState(fighter).classSkills,["perception"]);assert.equal(generateCharacter(fighter).validation.valid,true);
  const bard=stateFor("2024","bard",3,"human","sage","college-lore");bard.speciesSelections={skill:"nature"};bard.classSelections={classSkills:["deception","persuasion"],loreBonusSkills:["nature","religion"],expertise:["deception","history"]};const clean=sanitizeClassSelectionsForCurrentState(bard);assert.deepEqual(clean.classSkills,["deception","persuasion"]);assert.deepEqual(clean.loreBonusSkills,["religion"]);assert.deepEqual(clean.expertise,["deception","history"]);const character=generateCharacter(bard);assert.equal(character.validation.valid,true);assert.equal(character.audit.rawIntegrity,true);
});
