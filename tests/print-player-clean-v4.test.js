import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Print V4 keeps player sheets free of rule-source/page locator clutter",()=>{
  const pageOne=fs.readFileSync(new URL("../src/ui/print-page-one.js",import.meta.url),"utf8");
  const pageTwo=fs.readFileSync(new URL("../src/ui/print-page-two.js",import.meta.url),"utf8");
  assert.doesNotMatch(pageOne,/f\.source|m\.feat\.source|magic\.source|compactRuleSource/);
  assert.match(pageOne,/Active Rules/);
  assert.match(pageOne,/panel\("Skills",skills\(m\),"ps-skills"\)/);
  assert.doesNotMatch(pageTwo,/item\.source|auditSection\(|s\.source/);
  assert.match(pageTwo,/Active Rules/);
});

test("Print V4 preserves vivid class-specific palettes and ink-saver isolation",()=>{
  const css=fs.readFileSync(new URL("../styles/readability.css",import.meta.url),"utf8");
  for(const theme of ["barbarian-rage","bard-legend","cleric-sanctum","druid-wild","fighter-steel","monk-focus","paladin-oath","ranger-warden","rogue-shadow","sorcerer-aether","warlock-eldritch","wizard-arcane"]){
    assert.match(css,new RegExp(`theme-${theme.replace(/[.*+?^${}()|[\\]\\]/g,"\\$&")}`));
  }
  assert.match(css,/:not\(\.sheet-print-ink-saver\)/);
});
