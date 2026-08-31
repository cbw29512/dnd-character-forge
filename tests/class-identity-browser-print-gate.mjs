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
console.log(`[class-identity-browser-print] verified ${CLASSES.length} deluxe class identities, page-one geometry, standalone attribution placement, decoded visually complete portraits, printed first-page portraits, dossier portraits, and ink-saver emblems in Chrome`);

function verifyClass(classId){
  const character=characterAt(classId),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),expected=model.profile.caster?3:2,slug=`v3-2024-${classId}`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),sheetPng=path.join(OUT,`${slug}-sheet`),dossierPng=path.join(OUT,`${slug}-dossier`),sheetProbe=path.join(OUT,`${slug}-sheet-probe`),dossierProbe=path.join(OUT,`${slug}-dossier-probe`),id=escapeRegex(classId);
  assert.equal(character.validation.valid,true,`${classId}: generated character invalid`);assert.equal(character.audit.status,"PASS",`${classId}: audit failed`);assert.equal(character.audit.rawIntegrity,true,`${classId}: RAW integrity failed`);assert.equal(model.presentation.customization.packetMode,"deluxe",`${classId}: deluxe state missing`);assert.equal(model.packet.totalPages,expected,`${classId}: wrong deluxe page count`);assert.ok(model.dossier,`${classId}: dossier missing`);assert.match(target.innerHTML,new RegExp(`theme-${escapeRegex(model.theme.id)}`));assert.match(target.innerHTML,/ps-class-ornaments/);assert.match(target.innerHTML,/ps-dossier-page/);
  assert.match(target.innerHTML,/ps-placeholder-illustrated/,`${classId}: illustrated placeholder wrapper missing`);assert.match(target.innerHTML,/ps-class-portrait-image/,`${classId}: illustrated portrait image missing`);assert.match(target.innerHTML,/ps-class-portrait-image[^>]+src="[^"]+"/,`${classId}: portrait source missing`);assert.match(target.innerHTML,/ps-placeholder-emblem/,`${classId}: ink-saver emblem wrapper missing`);assert.match(target.innerHTML,/ps-placeholder-svg ps-class-crest/,`${classId}: crisp vector emblem missing`);assert.doesNotMatch(target.innerHTML,/ps-premium-class-crest|<filter\b|feDropShadow|linearGradient/,`${classId}: legacy filtered crest leaked into packet`);assert.match(target.innerHTML,new RegExp(`class-placeholder class-${id}[\\s\\S]*?ps-class-portrait-image`),`${classId}: first-page illustrated portrait missing`);assert.match(target.innerHTML,new RegExp(`ps-dossier-portrait-art class-${id}[\\s\\S]*?ps-class-portrait-image`),`${classId}: dossier illustrated portrait missing`);
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  const decodedDom=execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--dump-dom",pathToFileURL(htmlPath).href],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});
  assert.match(decodedDom,/data-portrait-decoded="yes"/,`${classId}: Chrome could not decode one or more printed portrait images`);
  assert.match(decodedDom,/data-portrait-visual="yes"/,`${classId}: Chrome rendered a visually blank, flat, or partial portrait image`);
  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);assert.equal(pages,expected,`${classId}: Chrome page count mismatch`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${classId}: PDF not US Letter`);
  const bbox=execFileSync("pdftotext",["-f","1","-l","1","-bbox-layout",pdfPath,"-"],{encoding:"utf8"});assertPrintGeometry(bbox,classId,model);
  execFileSync("pdftotext",["-layout",pdfPath,txtPath]);const text=normalize(readFileSync(txtPath,"utf8"));assert.ok(text.includes(character.name),`${classId}: name missing`);assert.ok(text.includes(character.class.name),`${classId}: class missing`);assert.match(text,/Deluxe Character Dossier/i,`${classId}: dossier heading missing`);assert.ok(text.includes("Generated narrative flavor"),`${classId}: narrative disclaimer missing`);assert.ok(text.toLowerCase().includes("raw integrity"),`${classId}: RAW marker missing`);assert.match(text,new RegExp(`Page ${expected}\\s*\\/\\s*${expected}`,"i"),`${classId}: final page marker missing`);
  execFileSync("pdftoppm",["-png","-r","110","-f","1","-singlefile",pdfPath,sheetPng]);execFileSync("pdftoppm",["-png","-r","110","-f",String(expected),"-singlefile",pdfPath,dossierPng]);
  execFileSync("pdftoppm",["-r","55","-f","1","-singlefile","-x","35","-y","35","-W","78","-H","72",pdfPath,sheetProbe]);assertPrintedPortrait(`${sheetProbe}.ppm`,classId,"first-page portrait");
  execFileSync("pdftoppm",["-r","55","-f",String(expected),"-singlefile","-x","34","-y","30","-W","70","-H","86",pdfPath,dossierProbe]);assertPrintedPortrait(`${dossierProbe}.ppm`,classId,"Deluxe dossier portrait");
  console.log(`[class-identity-browser-print] ${classId}: ${expected} pages · ${model.theme.id} · page-one geometry and attribution clear · decoded and visibly printed class portraits`);
}

function assertPrintGeometry(xml,classId,model){
  const lines=bboxLines(xml),footer=lines.find(line=>/RULES\s+LAWYER\s+CERTIFIED/i.test(line.text)),attribution=lines.find(line=>isAttributionLine(line.text));
  assert.ok(footer,`${classId}: certification footer line missing from page 1`);
  assert.ok(attribution,`${classId}: standalone SRD/CC attribution line missing from page 1`);
  assert.ok(attribution.yMin>=footer.yMin-.25,`${classId}: attribution escaped above certification/footer row (${attribution.yMin.toFixed(1)} < ${footer.yMin.toFixed(1)})`);
  assert.ok(attribution.yMax<760,`${classId}: attribution clipped too low on Letter page (${attribution.yMax.toFixed(1)})`);
  const motto=normalize(model.motto).toLowerCase(),className=normalize(model.identity.className).toLowerCase();
  const overlaps=lines.filter(line=>line.yMax>footer.yMin+.25&&!allowedFooterLine(line.text,motto,className));
  assert.equal(overlaps.length,0,`${classId}: page-one content overlaps certification/footer area: ${overlaps.slice(0,4).map(line=>`"${line.text}" @ ${line.yMin.toFixed(1)}-${line.yMax.toFixed(1)}`).join(", ")}`);
  const quickTitle=lines.find(line=>/^QUICK TURN$/i.test(line.text)),rulesTitle=lines.find(line=>/^RULES INDEX$/i.test(line.text));
  if(quickTitle&&rulesTitle){
    const quickSteps=lines.filter(line=>line.yMin>quickTitle.yMin+.25&&line.xMin>=150&&line.xMax<=410&&/^\d+\./.test(line.text));
    if(quickSteps.length){const quickBottom=Math.max(...quickSteps.map(line=>line.yMax));assert.ok(rulesTitle.yMin>quickBottom+1,`${classId}: Rules Index overlaps Quick Turn (${rulesTitle.yMin.toFixed(1)} <= ${quickBottom.toFixed(1)})`);}
  }
}
function bboxLines(xml){
  const lines=[],pattern=/<line\b[^>]*xMin="([^"]+)" yMin="([^"]+)" xMax="([^"]+)" yMax="([^"]+)"[^>]*>([\s\S]*?)<\/line>/g;
  for(const match of xml.matchAll(pattern)){const words=[...match[5].matchAll(/<word\b[^>]*>([\s\S]*?)<\/word>/g)].map(word=>decodeXml(word[1]));const text=normalize(words.join(" "));if(text)lines.push({xMin:Number(match[1]),yMin:Number(match[2]),xMax:Number(match[3]),yMax:Number(match[4]),text});}
  return lines;
}
function isAttributionLine(value){return /Contains\s+SRD\s+5\.(?:1|2\.1)\s+material.*Wizards of the Coast LLC.*CC BY 4\.0/i.test(normalize(value));}
function allowedFooterLine(value,motto,className){
  const text=normalize(value),lower=text.toLowerCase(),compact=lower.replace(/\s+/g,""),classCompact=className.replace(/\s+/g,""),symbolOnly=!/[\p{L}\p{N}]/u.test(text);
  return /RULES\s+LAWYER\s+CERTIFIED/i.test(text)||isAttributionLine(text)||lower===motto||compact===classCompact||symbolOnly;
}
function decodeXml(value){return String(value||"").replace(/&apos;/g,"'").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&");}
function assertPrintedPortrait(ppmPath,classId,label){
  const data=readFileSync(ppmPath),header=data.subarray(0,64).toString("ascii"),match=header.match(/^P6\s+(\d+)\s+(\d+)\s+255\s/);assert.ok(match,`${classId}: ${label} probe is not a readable PPM`);const headerLength=match[0].length,width=Number(match[1]),height=Number(match[2]),pixels=data.subarray(headerLength,headerLength+width*height*3);assert.equal(pixels.length,width*height*3,`${classId}: ${label} probe is truncated`);let sum=0,sumSq=0,dark=0,count=0;for(let i=0;i<pixels.length;i+=3){const luminance=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];sum+=luminance;sumSq+=luminance*luminance;if(luminance<190)dark++;count++;}const mean=sum/count,variance=Math.max(0,sumSq/count-mean*mean),spread=Math.sqrt(variance),darkRatio=dark/count;assert.ok(spread>18&&darkRatio>.035,`${classId}: printed ${label} frame is blank or visually empty (spread ${spread.toFixed(1)}, dark ${(darkRatio*100).toFixed(1)}%)`);
}
function characterAt(classId){
  const state=createInitialState();state.ruleset="2024";state.constraints.level="7";state.constraints.class=classId;state.constraints.subclass="random";state.constraints.species="human";state.constraints.background="criminal";const character=generateCharacter(state);character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe",style:"ornate",paper:"ivory",ornament:"rich",frame:"class",printMode:"premium",portraitVisible:true}};return character;
}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div><script>window.addEventListener("load",()=>{try{const portraits=[...document.querySelectorAll(".ps-class-portrait-image")];const decoded=portraits.length>=2&&portraits.every((img)=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);const visual=decoded&&portraits.every(hasVisualDetail);document.documentElement.dataset.portraitDecoded=decoded?"yes":"no";document.documentElement.dataset.portraitVisual=visual?"yes":"no";}catch(error){console.error("[portrait-visual-gate]",error);document.documentElement.dataset.portraitDecoded="no";document.documentElement.dataset.portraitVisual="no";}});function hasVisualDetail(img){const width=24,height=36,canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)return false;ctx.drawImage(img,0,0,width,height);const pixels=ctx.getImageData(0,0,width,height).data,rows=[[],[],[]],all=[];for(let y=0;y<height;y++){for(let x=0;x<width;x++){const i=(y*width+x)*4;if(pixels[i+3]<16)continue;const luminance=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];all.push(luminance);rows[Math.min(2,Math.floor(y/(height/3)))].push(luminance);}}const spread=(values)=>{if(values.length<20)return 0;const mean=values.reduce((sum,value)=>sum+value,0)/values.length;return Math.sqrt(values.reduce((sum,value)=>sum+(value-mean)**2,0)/values.length);};return all.length>=width*height*.2&&spread(all)>10&&rows.every((row)=>spread(row)>4);}</script></body></html>`;}
function normalize(value){return String(value||"").replace(/\s+/g," ").trim();}
function escapeRegex(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
