import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { MASTERY_REFERENCE } from "../src/data/quick-reference.js";
import { entityProvenance, referenceProvenance } from "../src/data/rule-provenance.js";

const EXPECTED_ENTITIES={
  "2014":{species:{human:"5"},background:{acolyte:"61"},class:{fighter:"24",wizard:"52",cleric:"15"},subclass:{champion:"25","school-evocation":"54","life-domain":"17"}},
  "2024":{species:{dragonborn:"84",dwarf:"84",elf:"84",gnome:"85",goliath:"85",halfling:"86",human:"86",orc:"86",tiefling:"86"},background:{criminal:"83",soldier:"83"},class:{fighter:"47",wizard:"77",cleric:"36"},subclass:{champion:"49",evoker:"82","life-domain":"40"}}
};
const CLASSES={"2014":["fighter","wizard","cleric"],"2024":["fighter","wizard","cleric"]};
const SRD_BACKGROUND=Object.freeze({"2014":"acolyte","2024":"criminal"});

function fixedCharacter(ruleset,classId,level="5"){
  try{const state=createInitialState();state.ruleset=ruleset;state.constraints.level=level;state.constraints.class=classId;state.constraints.background=SRD_BACKGROUND[ruleset];return generateCharacter(state);}
  catch(error){console.error(`[test] fixed ${ruleset} ${classId} character`,error);throw error;}
}

test("verified launch entities have exact SRD printed-page provenance",()=>{
  try{for(const [ruleset,kinds] of Object.entries(EXPECTED_ENTITIES))for(const [kind,entries] of Object.entries(kinds))for(const [id,page] of Object.entries(entries)){const source=entityProvenance(ruleset,kind,id);assert.equal(source.page,page);assert.equal(source.version,ruleset==="2014"?"SRD 5.1":"SRD 5.2.1");assert.match(source.pdfUrl,/\.pdf$/);}}
  catch(error){console.error("[test] entity provenance",error);throw error;}
});

test("every rendered play reference in the verified class matrix has provenance",()=>{
  try{for(const ruleset of Object.keys(CLASSES))for(const classId of CLASSES[ruleset])for(let i=0;i<60;i++){const character=fixedCharacter(ruleset,classId);const items=buildQuickReference(character);assert.ok(items.length>0);for(const item of items){assert.ok(item.source?.version,`${ruleset} ${classId} ${item.name} missing source version`);assert.ok(item.source?.page,`${ruleset} ${classId} ${item.name} missing source page`);assert.match(item.source.pdfUrl,/\.pdf$/);}}}
  catch(error){console.error("[test] play-reference provenance matrix",error);throw error;}
});

test("rules audit mechanics all carry verified source locators",()=>{
  try{for(const ruleset of Object.keys(CLASSES))for(const classId of CLASSES[ruleset]){const character=fixedCharacter(ruleset,classId);assert.equal(character.audit.status,"PASS");for(const mechanic of character.audit.mechanics){assert.ok(mechanic.source?.version,`${mechanic.label} missing source version`);assert.ok(mechanic.source?.page,`${mechanic.label} missing source page`);assert.match(mechanic.source.pdfUrl,/\.pdf$/);}}}
  catch(error){console.error("[test] audit mechanic provenance",error);throw error;}
});

test("2024 Weapon Mastery references point to SRD 5.2.1 printed page 90",()=>{
  try{const character=fixedCharacter("2024","fighter");for(const item of buildQuickReference(character).filter(entry=>entry.id.startsWith("mastery:"))){assert.equal(item.source.version,"SRD 5.2.1");assert.equal(item.source.page,"90");}}
  catch(error){console.error("[test] mastery provenance",error);throw error;}
});

test("every shared 2024 Weapon Mastery reference has fail-closed provenance",()=>{
  try{
    const character=fixedCharacter("2024","fighter");
    for(const masteryName of Object.keys(MASTERY_REFERENCE)){
      const source=referenceProvenance(character,"mastery",masteryName);
      assert.equal(source.version,"SRD 5.2.1",`${masteryName} has the wrong source version`);
      assert.equal(source.page,"90",`${masteryName} has the wrong printed-page provenance`);
      assert.match(source.pdfUrl,/\.pdf$/);
    }
  }catch(error){console.error("[test] shared mastery provenance completeness",error);throw error;}
});

test("2014 class-specific Ability Score Improvement citations stay class-correct",()=>{
  try{const expected={fighter:"25",wizard:"53",cleric:"17"};for(const [classId,page] of Object.entries(expected)){const character=fixedCharacter("2014",classId,"4");const source=referenceProvenance(character,"feature","Ability Score Improvement");assert.equal(source.page,page);}}
  catch(error){console.error("[test] 2014 ASI provenance",error);throw error;}
});

test("unknown rules cannot receive invented provenance",()=>{
  try{const character=fixedCharacter("2024","fighter");assert.throws(()=>referenceProvenance(character,"feature","Imaginary Rule"),/Missing reference provenance/);assert.throws(()=>entityProvenance("2024","class","imaginary-class"),/Missing entity provenance/);}
  catch(error){console.error("[test] provenance fail closed",error);throw error;}
});
