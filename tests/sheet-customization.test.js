import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { createDefaultSheetCustomization, normalizeSheetCustomization, sheetCustomizationClasses } from "../src/print/customization.js";
import { PRINT_THEMES, selectPrintTheme } from "../src/print/theme.js";
import { classPlaceholderArt } from "../src/print/class-art.js";

function characterAt(classId,subclass){
  try{
    const state=createInitialState();state.ruleset="2024";state.constraints.level="20";state.constraints.class=classId;state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background="criminal";return generateCharacter(state);
  }catch(error){console.error(`[test] premium customization ${classId}`,error);throw error;}
}

test("premium customization defaults are presentation-only and stable",()=>{
  const value=createDefaultSheetCustomization();assert.deepEqual(value,{style:"ornate",paper:"ivory",ornament:"rich",frame:"class",printMode:"premium",portraitVisible:true,portraitX:50,portraitY:32,portraitZoom:100,portraitFilter:"natural"});
});

test("customization normalization clamps unsafe or unknown values",()=>{
  const value=normalizeSheetCustomization({style:"unknown",paper:"white",portraitX:-50,portraitY:500,portraitZoom:999,portraitFilter:"grayscale",portraitVisible:false});
  assert.equal(value.style,"ornate");assert.equal(value.paper,"white");assert.equal(value.portraitX,0);assert.equal(value.portraitY,100);assert.equal(value.portraitZoom,165);assert.equal(value.portraitFilter,"grayscale");assert.equal(value.portraitVisible,false);
  assert.match(sheetCustomizationClasses(value),/sheet-paper-white/);assert.match(sheetCustomizationClasses(value),/portrait-filter-grayscale/);
});

test("all twelve core classes have distinct premium theme hooks and original sigils",()=>{
  const ids=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
  assert.deepEqual(Object.keys(PRINT_THEMES).sort(),[...ids].sort());assert.equal(new Set(ids.map(id=>PRINT_THEMES[id].id)).size,12);
  for(const id of ids){const theme=selectPrintTheme({class:{id}});assert.ok(theme.visualIdentity);assert.ok(theme.motif);assert.match(classPlaceholderArt(id),/ps-placeholder-svg/);}
});

test("supported classes project useful class-specific resource modules",()=>{
  const cases=[["fighter","champion","Martial Resources"],["wizard","evoker","Arcane Toolkit"],["cleric","life-domain","Sacred Channel"]];
  for(const [classId,subclass,title] of cases){const model=buildPremiumPrintModel(characterAt(classId,subclass));assert.equal(model.classUtility.title,title);assert.equal(model.classUtility.stats.length,4);}
  assert.equal(buildPremiumPrintModel(characterAt("rogue","thief")).classUtility,null);
});

test("portrait visibility and tuning never alter character rules",()=>{
  const character=characterAt("fighter","champion"),original={ac:character.ac,hp:character.hp,attacks:structuredClone(character.attacks),validation:structuredClone(character.validation)};
  character.presentation={portraitDataUrl:"data:image/jpeg;base64,QUJD",sheetCustomization:{portraitVisible:false,portraitX:3,portraitY:97,portraitZoom:165,style:"minimal",printMode:"ink-saver"}};
  const model=buildPremiumPrintModel(character);assert.equal(model.portraitDataUrl,null);assert.match(model.presentation.classes,/sheet-style-minimal/);assert.match(model.presentation.classes,/sheet-print-ink-saver/);assert.equal(character.ac,original.ac);assert.equal(character.hp,original.hp);assert.deepEqual(character.attacks,original.attacks);assert.deepEqual(character.validation,original.validation);
});
