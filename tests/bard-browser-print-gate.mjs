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
  {
    ruleset:"2014",
    classId:"bard",
    subclass:"college-lore",
    species:"human",
    background:"acolyte",
    pages:2,
    classSelections:{instruments:["Lute"]},
    spellSelections:{magicalSecrets:["eldritch-blast","hellish-rebuke"]},
    customization:{style:"ornate",paper:"parchment",ornament:"rich",frame:"filigree",printMode:"premium"}
  },
  {
    ruleset:"2024",
    classId:"bard",
    subclass:"college-lore",
    species:"human",
    background:"sage",
    pages:2,
    classSelections:{instruments:["Lute"]},
    spellSelections:{loreDiscoveries:["power-word-heal","guidance"]},
    customization:{style:"ornate",paper:"ivory",ornament:"rich",frame:"class",printMode:"premium"}
  }
];

mkdirSync(OUT,{recursive:true});
for(const item of CASES)verifyPacket(item);
console.log(`[bard-browser-print] verified ${CASES.length} fixed Bard premium PDFs in Chrome`);

function verifyPacket(testCase){
  const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-${testCase.species}-bard`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),pngPrefix=path.join(OUT,`${slug}-page`);
  assert.equal(character.validation.valid,true,`${slug}: generated Bard is invalid`);
  assert.equal(character.audit.status,"PASS",`${slug}: Rules Audit did not pass`);
  assert.equal(character.audit.rawIntegrity,true,`${slug}: RAW integrity failed`);
  assert.equal(model.theme.id,"bard-legend",`${slug}: wrong print theme`);
  assert.equal(model.classUtility?.title,"Living Legend",`${slug}: Bard resource panel missing`);
  assert.equal(model.packet.totalPages,testCase.pages,`${slug}: model violates fixed page profile`);
  for(const [key,value] of Object.entries(testCase.customization))assert.equal(model.presentation.customization[key],value,`${slug}: customization ${key}`);

  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);
  assert.equal(pages,testCase.pages,`${slug}: browser PDF violates fixed page profile`);
  assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);

  execFileSync("pdftotext",["-layout",pdfPath,txtPath]);
  execFileSync("pdftoppm",["-png","-r","120",pdfPath,pngPrefix]);
  const extracted=readFileSync(txtPath,"utf8"),pagesText=pdfPages(extracted);
  assert.equal(pagesText.length,pages,`${slug}: extracted page count mismatch`);
  for(let index=0;index<pagesText.length;index++){
    const text=normalize(pagesText[index]);assert.ok(text.length>500,`${slug}: page ${index+1} is suspiciously sparse (${text.length} chars)`);assert.match(text,new RegExp(`Page\\s+${index+1}\\s*\\/\\s*${pages}`,"i"),`${slug}: page marker missing`);
  }

  const whole=normalize(extracted),fold=whole.toLowerCase(),tokens=[character.name,...model.attacks.map(item=>item.name),...model.equipment,...model.ruleIndex.map(item=>item.name),model.classUtility.title,...model.spellPage.entries.map(item=>item.name)];
  for(const token of tokens)assert.ok(fold.includes(normalize(token).toLowerCase()),`${slug}: printed PDF lost expected content: ${token}`);
  for(const phrase of ["RAW Integrity","Living Legend","Bardic Inspiration","College of Lore","Cutting Words","Peerless Skill"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing Bard contract text: ${phrase}`);

  if(testCase.ruleset==="2014"){
    assert.equal(character.spells.cantrips.all.length,4);assert.equal(character.spells.known.all.length,24);assert.equal(character.spells.magicalSecrets.length,6);assert.equal(model.spellPage.entries.length,28);assert.ok(character.spells.magicalSecrets.includes("eldritch-blast"));assert.ok(character.spells.magicalSecrets.includes("hellish-rebuke"));for(const phrase of ["Eldritch Blast","Hellish Rebuke","Song of Rest","Additional Magical Secrets","Countercharm"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing 2014 Bard text: ${phrase}`);for(const phrase of ["Words of Creation","Magical Discoveries","Boon of Spell Recall"])assert.equal(fold.includes(normalize(phrase).toLowerCase()),false,`${slug}: leaked 2024 Bard text: ${phrase}`);
  }else{
    assert.equal(character.spells.prepared.all.length,22);assert.deepEqual(character.spells.loreDiscoveries.slice().sort(),["guidance","power-word-heal"]);assert.equal(character.spells.alwaysPrepared.length,3);assert.equal(model.spellPage.entries.length,29);assert.equal(model.spellPage.entries.filter(entry=>entry.id==="power-word-heal").length,1);for(const phrase of ["Power Word Heal","Power Word Kill","Magical Discoveries","Words of Creation","Superior Inspiration","Boon of Spell Recall","D20 Test"])assert.ok(fold.includes(normalize(phrase).toLowerCase()),`${slug}: missing 2024 Bard text: ${phrase}`);for(const phrase of ["Song of Rest","Additional Magical Secrets"])assert.equal(fold.includes(normalize(phrase).toLowerCase()),false,`${slug}: leaked 2014 Bard text: ${phrase}`);
  }
  console.log(`[bard-browser-print] ${slug}: ${pages} Letter pages · ${model.ruleIndex.length} rules · ${model.equipment.length} equipment · ${model.spellPage.entries.length} spells · ${model.presentation.customization.style}/${model.presentation.customization.printMode}`);
}

function characterAt({ruleset,classId,subclass,species,background,classSelections={},spellSelections={},customization}){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class=classId;state.constraints.subclass=subclass;state.constraints.species=species;state.constraints.background=background;state.classSelections=classSelections;state.spellSelections={...state.spellSelections,...spellSelections};const character=generateCharacter(state);character.presentation={...(character.presentation||{}),sheetCustomization:customization};return character;
}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function pdfPages(text){const pages=String(text||"").split("\f");while(pages.length&&normalize(pages.at(-1))==="")pages.pop();return pages;}
function normalize(value){return String(value||"").replace(/[’‘]/g,"'").replace(/[–—]/g,"-").replace(/\s+/g," ").trim();}
