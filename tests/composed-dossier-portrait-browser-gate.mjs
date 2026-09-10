import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const SLUG="composed-deep-sailor-tempest-scout";

try{
  mkdirSync(OUT,{recursive:true});
  const character=buildCharacter(),target={innerHTML:""},model=renderPremiumPrintSheet(character,target);
  assert.equal(model.dossier?.artDirection?.backgroundId,"deep-sailor");
  assert.equal(model.dossier?.artDirection?.pathId,"tempest-scout");
  assert.equal(model.dossier?.artDirection?.variantKey,"deep-sailor--tempest-scout");
  assert.match(target.innerHTML,/data-composed-portrait="deep-sailor--tempest-scout"/);
  assert.match(target.innerHTML,/ps-composed-background-art/);
  assert.match(target.innerHTML,/ps-composed-class-crest/);
  assert.match(target.innerHTML,/ps-composed-path-art/);
  assert.doesNotMatch(target.innerHTML,/ps-class-portrait-image/);
  assert.doesNotMatch(target.innerHTML,/data-curated-portrait="deep-sailor--tempest-scout"/);

  const htmlPath=path.join(OUT,`${SLUG}.html`),pdfPath=path.join(OUT,`${SLUG}.pdf`),pngBase=path.join(OUT,`${SLUG}-dossier`);
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  const htmlUrl=pathToFileURL(htmlPath).href;
  const dom=execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--virtual-time-budget=3000","--dump-dom",htmlUrl],{encoding:"utf8",timeout:30000,maxBuffer:8*1024*1024});
  assert.match(dom,/data-composed-loaded="true"/,"Chrome did not retain all three composed vignette layers");
  assert.match(dom,/data-composed-layer-count="3"/,"composed vignette lost a required visual layer");

  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,htmlUrl],{stdio:"pipe",timeout:30000});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});
  assert.match(info,/Pages:\s+3\b/,"composed deluxe Ranger packet must remain three pages");
  assert.match(info,/Page size:\s+612 x 792 pts/i,"composed dossier PDF must remain US Letter");

  execFileSync("pdftoppm",["-f","3","-singlefile","-png","-r","120",pdfPath,pngBase],{stdio:"pipe"});
  const pngPath=`${pngBase}.png`;
  assert.ok(statSync(pngPath).size>25000,"composed dossier review image is unexpectedly small");
  const extracted=execFileSync("pdftotext",["-f","3","-l","3","-layout",pdfPath,"-"],{encoding:"utf8"});
  assert.match(extracted,/Deluxe Character Dossier/i);
  assert.match(extracted,/salt-stained chart|sailor|sea|ship/i);
  assert.match(extracted,/storm road|tempest/i);
  console.log(`[composed-dossier] ${SLUG}: full-frame background/class/path vignette rendered in Chrome and PDF.`);
}catch(error){
  console.error("[composed-dossier] browser/PDF certification failed",error);
  throw error;
}

function buildCharacter(){
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints.level="7";
    state.constraints.class="ranger";
    state.constraints.subclass="tempest-scout";
    state.constraints.species="human";
    state.constraints.background="deep-sailor";
    state.constraints.name="Mara Tideglass";
    const character=generateCharacter(state);
    assert.equal(character.validation.valid,true,"composed pilot fixture must remain legal");
    character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe",printMode:"premium"}};
    return character;
  }catch(error){console.error("[composed-dossier] fixture build failed",error);throw error;}
}

function fixtureHtml(packet){
  try{
    return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div><script>window.addEventListener("load",()=>{const portrait=document.querySelector("[data-composed-portrait]"),background=portrait?.querySelector(".ps-composed-background-art"),crest=portrait?.querySelector(".ps-composed-class-crest .ps-class-crest"),path=portrait?.querySelector(".ps-composed-path-art"),layers=[background,crest,path].filter(Boolean);document.body.dataset.composedLayerCount=String(layers.length);document.body.dataset.composedLoaded=String(Boolean(portrait&&layers.length===3));});</script></body></html>`;
  }catch(error){console.error("[composed-dossier] fixture HTML failed",error);throw error;}
}
