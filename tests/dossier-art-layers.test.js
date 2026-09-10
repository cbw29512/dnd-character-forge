import assert from "node:assert/strict";
import test from "node:test";
import {
  DOSSIER_BACKGROUND_LAYERS,
  DOSSIER_PATH_LAYERS,
  composedDossierArtFor,
  isApprovedDossierArtLayer
} from "../src/print/dossier-art-layers.js";
import { composedDossierPortraitArt } from "../src/print/dossier-art-layer-renderer.js";

test("approved dossier layers are typed and reusable",()=>{
  try{
    assert.equal(isApprovedDossierArtLayer(DOSSIER_BACKGROUND_LAYERS["grave-warden"],"grave-warden","background"),true);
    assert.equal(isApprovedDossierArtLayer(DOSSIER_PATH_LAYERS["oath-beacon"],"oath-beacon","path"),true);
    assert.equal(isApprovedDossierArtLayer({...DOSSIER_PATH_LAYERS["oath-beacon"],status:"draft"},"oath-beacon","path"),false);
    assert.equal(composedDossierArtFor("grave-warden","tempest-scout")?.variantKey,"grave-warden--tempest-scout");
    assert.equal(composedDossierArtFor("deep-sailor","oath-beacon")?.variantKey,"deep-sailor--oath-beacon");
    assert.equal(composedDossierArtFor("criminal","oath-beacon"),null);
  }catch(error){
    console.error("[dossier-art-layers-test] layer contract failed",error);
    throw error;
  }
});

test("layer renderer combines class portrait with both approved story motifs",()=>{
  try{
    const html=composedDossierPortraitArt("ranger",{backgroundId:"grave-warden",pathId:"tempest-scout",variantKey:"grave-warden--tempest-scout"});
    assert.match(html,/data-composed-portrait="grave-warden--tempest-scout"/);
    assert.match(html,/ps-class-portrait-image/);
    assert.match(html,/ps-composed-dossier-overlay/);
    assert.match(html,/ps-composed-background-layer|M18 190/);
    assert.match(html,/ps-composed-path-layer|m148 91/);
    assert.match(html,/Ranger bow arrow and woodland trail crest/);
  }catch(error){
    console.error("[dossier-art-layers-test] layered render failed",error);
    throw error;
  }
});
