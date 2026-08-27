import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { ADVANCEMENT_OPTIONS_2014, ADVANCEMENT_OPTIONS_2024, advancementFeatReference, isForgeOriginalFeat } from "../src/data/feat-library.js";
import { advancementLevelsFor, validateClassAdvancements } from "../src/rules/advancement-feats.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";
import { buildQuickReference } from "../src/rules/reference-router.js";

const ORIGINAL_IDS=["heavy-hand","fleet-vanguard","iron-constitution","field-scholar","resolute-spirit","commanding-presence"];

test("advancement catalogs expose ASI, SRD Grappler, and six source-labeled Forge originals",()=>{
  for(const catalog of [ADVANCEMENT_OPTIONS_2014,ADVANCEMENT_OPTIONS_2024]){
    assert.equal(catalog[0].id,"asi");assert.equal(catalog.some(item=>item.id==="grappler"&&item.contentKind==="official-srd"),true);
    const originals=catalog.filter(isForgeOriginalFeat);assert.deepEqual(originals.map(item=>item.id),ORIGINAL_IDS);assert.ok(originals.every(item=>item.randomEligible===false&&item.displayName.endsWith("— Forge Original")));
  }
});

test("default class advancements preserve automatic ASI behavior and RAW integrity",()=>{
  for(const ruleset of ["2014","2024"]){const s=baseState(ruleset,"fighter",20);const c=generateCharacter(s),levels=advancementLevelsFor(c.class,c.level);assert.equal(c.classAdvancements.length,levels.length);assert.ok(c.classAdvancements.every(record=>record.optionId==="asi"&&record.kind==="asi"));assert.equal(c.feats.some(feat=>feat.advancementFeat),false);assert.equal(c.audit.rawIntegrity,true);assert.deepEqual(validateClassAdvancements(c),[]);}
});

test("2014 SRD Grappler consumes the ASI slot without adding an ability point and remains RAW",()=>{
  const s=baseState("2014","barbarian",4);s.classSelections.advancements=["grappler"];const c=generateCharacter(s),record=c.classAdvancements[0];assert.equal(record.optionId,"grappler");assert.equal(c.abilities.str,c.advancementBaseAbilities.str);assert.ok(c.feats.some(feat=>feat.id==="grappler"&&feat.advancementFeat));assert.equal(c.audit.rawIntegrity,true);const ref=buildQuickReference(c).find(item=>item.id==="feat:grappler");assert.equal(ref.source.version,"SRD 5.1");assert.equal(ref.source.page,"75");assert.deepEqual(validateClassAdvancements(c),[]);
});

test("2024 SRD Grappler applies its legal +1 STR/DEX increase and remains RAW",()=>{
  const s=baseState("2024","barbarian",4);s.constraints.background="soldier";s.classSelections.advancements=["grappler"];const c=generateCharacter(s),record=c.classAdvancements[0];assert.equal(record.optionId,"grappler");assert.ok(["str","dex"].includes(record.appliedAbility));assert.equal(c.abilities[record.appliedAbility],Math.min(20,c.advancementBaseAbilities[record.appliedAbility]+1));assert.equal(c.audit.rawIntegrity,true);const ref=buildQuickReference(c).find(item=>item.id==="feat:grappler");assert.equal(ref.source.version,"SRD 5.2.1");assert.equal(ref.source.page,"87");assert.deepEqual(validateClassAdvancements(c),[]);
});

test("every Forge-original advancement feat generates in both editions with compatible provenance",()=>{
  for(const ruleset of ["2014","2024"]){for(const id of ORIGINAL_IDS){const s=baseState(ruleset,"fighter",4);if(ruleset==="2024")s.constraints.background="soldier";s.classSelections.advancements=[id];const c=generateCharacter(s),feat=c.feats.find(item=>item.id===id),record=c.classAdvancements[0],ref=buildQuickReference(c).find(item=>item.id===`feat:${id}`);assert.ok(feat,`${ruleset} ${id}: feat missing`);assert.equal(record.contentKind,"forge-original");assert.equal(c.audit.rawIntegrity,false);assert.match(c.audit.license,/Character Forge Original/);assert.equal(ref.source.version,"Character Forge Original");assert.equal(ref.category,"Forge Original Feat");assert.deepEqual(validateClassAdvancements(c),[]);}}
});

test("Forge-original feat effects alter the generated character rather than existing as labels only",()=>{
  const fleetState=baseState("2024","fighter",4);fleetState.constraints.background="soldier";fleetState.classSelections.advancements=["fleet-vanguard"];const fleet=generateCharacter(fleetState);assert.equal(fleet.advancementSpeedBonus,5);assert.equal(fleet.speed>=35,true);assert.equal(fleet.abilities.dex,Math.min(20,fleet.advancementBaseAbilities.dex+1));
  const scholarState=baseState("2014","wizard",4);scholarState.classSelections.advancements=["field-scholar"];const scholar=generateCharacter(scholarState),record=scholar.classAdvancements[0];assert.ok(record.grantedSkill);assert.ok(scholar.skills.includes(record.grantedSkill));assert.equal(record.grantedTool,"Cartographer's Tools");assert.ok(scholar.toolProficiencies.includes("Cartographer's Tools"));assert.equal(scholar.abilities.int,Math.min(20,scholar.advancementBaseAbilities.int+1));
});

test("nonrepeatable advancement feats cannot be selected twice",()=>{
  const s=baseState("2024","fighter",6);s.constraints.background="soldier";s.classSelections.advancements=["fleet-vanguard","fleet-vanguard"];assert.throws(()=>generateCharacter(s),/cannot be taken more than once/i);
});

test("extra Fighter and Rogue advancement levels are exposed as independent indexed UI slots",()=>{
  const fighter=createInitialState();fighter.ruleset="2024";fighter.constraints.class="fighter";fighter.constraints.level="6";const fighterFields=classChoiceFieldsForState(fighter).filter(field=>field.key==="advancements");assert.deepEqual(fighterFields.map(field=>field.label),["Advancement — Level 4","Advancement — Level 6"]);assert.ok(fighterFields.every(field=>field.defaultLabel==="Automatic ASI"));
  const rogue=createInitialState();rogue.ruleset="2024";rogue.constraints.class="rogue";rogue.constraints.level="10";const rogueFields=classChoiceFieldsForState(rogue).filter(field=>field.key==="advancements");assert.deepEqual(rogueFields.map(field=>field.label),["Advancement — Level 4","Advancement — Level 8","Advancement — Level 10"]);
});

test("selected advancement feats survive character-to-state restoration",()=>{
  const s=baseState("2024","fighter",8);s.constraints.background="soldier";s.classSelections.advancements=[null,"resolute-spirit"];const c=generateCharacter(s),restored=classSelectionsFromCharacter(c);assert.deepEqual(restored.advancements,[null,"resolute-spirit"]);
});

test("every advancement feat has a complete printable quick-reference record",()=>{
  for(const catalog of [ADVANCEMENT_OPTIONS_2014,ADVANCEMENT_OPTIONS_2024])for(const feat of catalog.filter(item=>item.kind==="feat")){const ref=advancementFeatReference(feat);assert.ok(ref.name&&ref.text&&ref.timing&&ref.source.version&&ref.source.page);}
});

function baseState(ruleset,classId,level){const s=createInitialState();s.ruleset=ruleset;s.constraints.level=String(level);s.constraints.class=classId;s.constraints.species="human";s.constraints.background="acolyte";return s;}
