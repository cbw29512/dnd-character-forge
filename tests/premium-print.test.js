import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

function characterAt(classId,level,subclass="random"){
  const state=createInitialState();state.ruleset="2024";state.constraints.class=classId;state.constraints.level=String(level);state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background=classId==="paladin"?"soldier":"criminal";if(classId==="paladin")state.classSelections={fightingStyle:"defense"};return generateCharacter(state);
}
test("premium print model rejects unvalidated input",()=>assert.throws(()=>buildPremiumPrintModel({}),/validated character/i));
test("martial classes use a hard one-page export profile",()=>{
  for(const [classId,subclass] of [["fighter","champion"],["rogue","thief"]]){const m=buildPremiumPrintModel(characterAt(classId,20,subclass));assert.equal(m.profile.id,"martial-one-page");assert.equal(m.packet.totalPages,1);assert.equal(m.spellPage,null);}
});
test("casters and half-casters use a hard two-page export profile",()=>{
  for(const [classId,subclass] of [["wizard","evoker"],["cleric","life-domain"],["paladin","oath-devotion"]]){const m=buildPremiumPrintModel(characterAt(classId,20,subclass));assert.equal(m.profile.id,"caster-two-page");assert.equal(m.packet.totalPages,2);assert.ok(m.spellPage);}
});
test("each current class has its own premium visual identity",()=>{
  assert.equal(buildPremiumPrintModel(characterAt("fighter",20,"champion")).theme.id,"fighter-steel");
  assert.equal(buildPremiumPrintModel(characterAt("rogue",20,"thief")).theme.id,"rogue-shadow");
  assert.equal(buildPremiumPrintModel(characterAt("cleric",20,"life-domain")).theme.id,"cleric-sanctum");
  assert.equal(buildPremiumPrintModel(characterAt("paladin",20,"oath-devotion")).theme.id,"paladin-oath");
  assert.equal(buildPremiumPrintModel(characterAt("wizard",20,"evoker")).theme.id,"wizard-arcane");
});
test("compact rules index preserves every active sourced rule",()=>{
  for(const [classId,subclass] of [["fighter","champion"],["wizard","evoker"],["cleric","life-domain"],["paladin","oath-devotion"],["rogue","thief"]]){const c=characterAt(classId,20,subclass),m=buildPremiumPrintModel(c),expected=buildQuickReference(c).map(item=>item.id).sort(),actual=m.ruleIndex.map(item=>item.id).sort();assert.deepEqual(actual,expected);assert.ok(m.ruleIndex.every(item=>/p\.\d+/.test(item.source)));}
});
test("caster page two preserves every generated spell exactly once",()=>{
  for(const [classId,subclass] of [["wizard","evoker"],["cleric","life-domain"],["paladin","oath-devotion"]]){const c=characterAt(classId,20,subclass),m=buildPremiumPrintModel(c),actual=m.spellPage.entries.map(item=>item.id),expected=classId==="wizard"?[...new Set([...c.spells.cantrips.all,...c.spells.spellbook.all])]:[...new Set([...c.spells.cantrips.all,...c.spells.alwaysPrepared,...c.spells.prepared.all])];assert.equal(new Set(actual).size,actual.length);assert.deepEqual([...actual].sort(),[...expected].sort());}
});
test("complete audit proof remains in the fixed packet model",()=>{
  const c=characterAt("cleric",20,"life-domain"),m=buildPremiumPrintModel(c);assert.equal(m.audit.checks.length,c.audit.checks.length);assert.equal(m.audit.mechanics.length,c.audit.mechanics.length);assert.equal(m.audit.license,"CC BY 4.0");assert.equal(m.audit.rawIntegrity,true);
});
test("default export uses class illustration and uploaded portrait overrides it",()=>{
  const c=characterAt("fighter",20,"champion"),target={innerHTML:""};renderPremiumPrintSheet(c,target);assert.match(target.innerHTML,/ps-placeholder-svg/);assert.match(target.innerHTML,/class-fighter/);
  c.presentation={portraitDataUrl:"data:image/jpeg;base64,QUJD"};renderPremiumPrintSheet(c,target);assert.match(target.innerHTML,/has-image/);assert.match(target.innerHTML,/data:image\/jpeg;base64,QUJD/);assert.doesNotMatch(target.innerHTML,/class-placeholder class-fighter/);
});
test("Paladin default export uses its shield-and-radiance class illustration",()=>{
  const target={innerHTML:""};renderPremiumPrintSheet(characterAt("paladin",20,"oath-devotion"),target);assert.match(target.innerHTML,/class-paladin/);assert.match(target.innerHTML,/Oathbound/);assert.match(target.innerHTML,/Sacred Charge/);
});
test("page one preserves familiar 5e table-play landmarks",()=>{
  const target={innerHTML:""};renderPremiumPrintSheet(characterAt("fighter",20,"champion"),target);const html=target.innerHTML.replaceAll("&amp;","&");for(const label of ["Ability Scores","Saving Throws","Skills","Attacks & Spellcasting","Equipment","Features & Traits","Passive Wisdom (Perception)"])assert.ok(html.includes(label),`missing familiar 5e landmark: ${label}`);
});
test("caster spell page restores level-by-level 0 through 9 structure",()=>{
  const target={innerHTML:""};renderPremiumPrintSheet(characterAt("wizard",20,"evoker"),target);assert.match(target.innerHTML,/Spellcasting Ability/);assert.match(target.innerHTML,/Spell Save DC/);assert.match(target.innerHTML,/Spell Attack Bonus/);for(let level=0;level<=9;level++)assert.match(target.innerHTML,new RegExp(`ps-spell-level level-${level}`));
});
test("martial renderer creates one sheet and caster renderer exactly two",()=>{
  const target={innerHTML:""};renderPremiumPrintSheet(characterAt("fighter",20,"champion"),target);assert.equal((target.innerHTML.match(/class="premium-sheet/g)||[]).length,1);assert.match(target.innerHTML,/Rules Index/);
  renderPremiumPrintSheet(characterAt("paladin",20,"oath-devotion"),target);assert.equal((target.innerHTML.match(/class="premium-sheet/g)||[]).length,2);assert.match(target.innerHTML,/>Spells</);assert.match(target.innerHTML,/Sourced Rules Index/);assert.match(target.innerHTML,/Rules Audit/);
});
test("fixed export CSS and renderer enforce the new product contract",()=>{
  const renderer=readFileSync(new URL("../src/ui/premium-print.js",import.meta.url),"utf8"),fixed=readFileSync(new URL("../styles/print/premium-fixed.css",import.meta.url),"utf8"),officialFlow=readFileSync(new URL("../styles/print/premium-official-flow.css",import.meta.url),"utf8"),responsive=readFileSync(new URL("../styles/responsive.css",import.meta.url),"utf8"),art=readFileSync(new URL("../src/print/class-art.js",import.meta.url),"utf8");assert.match(renderer,/renderPrintPageOne/);assert.match(renderer,/renderPrintPageTwo/);assert.match(fixed,/profile-martial-one-page/);assert.match(fixed,/profile-caster-two-page/);assert.match(officialFlow,/ps-spell-level-grid/);assert.match(officialFlow,/ps-saving-throws/);assert.match(fixed,/theme-barbarian-rage/);assert.match(responsive,/print\/premium-official-flow\.css/);assert.match(art,/barbarianArt/);assert.match(art,/paladinArt/);
});
