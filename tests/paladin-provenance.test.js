import test from "node:test";
import assert from "node:assert/strict";
import { paladinEntityProvenance, paladinReferenceProvenance } from "../src/data/paladin-provenance.js";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";

function paladin(ruleset,style){const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="paladin";state.constraints.subclass="oath-devotion";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"soldier";state.classSelections={fightingStyle:style};return generateCharacter(state);}

test("Paladin class, subclass, and spell-list entities use exact SRD printed pages",()=>{
  assert.equal(paladinEntityProvenance("2014","class").page,"30–32");assert.equal(paladinEntityProvenance("2014","subclass").page,"32–33");assert.equal(paladinEntityProvenance("2014","spells").page,"108–109");
  assert.equal(paladinEntityProvenance("2024","class").page,"53–55");assert.equal(paladinEntityProvenance("2024","subclass").page,"56–57");assert.equal(paladinEntityProvenance("2024","spells").page,"55–56");
});

test("every encoded Paladin Fighting Style has verified provenance",()=>{
  const styles={"2014":["Defense","Dueling","Great Weapon Fighting","Protection"],"2024":["Archery","Defense","Great Weapon Fighting","Two-Weapon Fighting","Blessed Warrior"]};
  for(const ruleset of ["2014","2024"]){const c=paladin(ruleset,ruleset==="2014"?"defense":"defense");for(const name of styles[ruleset]){const source=paladinReferenceProvenance(c,"style",name);assert.equal(source.version,ruleset==="2014"?"SRD 5.1":"SRD 5.2.1");assert.ok(source.page);}}
});

test("every rendered level-20 Paladin play reference is sourced and edition-correct",()=>{
  for(const [ruleset,style] of [["2014","protection"],["2024","blessed-warrior"]]){const c=paladin(ruleset,style),refs=buildQuickReference(c);assert.ok(refs.length>20);for(const item of refs){assert.ok(item.source?.version,`${ruleset} ${item.name} missing source version`);assert.ok(item.source?.page,`${ruleset} ${item.name} missing source page`);assert.match(item.source.pdfUrl,/\.pdf$/);}if(ruleset==="2024"){assert.ok(refs.some(item=>item.name==="Boon of Truesight"&&item.source.page==="88"));assert.ok(refs.some(item=>item.name==="Blessed Warrior"&&item.source.page==="54"));}}
});
