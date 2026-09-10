import assert from "node:assert/strict";
import test from "node:test";
import {
  curatedDossierPortraitFor,
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

test("missing curated variants fall back to the established class art",()=>{
  try{
    const key="grave-warden--oath-beacon";
    assert.equal(curatedDossierPortraitFor(key),null);
    const html=dossierFallbackArt("paladin",{variantKey:key});
    assert.match(html,/ps-placeholder-illustrated/);
    assert.match(html,/ps-placeholder-emblem/);
    assert.match(html,/ps-class-crest/);
    assert.doesNotMatch(html,/data-curated-portrait/);
  }catch(error){
    console.error("[dossier-portrait-assets-test] class fallback failed",error);
    throw error;
  }
});

test("malformed portrait inputs fail closed to class fallback",()=>{
  try{
    const html=dossierFallbackArt("fighter",{get variantKey(){throw new Error("fixture failure");}});
    assert.match(html,/ps-placeholder-emblem/);
    assert.match(html,/Fighter shield and crossed blades crest/);
  }catch(error){
    console.error("[dossier-portrait-assets-test] fail-closed contract failed",error);
    throw error;
  }
});
