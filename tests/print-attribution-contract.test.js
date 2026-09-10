import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

function make(ruleset,packetMode="table"){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level="7";
  state.constraints.class="fighter";
  state.constraints.subclass="random";
  state.constraints.species="human";
  state.constraints.background=ruleset==="2024"?"soldier":"acolyte";
  const character=generateCharacter(state);
  character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode}};
  return character;
}

function render(character){
  const target={innerHTML:""};
  const model=renderPremiumPrintSheet(character,target);
  return{html:target.innerHTML,model};
}

test("every standalone print page carries prescribed edition-specific SRD/CC attribution",()=>{
  for(const [ruleset,sourcePattern,prescribed] of [
    ["2014",/dnd\.wizards\.com\/resources\/systems-reference-document/,/This work includes material taken from the System Reference Document 5\.1/],
    ["2024",/dndbeyond\.com\/srd/,/This work includes material from the System Reference Document 5\.2\.1/]
  ]){
    for(const packetMode of ["table","deluxe"]){
      const {html,model}=render(make(ruleset,packetMode));
      assert.match(html,prescribed);
      assert.match(html,/Wizards of the Coast LLC/);
      assert.match(html,/Creative Commons Attribution 4\.0 International License/);
      assert.match(html,/creativecommons\.org\/licenses\/by\/4\.0\/legalcode/);
      assert.match(html,sourcePattern);
      assert.equal((html.match(/class="ps-license"/g)||[]).length,model.packet.totalPages,`${ruleset} ${packetMode} attribution count`);
    }
  }
});

test("print cascade reserves wrapping room and gives attribution final footer ownership",()=>{
  const sorcerer=fs.readFileSync(new URL("../styles/print/premium-sorcerer.css",import.meta.url),"utf8");
  const attribution=fs.readFileSync(new URL("../styles/print/premium-attribution.css",import.meta.url),"utf8");
  const readabilityIndex=sorcerer.indexOf("premium-readability.css");
  const v5Index=sorcerer.indexOf("premium-v5-layout.css");
  const attributionIndex=sorcerer.indexOf("premium-attribution.css");
  assert.ok(readabilityIndex>=0&&v5Index>readabilityIndex,"V5 layout must follow readability capacity rules");
  assert.ok(attributionIndex>v5Index,"attribution must load last so its prescribed footer typography cannot be re-expanded");
  assert.match(attribution,/\.ps-footer>\.ps-license/);
  assert.match(attribution,/grid-column:1\/-1/);
  assert.match(attribution,/white-space:normal/);
  assert.doesNotMatch(attribution,/white-space:nowrap/);
});
