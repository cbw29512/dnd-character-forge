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
    const entry={variantKey:"grave-warden--oath-beacon",src:"file:///approved.webp",backgroundSymbol:"unmarked grave",pathSymbol:"beacon in smoke",status:"approved",provenance:"Character Forge original art"};
    assert.equal(isCuratedDossierPortraitEntry(entry,"grave-warden--oath-beacon"),true);
    assert.equal(isCuratedDossierPortraitEntry({...entry,status:"draft"},entry.variantKey),false);
    assert.equal(isCuratedDossierPortraitEntry({...entry,pathSymbol:""},entry.variantKey),false);
    assert.equal(isCuratedDossierPortraitEntry(entry,"criminal--oath-beacon"),false);
  }catch(error){console.error("[dossier-portrait-assets-test] schema contract failed",error);throw error;}
});

test("Grave Warden Oath Beacon resolves to a real original SVG asset",()=>{
  try{
    const key="grave-warden--oath-beacon",entry=curatedDossierPortraitFor(key);
    assert.ok(entry,`${key}: curated entry missing`);
    assert.deepEqual(curatedDossierPortraitIds(),[key]);
    assert.equal(entry.status,"approved");
    assert.match(entry.provenance,/Original Character Forge vector illustration/);
    const svg=readFileSync(fileURLToPath(entry.src),"utf8");
    assert.match(svg,/<svg\b/);assert.match(svg,/Grave Warden and Oath Beacon/);assert.match(svg,/grave stones/i);assert.ok(svg.length>3000,"pilot SVG is unexpectedly trivial");
  }catch(error){console.error("[dossier-portrait-assets-test] pilot asset certification failed",error);throw error;}
});

test("exact curated art outranks a reusable layer pair for the same variant",()=>{
  try{
    const key="grave-warden--oath-beacon",html=dossierFallbackArt("paladin",{backgroundId:"grave-warden",pathId:"oath-beacon",variantKey:key});
    assert.match(html,/data-curated-portrait="grave-warden--oath-beacon"/);assert.doesNotMatch(html,/data-composed-portrait/);assert.match(html,/grave-warden--oath-beacon\.svg/);assert.match(html,/Paladin radiant sword and oath shield crest/);
  }catch(error){console.error("[dossier-portrait-assets-test] exact priority failed",error);throw error;}
});

test("approved reusable layers render a story vignette before generic class fallback",()=>{
  try{
    const html=dossierFallbackArt("ranger",{backgroundId:"deep-sailor",pathId:"tempest-scout",variantKey:"deep-sailor--tempest-scout"});
    assert.match(html,/data-composed-portrait="deep-sailor--tempest-scout"/);assert.match(html,/ps-composed-scene/);assert.match(html,/ps-composed-background-art/);assert.match(html,/ps-composed-class-crest/);assert.match(html,/ps-composed-path-art/);assert.match(html,/Ranger bow arrow and woodland trail crest/);assert.doesNotMatch(html,/ps-class-portrait-image/);assert.doesNotMatch(html,/data-curated-portrait/);
  }catch(error){console.error("[dossier-portrait-assets-test] composed priority failed",error);throw error;}
});

test("composed color art uses one self-painted SVG while Ink Saver restores the crest",()=>{
  try{
    const css=readFileSync(fileURLToPath(new URL("../styles/print/premium-curated-dossier.css",import.meta.url)),"utf8"),loadPoint=readFileSync(fileURLToPath(new URL("../styles/print/premium-sorcerer.css",import.meta.url)),"utf8");
    assert.match(css,/ps-composed-dossier-portrait\{[^}]*z-index:2/s,"composed scene must sit above the generic narrative overlay");
    assert.match(css,/ps-narrative-fallback:has\(\.ps-composed-dossier-portrait\)::after\{[^}]*z-index:1/s,"generic fallback overlay must remain below composed art");
    assert.match(css,/\.premium-sheet:not\(\.sheet-print-ink-saver\)[\s\S]*\.ps-composed-dossier-portrait\{[\s\S]*display:block!important/s);
    assert.match(css,/sheet-print-ink-saver[\s\S]*ps-curated-dossier-portrait[\s\S]*ps-composed-dossier-portrait/);
    assert.ok(loadPoint.indexOf('premium-curated-dossier.css')>loadPoint.indexOf('premium-ink-saver.css'),"dossier art override must load after heraldic defaults");
  }catch(error){console.error("[dossier-portrait-assets-test] print visibility contract failed",error);throw error;}
});

test("missing or malformed variants fail closed to established class art",()=>{
  try{
    const key="__missing__--__missing__";assert.equal(curatedDossierPortraitFor(key),null);
    const missing=dossierFallbackArt("paladin",{variantKey:key});assert.match(missing,/ps-placeholder-illustrated/);assert.match(missing,/ps-class-crest/);assert.doesNotMatch(missing,/data-curated-portrait|data-composed-portrait/);
    const malformed=dossierFallbackArt("fighter",{get variantKey(){throw new Error("fixture failure");}});assert.match(malformed,/ps-placeholder-emblem/);assert.match(malformed,/Fighter shield and crossed blades crest/);
  }catch(error){console.error("[dossier-portrait-assets-test] fail-closed contract failed",error);throw error;}
});
