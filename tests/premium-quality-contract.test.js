import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const index=readFileSync("index.html","utf8");
const screenReadability=readFileSync("styles/readability.css","utf8");
const printReadability=readFileSync("styles/print/premium-readability.css","utf8");
const printLoadOrder=readFileSync("styles/print/premium-sorcerer.css","utf8");
const printPageOne=readFileSync("src/ui/print-page-one.js","utf8");
const printPageTwo=readFileSync("src/ui/print-page-two.js","utf8");
const copyGuard=readFileSync("src/ui/premium-copy-guard.js","utf8");
const library=readFileSync("src/ui/library.js","utf8");
const finalizer=readFileSync("src/rules/finalize-character.js","utf8");

test("customer-facing source claims distinguish SRD from compatible original content",()=>{
  try{
    assert.match(index,/Random uses SRD/);
    assert.match(index,/clearly labeled Forge Original options/i);
    assert.match(index,/independent third-party tool/i);
    assert.doesNotMatch(index,/>RAW only</i);
    assert.doesNotMatch(index,/>RAW choices</i);
    assert.doesNotMatch(index,/complete[s]? a legal 2014 or 2024 SRD character/i);
    assert.match(library,/✓ 5E COMPATIBLE/);
    assert.match(library,/✓ SRD \/ RAW/);
    assert.match(copyGuard,/✓ VERIFIED · 5E COMPATIBLE/);
    assert.match(copyGuard,/Random uses verified options/);
  }catch(error){console.error("[test] premium source accuracy contract",error);throw error;}
});

test("screen readability layer loads after the visual landing layer",()=>{
  try{
    assert.ok(index.indexOf('styles/readability.css')>index.indexOf('styles/landing.css'));
    assert.match(screenReadability,/font-size:max\(\.75rem,12px\)/);
    assert.match(screenReadability,/\.brand small\{font-size:\.72rem\}/);
    assert.match(screenReadability,/\.field\{font-size:\.78rem\}/);
    assert.match(screenReadability,/\.section-kicker\{font-size:\.72rem/);
  }catch(error){console.error("[test] screen readability contract",error);throw error;}
});

test("premium print readability raises useful text without crowding certification footer",()=>{
  try{
    assert.ok(printLoadOrder.indexOf('premium-readability.css')>printLoadOrder.indexOf('premium-attribution.css'));
    assert.match(printReadability,/\.ps-feature-list p\{font-size:5\.9pt/);
    assert.match(printReadability,/\.ps-quick-list\{font-size:6\.1pt/);
    assert.match(printReadability,/\.profile-martial-one-page \.ps-frame,[\s\S]*\.profile-martial-deluxe-two-page \.ps-frame\{grid-template-rows:1\.72in 1fr \.31in\}/);
    assert.match(printReadability,/\.ps-footer\{font-size:6pt;line-height:1\.02;row-gap:\.006in;padding:\.018in \.08in 0\}/);
    assert.match(printReadability,/\.ps-audit\{font-size:5\.4pt;line-height:1\.02\}/);
    assert.match(printReadability,/\.ps-footer>\.ps-license\{font-size:5pt;line-height:1\.02;letter-spacing:-\.01em\}/);
    assert.match(printReadability,/\.ps-dossier-story p\{font-size:8\.5pt/);
    assert.match(printReadability,/\.ps-reference-card p\{font-size:6\.9pt/);
    assert.match(printReadability,/\.ps-audit-checks ol\{font-size:6\.8pt/);
  }catch(error){console.error("[test] print readability contract",error);throw error;}
});

test("player print keeps active rule names but removes source/page provenance from the visible rules lists",()=>{
  try{
    assert.match(printPageOne,/Active Rules/);
    assert.match(printPageOne,/m\.ruleIndex\.map\(item=>`<span><b>\$\{esc\(item\.name\)\}<\/b><\/span>`/);
    assert.doesNotMatch(printPageOne,/compactRuleSource|item\.source/);
    assert.match(printPageTwo,/Active Rules/);
    assert.doesNotMatch(printPageTwo,/auditSection\(|item\.source|s\.source/);
  }catch(error){console.error("[test] player print provenance contract",error);throw error;}
});

test("rendered compatible-content copy guard is idempotent and presentation-only",()=>{
  try{
    assert.ok(index.indexOf('src/ui/premium-copy-guard.js')>index.indexOf('src/app.js'));
    assert.match(copyGuard,/Character Forge Original/i);
    assert.match(copyGuard,/badge\.textContent!==badgeText/);
    assert.match(copyGuard,/if\(footer&&\/\\bRAW\\b\//);
    assert.doesNotMatch(copyGuard,/generateCharacter|deriveCharacter|validateCharacter|startingMagic/);
  }catch(error){console.error("[test] premium copy guard contract",error);throw error;}
});

test("saved starting-magic presentation is rebuilt from trusted catalog data",()=>{
  try{
    assert.match(finalizer,/import \{ generateStartingMagic \} from "\.\/magic-starting\.js"/);
    assert.match(finalizer,/function restoreStartingMagic\(character\)/);
    assert.match(finalizer,/generateStartingMagic\(\{ruleset:character\.ruleset,level:character\.level,mode:resolvedMode,classId:character\.class\.id\}\)/);
    assert.match(finalizer,/Saved starting resources no longer match the current verified starting-magic catalog/);
  }catch(error){console.error("[test] saved starting magic trust contract",error);throw error;}
});
