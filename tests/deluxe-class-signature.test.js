import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRINT_THEMES } from "../src/print/theme.js";
import { classWatermark, sheetArticleOpen } from "../src/ui/print-decoration.js";

const SIGNATURES=read("styles/print/premium-class-signatures.css");
const PALETTES=read("styles/print/premium-class-palettes.css");
const LOAD_POINT=read("styles/print/premium-sorcerer.css");
const CLASS_IDS=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];

test("all 12 classes have a complete color-and-grayscale print identity",()=>{
  assert.deepEqual(Object.keys(PRINT_THEMES).sort(),[...CLASS_IDS].sort());
  const palettes=new Set(),patterns=new Set(),glyphs=new Set();
  for(const classId of CLASS_IDS){
    const theme=PRINT_THEMES[classId];
    assert.equal(theme.className.toLowerCase(),classId);
    assert.ok(theme.label.length>=6,`${classId}: resource/identity label too weak`);
    assert.ok(theme.glyph.length>=1,`${classId}: glyph missing`);
    assert.ok(theme.rail.split(" · ").length>=3,`${classId}: class signature rail missing`);
    assert.ok(theme.grayscalePattern.length>=6,`${classId}: grayscale pattern missing`);
    for(const key of ["primary","dark","accent","frame","glow"])assert.ok(theme.palette[key],`${classId}: palette ${key} missing`);
    palettes.add(JSON.stringify(theme.palette));patterns.add(theme.grayscalePattern);glyphs.add(theme.glyph);
    assert.match(SIGNATURES,new RegExp(`\\.theme-${escapeRegex(theme.id)} \\.ps-theme-ribbon span`),`${classId}: typography selector missing`);
    assert.match(SIGNATURES,new RegExp(`\\.theme-${escapeRegex(theme.id)} \\.ps-panel h2:before`),`${classId}: section symbol selector missing`);
  }
  assert.equal(palettes.size,12,"Every class should have a distinct palette.");
  assert.equal(patterns.size,12,"Every class should have a distinct grayscale identity token.");
  assert.ok(glyphs.size>=10,"Class symbols should be strongly differentiated.");
});

test("frame decoration prints the class name, symbol rails, emblem art, and class palette variables",()=>{
  for(const classId of CLASS_IDS){
    const theme=PRINT_THEMES[classId],model=dummyModel(classId,theme),decoration=classWatermark(model),open=sheetArticleOpen(model);
    assert.match(decoration,new RegExp(`<span>${escapeRegex(theme.className)}</span>`),`${classId}: class wordmark missing from ribbon`);
    assert.match(decoration,/ps-class-signature/);
    assert.match(decoration,/ps-signature-left/);
    assert.match(decoration,/ps-signature-right/);
    assert.match(decoration,new RegExp(escapeRegex(theme.rail)),`${classId}: signature rail copy missing`);
    assert.match(decoration,/ps-placeholder-svg/,`${classId}: SVG emblem art missing`);
    assert.match(open,new RegExp(`data-print-class="${classId}"`));
    assert.match(open,new RegExp(`--class-primary:${escapeRegex(theme.palette.primary)}`));
    assert.match(open,new RegExp(`--class-accent:${escapeRegex(theme.palette.accent)}`));
    assert.match(open,/--portrait-zoom:1;--class-primary:/,"Customization variables and class palette variables must remain separate CSS declarations.");
  }
});

test("ink saver preserves class typography and symbology while class colors remain opt-out",()=>{
  assert.match(PALETTES,/\.premium-sheet:not\(\.sheet-print-ink-saver\)\s*\{/);
  assert.match(PALETTES,/--ps-primary:var\(--class-primary\)/);
  assert.match(SIGNATURES,/\.sheet-print-ink-saver \.ps-theme-ribbon\{display:block!important;background:#fff!important;color:#111!important/);
  assert.match(SIGNATURES,/\.sheet-print-ink-saver \.ps-class-ornaments\{display:block!important/);
  assert.match(SIGNATURES,/\.sheet-print-ink-saver \.ps-class-signature\{display:block!important/);
  assert.match(SIGNATURES,/\.sheet-print-ink-saver \.ps-class-watermark\{display:none!important/);
  assert.match(SIGNATURES,/\.sheet-ornament-minimal \.ps-class-signature,\.sheet-ornament-minimal \.ps-class-ornaments\{display:none!important\}/);
});

test("decorative tracking never breaks searchable semantic panel headings",()=>{
  assert.match(PALETTES,/\.premium-sheet:not\(\.sheet-style-minimal\) \.ps-panel h2 span\{letter-spacing:normal!important\}/);
});

test("signature and palette layers load after the existing class identity stack",()=>{
  const signatureImport='@import url("./premium-class-signatures.css");',paletteImport='@import url("./premium-class-palettes.css");';
  assert.ok(LOAD_POINT.includes(signatureImport));assert.ok(LOAD_POINT.includes(paletteImport));
  assert.ok(LOAD_POINT.indexOf(signatureImport)>LOAD_POINT.indexOf('@import url("./premium-class-arcane.css");'));
  assert.ok(LOAD_POINT.indexOf(paletteImport)>LOAD_POINT.indexOf(signatureImport));
  assert.ok(LOAD_POINT.indexOf(paletteImport)<LOAD_POINT.indexOf("@media print"));
});

function dummyModel(classId,theme){return{theme,identity:{classId,className:theme.className},presentation:{classes:"sheet-packet-deluxe sheet-style-ornate sheet-paper-ivory sheet-ornament-rich sheet-frame-class sheet-print-premium portrait-filter-natural",style:"--portrait-x:50%;--portrait-y:32%;--portrait-zoom:1"}};}
function read(path){return readFileSync(new URL(`../${path}`,import.meta.url),"utf8");}
function escapeRegex(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
