import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderCharacter } from "../src/ui/render.js";
import { legacySafeCharacter } from "../src/ui/render-safe.js";

test("2024 noncaster species magic visibly renders in the Spell Reference panel",()=>{
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints={level:"5",species:"tiefling",class:"fighter",subclass:"champion",background:"soldier",name:"Infernal Reference Fighter"};
    state.speciesSelections={size:"Medium",legacy:"infernal",spellcastingAbility:"cha"};
    const character=generateCharacter(state),target={innerHTML:""};
    renderCharacter(legacySafeCharacter(character),target);
    assert.match(target.innerHTML,/<h3>Spell Reference<\/h3>/,"noncaster granted magic must expose the Spell Reference panel");
    for(const name of ["Fire Bolt","Thaumaturgy","Hellish Rebuke","Darkness"])assert.ok(target.innerHTML.includes(name),`${name} species magic missing from visible Spell Reference`);
    assert.match(target.innerHTML,/Species Cantrip/);
    assert.match(target.innerHTML,/Species Magic/);
    assert.doesNotMatch(target.innerHTML,/Missing SRD|undefined|null/);
  }catch(error){console.error("[test] noncaster species spell-reference render failed",error);throw error;}
});
