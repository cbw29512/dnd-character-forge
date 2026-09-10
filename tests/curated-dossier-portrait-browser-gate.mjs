import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const SLUG="curated-grave-warden-oath-beacon";

try{
  mkdirSync(OUT,{recursive:true});
  const character=buildCharacter(),target={innerHTML:""};
  assert.equal(character.sourceMode,SOURCE.HOMEBREW,"curated Original art pilot must remain outside production RAW mode");
  assert.equal(character.audit?.rawIntegrity,false,"curated Original art pilot must not claim RAW integrity");
  const model=renderPremiumPrintSheet(character,target);
  assert.equal(model.dossier?.artDirection?.variantKey,"grave-warden--oath-beacon");
  assert.match(target.innerHTML,/data-curated-portrait="grave-warden--oath-beacon"/);
  assert.match(target.innerHTML,/grave-warden--oath-beacon\.svg/);

  const htmlPath=path.join(OUT,`${SLUG}.html`);
  const pdfPath=path.join(OUT,`${SLUG}.pdf`);
  const pngBase=path.join(OUT,`${SLUG}-dossier`);
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");

  const htmlUrl=pathToFileURL(htmlPath).href;
  const dom=execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--virtual-time-budget=3000","--dump-dom",htmlUrl],{encoding:"utf8",timeout:30000,maxBuffer:8*1024*1024});
  assert.match(dom,/data-curated-loaded="true"/,"Chrome did not decode the curated SVG asset");

  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,htmlUrl],{stdio:"pipe",timeout:30000});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});
  assert.match(info,/Pages:\s+3\b/,"curated deluxe Paladin packet must remain three pages");
  assert.match(info,/Page size:\s+612 x 792 pts/i,"curated dossier PDF must remain US Letter");

  execFileSync("pdftoppm",["-f","3","-singlefile","-png","-r","120",pdfPath,pngBase],{stdio:"pipe"});
  const pngPath=`${pngBase}.png`;
  assert.ok(statSync(pngPath).size>25000,"curated dossier review image is unexpectedly small");
  const extracted=execFileSync("pdftotext",["-f","3","-l","3","-layout",pdfPath,"-"],{encoding:"utf8"});
  assert.match(extracted,/Deluxe Character Dossier/i);
  assert.match(extracted,/unmarked grave|grave/i);
  assert.match(extracted,/beacon/i);
  console.log(`[curated-dossier] ${SLUG}: compatible SVG decoded in Chrome and dossier page rendered to ${path.basename(pngPath)}`);
}catch(error){console.error("[curated-dossier] browser/PDF certification failed",error);throw error;}

function buildCharacter(){
  try{
    const state=createInitialState();
    state.sourceMode=SOURCE.HOMEBREW;
    state.ruleset="2024";
    state.constraints.level="7";
    state.constraints.class="paladin";
    state.constraints.subclass="oath-beacon";
    state.constraints.species="human";
    state.constraints.background="grave-warden";
    state.constraints.name="Elira Venn";
    const character=generateCharacter(state);
    assert.equal(character.validation.valid,true,"curated compatible art pilot fixture must remain legal");
    character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe",printMode:"premium"}};
    return character;
  }catch(error){console.error("[curated-dossier] fixture build failed",error);throw error;}
}

function fixtureHtml(packet){
  try{return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div><script>window.addEventListener("load",async()=>{const img=document.querySelector("[data-curated-portrait] img");try{if(img)await img.decode();}catch(error){console.error(error);}document.body.dataset.curatedLoaded=String(Boolean(img&&img.complete&&img.naturalWidth>0));});</script></body></html>`;}
  catch(error){console.error("[curated-dossier] fixture HTML failed",error);throw error;}
}
