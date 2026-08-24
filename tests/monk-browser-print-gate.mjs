import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {ruleset:"2014",species:"human",background:"acolyte",classSelections:{monkTool:"Smith's Tools"},customization:{style:"ornate",paper:"parchment",ornament:"rich",frame:"class",printMode:"premium"}},
  {ruleset:"2024",species:"human",background:"criminal",classSelections:{monkTool:"Smith's Tools"},customization:{style:"ornate",paper:"ivory",ornament:"rich",frame:"class",printMode:"premium"}}
];

mkdirSync(OUT,{recursive:true});
for(const item of CASES)verifyPacket(item);
console.log(`[monk-browser-print] verified ${CASES.length} fixed Monk premium PDFs in Chrome`);

function verifyPacket(testCase){
  try{
    const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-${testCase.species}-monk`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
    assert.equal(character.validation.valid,true,`${slug}: generated Monk is invalid`);
    assert.equal(character.audit.status,"PASS",`${slug}: Rules Audit did not pass`);
    assert.equal(character.audit.rawIntegrity,true,`${slug}: RAW integrity failed`);
    assert.equal(model.theme.id,"monk-focus",`${slug}: wrong print theme`);
    assert.equal(model.classUtility?.title,"Centered Discipline",`${slug}: Monk resource panel missing`);
    assert.equal(model.packet.totalPages,1,`${slug}: Monk must remain a one-page martial packet`);
    assert.equal(model.profile.caster,false,`${slug}: Monk cannot enter caster two-page flow`);
    assert.ok(model.abilities.every(item=>item.proficient),`${slug}: Diamond Soul/Disciplined Survivor save markers are incomplete`);
    for(const [key,value] of Object.entries(testCase.customization))assert.equal(model.presentation.customization[key],value,`${slug}: customization ${key}`);

    writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
    execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
    const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);
    assert.equal(pages,1,`${slug}: browser PDF must be exactly one Letter page`);
    assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);

    execFileSync("pdftotext",["-layout",pdfPath,txtPath]);
    execFileSync("pdftoppm",["-png","-r","120",pdfPath,pngPrefix]);
    const extracted=readFileSync(txtPath,"utf8"),pagesText=pdfPages(extracted);
    assert.equal(pagesText.length,1,`${slug}: extracted page count mismatch`);
    const whole=normalize(extracted),fold=whole.toLowerCase();
    assert.ok(whole.length>900,`${slug}: one-page Monk PDF is suspiciously sparse (${whole.length} chars)`);
    assert.match(whole,/Page\s+1\s*\/\s*1/i,`${slug}: page marker missing`);
    const tokens=[character.name,...model.attacks.map(item=>item.name),...model.equipment,...model.ruleIndex.map(item=>item.name),model.classUtility.title];
    for(const token of tokens)assert.ok(fold.includes(normalize(token).toLowerCase()),`${slug}: printed PDF lost expected content: ${token}`);
    for(const phrase of ["RAW Integrity","Centered Discipline","Martial Arts","Unarmored Defense","Open Hand Technique","Wholeness of Body","Quivering Palm"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing Monk contract text: ${phrase}`);

    if(testCase.ruleset==="2014"){
      for(const phrase of ["Ki","Deflect Missiles","Ki-Empowered Strikes","Diamond Soul","Empty Body","Perfect Self","Tranquility","10d10 Necrotic"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing 2014 Monk text: ${phrase}`);
      for(const phrase of ["Monk's Focus","Deflect Attacks","Disciplined Survivor","Perfect Focus","Superior Defense","Body and Mind","Fleet Step","10d12 Force"])assert.equal(fold.includes(normalize(phrase).toLowerCase()),false,`${slug}: leaked 2024 Monk text: ${phrase}`);
    }else{
      for(const phrase of ["Focus","Deflect Attacks","Empowered Strikes","Disciplined Survivor","Perfect Focus","Superior Defense","Body and Mind","Fleet Step","Boon of Irresistible Offense","10d12 Force"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing 2024 Monk text: ${phrase}`);
      for(const phrase of ["Deflect Missiles","Ki-Empowered Strikes","Diamond Soul","Empty Body","Perfect Self","Tranquility","10d10 Necrotic"])assert.equal(fold.includes(normalize(phrase).toLowerCase()),false,`${slug}: leaked 2014 Monk text: ${phrase}`);
    }
    console.log(`[monk-browser-print] ${slug}: 1 Letter page · ${model.ruleIndex.length} rules · ${model.equipment.length} equipment · ${model.presentation.customization.style}/${model.presentation.customization.printMode}`);
  }catch(error){console.error(`[monk-browser-print] ${testCase.ruleset} gate failed`,error);throw error;}
}

function characterAt({ruleset,species,background,classSelections,customization}){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="monk";state.constraints.subclass="open-hand";state.constraints.species=species;state.constraints.background=background;state.classSelections=classSelections;const character=generateCharacter(state);character.presentation={...(character.presentation||{}),sheetCustomization:customization};return character;
  }catch(error){console.error(`[monk-browser-print] ${ruleset} character generation failed`,error);throw error;}
}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function pdfPages(text){const pages=String(text||"").split("\f");while(pages.length&&normalize(pages.at(-1))==="")pages.pop();return pages;}
function normalize(value){return String(value||"").replace(/[’‘]/g,"'").replace(/[–—]/g,"-").replace(/\s+/g," ").trim();}
