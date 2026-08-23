import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function devotion(){try{const state=createInitialState();state.ruleset="2014";state.constraints.level="20";state.constraints.class="paladin";state.constraints.subclass="oath-devotion";state.constraints.species="human";state.constraints.background="acolyte";return generateCharacter(state);}catch(error){console.error("[test] 2014 Devotion Paladin generation failed",error);throw error;}}

test("2014 level-20 Devotion Paladin keeps legacy class progression isolated",()=>{
  const c=devotion(),p=c.paladin;assert.equal(c.validation.valid,true);assert.equal(c.class.hitDie,10);assert.deepEqual(c.saves,["wis","cha"]);assert.equal(p.layOnHandsPool,100);assert.equal(p.masteryCount,0);assert.equal(c.masteryIds.length,0);assert.equal(p.attacksPerAction,2);assert.equal(p.auraRange,30);assert.equal(p.improvedDivineSmite,true);assert.ok(p.cleansingTouchUses>=1);assert.equal(p.purityOfSpirit,true);assert.equal(p.holyNimbus,true);assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),false);
  assert.ok(c.features.includes("Divine Smite"));assert.ok(c.features.includes("Turn the Unholy"));assert.ok(c.features.includes("Purity of Spirit"));assert.ok(c.features.includes("Aura Improvements"));assert.equal(c.features.includes("Paladin’s Smite"),false);assert.equal(c.features.includes("Weapon Mastery — Paladin"),false);assert.equal(c.features.includes("Faithful Steed"),false);assert.deepEqual(c.spells.slots,{1:4,2:3,3:3,4:3,5:2});assert.equal(c.spells.prepared.all.length,p.prepared);assert.equal(c.spells.alwaysPrepared.length,10);
});

test("2014 Paladin references, provenance, and two-page print model are complete",()=>{
  const c=devotion(),refs=buildQuickReference(c),model=buildPremiumPrintModel(c);for(const item of refs){assert.ok(item.source?.version,`${item.name} missing source`);assert.ok(item.source?.page,`${item.name} missing page`);}assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,true);assert.equal(model.packet.totalPages,2);assert.equal(model.classUtility.title,"Sacred Charge");assert.equal(model.spellPage.entries.length,c.spells.prepared.all.length+c.spells.alwaysPrepared.length);assert.match(model.spellPage.source,/Paladin spell list pp\.108–109/);assert.ok(model.ruleIndex.some(item=>item.name==="Divine Smite"));assert.ok(model.ruleIndex.some(item=>item.name==="Holy Nimbus"));
});
