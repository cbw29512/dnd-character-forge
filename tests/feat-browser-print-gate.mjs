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
  {ruleset:"2014",background:"acolyte",featId:"grappler",featName:"Grappler",raw:true,source:"SRD 5.1",page:"75"},
  {ruleset:"2024",background:"soldier",featId:"grappler",featName:"Grappler",raw:true,source:"SRD 5.2.1",page:"87"},
  {ruleset:"2014",background:"acolyte",featId:"fleet-vanguard",featName:"Fleet Vanguard",raw:false,source:"Character Forge Original",speed:35},
  {ruleset:"2024",background:"soldier",featId:"field-scholar",featName:"Field Scholar",raw:false,source:"Character Forge Original",tool:"Cartographer's Tools"}
];

mkdirSync(OUT,{recursive:true});
for(const testCase of CASES)verify(testCase);
console.log(`[feat-browser] verified ${CASES.length} advancement-feat Letter PDFs in Chrome`);

function verify(testCase){
  try{
    const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-human-fighter-${testCase.featId}`;
    assert.equal(character.validation.valid,true,`${slug}: validation failed`);
    assert.equal(character.audit.status,"PASS",`${slug}: audit failed`);
    assert.equal(character.audit.rawIntegrity,testCase.raw,`${slug}: RAW/compatible classification is wrong`);
    assert.equal(character.classAdvancements[0]?.optionId,testCase.featId,`${slug}: advancement slot lost selected feat`);
    assert.ok(character.feats.some(feat=>feat.id===testCase.featId&&feat.advancementFeat),`${slug}: selected advancement feat missing from character`);
    assert.equal(model.packet.totalPages,1,`${slug}: Fighter feat packet must remain one page`);
    assert.equal(model.feat?.name,testCase.featName,`${slug}: feat block lost advancement feat`);
    assertPhrase(model.feat?.source,testCase.source,`${slug}: feat block source is wrong`);
    if(testCase.page)assertPhrase(model.feat?.source,`p.${testCase.page}`,`${slug}: feat source page is wrong`);
    if(testCase.speed){assert.equal(character.speed,testCase.speed,`${slug}: feat Speed effect is wrong`);assert.equal(model.stats.speed,`${testCase.speed} ft`,`${slug}: print model lost feat Speed effect`);}
    if(testCase.tool)assert.ok(character.toolProficiencies.includes(testCase.tool),`${slug}: feat-granted tool proficiency missing`);

    const renderedHtml=normalizeHtml(target.innerHTML);
    assert.ok(renderedHtml.includes(testCase.featName.toLowerCase()),`${slug}: rendered sheet lost feat name`);
    assertPhrase(renderedHtml,testCase.source,`${slug}: rendered sheet lost feat source`);
    if(testCase.raw){assert.ok(renderedHtml.includes("raw integrity"),`${slug}: RAW integrity footer missing`);assert.equal(renderedHtml.includes("compatible content"),false,`${slug}: RAW feat was mislabeled compatible`);}else{assert.ok(renderedHtml.includes("5e compatible"),`${slug}: compatible label missing`);assert.ok(renderedHtml.includes("compatible content"),`${slug}: compatible footer missing`);assert.equal(renderedHtml.includes("raw integrity"),false,`${slug}: Forge Original feat falsely claims RAW integrity`);}

    const htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),rawTxtPath=path.join(OUT,`${slug}-raw.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
    writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
    execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
    const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});assert.match(info,/Pages:\s+1\b/,`${slug}: browser PDF is not one page`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);
    execFileSync("pdftotext",["-layout",pdfPath,txtPath]);execFileSync("pdftotext",["-raw",pdfPath,rawTxtPath]);execFileSync("pdftoppm",["-png","-r","96",pdfPath,pngPrefix]);
    const layout=normalize(readFileSync(txtPath,"utf8")),raw=normalize(readFileSync(rawTxtPath,"utf8")),fold=`${layout} ${raw}`.toLowerCase();
    assert.ok(layout.length>500,`${slug}: rendered PDF is suspiciously sparse (${layout.length} chars)`);
    assertPhrase(fold,testCase.featName,`${slug}: PDF lost feat name`);assertPhrase(fold,testCase.source,`${slug}: PDF lost feat source`);
    if(testCase.raw){assertPhrase(fold,"RAW integrity",`${slug}: PDF lost RAW integrity`);assert.equal(fold.includes("compatible content"),false,`${slug}: PDF mislabeled RAW feat compatible`);}else{assertPhrase(fold,"Compatible content",`${slug}: PDF lost compatible-content footer`);assertPhrase(fold,"Character Forge Original",`${slug}: PDF lost original provenance`);assert.equal(fold.includes("raw integrity"),false,`${slug}: PDF falsely claims RAW integrity`);}
    if(testCase.speed)assertPhrase(fold,`${testCase.speed} ft`,`${slug}: PDF lost feat Speed effect`);if(testCase.tool)assertPhrase(fold,testCase.tool,`${slug}: PDF lost feat-granted tool`);
    console.log(`[feat-browser] ${slug}: 1 Letter page · ${testCase.raw?"RAW":"compatible"} feat provenance visible`);
  }catch(error){console.error(`[feat-browser] failed ${testCase.ruleset} ${testCase.featId}`,error);throw error;}
}

function characterAt({ruleset,background,featId}){const state=createInitialState();state.ruleset=ruleset;state.constraints.level="4";state.constraints.class="fighter";state.constraints.subclass="champion";state.constraints.species="human";state.constraints.background=background;state.constraints.name=`Forge ${featId}`;state.classSelections.advancements=[featId];return generateCharacter(state);}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function normalize(value){return String(value||"").normalize("NFKC").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[\u2010-\u2015]/g,"-").replace(/\s+/g," ").trim();}
function normalizeHtml(value){return normalize(String(value||"").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"')).toLowerCase();}
function assertPhrase(haystack,phrase,message){const fold=normalize(haystack).toLowerCase(),tokens=normalize(phrase).toLowerCase().split(/\s+/).filter(Boolean);assert.ok(tokens.every(token=>fold.includes(token)),message);}
