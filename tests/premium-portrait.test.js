import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";
import { pregenFingerprintPayload } from "../src/library/fingerprint.js";

const SAMPLE="data:image/jpeg;base64,/9j/AA==";
function fighter(){const state=createInitialState();state.ruleset="2024";state.constraints.class="fighter";state.constraints.level="5";state.constraints.subclass="champion";return generateCharacter(state);}

test("presentation portrait is included in print model but not mechanical fingerprint",()=>{
  const c=fighter(),before=pregenFingerprintPayload(c);c.presentation={portraitDataUrl:SAMPLE};const after=pregenFingerprintPayload(c),model=buildPremiumPrintModel(c);assert.deepEqual(after,before);assert.equal(model.portraitDataUrl,SAMPLE);
});
test("invalid presentation URLs never enter premium print markup and fall back to class art",()=>{
  const c=fighter();c.presentation={portraitDataUrl:'javascript:alert(1)'};const model=buildPremiumPrintModel(c),target={innerHTML:""};renderPremiumPrintSheet(c,target);assert.equal(model.portraitDataUrl,null);assert.doesNotMatch(target.innerHTML,/javascript:/);assert.match(target.innerHTML,/ps-placeholder-svg/);assert.match(target.innerHTML,/class-placeholder class-fighter/);
});
test("valid portrait switches premium renderer from class art to image",()=>{
  const c=fighter();c.presentation={portraitDataUrl:SAMPLE};const target={innerHTML:""};renderPremiumPrintSheet(c,target);assert.match(target.innerHTML,/ps-portrait-art has-image/);assert.match(target.innerHTML,/<img src="data:image\/jpeg;base64,/);assert.doesNotMatch(target.innerHTML,/class-placeholder class-fighter/);
});
test("portrait workflow is local, bounded, persistent, and presentation-only",()=>{
  const portrait=fs.readFileSync(new URL("../src/ui/portrait-upload.js",import.meta.url),"utf8"),app=fs.readFileSync(new URL("../src/app.js",import.meta.url),"utf8"),state=fs.readFileSync(new URL("../src/state.js",import.meta.url),"utf8"),css=fs.readFileSync(new URL("../styles/portrait.css",import.meta.url),"utf8"),print=fs.readFileSync(new URL("../src/ui/print.js",import.meta.url),"utf8");assert.match(portrait,/MAX_SOURCE_BYTES=8\*1024\*1024/);assert.match(portrait,/MAX_SIDE=560/);assert.match(portrait,/MAX_OUTPUT_CHARS=450000/);assert.match(portrait,/canvas\.toDataURL\("image\/jpeg"/);assert.match(portrait,/image\/webp/);assert.match(app,/bindPortraitUpload/);assert.match(app,/restorePortraitFromCharacter/);assert.match(app,/applyPortraitToCurrent/);assert.match(app,/await exportCharacterPdf/);assert.match(state,/portraitDataUrl: null/);assert.match(css,/ps-portrait-art\.has-image img/);assert.match(print,/await waitForPrintImages\(root\)/);assert.match(print,/image\.decode/);
});
