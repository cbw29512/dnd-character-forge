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

test("every standalone print page carries edition-specific SRD/CC attribution",()=>{
  for(const [ruleset,sourcePattern] of [["2014",/dnd\.wizards\.com\/resources\/systems-reference-document/],["2024",/dndbeyond\.com\/srd/]]){
    for(const packetMode of ["table","deluxe"]){
      const {html,model}=render(make(ruleset,packetMode));
      assert.match(html,/Wizards of the Coast LLC/);
      assert.match(html,/CC BY 4\.0/);
      assert.match(html,/creativecommons\.org\/licenses\/by\/4\.0\//);
      assert.match(html,sourcePattern);
      assert.equal((html.match(/class="ps-license"/g)||[]).length,model.packet.totalPages,`${ruleset} ${packetMode} attribution count`);
    }
  }
});

test("print cascade loads compact attribution footer styling",()=>{
  const sorcerer=fs.readFileSync(new URL("../styles/print/premium-sorcerer.css",import.meta.url),"utf8");
  const attribution=fs.readFileSync(new URL("../styles/print/premium-attribution.css",import.meta.url),"utf8");
  assert.match(sorcerer,/premium-attribution\.css/);
  assert.match(attribution,/\.ps-footer>\.ps-license/);
  assert.match(attribution,/grid-column:1\/-1/);
  assert.match(attribution,/white-space:nowrap/);
});
