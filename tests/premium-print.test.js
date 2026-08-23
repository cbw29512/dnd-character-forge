import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function characterAt(classId,level,subclass="random"){
  const state=createInitialState();state.ruleset="2024";state.constraints.class=classId;state.constraints.level=String(level);state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background="criminal";return generateCharacter(state);
}
test("premium print model rejects unvalidated input",()=>{assert.throws(()=>buildPremiumPrintModel({}),/validated character/i);});
test("Fighter premium sheet uses martial theme and table-ready resources",()=>{
  const c=characterAt("fighter",20,"champion"),m=buildPremiumPrintModel(c);assert.equal(m.theme.id,"martial-red");assert.equal(m.identity.level,20);assert.equal(m.stats.ac,c.ac);assert.equal(m.abilities.length,6);assert.equal(m.skills.length,18);assert.ok(m.attacks.length);assert.equal(m.quickTurn.length,3);assert.match(m.quickTurn[0],/Attack action/i);assert.equal(m.audit.status,"PASS");
});
test("Cleric premium sheet carries spellcasting and holy theme",()=>{
  const c=characterAt("cleric",20,"life-domain"),m=buildPremiumPrintModel(c);assert.equal(m.theme.id,"holy-gold");assert.ok(m.spellcasting);assert.equal(m.spellcasting.saveDc,c.spells.saveDc);assert.equal(m.spellcasting.prepared.length,c.spells.prepared.all.length);assert.equal(m.spellcasting.alwaysPrepared.length,c.spells.alwaysPrepared.length);assert.match(m.quickTurn.join(" "),/Channel Divinity/i);
});
test("level-20 Evoker premium model handles the full high-level caster state",()=>{
  const c=characterAt("wizard",20,"evoker"),m=buildPremiumPrintModel(c);assert.equal(m.theme.id,"arcane-blue");assert.equal(m.spellcasting.prepared.length,25);assert.equal(m.spellcasting.spellbookCount,53);assert.equal(m.spellcasting.cantrips.length,5);assert.ok(m.features.length<=9);assert.ok(m.equipment.length<=12);
});
test("premium export is isolated from the normal screen renderer",()=>{
  const print=readFileSync(new URL("../src/ui/print.js",import.meta.url),"utf8"),renderer=readFileSync(new URL("../src/ui/premium-print.js",import.meta.url),"utf8"),css=readFileSync(new URL("../styles/print/premium-sheet.css",import.meta.url),"utf8"),responsive=readFileSync(new URL("../styles/responsive.css",import.meta.url),"utf8");assert.match(print,/renderPremiumPrintSheet/);assert.match(print,/premium-print-active/);assert.match(renderer,/premium-sheet/);assert.match(renderer,/Quick Turn/);assert.match(css,/body\.premium-print-active/);assert.match(css,/height:10\.2in/);assert.match(responsive,/print\/premium-sheet\.css/);
});
