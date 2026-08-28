import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url)),OUT=path.join(ROOT,"tests/.browser-print"),CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
mkdirSync(OUT,{recursive:true});
for(const classId of CASES)verifyInkSaver(classId);
console.log(`[class-signature-ink-saver] verified ${CASES.length} monochrome premium class crests and rendered pages in Chrome`);

function verifyInkSaver(classId){
  try{
    const character=characterAt(classId),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),expected=model.profile.caster?3:2,slug=`ink-saver-2024-${classId}`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`),pngBase=path.join(OUT,`${slug}-sheet`),ppmBase=path.join(OUT,`${slug}-chroma`),html=target.innerHTML;
    assert.equal(character.validation.valid,true,`${classId}: generated character invalid`);assert.equal(character.audit.rawIntegrity,true,`${classId}: RAW integrity failed`);assert.equal(model.presentation.customization.printMode,"ink-saver",`${classId}: Ink Saver state missing`);assert.match(html,/sheet-print-ink-saver/,`${classId}: Ink Saver class missing`);assert.match(html,new RegExp(`data-print-class="${classId}"`),`${classId}: print class marker missing`);assert.match(html,new RegExp(`<span>${escapeRegex(model.theme.className)}</span>`),`${classId}: visible class wordmark missing`);assert.match(html,/ps-class-signature/,`${classId}: class signature missing`);assert.match(html,/ps-class-ornaments/,`${classId}: class frame art missing`);assert.match(html,/ps-premium-class-crest/,`${classId}: premium crest missing`);assert.match(html,new RegExp(`data-crest-class="${classId}"`),`${classId}: wrong premium crest`);assert.match(html,/crest-field/,`${classId}: monochrome-targetable crest structure missing`);assert.match(html,new RegExp(escapeRegex(model.theme.rail)),`${classId}: signature rail missing`);
    writeFileSync(htmlPath,fixtureHtml(html),"utf8");execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
    const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);assert.equal(pages,expected,`${classId}: Ink Saver page count mismatch`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${classId}: Ink Saver PDF not US Letter`);
    execFileSync("pdftotext",["-layout",pdfPath,txtPath]);const text=normalize(readFileSync(txtPath,"utf8"));assert.ok(text.includes(character.name),`${classId}: name missing`);assert.ok(text.includes(model.theme.className),`${classId}: class wordmark missing from PDF text`);assert.ok(text.includes(model.theme.rail.replaceAll(" · "," "))||text.includes(model.theme.className),`${classId}: class identity text missing`);assert.match(text,/RAW integrity/i,`${classId}: audit marker missing`);
    execFileSync("pdftoppm",["-png","-r","110","-f","1","-singlefile",pdfPath,pngBase]);
    execFileSync("pdftoppm",["-r","55","-f","1","-singlefile",pdfPath,ppmBase]);
    assertRenderedMonochrome(`${ppmBase}.ppm`,classId);unlinkSync(`${ppmBase}.ppm`);
    console.log(`[class-signature-ink-saver] ${classId}: ${expected} pages · ${model.theme.grayscalePattern} · rendered pixel monochrome`);
  }catch(error){console.error(`[class-signature-ink-saver] ${classId} failed`,error);throw error;}
}

function assertRenderedMonochrome(filePath,classId){
  const data=readFileSync(filePath);let offset=0;
  const nextToken=()=>{while(offset<data.length&&(data[offset]===9||data[offset]===10||data[offset]===13||data[offset]===32))offset++;if(data[offset]===35){while(offset<data.length&&data[offset]!==10&&data[offset]!==13)offset++;return nextToken();}const start=offset;while(offset<data.length&&data[offset]!==9&&data[offset]!==10&&data[offset]!==13&&data[offset]!==32)offset++;return data.subarray(start,offset).toString("ascii");};
  const magic=nextToken(),width=Number(nextToken()),height=Number(nextToken()),max=Number(nextToken());assert.equal(magic,"P6",`${classId}: unexpected PPM format`);assert.equal(max,255,`${classId}: unexpected PPM channel depth`);if(data[offset]===13&&data[offset+1]===10)offset+=2;else if(data[offset]===9||data[offset]===10||data[offset]===13||data[offset]===32)offset++;
  const expected=width*height*3,pixels=data.subarray(offset,offset+expected);assert.equal(pixels.length,expected,`${classId}: incomplete PPM raster`);let maxSpread=0,coloredPixels=0;for(let i=0;i<pixels.length;i+=3){const r=pixels[i],g=pixels[i+1],b=pixels[i+2],spread=Math.max(r,g,b)-Math.min(r,g,b);if(spread>maxSpread)maxSpread=spread;if(spread>8)coloredPixels++;}
  assert.equal(coloredPixels,0,`${classId}: Black & White render leaked color into ${coloredPixels} pixels (max RGB spread ${maxSpread})`);
}

function characterAt(classId){const state=createInitialState();state.ruleset="2024";state.constraints.level="7";state.constraints.class=classId;state.constraints.subclass="random";state.constraints.species="human";state.constraints.background="criminal";const character=generateCharacter(state);character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe",style:"ornate",paper:"white",ornament:"rich",frame:"class",printMode:"ink-saver",portraitVisible:false,portraitFilter:"grayscale"}};return character;}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function normalize(value){return String(value||"").replace(/\s+/g," ").trim();}
function escapeRegex(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
