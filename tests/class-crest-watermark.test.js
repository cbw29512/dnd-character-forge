import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { classDecorationArt } from "../src/print/class-art.js";

const PALETTES=read("styles/print/premium-class-palettes.css");
const INK_SAVER=read("styles/print/premium-ink-saver.css");
const GORGEOUS=read("styles/print/premium-gorgeous.css");
const CLASS_IDS=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];

test("all 12 classes provide distinct SVG crest art for the player-sheet watermark",()=>{
  const crests=new Set();
  for(const classId of CLASS_IDS){
    const art=classDecorationArt(classId);
    assert.match(art,/ps-class-crest/,`${classId}: class crest marker missing`);
    assert.match(art,/viewBox="0 0 180 220"/,`${classId}: crest viewBox changed`);
    assert.match(art,new RegExp(`${capitalize(classId)}[^\"]+crest`,`i`),`${classId}: accessible crest label missing`);
    crests.add(art);
  }
  assert.equal(crests.size,12,"Every class must retain distinct crest art.");
});

test("page-one crest is centered and visibly layered in the equipment writing field without changing layout",()=>{
  assert.match(PALETTES,/\.ps-page-one\.premium-sheet:not\(\.sheet-print-ink-saver\):not\(\.sheet-style-minimal\) \.ps-class-watermark\s*\{/);
  assert.match(PALETTES,/left:2\.72in/);
  assert.match(PALETTES,/top:4\.35in/);
  assert.match(PALETTES,/width:2\.18in/);
  assert.match(PALETTES,/height:2\.66in/);
  assert.match(PALETTES,/opacity:\.034/);
  assert.match(PALETTES,/transform:none!important/);
  assert.match(PALETTES,/z-index:3!important/);
  assert.match(GORGEOUS,/\.ps-class-watermark\{position:absolute;z-index:0!important/);
});

test("minimal and ink-saver sheets still suppress the toner-heavy watermark",()=>{
  assert.match(GORGEOUS,/\.sheet-style-minimal \.ps-theme-ribbon,\.sheet-style-minimal \.ps-class-watermark/);
  assert.match(INK_SAVER,/\.sheet-print-ink-saver \.ps-class-watermark\{display:none!important\}/);
  assert.doesNotMatch(PALETTES,/display:block!important/);
});

function capitalize(value){return `${value[0].toUpperCase()}${value.slice(1)}`;}
function read(path){return readFileSync(new URL(`../${path}`,import.meta.url),"utf8");}
