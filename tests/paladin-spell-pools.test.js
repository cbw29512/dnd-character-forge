import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { PALADIN_SPELLS_2014, PALADIN_SPELLS_2024 } from "../src/data/paladin-spells.js";

const OATH_ONLY_2014=["sanctuary","beacon-of-hope","freedom-of-movement","guardian-of-faith","commune","flame-strike"];
const OATH_ONLY_2024=["beacon-of-hope","freedom-of-movement","guardian-of-faith","commune","flame-strike"];

function generated(ruleset,level,spellSelections={}){const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="paladin";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"soldier";state.constraints.subclass=level>=3?"oath-devotion":"random";state.spellSelections=spellSelections;return generateCharacter(state);}

test("Oath-only spell records are explicit and excluded from the base Paladin catalog",()=>{
  assert.deepEqual(PALADIN_SPELLS_2014.filter(spell=>spell.oathOnly).map(spell=>spell.id).sort(),[...OATH_ONLY_2014].sort());
  assert.deepEqual(PALADIN_SPELLS_2024.filter(spell=>spell.oathOnly).map(spell=>spell.id).sort(),[...OATH_ONLY_2024].sort());
  assert.equal(PALADIN_SPELLS_2014.find(spell=>spell.id==="sanctuary")?.oathOnly,true);
  assert.equal(PALADIN_SPELLS_2024.find(spell=>spell.id==="beacon-of-hope")?.oathOnly,true);
});

test("2014 level-2 Paladin cannot prepare Devotion-only Sanctuary before taking the oath",()=>{
  assert.throws(()=>generated("2014",2,{prepared:["sanctuary"]}),/Illegal Paladin prepared-spell selection: sanctuary/);
});

test("normal Paladin preparation never consumes an Oath-only spell slot",()=>{
  for(const ruleset of ["2014","2024"])for(let i=0;i<100;i++){const c=generated(ruleset,20),oathOnly=new Set((ruleset==="2014"?PALADIN_SPELLS_2014:PALADIN_SPELLS_2024).filter(spell=>spell.oathOnly).map(spell=>spell.id));for(const id of c.spells.prepared.all)assert.equal(oathOnly.has(id),false,`${ruleset} normal preparation leaked Oath-only ${id}`);for(const id of oathOnly)assert.ok(c.spells.alwaysPrepared.includes(id),`${ruleset} Oath spell ${id} missing from always prepared`);}
});
