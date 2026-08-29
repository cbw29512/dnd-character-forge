import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const heroCss=readFileSync(new URL("../styles/hero-experience.css",import.meta.url),"utf8");
const polishCss=readFileSync(new URL("../styles/forge-polish.css",import.meta.url),"utf8");

test("desktop Forge loads the anti-chunk polish layer",()=>{
  assert.match(heroCss,/^@import url\("\.\/forge-polish\.css"\);/);
  assert.match(polishCss,/max-width:1480px/);
  assert.match(polishCss,/grid-template-columns:minmax\(430px,\.82fr\) minmax\(620px,1\.18fr\)/);
  assert.match(polishCss,/align-self:start/);
});

test("initial Forge fields are rows instead of nested cards",()=>{
  assert.match(polishCss,/\.forge-workspace:not\(:has\(\.character-sheet\)\) \.field\{[\s\S]*?border:0;[\s\S]*?background:transparent;/);
  assert.match(polishCss,/\.workflow-title,[\s\S]*?\.workflow-reset-note\{[\s\S]*?display:none;/);
  assert.match(polishCss,/Optional controls become sections inside one form instead of nested cards/);
  assert.match(polishCss,/\.species-choice-panel,[\s\S]*?\.sheet-customizer-panel\{[\s\S]*?border-top:1px solid #ddd4c7;[\s\S]*?border-radius:0;[\s\S]*?background:transparent;/);
});

test("support and informational areas are flattened on desktop",()=>{
  assert.match(polishCss,/\.support-card\{[\s\S]*?border-radius:0;[\s\S]*?background:transparent;/);
  assert.match(polishCss,/\.seo-about\{[\s\S]*?border-radius:0;[\s\S]*?background:transparent;/);
});
