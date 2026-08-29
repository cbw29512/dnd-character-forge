import test from "node:test";
import assert from "node:assert/strict";
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
    assert.match(portrait,/^data:image\/webp;base64,/);
    assert.ok(portrait.length>5000,`${classId}: portrait data is unexpectedly small`);
    assert.match(art,/class="ps-placeholder-illustrated"/);
    assert.match(art,/class="ps-class-portrait-image"/);
    assert.match(art,/data:image\/webp;base64,/);
    assert.match(art,/class="ps-placeholder-emblem"/);
    assert.match(art,/class="ps-placeholder-svg ps-class-crest"/);
    assert.match(art,/shape-rendering="geometricPrecision"/);
    assert.match(art,EXPECTED[classId]);
    assert.doesNotMatch(art,/ps-premium-class-crest/);
    assert.doesNotMatch(art,/<filter\b|feDropShadow|linearGradient/);
  });
}

test("all class portraits are distinct assets",()=>{
  const portraits=CLASSES.map(classPortraitDataUrl);
  assert.equal(new Set(portraits).size,CLASSES.length);
});

test("unknown class falls back safely without throwing",()=>{
  const art=classPlaceholderArt("unknown-class");
  assert.equal(classPortraitDataUrl("unknown-class"),"");
  assert.match(art,/ps-placeholder-svg/);
  assert.match(art,/Adventurer crest/);
  assert.doesNotMatch(art,/ps-class-portrait-image/);
});
