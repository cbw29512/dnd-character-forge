import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { BARD_SPELLS_2024 } from "../src/data/bard-spells.js";
import { CLERIC_SPELLS_2024 } from "../src/data/cleric-spells.js";
import { DRUID_SPELLS_2024 } from "../src/data/druid-spells.js";
import { SORCERER_SPELLS_2024 } from "../src/data/sorcerer-spells.js";
import { WARLOCK_SPELLS_2024 } from "../src/data/warlock-spells.js";
import { WIZARD_SPELLS_2024 } from "../src/data/wizard-spells.js";
import { SPELL_REFERENCE_2024 } from "../src/data/spell-reference-2024.js";
import { generateCharacter } from "../src/rules/generator.js";
import { characterCantripReferences, getSpellReference, resolveCantripReference } from "../src/rules/spell-reference.js";

const WIZARD_SRD=["acid-splash","chill-touch","dancing-lights","elementalism","fire-bolt","light","mage-hand","mending","message","minor-illusion","poison-spray","prestidigitation","ray-of-frost","shocking-grasp","true-strike"].sort();
const CLERIC_SRD=["guidance","light","mending","resistance","sacred-flame","spare-the-dying","thaumaturgy"].sort();
const SUPPORTED_2024_CASTER_LISTS=[BARD_SPELLS_2024,CLERIC_SPELLS_2024,DRUID_SPELLS_2024,SORCERER_SPELLS_2024,WARLOCK_SPELLS_2024,WIZARD_SPELLS_2024];
const SUPPORTED_2024_CASTER_IDS=["bard","cleric","druid","sorcerer","warlock","wizard"];
const cantripIds=spells=>spells.filter(spell=>spell.level===0).map(spell=>spell.id).sort(),cantripReferences=SPELL_REFERENCE_2024.filter(spell=>spell.level===0);
const catalogIds=[...new Set(SUPPORTED_2024_CASTER_LISTS.flatMap(spells=>spells.filter(spell=>spell.level===0).map(spell=>spell.id)))].sort(),referenceIds=cantripReferences.map(spell=>spell.id).sort();
function make(classId,level){const state=createInitialState();state.ruleset="2024";state.constraints.class=classId;state.constraints.level=String(level);return generateCharacter(state);}
test("2024 Wizard and Cleric cantrip pools exactly match their SRD 5.2.1 class lists",()=>{try{assert.deepEqual(cantripIds(WIZARD_SPELLS_2024),WIZARD_SRD);assert.deepEqual(cantripIds(CLERIC_SPELLS_2024),CLERIC_SRD);assert.ok(WIZARD_SRD.includes("elementalism"));assert.equal(WIZARD_SRD.includes("thunderclap"),false);}catch(error){console.error("[test] SRD cantrip class lists",error);throw error;}});
test("every unique supported 2024 full-caster cantrip has exactly one SRD reference",()=>{try{assert.deepEqual(referenceIds,catalogIds);for(const id of catalogIds)assert.equal(cantripReferences.filter(spell=>spell.id===id).length,1,`${id} should have exactly one SRD reference`);assert.equal(new Set(referenceIds).size,referenceIds.length);}catch(error){console.error("[test] cantrip reference coverage",error);throw error;}});
test("all 2024 cantrip references carry structured playable metadata and source pages",()=>{try{for(const spell of cantripReferences){assert.equal(spell.level,0);assert.equal(spell.source,"SRD 5.2.1");assert.ok(Number.isInteger(spell.srdPage)&&spell.srdPage>=107&&spell.srdPage<=172);for(const key of ["name","school","castingTime","range","components","duration","resolution","effect"])assert.ok(spell[key],`${spell.id} missing ${key}`);assert.ok(spell.effect.length>=25);}}catch(error){console.error("[test] cantrip metadata",error);throw error;}});
test("only Dancing Lights, Guidance, and Resistance require Concentration among supported cantrips",()=>{try{const ids=cantripReferences.filter(spell=>spell.concentration).map(spell=>spell.id).sort();assert.deepEqual(ids,["dancing-lights","guidance","resistance"]);}catch(error){console.error("[test] cantrip concentration",error);throw error;}});
test("level 5 cantrip damage and special scaling resolve at current character level",()=>{try{const wizard=make("wizard",5),cleric=make("cleric",5);for(const [id,text] of [["acid-splash","2d6 Acid"],["fire-bolt","2d10 Fire"],["poison-spray","2d12 Poison"],["ray-of-frost","2d8 Cold"],["shocking-grasp","2d8 Lightning"],["sacred-flame","2d8 Radiant"]]){const c=id==="sacred-flame"?cleric:wizard;assert.match(resolveCantripReference(c,id).currentEffect,new RegExp(text));}assert.equal(resolveCantripReference(cleric,"spare-the-dying").range,"30 ft");assert.match(resolveCantripReference(wizard,"true-strike").currentEffect,/1d6 Radiant/);}catch(error){console.error("[test] level 5 cantrip scaling",error);throw error;}});
test("level 1 cantrips keep base scaling",()=>{try{const wizard=make("wizard",1),cleric=make("cleric",1);assert.match(resolveCantripReference(wizard,"fire-bolt").currentEffect,/1d10 Fire/);assert.equal(resolveCantripReference(cleric,"spare-the-dying").range,"15 ft");assert.match(resolveCantripReference(wizard,"true-strike").currentEffect,/no extra cantrip damage/);}catch(error){console.error("[test] level 1 cantrip scaling",error);throw error;}});
test("generated 2024 full-caster cantrips always resolve to references",()=>{try{for(const classId of SUPPORTED_2024_CASTER_IDS)for(let level=1;level<=5;level++)for(let i=0;i<20;i++){const c=make(classId,level),refs=characterCantripReferences(c);assert.equal(refs.length,c.spells.cantrips.all.length);for(const ref of refs)assert.ok(getSpellReference("2024",ref.id));}}catch(error){console.error("[test] generated cantrip references",error);throw error;}});
