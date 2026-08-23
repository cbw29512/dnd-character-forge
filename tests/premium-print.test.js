import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

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
test("level-20 Thief premium model carries complete compact Rogue resources",()=>{
  const c=characterAt("rogue",20,"thief"),m=buildPremiumPrintModel(c),r=m.rogueResources;assert.equal(m.theme.id,"shadow-teal");assert.equal(m.spellcasting,null);assert.ok(r);assert.equal(r.sneakAttack,"10d6");assert.equal(r.expertise,4);assert.equal(r.masteries,2);assert.equal(r.effectsPerSneak,2);assert.equal(r.reliableTalent,true);assert.equal(r.options.length,7);assert.equal(r.options.find(option=>option.name==="Poison").requires,"Poisoner's Kit");assert.match(r.scrollWarning,/disintegrates the scroll/);assert.match(m.quickTurn.join(" "),/Cunning Strike/);
});
test("premium rules appendix contains every active quick reference with provenance",()=>{
  for(const [classId,subclass] of [["fighter","champion"],["wizard","evoker"],["cleric","life-domain"],["rogue","thief"]]){const c=characterAt(classId,20,subclass),m=buildPremiumPrintModel(c),expected=buildQuickReference(c).map(item=>item.id).sort(),actual=m.appendix.referencePages.flat().map(item=>item.id).sort();assert.deepEqual(actual,expected);assert.ok(m.appendix.referencePages.flat().every(item=>/p\.\d+/.test(item.source)));}
});
test("caster spell appendix contains every generated spell exactly once",()=>{
  for(const [classId,subclass] of [["wizard","evoker"],["cleric","life-domain"]]){const c=characterAt(classId,20,subclass),m=buildPremiumPrintModel(c),entries=m.appendix.spellPages.flatMap(page=>page.entries),actual=entries.map(item=>item.id),expected=classId==="wizard"?[...new Set([...(c.spells.cantrips.all||[]),...(c.spells.spellbook.all||[])])]:[...new Set([...(c.spells.cantrips.all||[]),...(c.spells.alwaysPrepared||[]),...(c.spells.prepared.all||[])])];assert.equal(new Set(actual).size,actual.length);assert.deepEqual([...actual].sort(),[...expected].sort());}
});
test("complete Rules Audit survives into the final packet",()=>{
  const c=characterAt("rogue",20,"thief"),m=buildPremiumPrintModel(c);assert.equal(m.appendix.audit.checks.length,c.audit.checks.length);assert.equal(m.appendix.audit.mechanics.length,c.audit.mechanics.length);assert.equal(m.appendix.audit.sourcePdfUrl,c.audit.sourcePdfUrl);assert.equal(m.appendix.audit.license,"CC BY 4.0");assert.equal(m.packet.totalPages,1+m.appendix.referencePages.length+m.appendix.spellPages.length+1);
});
test("Rogue premium renderer exposes strike effects, requirements, Thief warning, and complete appendix",()=>{
  const c=characterAt("rogue",20,"thief"),target={innerHTML:""},m=renderPremiumPrintSheet(c,target);assert.match(target.innerHTML,/Rogue Resources/);assert.match(target.innerHTML,/ps-rogue-stats/);assert.match(target.innerHTML,/Poisoner&#39;s Kit/);assert.match(target.innerHTML,/Knock Out/);assert.match(target.innerHTML,/disintegrates the scroll/);assert.match(target.innerHTML,/Rules &amp; Provenance/);assert.match(target.innerHTML,/Stroke of Luck/);assert.match(target.innerHTML,/Thief’s Reflexes/);assert.match(target.innerHTML,/Rules Audit/);assert.equal((target.innerHTML.match(/class="ps-appendix-page/g)||[]).length,m.packet.totalPages-1);
});
test("Rogue Quick Turn never recommends features before their unlock level",()=>{
  const level1=buildPremiumPrintModel(characterAt("rogue",1)),level2=buildPremiumPrintModel(characterAt("rogue",2));assert.doesNotMatch(level1.quickTurn.join(" "),/Cunning Action/);assert.match(level2.quickTurn.join(" "),/Cunning Action/);assert.equal(level1.rogueResources.cunningStrikeDc,null);assert.equal(level1.rogueResources.options.length,0);
});
test("premium export packet has explicit deterministic pagination without appendix truncation",()=>{
  const print=readFileSync(new URL("../src/ui/print.js",import.meta.url),"utf8"),renderer=readFileSync(new URL("../src/ui/premium-print.js",import.meta.url),"utf8"),css=readFileSync(new URL("../styles/print/premium-sheet.css",import.meta.url),"utf8"),rogueCss=readFileSync(new URL("../styles/print/premium-rogue.css",import.meta.url),"utf8"),appendixCss=readFileSync(new URL("../styles/print/premium-appendix.css",import.meta.url),"utf8"),responsive=readFileSync(new URL("../styles/responsive.css",import.meta.url),"utf8");assert.match(print,/renderPremiumPrintSheet/);assert.match(print,/premium-print-active/);assert.match(renderer,/premium-sheet/);assert.match(renderer,/Rules & Provenance/);assert.match(renderer,/Spell Loadout/);assert.match(renderer,/Rules Audit/);assert.match(css,/body\.premium-print-active/);assert.match(css,/height:10\.2in/);assert.match(rogueCss,/ps-rogue-options/);assert.match(appendixCss,/height:10\.2in/);assert.match(appendixCss,/page-break-before:always/);assert.doesNotMatch(appendixCss,/line-clamp|overflow:hidden/);assert.match(responsive,/print\/premium-sheet\.css/);assert.match(responsive,/print\/premium-rogue\.css/);assert.match(responsive,/print\/premium-appendix\.css/);
});
