import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference as buildCoreQuickReference } from "../src/rules/reference.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { legacySafeCharacter } from "../src/ui/render-safe.js";

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

function paladin(ruleset,styleId){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints={level:"2",species:"human",class:"paladin",subclass:"random",background:ruleset==="2014"?"acolyte":"soldier",name:`${ruleset} ${styleId} Paladin`};
  state.classSelections={fightingStyle:styleId};
  if(ruleset==="2024"&&styleId==="blessed-warrior")state.spellSelections={...state.spellSelections,cantrips:["guidance","sacred-flame"]};
  return generateCharacter(state);
}

test("every legal Paladin Fighting Style has a routed quick reference in both editions",()=>{
  try{
    const pools={"2014":["defense","dueling","great-weapon","protection"],"2024":["archery","defense","great-weapon","two-weapon","blessed-warrior"]};
    for(const ruleset of ["2014","2024"])for(const styleId of pools[ruleset]){
      const character=paladin(ruleset,styleId),style=character.fightingStyle,references=buildQuickReference(character),reference=references.find(item=>item.id===`style:${style.name}`);
      assert.ok(reference,`${ruleset} ${style.name} should have a routed style reference`);
      assert.equal(reference.name,style.name);
      assert.match(reference.source.version,/^SRD 5\./);
      assert.ok(reference.source.page);
    }
  }catch(error){console.error("[test] Paladin style routing completeness failed",error);throw error;}
});

test("Blessed Warrior stays in Paladin routing and cannot leak into the legacy generic reference lookup",()=>{
  try{
    const character=paladin("2024","blessed-warrior"),references=buildQuickReference(character),blessed=references.find(item=>item.name==="Blessed Warrior");
    assert.ok(blessed,"Blessed Warrior routed reference should exist");
    assert.equal(blessed.category,"Fighting Style");
    assert.equal(blessed.source.version,"SRD 5.2.1");
    assert.equal(blessed.source.page,"54");
    assert.match(blessed.text,/two Cleric cantrips/i);
    assert.match(blessed.text,/Charisma/i);
    assert.match(blessed.text,/Guidance/);
    assert.match(blessed.text,/Sacred Flame/);
    const safe=legacySafeCharacter(character);
    assert.equal(safe.fightingStyle,null);
    assert.deepEqual(safe.fightingStyles,[]);
    assert.doesNotThrow(()=>buildCoreQuickReference(safe));
  }catch(error){console.error("[test] Blessed Warrior legacy routing isolation failed",error);throw error;}
});

test("legacy-safe adapter preserves generated Fighter style state used by the visible Fighter resource summary",()=>{
  try{
    const state=createInitialState();state.ruleset="2024";state.constraints={level:"1",species:"human",class:"fighter",subclass:"random",background:"soldier",name:"Style-preservation Fighter"};
    const character=generateCharacter(state),safe=legacySafeCharacter(character);
    assert.ok(character.fightingStyle,"Generated Fighter should have a Fighting Style");
    assert.equal(safe.fightingStyle?.id,character.fightingStyle?.id);
    assert.deepEqual(safe.fightingStyles?.map(style=>style.id),character.fightingStyles?.map(style=>style.id));
    assert.doesNotThrow(()=>buildCoreQuickReference(safe));
  }catch(error){console.error("[test] Fighter legacy style preservation failed",error);throw error;}
});
