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
  {ruleset:"2014",species:"human",background:"bounty-hunter",feature:"Known Pursuer",tool:"Thieves' Tools"},
  {ruleset:"2024",species:"dwarf",background:"field-medic",feat:"Skilled",tool:"Herbalism Kit"},
  {ruleset:"2024",species:"dwarf",background:"grave-warden",feat:"Magic Initiate (Cleric)",tool:"Herbalism Kit",magicInitiate:true}
];

mkdirSync(OUT,{recursive:true});
for(const testCase of CASES)verify(testCase);
console.log(`[background-browser] verified ${CASES.length} Forge-original background Letter PDFs in Chrome`);

function verify(testCase){
  try{
    const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-${testCase.species}-fighter-${testCase.background}`;
    assert.equal(character.validation.valid,true,`${slug}: validation failed`);
    assert.equal(character.audit.status,"PASS",`${slug}: audit failed`);
    assert.equal(character.audit.rawIntegrity,false,`${slug}: original background was mislabeled RAW`);
    assert.equal(model.packet.totalPages,1,`${slug}: Fighter background packet must remain one page`);
    assert.equal(model.identity.background,`${character.background.name} — Forge Original`,`${slug}: printable identity lost original-background label`);
    assert.ok(character.toolProficiencies.includes(testCase.tool),`${slug}: background tool missing`);
    if(testCase.feature)assert.ok(model.ruleIndex.some(item=>item.name===testCase.feature),`${slug}: background feature missing from rules index`);
    if(testCase.feat)assert.equal(model.feat?.name,testCase.feat,`${slug}: background Origin feat missing from print model`);
    if(testCase.magicInitiate){
      assert.ok(character.magicInitiate,`${slug}: Magic Initiate choices missing`);
      assertPhrase(model.feat.text,character.magicInitiate.cantripNames[0],`${slug}: first Magic Initiate cantrip missing from feat text`);
      assertPhrase(model.feat.text,character.magicInitiate.cantripNames[1],`${slug}: second Magic Initiate cantrip missing from feat text`);
      assertPhrase(model.feat.text,character.magicInitiate.level1SpellName,`${slug}: Magic Initiate level-1 spell missing from feat text`);
    }
    const renderedHtml=normalizeHtml(target.innerHTML);
    assert.ok(renderedHtml.includes(normalizeHtml(character.background.name)),`${slug}: rendered sheet lost background identity`);
    assert.ok(renderedHtml.includes("forge original"),`${slug}: rendered sheet lost Forge Original label`);
    assert.ok(renderedHtml.includes("5e compatible"),`${slug}: rendered sheet lost compatible-content labeling`);
    assert.equal(renderedHtml.includes("pass · raw ·"),false,`${slug}: rendered footer still presents original content as RAW`);

    const htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),rawTxtPath=path.join(OUT,`${slug}-raw.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
    writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
    execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
    const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});assert.match(info,/Pages:\s+1\b/,`${slug}: browser PDF is not one page`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);
    execFileSync("pdftotext",["-layout",pdfPath,txtPath]);execFileSync("pdftotext",["-raw",pdfPath,rawTxtPath]);execFileSync("pdftoppm",["-png","-r","96",pdfPath,pngPrefix]);
    const layout=normalize(readFileSync(txtPath,"utf8")),raw=normalize(readFileSync(rawTxtPath,"utf8")),fold=`${layout} ${raw}`.toLowerCase();
    assert.ok(layout.length>500,`${slug}: rendered PDF is suspiciously sparse (${layout.length} chars)`);
    assertPhrase(fold,character.background.name,`${slug}: background identity missing from PDF`);
    assertPhrase(fold,"Forge Original",`${slug}: original-content label missing from PDF`);
    assertPhrase(fold,"Compatible content",`${slug}: compatible-content footer missing from PDF`);
    if(testCase.feature)assertPhrase(fold,testCase.feature,`${slug}: PDF lost background feature`);
    if(testCase.feat)assertPhrase(fold,testCase.feat,`${slug}: PDF lost background feat`);
    if(testCase.magicInitiate){for(const name of [...character.magicInitiate.cantripNames,character.magicInitiate.level1SpellName])assertPhrase(fold,name,`${slug}: PDF lost Magic Initiate spell ${name}`);}
    assert.equal(fold.includes("raw integrity"),false,`${slug}: PDF falsely claims RAW integrity`);
    console.log(`[background-browser] ${slug}: 1 Letter page · ${character.background.name} compatible provenance visible`);
  }catch(error){console.error(`[background-browser] failed ${testCase.ruleset} ${testCase.background}`,error);throw error;}
}

function characterAt({ruleset,species,background}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level="5";state.constraints.class="fighter";state.constraints.subclass="champion";state.constraints.species=species;state.constraints.background=background;state.constraints.name=`Forge ${background}`;return generateCharacter(state);
}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function normalize(value){return String(value||"").normalize("NFKC").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[\u2010-\u2015]/g,"-").replace(/\s+/g," ").trim();}
function normalizeHtml(value){return normalize(String(value||"").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"')).toLowerCase();}
function assertPhrase(haystack,phrase,message){const fold=normalize(haystack).toLowerCase(),tokens=normalize(phrase).toLowerCase().split(/\s+/).filter(Boolean);assert.ok(tokens.every(token=>fold.includes(token)),message);}
