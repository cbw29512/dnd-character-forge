import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  curatedDossierPortraitFor,
  curatedDossierPortraitIds,
  dossierFallbackArt,
  isCuratedDossierPortraitEntry
} from "../src/print/dossier-portrait-assets.js";

test("curated portrait schema requires an approved exact variant",()=>{
  try{
    const entry={
      variantKey:"grave-warden--oath-beacon",
      src:"file:///approved.webp",
      backgroundSymbol:"unmarked grave",
      pathSymbol:"beacon in smoke",
      status:"approved",
      provenance:"Character Forge original art"
    };
    assert.equal(isCuratedDossierPortraitEntry(entry,"grave-warden--oath-beacon"),true);
    assert.equal(isCuratedDossierPortraitEntry({...entry,status:"draft"},entry.variantKey),false);
    assert.equal(isCuratedDossierPortraitEntry({...entry,pathSymbol:""},entry.variantKey),false);
    assert.equal(isCuratedDossierPortraitEntry(entry,"criminal--oath-beacon"),false);
  }catch(error){
    console.error("[dossier-portrait-assets-test] schema contract failed",error);
    throw error;
  }
});

test("Grave Warden Oath Beacon resolves to a real original SVG asset",()=>{
  try{
    const key="grave-warden--oath-beacon",entry=curatedDossierPortraitFor(key);
    assert.ok(entry,`${key}: curated entry missing`);
    assert.deepEqual(curatedDossierPortraitIds(),[key]);
    assert.equal(entry.status,"approved");
    assert.match(entry.provenance,/Original Character Forge vector illustration/);
    const svg=readFileSync(fileURLToPath(entry.src),"utf8");
    assert.match(svg,/<svg\b/);
    assert.match(svg,/Grave Warden and Oath Beacon/);
    assert.match(svg,/grave stones/i);
    assert.ok(svg.length>3000,"pilot SVG is unexpectedly trivial");
  }catch(error){
    console.error("[dossier-portrait-assets-test] pilot asset certification failed",error);
    throw error;
  }
});

test("approved exact variant renders curated color art plus the ink-saver crest",()=>{
  try{
    const key="grave-warden--oath-beacon";
    const html=dossierFallbackArt("paladin",{variantKey:key});
    assert.match(html,/data-curated-portrait="grave-warden--oath-beacon"/);
    assert.match(html,/ps-curated-dossier-portrait/);
    assert.match(html,/grave-warden--oath-beacon\.svg/);
    assert.match(html,/ps-placeholder-emblem/);
    assert.match(html,/Paladin radiant sword and oath shield crest/);
  }catch(error){
    console.error("[dossier-portrait-assets-test] curated render failed",error);
    throw error;
  }
});

test("curated print CSS shows approved art in color and restores the crest for Ink Saver",()=>{
  try{
    const css=readFileSync(fileURLToPath(new URL("../styles/print/premium-curated-dossier.css",import.meta.url)),"utf8");
    const loadPoint=readFileSync(fileURLToPath(new URL("../styles/print/premium-sorcerer.css",import.meta.url)),"utf8");
    assert.match(css,/\.premium-sheet:not\(\.sheet-print-ink-saver\) \.ps-curated-dossier-portrait\s*\{[^}]*display:block!important/s);
    assert.match(css,/\.premium-sheet:not\(\.sheet-print-ink-saver\) \.ps-curated-dossier-portrait \+ \.ps-placeholder-emblem\s*\{[^}]*display:none!important/s);
    assert.match(css,/\.premium-sheet\.sheet-print-ink-saver \.ps-curated-dossier-portrait\s*\{[^}]*display:none!important/s);
    assert.match(css,/\.premium-sheet\.sheet-print-ink-saver \.ps-curated-dossier-portrait \+ \.ps-placeholder-emblem\s*\{[^}]*display:grid!important/s);
    assert.ok(loadPoint.indexOf('premium-curated-dossier.css')>loadPoint.indexOf('premium-ink-saver.css'),"curated override must load after heraldic defaults");
  }catch(error){
    console.error("[dossier-portrait-assets-test] print visibility contract failed",error);
    throw error;
  }
});

test("missing or malformed variants fail closed to established class art",()=>{
  try{
    const key="__missing__--__missing__";
    assert.equal(curatedDossierPortraitFor(key),null);
    const missing=dossierFallbackArt("paladin",{variantKey:key});
    assert.match(missing,/ps-placeholder-illustrated/);
    assert.match(missing,/ps-class-crest/);
    assert.doesNotMatch(missing,/data-curated-portrait/);

    const malformed=dossierFallbackArt("fighter",{get variantKey(){throw new Error("fixture failure");}});
    assert.match(malformed,/ps-placeholder-emblem/);
    assert.match(malformed,/Fighter shield and crossed blades crest/);
  }catch(error){
    console.error("[dossier-portrait-assets-test] fail-closed contract failed",error);
    throw error;
  }
});
