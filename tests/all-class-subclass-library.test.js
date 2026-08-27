import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { FORGE_ORIGINAL_SUBCLASSES_2014, FORGE_ORIGINAL_SUBCLASSES_2024, originalSubclassFeatureRecordsFor } from "../src/data/original-subclasses.js";

const DATA={"2014":FORGE_2014,"2024":FORGE_2024};
const ORIGINALS={"2014":FORGE_ORIGINAL_SUBCLASSES_2014,"2024":FORGE_ORIGINAL_SUBCLASSES_2024};
const SCHEDULES=Object.freeze({
  bard:Object.freeze({"2014":[3,3,6,14],"2024":[3,3,6,14]}),
  cleric:Object.freeze({"2014":[1,2,6,8,17],"2024":[3,3,6,17]}),
  druid:Object.freeze({"2014":[2,6,10,14],"2024":[3,6,10,14]}),
  fighter:Object.freeze({"2014":[3,7,10,15,18],"2024":[3,7,10,15,18]}),
  monk:Object.freeze({"2014":[3,6,11,17],"2024":[3,6,11,17]}),
  paladin:Object.freeze({"2014":[3,3,7,15,20],"2024":[3,3,7,15,20]}),
  ranger:Object.freeze({"2014":[3,7,11,15],"2024":[3,7,11,15]}),
  rogue:Object.freeze({"2014":[3,3,9,13,17],"2024":[3,3,9,13,17]}),
  sorcerer:Object.freeze({"2014":[1,6,14,18],"2024":[3,6,14,18]}),
  warlock:Object.freeze({"2014":[1,6,10,14],"2024":[3,6,10,14]}),
  wizard:Object.freeze({"2014":[2,6,10,14],"2024":[3,6,10,14]})
});

function generate(ruleset,classId,subclassId,level=20){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class=classId;state.constraints.subclass=subclassId;state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"soldier";return generateCharacter(state);
}

test("every supported class exposes at least three subclass choices in both editions",()=>{
  for(const ruleset of ["2014","2024"]){
    const data=DATA[ruleset];assert.equal(data.classes.length,12,`${ruleset} class count`);
    for(const cls of data.classes){const subclasses=data.subclasses.filter(item=>item.classId===cls.id);assert.ok(subclasses.length>=3,`${ruleset} ${cls.name} has only ${subclasses.length} subclass option(s)`);}
  }
});

test("every non-Barbarian class receives exactly two clearly labeled Forge-original options",()=>{
  for(const ruleset of ["2014","2024"]){
    const originals=ORIGINALS[ruleset];assert.equal(originals.length,22,`${ruleset} original subclass count`);
    for(const cls of DATA[ruleset].classes.filter(item=>item.id!=="barbarian")){
      const classOriginals=originals.filter(item=>item.classId===cls.id);assert.equal(classOriginals.length,2,`${ruleset} ${cls.name} original count`);
      for(const subclass of classOriginals){assert.equal(subclass.level,cls.subclassLevel,`${ruleset} ${subclass.name} unlock`);assert.equal(subclass.contentKind,"forge-original");assert.equal(subclass.randomEligible,false);assert.match(subclass.displayName,/Forge Original/);}
    }
  }
});

test("original subclass feature schedules match each class and edition cadence",()=>{
  for(const ruleset of ["2014","2024"])for(const subclass of ORIGINALS[ruleset]){
    const records=originalSubclassFeatureRecordsFor(ruleset,subclass.classId,20,subclass.id),actual=records.map(record=>record.level),expected=SCHEDULES[subclass.classId][ruleset];assert.deepEqual(actual,expected,`${ruleset} ${subclass.id} feature cadence`);
    const atUnlock=originalSubclassFeatureRecordsFor(ruleset,subclass.classId,subclass.level,subclass.id);assert.ok(atUnlock.length>=1,`${ruleset} ${subclass.id} has no unlock feature`);assert.ok(atUnlock.every(record=>record.level<=subclass.level));
  }
});

test("every original subclass generates valid characters at unlock and level 20 with complete references and source-safe audit",()=>{
  for(const ruleset of ["2014","2024"])for(const subclass of ORIGINALS[ruleset])for(const level of [...new Set([subclass.level,20])]){
    const c=generate(ruleset,subclass.classId,subclass.id,level),records=originalSubclassFeatureRecordsFor(ruleset,subclass.classId,level,subclass.id),refs=buildQuickReference(c),model=buildPremiumPrintModel(c);
    assert.equal(c.validation.valid,true,`${ruleset} ${subclass.id} L${level} validation`);assert.equal(c.subclass.id,subclass.id);assert.equal(c.subclass.name,subclass.name);assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,false);assert.match(c.audit.license,/Character Forge Original/);assert.match(c.audit.scope,/official non-SRD D&D subclasses are not reproduced/i);assert.equal(c.audit.mechanics.find(item=>item.label==="Subclass")?.source.version,"Character Forge Original");assert.equal(model.identity.subclassName,subclass.name);
    for(const record of records){assert.ok(c.features.includes(record.name),`${ruleset} ${subclass.id} L${level} missing ${record.name}`);const ref=refs.find(item=>item.name===record.name);assert.ok(ref,`${ruleset} ${subclass.id} missing reference ${record.name}`);assert.equal(ref.source.version,"Character Forge Original");assert.ok(ref.text.length>45,`${record.name} reference too thin`);}
    for(const future of originalSubclassFeatureRecordsFor(ruleset,subclass.classId,20,subclass.id).filter(record=>record.level>level))assert.equal(c.features.includes(future.name),false,`${ruleset} ${subclass.id} gained ${future.name} early`);
  }
});

test("default Random generation remains SRD-only for every class after library expansion",()=>{
  for(const ruleset of ["2014","2024"])for(const cls of DATA[ruleset].classes)for(let i=0;i<12;i++){
    const c=generate(ruleset,cls.id,"random",20);assert.equal(c.validation.valid,true,`${ruleset} ${cls.name} Random validation`);assert.ok(c.subclass,`${ruleset} ${cls.name} Random lost subclass at L20`);assert.notEqual(c.subclass.contentKind,"forge-original",`${ruleset} ${cls.name} Random selected ${c.subclass.name}`);assert.equal(c.audit.rawIntegrity,true,`${ruleset} ${cls.name} SRD Random lost RAW integrity`);
  }
});