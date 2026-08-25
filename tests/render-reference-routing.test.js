import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";

test("screen renderer uses the class-aware quick-reference adapter",async()=>{
  try{
    const app=await readFile(new URL("../src/app.js",import.meta.url),"utf8");
    const adapter=await readFile(new URL("../src/ui/render-safe.js",import.meta.url),"utf8");
    assert.match(app,/from \"\.\/ui\/render-safe\.js\"/);
    assert.match(adapter,/from \"\.\.\/rules\/reference-router\.js\"/);
  }catch(error){console.error("[test] renderer routing contract failed",error);throw error;}
});

for(const ruleset of ["2014","2024"]){
  test(`${ruleset} Monk quick references include Unarmored Defense`,()=>{
    try{
      const state=createInitialState();
      state.ruleset=ruleset;
      state.constraints={level:"1",species:"random",class:"monk",subclass:"random",background:"random",name:"Routing Test Monk"};
      const character=generateCharacter(state);
      const references=buildQuickReference(character);
      assert.ok(references.some(item=>item.name==="Unarmored Defense"),`Missing Unarmored Defense for ${ruleset} Monk`);
    }catch(error){console.error(`[test] ${ruleset} Monk routing contract failed`,error);throw error;}
  });
}
