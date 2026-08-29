import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const heroCss=readFileSync(new URL("../styles/hero-experience.css",import.meta.url),"utf8");
const polishCss=readFileSync(new URL("../styles/forge-polish.css",import.meta.url),"utf8");
const mobileCss=readFileSync(new URL("../styles/forge-mobile-polish.css",import.meta.url),"utf8");
const mobileResultCss=readFileSync(new URL("../styles/forge-mobile-result.css",import.meta.url),"utf8");
const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");

test("desktop Forge loads the app-first console layer",()=>{
  assert.match(heroCss,/^@import url\("\.\/forge-polish\.css"\);/);
  assert.match(heroCss,/@import url\("\.\/forge-mobile-polish\.css"\);/);
  assert.match(heroCss,/@import url\("\.\/forge-mobile-result\.css"\);/);
  assert.match(polishCss,/max-width:1480px/);
  assert.match(polishCss,/grid-template-columns:minmax\(520px,590px\) minmax\(0,1fr\)/);
  assert.match(polishCss,/grid-template-areas:[\s\S]*?"hero hero"[\s\S]*?"panel result"/);
});

test("initial identity strip is compact and the Forge owns the first screen",()=>{
  assert.match(polishCss,/\.hero-copy h1\{[\s\S]*?font-size:clamp\(1\.8rem,2\.25vw,2\.3rem\)/);
  assert.match(polishCss,/\.hero-copy h1 br\{display:none\}/);
  assert.match(polishCss,/\.hero-flow\{display:none\}/);
  assert.match(polishCss,/Forge console: same visual world as the result/);
});

test("builder is a dark compact console instead of a parchment form slab",()=>{
  assert.match(polishCss,/linear-gradient\(180deg,#1b1e23 0%,#15171b 100%\)/);
  assert.match(polishCss,/\.forge-workspace:not\(:has\(\.character-sheet\)\) \.field-grid\{[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(polishCss,/\.forge-panel \.field::before\{display:none!important;content:none!important\}/);
  assert.match(polishCss,/background:#22262c;[\s\S]*?color:#f0ebe2/);
});

test("tablet and phone share the app-first Forge console instead of reverting to the old form",()=>{
  assert.match(mobileCss,/@media \(max-width:980px\)/);
  assert.match(mobileCss,/linear-gradient\(180deg,#1b1e23 0%,#15171b 100%\)/);
  assert.match(mobileCss,/\.hero-flow\{display:none!important\}/);
  assert.match(mobileCss,/\.forge-panel \.field::before\{display:none!important;content:none!important\}/);
  assert.match(mobileCss,/@media \(max-width:680px\)/);
  assert.match(mobileCss,/\.forge-panel \.launch-cta \.forge-button\{[\s\S]*?width:100%/);
});

test("phone generated state shows the forged character before edit controls",()=>{
  assert.match(mobileResultCss,/@media \(max-width:680px\)/);
  assert.match(mobileResultCss,/\.forge-workspace:has\(\.character-sheet\) \.result-stage\{[\s\S]*?order:1/);
  assert.match(mobileResultCss,/\.forge-workspace:has\(\.character-sheet\) \.forge-panel\{[\s\S]*?order:2/);
});

test("secondary presentation settings are progressively disclosed",()=>{
  assert.match(app,/groupAdvancedOptions\(\)/);
  assert.match(app,/details\.id="forgeAdvancedOptions"/);
  assert.match(app,/Spells, starting magic, portrait, print style, and Homebrew details/);
  assert.match(app,/\["spellPickerPanel","homebrewPanel","magicControls","portraitPanel","sheetCustomizerPanel"\]/);
  assert.match(polishCss,/\.forge-panel \.forge-advanced-options>summary/);
});

test("generated result leads with the character before starting-resource detail",()=>{
  assert.match(app,/result\.append\(card\)/);
  assert.doesNotMatch(app,/result\.prepend\(card\)/);
  assert.match(polishCss,/grid-template-columns:minmax\(300px,330px\) minmax\(0,1fr\)/);
  assert.match(polishCss,/\.forge-workspace:has\(\.character-sheet\) \.field-grid\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test("empty state reads as a parchment sheet on the Forge workbench",()=>{
  assert.match(polishCss,/\.empty-sheet\{[\s\S]*?background:linear-gradient\(145deg,#f5efe4,#e8decd\)/);
  assert.match(polishCss,/\.forge-empty-state\{[\s\S]*?border:0;[\s\S]*?background:transparent/);
  assert.match(mobileCss,/\.empty-sheet\{[\s\S]*?background:linear-gradient\(145deg,#f5efe4,#e8decd\)/);
});
