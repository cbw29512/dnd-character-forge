import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {ruleset:"2014",subclass:"iron-tempest",background:"acolyte",features:["Driving Fury","Unbroken Advance","Steel Through the Gap","Tempest Reprisal"]},
  {ruleset:"2014",subclass:"stoneheart",background:"acolyte",features:["Stonehide Rage","Rooted Stance","Weather the Blow","The Mountain Remains"]},
  {ruleset:"2024",subclass:"iron-tempest",background:"soldier",features:["Driving Fury","Unbroken Advance","Steel Through the Gap","Tempest Reprisal"]},
  {ruleset:"2024",subclass:"stoneheart",background:"soldier",features:["Stonehide Rage","Rooted Stance","Weather the Blow","The Mountain Remains"]}
];

for(const testCase of CASES)verify(testCase);
console.log(`[barbarian-original-browser] verified ${CASES.length} Forge-original Barbarian Letter PDFs in Chrome`);

function verify(testCase){
  try{
    const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-human-barbarian-${testCase.subclass}`;
    assert.equal(character.validation.valid,true,`${slug}: validation failed`);
    assert.equal(character.audit.status,"PASS",`${slug}: audit failed`);
    assert.equal(character.audit.rawIntegrity,false,`${slug}: original content was mislabeled RAW`);
    assert.equal(model.packet.totalPages,1,`${slug}: Barbarian packet must remain one page`);
    assert.equal(model.classUtility?.title,"Primal Fury",`${slug}: Barbarian utility missing`);
    assert.equal(model.identity.subclassName,character.subclass.name,`${slug}: print model lost subclass identity`);
    const renderedHtml=normalizeHtml(target.innerHTML);
    assert.ok(renderedHtml.includes(normalizeHtml(character.subclass.name)),`${slug}: rendered sheet lost subclass identity before Chrome`);
    assert.ok(renderedHtml.includes("5e compatible"),`${slug}: rendered sheet lost compatible-content labeling`);
    assert.equal(renderedHtml.includes("pass · raw ·"),false,`${slug}: rendered footer still presents original content as RAW`);
    for(const feature of testCase.features){assert.ok(character.features.includes(feature),`${slug}: missing ${feature}`);assert.ok(model.ruleIndex.some(item=>item.name===feature),`${slug}: rules index missing ${feature}`);}

    const htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),rawTxtPath=path.join(OUT,`${slug}-raw.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
    writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
    execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
    const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});assert.match(info,/Pages:\s+1\b/,`${slug}: browser PDF is not one page`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);
    execFileSync("pdftotext",["-layout",pdfPath,txtPath]);execFileSync("pdftotext",["-raw",pdfPath,rawTxtPath]);execFileSync("pdftoppm",["-png","-r","96",pdfPath,pngPrefix]);
    const layout=normalize(readFileSync(txtPath,"utf8")),raw=normalize(readFileSync(rawTxtPath,"utf8")),fold=`${layout} ${raw}`.toLowerCase();
    assert.ok(layout.length>500,`${slug}: rendered PDF is suspiciously sparse (${layout.length} chars)`);
    assertPhrase(fold,character.subclass.name,`${slug}: subclass identity missing from PDF`);
    assertPhrase(fold,"compatible content",`${slug}: compatible-content footer missing`);
    assertPhrase(fold,"character forge original",`${slug}: original-content provenance missing from PDF`);
    for(const feature of testCase.features)assertPhrase(fold,feature,`${slug}: PDF lost ${feature}`);
    assert.equal(fold.includes("raw integrity"),false,`${slug}: PDF falsely claims RAW integrity`);
    console.log(`[barbarian-original-browser] ${slug}: 1 Letter page · compatible/original provenance visible`);
  }catch(error){console.error(`[barbarian-original-browser] failed ${testCase.ruleset} ${testCase.subclass}`,error);throw error;}
}

function characterAt({ruleset,subclass,background}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="barbarian";state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background=background;state.constraints.name=`Forge ${subclass}`;return generateCharacter(state);
}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function normalize(value){return String(value||"").normalize("NFKC").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[\u2010-\u2015]/g,"-").replace(/\s+/g," ").trim();}
function normalizeHtml(value){return normalize(String(value||"").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"')).toLowerCase();}
function assertPhrase(fold,phrase,message){const tokens=normalize(phrase).toLowerCase().split(/\s+/).filter(Boolean);assert.ok(tokens.every(token=>fold.includes(token)),message);}
