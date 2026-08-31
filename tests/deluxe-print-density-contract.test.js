import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const fixedCss=readFileSync(fileURLToPath(new URL("../styles/print/premium-fixed.css",import.meta.url)),"utf8");
const deluxeCss=readFileSync(fileURLToPath(new URL("../styles/print/premium-v3-base.css",import.meta.url)),"utf8");

test("Deluxe print profiles inherit compact page-one layout rules",()=>{
  assert.match(fixedCss,/\.profile-martial-deluxe-two-page \.ps-frame/);
  assert.match(fixedCss,/\.profile-martial-deluxe-two-page \.ps-feature-list p/);
  assert.match(fixedCss,/\.profile-martial-deluxe-two-page \.ps-quick-list/);
  assert.match(fixedCss,/\.profile-caster-deluxe-three-page \.ps-body/);
  assert.match(fixedCss,/\.profile-caster-deluxe-three-page \.ps-feature-list p/);
  assert.match(fixedCss,/\.profile-caster-deluxe-three-page \.ps-spells p/);
});

test("Page-one columns may shrink above Rules Index instead of forcing overlap",()=>{
  const rule=fixedCss.match(/\.ps-main-columns\{([^}]*)\}/)?.[1]||"";
  assert.ok(rule,"ps-main-columns print rule missing");
  assert.doesNotMatch(rule,/height\s*:\s*100%/i);
  assert.match(rule,/min-height\s*:\s*0/i);
});

test("Late Deluxe hierarchy keeps dense Quick Turn and feature type within Letter capacity",()=>{
  const quick=deluxeCss.match(/\.sheet-packet-deluxe \.ps-quick-list\{([^}]*)\}/)?.[1]||"";
  const feature=deluxeCss.match(/\.sheet-packet-deluxe \.ps-feature-list p\{([^}]*)\}/)?.[1]||"";
  assert.match(quick,/font-size\s*:\s*5\.7pt/);
  assert.match(quick,/line-height\s*:\s*1\.2/);
  assert.match(feature,/font-size\s*:\s*5\.5pt/);
  assert.match(feature,/line-height\s*:\s*1\.16/);
  assert.match(deluxeCss,/\.sheet-packet-deluxe\.profile-martial-deluxe-two-page\.theme-fighter-steel \.ps-rule-index>div\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});
