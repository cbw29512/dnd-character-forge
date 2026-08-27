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
const BODY_PATTERN=/<body\b([^>]*)>[\s\S]*<\/body>/i;
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
    for(const feature of testCase.features){assert.ok(character.features.includes(feature),`${slug}: missing ${feature}`);assert.ok(model.ruleIndex.some(item=>item.name===feature),`${slug}: rules index missing ${feature}`);}

    const templatePath=path.join(OUT,`${testCase.ruleset}-human-barbarian.html`),template=readFileSync(templatePath,"utf8"),bodyMatch=template.match(BODY_PATTERN);
    assert.ok(bodyMatch,`${slug}: baseline browser fixture is unavailable`);
    const html=template.replace(BODY_PATTERN,`<body${bodyMatch[1]}>${target.innerHTML}</body>`),htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
    writeFileSync(htmlPath,html,"utf8");
    execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
    const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});assert.match(info,/Pages:\s+1\b/,`${slug}: browser PDF is not one page`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);
    execFileSync("pdftotext",["-layout",pdfPath,txtPath]);execFileSync("pdftoppm",["-png","-r","96",pdfPath,pngPrefix]);
    const text=normalize(readFileSync(txtPath,"utf8")),fold=text.toLowerCase();
    assert.ok(fold.includes(character.subclass.name.toLowerCase()),`${slug}: subclass identity missing from PDF`);
    assert.ok(fold.includes("compatible content"),`${slug}: compatible-content footer missing`);
    assert.ok(fold.includes("character forge original"),`${slug}: original-content provenance missing from PDF`);
    for(const feature of testCase.features)assert.ok(fold.includes(feature.toLowerCase()),`${slug}: PDF lost ${feature}`);
    assert.equal(fold.includes("raw integrity"),false,`${slug}: PDF falsely claims RAW integrity`);
    console.log(`[barbarian-original-browser] ${slug}: 1 Letter page · compatible/original provenance visible`);
  }catch(error){console.error(`[barbarian-original-browser] failed ${testCase.ruleset} ${testCase.subclass}`,error);throw error;}
}

function characterAt({ruleset,subclass,background}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class="barbarian";state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background=background;state.constraints.name=`Forge ${subclass}`;return generateCharacter(state);
}
function normalize(value){return String(value||"").replace(/[\u2010-\u2015]/g,"-").replace(/\s+/g," ").trim();}
