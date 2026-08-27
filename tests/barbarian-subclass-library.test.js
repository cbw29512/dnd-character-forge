import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";

const ORIGINALS=[
  {id:"iron-tempest",name:"Path of the Iron Tempest",features:[[3,"Driving Fury"],[6,"Unbroken Advance"],[10,"Steel Through the Gap"],[14,"Tempest Reprisal"]]},
  {id:"stoneheart",name:"Path of the Stoneheart",features:[[3,"Stonehide Rage"],[6,"Rooted Stance"],[10,"Weather the Blow"],[14,"The Mountain Remains"]]}
];

function barbarian(ruleset,subclass,level=20){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="barbarian";state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"soldier";return generateCharacter(state);
}

test("Barbarian picker catalog exposes Berserker plus two clearly labeled Forge originals in each edition",()=>{
  for(const [ruleset,data] of [["2014",FORGE_2014],["2024",FORGE_2024]]){
    const subclasses=data.subclasses.filter(item=>item.classId==="barbarian");assert.equal(subclasses.length,3,`${ruleset} Barbarian subclass count`);
    assert.equal(subclasses.find(item=>item.id==="berserker")?.name,"Path of the Berserker");
    for(const expected of ORIGINALS){const subclass=subclasses.find(item=>item.id===expected.id);assert.ok(subclass,`${ruleset} missing ${expected.id}`);assert.equal(subclass.contentKind,"forge-original");assert.equal(subclass.randomEligible,false);assert.match(subclass.displayName,/Forge Original/);}
  }
});

test("Forge-original Barbarian feature unlocks are exact at levels 3, 6, 10, and 14 in both editions",()=>{
  for(const ruleset of ["2014","2024"])for(const subclass of ORIGINALS)for(const [level,name] of subclass.features){
    const at=barbarian(ruleset,subclass.id,level),before=level===3?barbarian(ruleset,"random",2):barbarian(ruleset,subclass.id,level-1);
    assert.equal(at.validation.valid,true,`${ruleset} ${subclass.id} L${level} validation`);assert.ok(at.features.includes(name),`${ruleset} ${subclass.id} missing ${name} at L${level}`);assert.equal(before.features.includes(name),false,`${ruleset} ${subclass.id} gained ${name} early`);
    for(const [otherLevel,otherName] of subclass.features)if(otherLevel>level)assert.equal(at.features.includes(otherName),false,`${ruleset} ${subclass.id} gained ${otherName} early`);
  }
});

test("RAW Random Barbarian selection never silently opts into Forge-original subclasses",()=>{
  for(const ruleset of ["2014","2024"])for(let i=0;i<120;i++){
    const c=barbarian(ruleset,"random",20);assert.equal(c.validation.valid,true);assert.equal(c.subclass?.id,"berserker",`${ruleset} Random selected non-SRD subclass`);assert.equal(c.audit.rawIntegrity,true,`${ruleset} Random lost RAW integrity`);
  }
});

test("Forge-original Barbarian references and print model are complete without pretending to be SRD",()=>{
  for(const ruleset of ["2014","2024"])for(const subclass of ORIGINALS){
    const c=barbarian(ruleset,subclass.id),refs=buildQuickReference(c),model=buildPremiumPrintModel(c);assert.equal(c.validation.valid,true);assert.equal(c.subclass.name,subclass.name);assert.equal(model.identity.subclassName,subclass.name);assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,false);assert.match(c.audit.license,/Character Forge Original/);assert.match(c.audit.scope,/official non-SRD D&D subclasses are not reproduced/i);
    const subclassAudit=c.audit.mechanics.find(item=>item.label==="Subclass");assert.equal(subclassAudit.source.version,"Character Forge Original");
    for(const [,name] of subclass.features){const ref=refs.find(item=>item.name===name);assert.ok(ref,`${ruleset} ${subclass.id} missing reference ${name}`);assert.equal(ref.source.version,"Character Forge Original");assert.ok(ref.text.length>40,`${name} reference too thin`);}
    assert.equal(model.classUtility.title,"Primal Fury");
  }
});

test("SRD Berserker remains RAW after the subclass expansion",()=>{
  for(const ruleset of ["2014","2024"]){const c=barbarian(ruleset,"berserker");assert.equal(c.validation.valid,true);assert.equal(c.audit.rawIntegrity,true);assert.equal(c.audit.mechanics.find(item=>item.label==="Subclass")?.source.version,ruleset==="2014"?"SRD 5.1":"SRD 5.2.1");}
});
