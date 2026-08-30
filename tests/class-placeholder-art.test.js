import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { classPlaceholderArt } from "../src/print/class-art.js";
import { classPortraitDataUrl } from "../src/print/class-portrait-assets.js";

const CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
const EXPECTED={
  barbarian:/crossed axes and primal rage/i,
  bard:/lute and star of inspiration/i,
  cleric:/radiant holy symbol/i,
  druid:/antlers leaf and moon/i,
  fighter:/shield and crossed blades/i,
  monk:/open hand and disciplined circle/i,
  paladin:/radiant sword and oath shield/i,
  ranger:/bow arrow and woodland trail/i,
  rogue:/hood daggers and lock/i,
  sorcerer:/living flame and innate magic/i,
  warlock:/eldritch eye and pact sigil/i,
  wizard:/arcane star spellbook and wand/i
};

for(const classId of CLASSES){
  test(`${classId} fallback carries a premium portrait and crisp ink-saver emblem`,()=>{
    const art=classPlaceholderArt(classId),portrait=classPortraitDataUrl(classId);
    assert.ok(typeof portrait==="string"&&portrait.length>20,`${classId}: portrait source is missing`);
    assert.match(art,/class="ps-placeholder-illustrated"/);
    assert.match(art,/class="ps-class-portrait-image"/);
    assert.match(art,/ps-class-portrait-image[^>]+src="[^"]+"/);
    assert.match(art,/class="ps-placeholder-emblem"/);
    assert.match(art,/class="ps-placeholder-svg ps-class-crest"/);
    assert.match(art,/shape-rendering="geometricPrecision"/);
    assert.match(art,EXPECTED[classId]);
    assert.doesNotMatch(art,/ps-premium-class-crest/);
    assert.doesNotMatch(art,/<filter\b|feDropShadow|linearGradient/);
  });
}

test("Cleric color placeholder is the approved raster portrait asset",()=>{
  const portrait=classPortraitDataUrl("cleric");
  assert.match(portrait,/cleric\.webp$/i,"Cleric must use the approved raster portrait, not the legacy icon placeholder");
  const assetUrl=new URL("../src/print/class-portraits/cleric.webp",import.meta.url);
  const bytes=readFileSync(fileURLToPath(assetUrl));
  assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
  assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");
  assert.equal(createHash("sha256").update(bytes).digest("hex"),"3705a71fd343103a0d1c4f38f3738ff0728e3a95dccca4389c1454a3109fbe6c","Cleric portrait must remain the approved gold-and-ivory character artwork");
});

test("all class portraits are distinct assets",()=>{
  const portraits=CLASSES.map(classPortraitDataUrl);
  assert.equal(new Set(portraits).size,CLASSES.length);
});

test("print CSS fills the color portrait frame and swaps to the emblem in Ink Saver",()=>{
  const css=readFileSync(fileURLToPath(new URL("../styles/print/premium-ink-saver.css",import.meta.url)),"utf8");
  assert.match(css,/\.ps-placeholder-illustrated\s*\{[^}]*display:block[^}]*width:100%[^}]*height:100%/s);
  assert.match(css,/\.ps-placeholder-emblem\s*\{display:none\}/);
  assert.match(css,/\.sheet-print-ink-saver \.ps-placeholder-illustrated\s*\{display:none!important\}/);
  assert.match(css,/\.sheet-print-ink-saver \.ps-placeholder-emblem\s*\{display:grid!important/);
  assert.match(css,/\.ps-class-portrait-image\s*\{[^}]*object-fit:cover!important/s);
});

test("unknown class falls back safely without throwing",()=>{
  const art=classPlaceholderArt("unknown-class");
  assert.equal(classPortraitDataUrl("unknown-class"),"");
  assert.match(art,/ps-placeholder-svg/);
  assert.match(art,/Adventurer crest/);
  assert.doesNotMatch(art,/ps-class-portrait-image/);
});
