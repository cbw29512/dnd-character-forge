import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function devotion(classSelections={}){try{const state=createInitialState();state.ruleset="2024";state.constraints.level="20";state.constraints.class="paladin";state.constraints.subclass="oath-devotion";state.constraints.species="human";state.constraints.background="soldier";state.classSelections=classSelections;return generateCharacter(state);}catch(error){console.error("[test] 2024 Devotion Paladin generation failed",error);throw error;}}

test("2024 level-20 Devotion Paladin uses revised progression and no legacy leakage",()=>{
  const c=devotion({fightingStyle:"defense"}),p=c.paladin;assert.equal(c.validation.valid,true);assert.equal(p.layOnHandsPool,100);assert.equal(p.masteryCount,2);assert.equal(c.masteryIds.length,2);assert.equal(new Set(c.masteryIds).size,2);assert.equal(p.channelDivinityUses,3);assert.equal(p.attacksPerAction,2);assert.equal(p.auraRange,30);assert.equal(p.radiantStrikes,true);assert.equal(p.restoringTouch,true);assert.equal(p.smiteOfProtection,true);assert.equal(p.holyNimbus,true);assert.ok(c.feats.some(feat=>feat.id==="boon-truesight"));
  assert.ok(c.features.includes("Paladin’s Smite"));assert.ok(c.features.includes("Weapon Mastery — Paladin"));assert.ok(c.features.includes("Faithful Steed"));assert.ok(c.features.includes("Abjure Foes"));assert.ok(c.features.includes("Radiant Strikes"));assert.ok(c.features.includes("Restoring Touch"));assert.ok(c.features.includes("Smite of Protection"));assert.equal(c.features.includes("Divine Smite"),false);assert.equal(c.features.includes("Improved Divine Smite"),false);assert.equal(c.features.includes("Turn the Unholy"),false);assert.deepEqual(c.spells.slots,{1:4,2:3,3:3,4:3,5:2});assert.equal(c.spells.prepared.all.length,15);assert.equal(c.spells.alwaysPrepared.length,12);assert.ok(c.spells.alwaysPrepared.includes("divine-smite"));assert.ok(c.spells.alwaysPrepared.includes("find-steed"));
});

test("2024 Paladin references, provenance, masteries, and two-page print model are complete",()=>{
  const c=devotion({fightingStyle:"defense"}),refs=buildQuickReference(c),model=buildPremiumPrintModel(c);for(const item of refs){assert.ok(item.source?.version,`${item.name} missing source`);assert.ok(item.source?.page,`${item.name} missing page`);}for(const mastery of refs.filter(item=>item.id.startsWith("mastery:")))assert.equal(mastery.source.page,"90");assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,true);assert.equal(model.packet.totalPages,2);assert.equal(model.classUtility.title,"Sacred Charge");assert.equal(model.spellPage.entries.length,27);assert.match(model.spellPage.source,/Paladin spell list pp\.55–56/);assert.ok(model.proficiencies.masteries.includes("Longsword — Sap"));assert.ok(model.proficiencies.masteries.includes("Javelin — Slow"));assert.ok(model.ruleIndex.some(item=>item.name==="Boon of Truesight"));assert.ok(model.ruleIndex.some(item=>item.name==="Holy Nimbus"));
});

test("2024 Paladin mastery choices remain exactly two distinct equipped legal weapons across random generations",()=>{
  for(let i=0;i<200;i++){const c=devotion({fightingStyle:"defense"});assert.deepEqual(c.masteryIds,["longsword","javelin"]);assert.equal(c.validation.valid,true);}
});
