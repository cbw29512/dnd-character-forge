import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { clericSpellsFor } from "../src/data/cleric-spells.js";
import { RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024 } from "../src/data/ranger-spells.js";

function stateFor(classId,subclass){const state=createInitialState();state.ruleset="2024";state.constraints={...state.constraints,level:"20",class:classId,subclass,species:"human",background:"acolyte",name:"Fixed Choice Contract"};return state;}

test("fixed Blessed Warrior cantrips survive Paladin generation",()=>{
  const state=stateFor("paladin","oath-devotion"),ids=clericSpellsFor("2024").filter(spell=>spell.level===0).slice(0,2).map(spell=>spell.id);state.classSelections={fightingStyle:"blessed-warrior"};state.spellSelections={cantrips:ids};const character=generateCharacter(state);assert.equal(character.fightingStyle.id,"blessed-warrior");assert.deepEqual(character.spells.cantrips.selected,ids);for(const id of ids)assert.ok(character.spells.cantrips.all.includes(id));
});

test("fixed Druidic Warrior cantrips survive Ranger generation",()=>{
  const state=stateFor("ranger","hunter"),ids=RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024.slice(0,2).map(spell=>spell.id);state.classSelections={fightingStyle:"druidic-warrior"};state.spellSelections={cantrips:ids};const character=generateCharacter(state);assert.equal(character.fightingStyle.id,"druidic-warrior");assert.deepEqual(character.spells.cantrips.selected,ids);for(const id of ids)assert.ok(character.spells.cantrips.all.includes(id));
});

test("fixed Druid land rejects a normal preparation that the land already grants",()=>{
  const state=stateFor("druid","circle-land");state.classSelections={primalOrder:"warden",circleLand:"polar"};state.spellSelections={prepared:["fog-cloud"]};assert.throws(()=>generateCharacter(state),/already always prepared/);
});
