import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

function render(ruleset){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level="20";
    state.constraints.class="paladin";
    state.constraints.subclass="oath-devotion";
    state.constraints.species="human";
    state.constraints.background=ruleset==="2014"?"acolyte":"soldier";
    state.classSelections={fightingStyle:"defense"};
    const target={innerHTML:""};
    renderPremiumPrintSheet(generateCharacter(state),target);
    return target.innerHTML.replaceAll("&amp;","&").replaceAll("&#39;", "'");
  }catch(error){console.error(`[test] ${ruleset} Paladin print polish`,error);throw error;}
}

test("Paladin spell page keeps levels 0-9 and adds an Oath and Smite field reference",()=>{
  for(const ruleset of ["2014","2024"]){
    const html=render(ruleset);
    assert.ok(html.includes("Oath & Smite Reference"));
    assert.ok(html.includes("Oathbound field reference"));
    for(let level=0;level<=9;level++)assert.match(html,new RegExp(`ps-spell-level level-${level}`));
  }
});

test("2014 Paladin field reference is edition-pure",()=>{
  const html=render("2014");
  for(const expected of ["Divine Smite","Lay On Hands","Aura of Protection","Sacred Oath"])assert.ok(html.includes(expected),`missing ${expected}`);
  for(const forbidden of ["Paladin's Smite","Abjure Foes","Weapon Mastery","Restoring Touch"])assert.equal(html.includes(forbidden),false,`2014 Paladin print leaked ${forbidden}`);
});

test("2024 Paladin field reference uses the revised resource flow",()=>{
  const html=render("2024");
  for(const expected of ["Paladin's Smite","Lay On Hands","Channel Divinity","Aura & Oath","Abjure Foes"])assert.ok(html.includes(expected),`missing ${expected}`);
  for(const forbidden of ["Improved Divine Smite","Cleansing Touch","Purity of Spirit","Turn the Unholy"])assert.equal(html.includes(forbidden),false,`2024 Paladin print leaked ${forbidden}`);
});

test("Paladin half-caster CSS reserves intentional field-reference space",()=>{
  const css=readFileSync(new URL("../styles/print/premium-official-flow.css",import.meta.url),"utf8");
  assert.match(css,/theme-paladin-oath \.ps-spell-level-grid/);
  assert.match(css,/\.ps-paladin-spell-support/);
  assert.match(css,/\.ps-paladin-support-grid/);
});
