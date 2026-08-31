import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const css=readFileSync(fileURLToPath(new URL("../styles/print/premium-fixed.css",import.meta.url)),"utf8");

test("Deluxe print profiles inherit compact page-one layout rules",()=>{
  assert.match(css,/\.profile-martial-deluxe-two-page \.ps-frame/);
  assert.match(css,/\.profile-martial-deluxe-two-page \.ps-feature-list p/);
  assert.match(css,/\.profile-martial-deluxe-two-page \.ps-quick-list/);
  assert.match(css,/\.profile-caster-deluxe-three-page \.ps-body/);
  assert.match(css,/\.profile-caster-deluxe-three-page \.ps-feature-list p/);
  assert.match(css,/\.profile-caster-deluxe-three-page \.ps-spells p/);
});

test("Page-one columns may shrink above Rules Index instead of forcing overlap",()=>{
  const rule=css.match(/\.ps-main-columns\{([^}]*)\}/)?.[1]||"";
  assert.ok(rule,"ps-main-columns print rule missing");
  assert.doesNotMatch(rule,/height\s*:\s*100%/i);
  assert.match(rule,/min-height\s*:\s*0/i);
});
