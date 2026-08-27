import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildPremiumPrintModel } from "../src/print/model.js";
import { createDefaultSheetCustomization, normalizeSheetCustomization, sheetCustomizationClasses } from "../src/print/customization.js";
import { PRINT_THEMES, selectPrintTheme } from "../src/print/theme.js";
import { classPlaceholderArt } from "../src/print/class-art.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

function characterAt(classId,level="20"){
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints.level=String(level);
    state.constraints.class=classId;
    state.constraints.subclass="random";
    state.constraints.species="human";
    state.constraints.background="criminal";
    return generateCharacter(state);
  }catch(error){
    console.error(`[test] premium customization ${classId}/${level}`,error);
    throw error;
  }
}

test("premium customization defaults are presentation-only and stable",()=>{
  const value=createDefaultSheetCustomization();
  assert.deepEqual(value,{style:"ornate",paper:"ivory",ornament:"rich",frame:"class",printMode:"premium",packetMode:"deluxe",portraitVisible:true,portraitX:50,portraitY:32,portraitZoom:100,portraitFilter:"natural"});
});

test("customization normalization clamps unsafe or unknown values",()=>{
  const value=normalizeSheetCustomization({style:"unknown",paper:"white",portraitX:-50,portraitY:500,portraitZoom:999,portraitFilter:"grayscale",portraitVisible:false});
  assert.equal(value.style,"ornate");assert.equal(value.paper,"white");assert.equal(value.portraitX,0);assert.equal(value.portraitY,100);assert.equal(value.portraitZoom,165);assert.equal(value.portraitFilter,"grayscale");assert.equal(value.portraitVisible,false);
  assert.match(sheetCustomizationClasses(value),/sheet-paper-white/);assert.match(sheetCustomizationClasses(value),/portrait-filter-grayscale/);
});

test("all twelve core classes have distinct premium theme hooks and original sigils",()=>{
  const ids=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
  assert.deepEqual(Object.keys(PRINT_THEMES).sort(),[...ids].sort());assert.equal(new Set(ids.map(id=>PRINT_THEMES[id].id)).size,12);
  for(const id of ids){
    const theme=selectPrintTheme({class:{id}});
    assert.ok(theme.visualIdentity);assert.ok(theme.motif);assert.match(classPlaceholderArt(id),/ps-placeholder-svg/);
    assert.match(classPlaceholderArt(id),new RegExp(`aria-label=\\"[^\\"]*${id === "wizard" ? "Wizard" : id.charAt(0).toUpperCase()+id.slice(1)}`));
  }
});

test("the selected class owns the printable sheet identity regardless of subclass or other choices",()=>{
  const cases=[
    ["fighter","fighter-steel",/shield-blades/],
    ["druid","druid-wild",/leaf-antler/],
    ["wizard","wizard-arcane",/spellbook-stars/]
  ];
  for(const [classId,themeId,motif] of cases){
    const character=characterAt(classId);
    character.subclass={id:"different-subclass"};
    const model=buildPremiumPrintModel(character);
    assert.equal(model.identity.classId,classId);assert.equal(model.theme.id,themeId);assert.match(model.theme.motif,motif);
  }
});

test("supported classes project useful class-specific resource modules",()=>{
  const cases=[["fighter","Martial Resources"],["wizard","Arcane Toolkit"],["cleric","Sacred Channel"]];
  for(const [classId,title] of cases){const model=buildPremiumPrintModel(characterAt(classId));assert.equal(model.classUtility.title,title);assert.equal(model.classUtility.stats.length,4);}
  assert.equal(buildPremiumPrintModel(characterAt("rogue")).classUtility,null);
});

test("portrait visibility and tuning never alter character rules",()=>{
  const character=characterAt("fighter"),original={ac:character.ac,hp:character.hp,attacks:structuredClone(character.attacks),validation:structuredClone(character.validation)};
  character.presentation={portraitDataUrl:"data:image/jpeg;base64,QUJD",sheetCustomization:{portraitVisible:false,portraitX:3,portraitY:97,portraitZoom:165,style:"minimal",printMode:"ink-saver"}};
  const model=buildPremiumPrintModel(character);assert.equal(model.portraitDataUrl,null);assert.match(model.presentation.classes,/sheet-style-minimal/);assert.match(model.presentation.classes,/sheet-print-ink-saver/);assert.equal(character.ac,original.ac);assert.equal(character.hp,original.hp);assert.deepEqual(character.attacks,original.attacks);assert.deepEqual(character.validation,original.validation);
});

test("visible uploaded portrait renders with exact focal point zoom and finish",()=>{
  const character=characterAt("wizard"),target={innerHTML:""};
  character.presentation={portraitDataUrl:"data:image/jpeg;base64,QUJD",sheetCustomization:{portraitVisible:true,portraitX:7,portraitY:84,portraitZoom:143,portraitFilter:"painted",frame:"filigree"}};
  const model=renderPremiumPrintSheet(character,target);
  assert.equal(model.portraitDataUrl,"data:image/jpeg;base64,QUJD");assert.equal(model.presentation.customization.portraitX,7);assert.equal(model.presentation.customization.portraitY,84);assert.equal(model.presentation.customization.portraitZoom,143);
  assert.match(target.innerHTML,/has-image/);assert.match(target.innerHTML,/portrait-filter-painted/);assert.match(target.innerHTML,/sheet-frame-filigree/);assert.match(target.innerHTML,/--portrait-x:7%;--portrait-y:84%;--portrait-zoom:1\.43/);assert.match(target.innerHTML,/object-position:var\(--portrait-x\) var\(--portrait-y\)/);assert.doesNotMatch(target.innerHTML,/class-placeholder class-wizard/);
});
