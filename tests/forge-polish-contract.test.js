import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const heroCss=readFileSync(new URL("../styles/hero-experience.css",import.meta.url),"utf8");
const polishCss=readFileSync(new URL("../styles/forge-polish.css",import.meta.url),"utf8");

test("desktop Forge loads the app-first polish layer",()=>{
  assert.match(heroCss,/^@import url\("\.\/forge-polish\.css"\);/);
  assert.match(polishCss,/max-width:1500px/);
  assert.match(polishCss,/grid-template-columns:minmax\(610px,1\.05fr\) minmax\(500px,\.95fr\)/);
  assert.match(polishCss,/grid-template-areas:[\s\S]*?"hero hero"[\s\S]*?"panel result"/);
});

test("initial hero is compact and the Forge owns the first screen",()=>{
  assert.match(polishCss,/\.hero-copy h1\{[\s\S]*?font-size:clamp\(2rem,2\.75vw,2\.8rem\)/);
  assert.match(polishCss,/\.hero-copy h1 br\{[\s\S]*?display:none/);
  assert.match(polishCss,/\.hero-flow\{[\s\S]*?display:none/);
  assert.match(polishCss,/\.launch-cta\{[\s\S]*?border-bottom:1px solid rgba\(89,80,67,\.1\)/);
});

test("core choices are compact and preview is visible beside the builder",()=>{
  assert.match(polishCss,/\.forge-workspace:not\(:has\(\.character-sheet\)\) \.field-grid\{[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(polishCss,/\.forge-workspace:not\(:has\(\.character-sheet\)\) \.field small\{[\s\S]*?display:none/);
  assert.match(polishCss,/\.forge-empty-state\{[\s\S]*?min-height:610px/);
  assert.match(polishCss,/\.empty-sheet\{[\s\S]*?min-height:395px[\s\S]*?transform:none/);
});

test("secondary support content stays visually subordinate",()=>{
  assert.match(polishCss,/\.support-card\{[\s\S]*?border-radius:0;[\s\S]*?background:transparent;/);
  assert.match(polishCss,/\.seo-about\{[\s\S]*?border-radius:0;[\s\S]*?background:transparent;/);
});
