import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url)),OUT=path.join(ROOT,"tests/.browser-print"),CHROME=process.env.CHROME_BIN||"google-chrome",CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
mkdirSync(OUT,{recursive:true});
const failures=[];
for(const classId of CLASSES){
  try{verifyClass(classId);}
  catch(error){const message=error instanceof Error?error.message:String(error);failures.push(`${classId}: ${message}`);console.error(`[class-identity-browser-print] ${classId} failed: ${message}`);}
}
if(failures.length){throw new Error(`[class-identity-browser-print] ${failures.length} class portrait/packet failure(s):\n${failures.join("\n")}`);}
console.log(`[class-identity-browser-print] verified ${CLASSES.length} deluxe class identities, decoded illustrated portraits, and ink-saver emblems in Chrome`);

function verifyClass(classId){
  const character=characterAt(classId),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),expected=model.profile.caster?3:2,slug=`v3-2024-${classId}`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),sheetPng=path.join(OUT,`${slug}-sheet`),dossierPng=path.join(OUT,`${slug}-dossier`),id=escapeRegex(classId);
  assert.equal(character.validation.valid,true,`${classId}: generated character invalid`);assert.equal(character.audit.status,"PASS",`${classId}: audit failed`);assert.equal(character.audit.rawIntegrity,true,`${classId}: RAW integrity failed`);assert.equal(model.presentation.customization.packetMode,"deluxe",`${classId}: deluxe state missing`);assert.equal(model.packet.totalPages,expected,`${classId}: wrong deluxe page count`);assert.ok(model.dossier,`${classId}: dossier missing`);assert.match(target.innerHTML,new RegExp(`theme-${escapeRegex(model.theme.id)}`));assert.match(target.innerHTML,/ps-class-ornaments/);assert.match(target.innerHTML,/ps-dossier-page/);
  assert.match(target.innerHTML,/ps-placeholder-illustrated/,`${classId}: illustrated placeholder wrapper missing`);assert.match(target.innerHTML,/ps-class-portrait-image/,`${classId}: illustrated portrait image missing`);assert.match(target.innerHTML,/data:image\/webp;base64,/,`${classId}: embedded portrait data missing`);assert.match(target.innerHTML,/ps-placeholder-emblem/,`${classId}: ink-saver emblem wrapper missing`);assert.match(target.innerHTML,/ps-placeholder-svg ps-class-crest/,`${classId}: crisp vector emblem missing`);assert.match(target.innerHTML,/shape-rendering="geometricPrecision"/,`${classId}: geometric precision hint missing`);assert.doesNotMatch(target.innerHTML,/ps-premium-class-crest|<filter\b|feDropShadow|linearGradient/,`${classId}: legacy filtered crest leaked into packet`);assert.match(target.innerHTML,new RegExp(`class-placeholder class-${id}[\\s\\S]*?ps-class-portrait-image`),`${classId}: first-page illustrated portrait missing`);assert.match(target.innerHTML,new RegExp(`ps-dossier-portrait-art class-${id}[\\s\\S]*?ps-class-portrait-image`),`${classId}: dossier illustrated portrait missing`);
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  const decodedDom=execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--dump-dom",pathToFileURL(htmlPath).href],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
  assert.match(decodedDom,/data-portrait-decoded="yes"/,`${classId}: Chrome could not decode one or more printed portrait images`);
  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);assert.equal(pages,expected,`${classId}: Chrome page count mismatch`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${classId}: PDF not US Letter`);
  execFileSync("pdftotext",["-layout",pdfPath,txtPath]);const text=normalize(readFileSync(txtPath,"utf8"));assert.ok(text.includes(character.name),`${classId}: name missing`);assert.ok(text.includes(character.class.name),`${classId}: class missing`);assert.match(text,/Deluxe Character Dossier/i,`${classId}: dossier heading missing`);assert.ok(text.includes("Generated narrative flavor"),`${classId}: narrative disclaimer missing`);assert.ok(text.toLowerCase().includes("raw integrity"),`${classId}: RAW marker missing`);assert.match(text,new RegExp(`Page ${expected}\\s*\\/\\s*${expected}`,"i"),`${classId}: final page marker missing`);
  execFileSync("pdftoppm",["-png","-r","110","-f","1","-singlefile",pdfPath,sheetPng]);execFileSync("pdftoppm",["-png","-r","110","-f",String(expected),"-singlefile",pdfPath,dossierPng]);
  console.log(`[class-identity-browser-print] ${classId}: ${expected} pages · ${model.theme.id} · decoded illustrated class portrait`);
}

function characterAt(classId){
  const state=createInitialState();state.ruleset="2024";state.constraints.level="7";state.constraints.class=classId;state.constraints.subclass="random";state.constraints.species="human";state.constraints.background="criminal";const character=generateCharacter(state);character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe",style:"ornate",paper:"ivory",ornament:"rich",frame:"class",printMode:"premium",portraitVisible:true}};return character;
}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div><script>window.addEventListener("load",()=>{try{const portraits=[...document.querySelectorAll(".ps-class-portrait-image")];const decoded=portraits.length>=2&&portraits.every((img)=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);document.documentElement.dataset.portraitDecoded=decoded?"yes":"no";}catch(error){console.error("[portrait-decode-gate]",error);document.documentElement.dataset.portraitDecoded="no";}});</script></body></html>`;}
function normalize(value){return String(value||"").replace(/\s+/g," ").trim();}
function escapeRegex(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
