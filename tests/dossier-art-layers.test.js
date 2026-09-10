import assert from "node:assert/strict";
import test from "node:test";
import {
  DOSSIER_BACKGROUND_LAYERS,
  DOSSIER_PATH_LAYERS,
  composedDossierArtFor,
  isApprovedDossierArtLayer
} from "../src/print/dossier-art-layers.js";
import { composedDossierPortraitArt } from "../src/print/dossier-art-layer-renderer.js";

test("approved dossier layers are typed, renderable, and reusable",()=>{
  try{
    const background=DOSSIER_BACKGROUND_LAYERS["grave-warden"],path=DOSSIER_PATH_LAYERS["oath-beacon"];
    assert.equal(isApprovedDossierArtLayer(background,"grave-warden","background"),true);
    assert.equal(isApprovedDossierArtLayer(path,"oath-beacon","path"),true);
    assert.equal(isApprovedDossierArtLayer({...path,status:"draft"},"oath-beacon","path"),false);
    assert.equal(isApprovedDossierArtLayer({...path,vector:""},"oath-beacon","path"),false);
    const graveTempest=composedDossierArtFor("grave-warden","tempest-scout"),deepBeacon=composedDossierArtFor("deep-sailor","oath-beacon");
    assert.equal(graveTempest?.variantKey,"grave-warden--tempest-scout");
    assert.equal(deepBeacon?.variantKey,"deep-sailor--oath-beacon");
    assert.ok(graveTempest?.background.vector.length>80&&graveTempest?.path.vector.length>80,"approved composition must carry substantial background and path vectors");
    assert.ok(deepBeacon?.background.vector.length>80&&deepBeacon?.path.vector.length>80,"approved composition must carry substantial background and path vectors");
    assert.equal(composedDossierArtFor("criminal","oath-beacon"),null);
  }catch(error){
    console.error("[dossier-art-layers-test] layer contract failed",error);
    throw error;
  }
});

test("layer renderer builds a full-frame vignette with background, class identity, and path layers",()=>{
  try{
    const html=composedDossierPortraitArt("ranger",{backgroundId:"grave-warden",pathId:"tempest-scout",variantKey:"grave-warden--tempest-scout"});
    assert.match(html,/data-composed-portrait="grave-warden--tempest-scout"/);
    assert.match(html,/ps-composed-art-field/);
    assert.match(html,/ps-composed-background-art/);
    assert.match(html,/ps-composed-class-crest/);
    assert.match(html,/ps-composed-path-art/);
    assert.doesNotMatch(html,/ps-class-portrait-image/);
    assert.match(html,/M16 189/);
    assert.match(html,/m137 91/);
    assert.match(html,/Ranger bow arrow and woodland trail crest/);
  }catch(error){
    console.error("[dossier-art-layers-test] layered render failed",error);
    throw error;
  }
});
