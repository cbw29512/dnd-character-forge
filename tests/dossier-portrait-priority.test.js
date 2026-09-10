import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

test("player-uploaded portrait remains higher priority than an exact compatible curated dossier variant",()=>{
  try{
    const state=createInitialState();
    state.sourceMode=SOURCE.HOMEBREW;
    state.ruleset="2024";
    state.constraints.level="7";
    state.constraints.class="paladin";
    state.constraints.subclass="oath-beacon";
    state.constraints.species="human";
    state.constraints.background="grave-warden";
    state.constraints.name="Upload Priority Witness";
    const character=generateCharacter(state);
    assert.equal(character.sourceMode,SOURCE.HOMEBREW);
    assert.equal(character.audit?.rawIntegrity,false);
    assert.equal(character.validation.valid,true,"upload-priority compatible fixture must remain legal");

    character.presentation={
      ...(character.presentation||{}),
      portraitDataUrl:"data:image/jpeg;base64,QUJD",
      sheetCustomization:{packetMode:"deluxe",portraitVisible:true}
    };
    const target={innerHTML:""},model=renderPremiumPrintSheet(character,target);
    assert.equal(model.dossier?.artDirection?.variantKey,"grave-warden--oath-beacon");
    assert.equal(model.portraitDataUrl,"data:image/jpeg;base64,QUJD");
    assert.match(target.innerHTML,/ps-dossier-portrait-art has-image/);
    assert.match(target.innerHTML,/src="data:image\/jpeg;base64,QUJD"/);
    assert.doesNotMatch(target.innerHTML,/data-curated-portrait=/);
    assert.doesNotMatch(target.innerHTML,/grave-warden--oath-beacon\.svg/);
  }catch(error){
    console.error("[dossier-portrait-priority-test] upload priority failed",error);
    throw error;
  }
});
