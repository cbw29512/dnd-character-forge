import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { FORGE_ORIGINAL_BACKGROUNDS_2014, FORGE_ORIGINAL_BACKGROUNDS_2024, isForgeOriginalBackground } from "../src/data/original-backgrounds.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { buildNarrativeDossier } from "../src/print/dossier.js";
import { ORIGINAL_BACKGROUND_DOSSIER } from "../src/print/original-background-dossier.js";

const EXPECTED_IDS=["bounty-hunter","caravan-guard","grave-warden","hedge-mage","monster-hunter","pit-fighter","royal-envoy","deep-sailor","field-medic","treasure-seeker","wilderness-guide","watchman"];

function characterAt(ruleset,background,{subclass="champion"}={}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level="5";state.constraints.species=ruleset==="2014"?"human":"dwarf";state.constraints.class="fighter";state.constraints.subclass=subclass;state.constraints.background=background;state.constraints.name=`Background ${background}`;return generateCharacter(state);
}

test("official SRD background catalogs remain untouched",()=>{
  assert.deepEqual(RAW_2014.backgrounds.map(item=>item.id),["acolyte"]);
  assert.deepEqual(RAW_2024.backgrounds.map(item=>item.id),["acolyte","criminal","sage","soldier"]);
});

test("Forge exposes twelve additional source-labeled backgrounds in each edition",()=>{
  assert.deepEqual(FORGE_ORIGINAL_BACKGROUNDS_2014.map(item=>item.id),EXPECTED_IDS);
  assert.deepEqual(FORGE_ORIGINAL_BACKGROUNDS_2024.map(item=>item.id),EXPECTED_IDS);
  assert.equal(FORGE_2014.backgrounds.length,RAW_2014.backgrounds.length+EXPECTED_IDS.length);
  assert.equal(FORGE_2024.backgrounds.length,RAW_2024.backgrounds.length+EXPECTED_IDS.length);
  for(const background of [...FORGE_ORIGINAL_BACKGROUNDS_2014,...FORGE_ORIGINAL_BACKGROUNDS_2024]){
    assert.equal(background.contentKind,"forge-original");assert.equal(background.randomEligible,false);assert.match(background.displayName,/Forge Original/);assert.equal(background.source.version,"Character Forge Original");
  }
});

test("every 2014 original background generates validated mechanics, references, audit, print, and dossier identity",()=>{
  for(const background of FORGE_ORIGINAL_BACKGROUNDS_2014){
    const character=characterAt("2014",background.id),refs=buildQuickReference(character),model=buildPremiumPrintModel(character),dossier=buildNarrativeDossier(character);
    assert.equal(character.validation.valid,true,background.id);assert.equal(character.audit.status,"PASS",background.id);assert.equal(character.audit.rawIntegrity,false,background.id);assert.match(character.audit.license,/Character Forge Original/);assert.match(character.audit.scope,/official non-SRD D&D material is not reproduced/i);
    for(const skill of background.skills)assert.ok(character.skills.includes(skill),`${background.id}: ${skill}`);
    for(const tool of background.tools||[])assert.ok(character.toolProficiencies.includes(tool),`${background.id}: ${tool}`);
    assert.deepEqual(character.backgroundEquipment,background.equipment);
    const feature=refs.find(item=>item.id===`background:${background.feature}`);assert.ok(feature,`${background.id}: missing feature reference`);assert.equal(feature.source.version,"Character Forge Original");
    const auditBackground=character.audit.mechanics.find(item=>item.label==="Background");assert.match(auditBackground.value,/Forge Original/);assert.equal(auditBackground.source.version,"Character Forge Original");
    assert.equal(model.identity.background,background.name);assert.equal(model.audit.rawIntegrity,false);assert.ok(model.ruleIndex.some(item=>item.name===background.feature),`${background.id}: print rules index missing background feature`);
    assert.ok(ORIGINAL_BACKGROUND_DOSSIER[background.id],`${background.id}: dossier identity missing`);assert.match(dossier.subtitle,new RegExp(background.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
});

test("every 2024 original background generates legal Origin-feat, tool, equipment, audit, and print state",()=>{
  for(const background of FORGE_ORIGINAL_BACKGROUNDS_2024){
    const character=characterAt("2024",background.id),refs=buildQuickReference(character),model=buildPremiumPrintModel(character),dossier=buildNarrativeDossier(character);
    assert.equal(character.validation.valid,true,background.id);assert.equal(character.audit.status,"PASS",background.id);assert.equal(character.audit.rawIntegrity,false,background.id);assert.match(character.audit.license,/Character Forge Original/);
    for(const skill of background.skills)assert.ok(character.skills.includes(skill),`${background.id}: ${skill}`);
    assert.ok(character.toolProficiencies.includes(background.tool),`${background.id}: ${background.tool}`);assert.ok(character.feats.some(feat=>feat.id===background.feat),`${background.id}: ${background.feat}`);assert.deepEqual(character.backgroundEquipment,background.equipment);
    if(background.magicInitiateList){assert.ok(character.magicInitiate,`${background.id}: Magic Initiate missing`);assert.equal(character.magicInitiate.spellList,background.magicInitiateList);assert.equal(character.backgroundChoices.cantrip1,character.magicInitiate.cantrips[0]);}
    const auditBackground=character.audit.mechanics.find(item=>item.label==="Background");assert.match(auditBackground.value,/Forge Original/);assert.equal(auditBackground.source.version,"Character Forge Original");
    assert.equal(model.identity.background,background.name);assert.equal(model.audit.rawIntegrity,false);assert.ok(refs.some(item=>item.name===character.feats.find(feat=>feat.id===background.feat)?.name),`${background.id}: Origin feat reference missing`);assert.match(dossier.subtitle,new RegExp(background.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
  }
});

test("default Random generation remains SRD-only for backgrounds",()=>{
  for(const ruleset of ["2014","2024"]){for(let index=0;index<160;index++){
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level="5";state.constraints.species=ruleset==="2014"?"human":"dwarf";state.constraints.class="fighter";state.constraints.subclass="champion";state.constraints.background="random";const character=generateCharacter(state);assert.equal(isForgeOriginalBackground(character.background),false,`${ruleset} Random selected ${character.background.id}`);assert.equal(character.audit.rawIntegrity,true,`${ruleset} SRD-only Random lost RAW integrity`);
  }}
});

test("original background and original subclass can coexist without source leakage",()=>{
  for(const ruleset of ["2014","2024"]){
    const data=ruleset==="2014"?FORGE_2014:FORGE_2024,subclass=data.subclasses.find(item=>item.classId==="fighter"&&item.contentKind==="forge-original");assert.ok(subclass,`${ruleset}: Fighter original subclass missing`);
    const character=characterAt(ruleset,"bounty-hunter",{subclass:subclass.id}),refs=buildQuickReference(character);
    assert.equal(character.validation.valid,true);assert.equal(character.audit.rawIntegrity,false);assert.match(character.audit.license,/Character Forge Original/);assert.ok(character.audit.mechanics.some(item=>item.label==="Background"&&item.source.version==="Character Forge Original"));assert.ok(character.audit.mechanics.some(item=>item.label==="Subclass"&&item.source.version==="Character Forge Original"));assert.ok(refs.some(item=>item.id.startsWith("feature:")&&item.source?.version==="Character Forge Original"));
  }
});
