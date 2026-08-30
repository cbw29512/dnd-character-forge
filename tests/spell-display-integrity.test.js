import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { spellDisplayCatalog } from "../src/ui/spell-display-catalog.js";
import { renderCharacter } from "../src/ui/render.js";
import { legacySafeCharacter } from "../src/ui/render-safe.js";

const CASTERS=["wizard","cleric","bard","druid","paladin","ranger","sorcerer","warlock"];

function generatedCaster(ruleset,classId,level="20"){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints={level,species:"human",class:classId,subclass:"random",background:ruleset==="2014"?"acolyte":"sage",name:`${ruleset} ${classId} display audit`};
    return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} ${classId} display fixture failed`,error);throw error;}
}

function activeSpellIds(character){
  return [...new Set([
    ...(character.spells?.cantrips?.all||[]),
    ...(character.spells?.known?.all||[]),
    ...(character.spells?.prepared?.all||[]),
    ...(character.spells?.alwaysPrepared||[]),
    ...(character.spells?.spellbook?.all||[]),
    ...(character.spells?.tome?.cantrips||[]),
    ...(character.spells?.tome?.rituals||[]),
    ...(character.spells?.invocationSpells||[]),
    ...Object.values(character.spells?.mysticArcanum||{}).filter(Boolean)
  ])];
}

test("every generated caster spell resolves to verified display metadata in both editions",()=>{
  try{
    for(const ruleset of ["2014","2024"])for(const classId of CASTERS){
      const character=generatedCaster(ruleset,classId),catalog=spellDisplayCatalog(character),ids=activeSpellIds(character);
      assert.ok(ids.length>0,`${ruleset} ${classId} should have active spells at level 20`);
      for(const id of ids){const spell=catalog.get(id);assert.ok(spell,`${ruleset} ${classId} is missing display metadata for ${id}`);assert.ok(Number.isInteger(spell.level)&&spell.level>=0&&spell.level<=9,`${ruleset} ${classId} has invalid display level for ${id}`);}
    }
  }catch(error){console.error("[test] cross-caster display metadata audit failed",error);throw error;}
});

test("2024 Druid prepared spells render under their actual spell levels",()=>{
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints={level:"18",species:"gnome",class:"druid",subclass:"circle-land",background:"sage",name:"Spell Level Audit Druid"};
    state.classSelections={primalOrder:"magician",circleLand:"polar",elementalFury:"potent-spellcasting",knownForms:["rat","riding-horse","spider","wolf","black-bear","reef-shark","brown-bear","pteranodon"]};
    state.spellSelections.prepared=["plant-growth","revivify","wind-walk","fire-storm"];
    const character=generateCharacter(state),target={innerHTML:""};
    renderCharacter(legacySafeCharacter(character),target);
    assert.match(target.innerHTML,/<span>Level 3<\/span><p>[^<]*Plant Growth[^<]*Revivify/);
    assert.match(target.innerHTML,/<span>Level 6<\/span><p>[^<]*Wind Walk/);
    assert.match(target.innerHTML,/<span>Level 7<\/span><p>[^<]*Fire Storm/);
    assert.doesNotMatch(target.innerHTML,/<span>Level 1<\/span><p>[^<]*(?:Plant Growth|Revivify|Wind Walk|Fire Storm)/);
  }catch(error){console.error("[test] Druid spell-level rendering failed",error);throw error;}
});

test("2014 spells-known casters visibly render their Known spells",()=>{
  try{
    for(const classId of ["bard","ranger","sorcerer","warlock"]){
      const character=generatedCaster("2014",classId,"10"),target={innerHTML:""};
      assert.ok(character.spells.known.all.length>0,`2014 ${classId} fixture should know leveled spells`);
      renderCharacter(legacySafeCharacter(character),target);
      assert.match(target.innerHTML,/<strong>Known<\/strong>/,`2014 ${classId} screen sheet should expose its known spells`);
      const catalog=spellDisplayCatalog(character),knownName=catalog.get(character.spells.known.all[0])?.name;
      assert.ok(knownName&&target.innerHTML.includes(knownName),`2014 ${classId} screen sheet should name a known spell`);
    }
  }catch(error){console.error("[test] known-spell screen rendering failed",error);throw error;}
});

test("Warlock display metadata covers cross-list Pact and invocation magic",()=>{
  try{
    for(const ruleset of ["2014","2024"]){
      const character=generatedCaster(ruleset,"warlock"),catalog=spellDisplayCatalog(character);
      assert.ok(catalog.has("find-familiar"),`${ruleset} Warlock display catalog should cover Pact of the Chain / Tome Find Familiar`);
      assert.ok(catalog.has("guidance"),`${ruleset} Warlock display catalog should cover cross-list Pact of the Tome cantrips`);
    }
  }catch(error){console.error("[test] Warlock bonus-magic display catalog failed",error);throw error;}
});

test("screen spell grouping fails closed and exposes every class spell bucket",async()=>{
  try{
    const source=await readFile(new URL("../src/ui/render.js",import.meta.url),"utf8");
    assert.match(source,/spellDisplayCatalog\(character\)/);
    assert.match(source,/Missing verified spell display metadata/);
    assert.doesNotMatch(source,/spell\?\.level\s*\|\|\s*1/);
    assert.match(source,/spellLevelGroups\("Known"/);
    assert.match(source,/Pact Tome Cantrips/);
    assert.match(source,/Pact Tome Rituals/);
    assert.match(source,/Invocation Spells/);
    assert.match(source,/Mystic Arcanum/);
  }catch(error){console.error("[test] fail-closed spell display contract failed",error);throw error;}
});
