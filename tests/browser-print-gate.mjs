import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url)),OUT=path.join(ROOT,"tests/.browser-print"),CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {ruleset:"2024",classId:"fighter",subclass:"champion",species:"human",background:"criminal",pages:1,customization:{style:"ornate",paper:"parchment",ornament:"rich",frame:"filigree",printMode:"premium"}},
  {ruleset:"2024",classId:"barbarian",subclass:"berserker",species:"human",background:"soldier",pages:1},
  {ruleset:"2024",classId:"rogue",subclass:"thief",species:"human",background:"criminal",pages:1,customization:{style:"minimal",paper:"white",ornament:"minimal",frame:"clean",printMode:"ink-saver"}},
  {ruleset:"2024",classId:"wizard",subclass:"evoker",species:"human",background:"criminal",pages:2,customization:{style:"ornate",paper:"ivory",ornament:"rich",frame:"class",portraitX:4,portraitY:91,portraitZoom:165,portraitFilter:"painted"}},
  {ruleset:"2024",classId:"cleric",subclass:"life-domain",species:"human",background:"criminal",pages:2,customization:{style:"classic",paper:"ivory",ornament:"balanced",frame:"filigree"}},
  {ruleset:"2014",classId:"wizard",subclass:"school-evocation",species:"human",background:"acolyte",pages:2},
  {ruleset:"2014",classId:"cleric",subclass:"life-domain",species:"dwarf",background:"acolyte",speciesSelections:{tool:"masons-tools"},pages:2},
  {ruleset:"2014",classId:"rogue",subclass:"thief",species:"human",background:"acolyte",pages:1},
  {ruleset:"2014",classId:"barbarian",subclass:"berserker",species:"human",background:"acolyte",pages:1}
];
rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});for(const item of CASES)verifyPacket(item);console.log(`[browser-print] verified ${CASES.length} fixed premium PDFs in Chrome`);

function verifyPacket(testCase){
  const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-${testCase.species}-${testCase.classId}`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
  if(testCase.customization){for(const [key,value] of Object.entries(testCase.customization))assert.equal(model.presentation.customization[key],value,`${slug}: customization ${key}`);}
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);assert.equal(model.packet.totalPages,testCase.pages,`${slug}: model violates fixed page profile`);assert.equal(pages,testCase.pages,`${slug}: browser PDF violates fixed page profile`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);
  execFileSync("pdftotext",["-layout",pdfPath,txtPath]);execFileSync("pdftoppm",["-png","-r","96",pdfPath,pngPrefix]);const extracted=readFileSync(txtPath,"utf8"),pageText=pdfPages(extracted);assert.equal(pageText.length,pages,`${slug}: extracted page count mismatch`);for(let index=0;index<pageText.length;index++){const text=normalize(pageText[index]);assert.ok(text.length>500,`${slug}: page ${index+1} is suspiciously sparse (${text.length} chars)`);assert.match(text,new RegExp(`Page\\s+${index+1}\\s*\\/\\s*${pages}`,"i"),`${slug}: page marker missing`);}
  const whole=normalize(extracted),wholeFold=whole.toLowerCase(),tokens=[character.name,...model.attacks.map(item=>item.name),...model.equipment,...model.ruleIndex.map(item=>item.name),...(model.classUtility?[model.classUtility.title]:[]),...(model.spellPage?.entries||[]).map(item=>item.name)];for(const token of tokens)assert.ok(wholeFold.includes(normalize(token).toLowerCase()),`${slug}: printed PDF lost expected content: ${token}`);assert.ok(wholeFold.includes("raw integrity"),`${slug}: audit integrity marker missing`);
  legacyChecks(testCase,character,whole,model);console.log(`[browser-print] ${slug}: ${pages} Letter page${pages===1?"":"s"} · ${model.ruleIndex.length} rules · ${model.equipment.length} equipment · ${model.spellPage?.entries.length||0} spells · ${model.presentation.customization.style}/${model.presentation.customization.printMode}`);
}
function legacyChecks(testCase,character,whole,model){
  if(testCase.ruleset==="2014"&&testCase.classId==="wizard"){assert.equal(character.spells.spellbook.all.length,44);assert.equal(model.spellPage.entries.length,49);assert.ok(whole.includes("Spell Mastery"));assert.ok(whole.includes("Signature Spells"));}
  if(testCase.ruleset==="2014"&&testCase.classId==="cleric"){assert.equal(character.spells.cantrips.all.length,5);assert.equal(character.spells.prepared.all.length,25);assert.equal(character.spells.alwaysPrepared.length,10);assert.equal(model.spellPage.entries.length,40);assert.ok(whole.includes("Cleric spell list pp.106-107"));assert.ok(whole.includes("Destroy Undead (CR 4)"));assert.ok(whole.includes("Supreme Healing"));}
  if(testCase.ruleset==="2014"&&testCase.species==="dwarf"){assert.equal(character.speciesChoices.subraceName,"Hill Dwarf");assert.equal(character.speciesHpBonus,20);assert.ok(whole.includes("Hill Dwarf"));assert.ok(whole.includes("Dwarven Toughness"));}
  if(testCase.ruleset==="2014"&&testCase.classId==="rogue"){assert.ok(whole.includes("Blindsense"));assert.ok(whole.includes("Use Magic Device"));assert.ok(whole.includes("Thief's Reflexes"));assert.equal(whole.includes("Cunning Strike DC"),false);assert.equal(whole.includes("Steady Aim"),false);}
  if(testCase.classId==="barbarian"){
    assert.equal(model.packet.totalPages,1);assert.equal(model.classUtility?.title,"Primal Fury");assert.ok(whole.includes("Primal Fury"));assert.ok(whole.includes("Rage"));assert.ok(whole.includes("Berserker"));assert.ok(whole.includes("Primal Champion"));
    if(testCase.ruleset==="2014"){
      assert.ok(whole.includes("Brutal Critical"));assert.equal(whole.includes("Brutal Strike"),false);assert.equal(whole.includes("Weapon Mastery"),false);assert.equal(whole.includes("Epic Boon"),false);
    }else{
      assert.ok(whole.includes("Brutal Strike"));assert.ok(whole.includes("Weapon Mastery"));assert.ok(whole.includes("Cleave"));assert.ok(whole.includes("Epic Boon"));assert.equal(whole.includes("Brutal Critical"),false);
    }
  }
}
function characterAt({ruleset,classId,subclass,species,background,speciesSelections={},customization=null}){const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class=classId;state.constraints.subclass=subclass;state.constraints.species=species;state.constraints.background=background;state.speciesSelections=speciesSelections;const character=generateCharacter(state);if(customization)character.presentation={...(character.presentation||{}),sheetCustomization:customization};return character;}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function pdfPages(text){const pages=text.split("\f");while(pages.length&&pages.at(-1).trim()==="")pages.pop();return pages;}
function normalize(value){return String(value??"").normalize("NFKC").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/\s+/g," ").trim();}
