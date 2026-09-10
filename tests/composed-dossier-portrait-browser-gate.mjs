import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const SLUG="composed-deep-sailor-tempest-scout";

try{
  mkdirSync(OUT,{recursive:true});
  const character=buildCharacter(),target={innerHTML:""},model=renderPremiumPrintSheet(character,target);
  assert.equal(character.sourceMode,SOURCE.HOMEBREW,"composed art pilot must remain outside production RAW mode");
  assert.equal(character.audit?.rawIntegrity,false,"composed art pilot must not claim RAW integrity");
  assert.equal(model.dossier?.artDirection?.backgroundId,"deep-sailor");
  assert.equal(model.dossier?.artDirection?.pathId,"tempest-scout");
  assert.equal(model.dossier?.artDirection?.variantKey,"deep-sailor--tempest-scout");

  const composedHtml=composedVignetteFragment(target.innerHTML);
  assert.match(composedHtml,/data-composed-portrait="deep-sailor--tempest-scout"/);
  assert.match(composedHtml,/ps-composed-scene/);
  assert.match(composedHtml,/ps-composed-background-art/);
  assert.match(composedHtml,/ps-composed-class-crest/);
  assert.match(composedHtml,/ps-composed-path-art/);
  assert.doesNotMatch(composedHtml,/ps-class-portrait-image/,"the dossier vignette itself must not reuse the raster class placeholder");
  assert.doesNotMatch(composedHtml,/data-curated-portrait="deep-sailor--tempest-scout"/);

  const css=readFileSync(path.join(ROOT,"styles/print/premium-curated-dossier.css"),"utf8");
  assert.match(css,/\.ps-composed-dossier-portrait\{[^}]*z-index:2/s,"composed vignette must stack above the generic fallback overlay");
  assert.match(css,/@media print\{[\s\S]*\.premium-sheet:not\(\.sheet-print-ink-saver\)[\s\S]*\.ps-composed-dossier-portrait\{[\s\S]*display:block!important/s,"print mode must explicitly reveal composed vignette art");

  const htmlPath=path.join(OUT,`${SLUG}.html`),pdfPath=path.join(OUT,`${SLUG}.pdf`),pngBase=path.join(OUT,`${SLUG}-dossier`),ppmBase=path.join(OUT,`${SLUG}-contrast`);
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  const htmlUrl=pathToFileURL(htmlPath).href;
  const dom=execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--virtual-time-budget=3000","--dump-dom",htmlUrl],{encoding:"utf8",timeout:30000,maxBuffer:8*1024*1024});
  assert.match(dom,/data-composed-loaded="true"/,"Chrome did not retain all three composed vignette identities");
  assert.match(dom,/data-composed-layer-count="3"/,"composed vignette lost a required visual identity");

  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,htmlUrl],{stdio:"pipe",timeout:30000});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});
  assert.match(info,/Pages:\s+3\b/,"composed deluxe Ranger packet must remain three pages");
  assert.match(info,/Page size:\s+612 x 792 pts/i,"composed dossier PDF must remain US Letter");

  execFileSync("pdftoppm",["-f","3","-singlefile","-png","-r","120",pdfPath,pngBase],{stdio:"pipe"});
  const pngPath=`${pngBase}.png`;
  assert.ok(statSync(pngPath).size>25000,"composed dossier review image is unexpectedly small");
  execFileSync("pdftoppm",["-f","3","-singlefile","-r","120",pdfPath,ppmBase],{stdio:"pipe"});
  verifyPortraitContrast(`${ppmBase}.ppm`);

  const extracted=execFileSync("pdftotext",["-f","3","-l","3","-layout",pdfPath,"-"],{encoding:"utf8"});
  assert.match(extracted,/Deluxe Character Dossier/i);
  assert.match(extracted,/salt-stained chart|sailor|sea|ship/i);
  assert.match(extracted,/storm road|tempest/i);
  console.log(`[composed-dossier] ${SLUG}: compatible self-contained SVG vignette rendered with visible pixel contrast in Chrome and PDF.`);
}catch(error){console.error("[composed-dossier] browser/PDF certification failed",error);throw error;}

function verifyPortraitContrast(ppmPath){
  try{
    const buffer=readFileSync(ppmPath),image=parsePpm(buffer);
    const x0=Math.floor(image.width*.074),x1=Math.ceil(image.width*.184),y0=Math.floor(image.height*.068),y1=Math.ceil(image.height*.14);
    let count=0,sum=0,sumSquares=0,bright=0;
    for(let y=y0;y<y1;y+=1)for(let x=x0;x<x1;x+=1){
      const offset=image.offset+(y*image.width+x)*3,lum=(buffer[offset]+buffer[offset+1]+buffer[offset+2])/3;
      count+=1;sum+=lum;sumSquares+=lum*lum;if(lum>=160)bright+=1;
    }
    const mean=sum/count,variance=Math.max(0,sumSquares/count-mean*mean),stddev=Math.sqrt(variance),brightFraction=bright/count;
    assert.ok(stddev>=12,`composed portrait crop is too visually flat (luminance stddev ${stddev.toFixed(2)})`);
    assert.ok(brightFraction>=.008,`composed portrait crop lacks visible bright motif pixels (${(brightFraction*100).toFixed(2)}%)`);
    console.log(`[composed-dossier] portrait pixels: mean=${mean.toFixed(1)} stddev=${stddev.toFixed(1)} bright=${(brightFraction*100).toFixed(2)}%`);
  }catch(error){console.error("[composed-dossier] pixel contrast audit failed",error);throw error;}
}

function parsePpm(buffer){
  try{
    let index=0;const tokens=[];
    while(tokens.length<4){
      while(index<buffer.length&&/\s/.test(String.fromCharCode(buffer[index])))index+=1;
      if(buffer[index]===35){while(index<buffer.length&&buffer[index]!==10)index+=1;continue;}
      let token="";while(index<buffer.length&&!/\s/.test(String.fromCharCode(buffer[index]))){token+=String.fromCharCode(buffer[index]);index+=1;}tokens.push(token);
    }
    while(index<buffer.length&&/\s/.test(String.fromCharCode(buffer[index])))index+=1;
    assert.equal(tokens[0],"P6","portrait contrast audit requires binary PPM");
    const width=Number(tokens[1]),height=Number(tokens[2]),max=Number(tokens[3]);
    assert.ok(width>0&&height>0&&max===255,"portrait PPM header is invalid");
    assert.ok(buffer.length>=index+width*height*3,"portrait PPM pixel payload is incomplete");
    return{width,height,offset:index};
  }catch(error){console.error("[composed-dossier] PPM parse failed",error);throw error;}
}

function composedVignetteFragment(packet){
  try{
    const html=String(packet||""),start=html.indexOf('<svg class="ps-placeholder-illustrated ps-composed-dossier-portrait ps-composed-scene"');
    assert.ok(start>=0,"composed dossier SVG scene is missing");
    const end=html.indexOf('<span class="ps-placeholder-emblem"',start);assert.ok(end>start,"composed dossier vignette fallback boundary is missing");
    return html.slice(start,end);
  }catch(error){console.error("[composed-dossier] vignette fragment extraction failed",error);throw error;}
}

function buildCharacter(){
  try{
    const state=createInitialState();state.sourceMode=SOURCE.HOMEBREW;state.ruleset="2024";state.constraints.level="7";state.constraints.class="ranger";state.constraints.subclass="tempest-scout";state.constraints.species="human";state.constraints.background="deep-sailor";state.constraints.name="Mara Tideglass";
    const character=generateCharacter(state);assert.equal(character.validation.valid,true,"composed compatible art pilot fixture must remain legal");character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe",printMode:"premium"}};return character;
  }catch(error){console.error("[composed-dossier] fixture build failed",error);throw error;}
}

function fixtureHtml(packet){
  try{return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div><script>window.addEventListener("load",()=>{const portrait=document.querySelector("[data-composed-portrait]"),background=portrait?.querySelector(".ps-composed-background-art"),crest=portrait?.querySelector(".ps-composed-class-crest"),path=portrait?.querySelector(".ps-composed-path-art"),layers=[background,crest,path].filter(Boolean);document.body.dataset.composedLayerCount=String(layers.length);document.body.dataset.composedLoaded=String(Boolean(portrait&&layers.length===3));});</script></body></html>`;}
  catch(error){console.error("[composed-dossier] fixture HTML failed",error);throw error;}
}
