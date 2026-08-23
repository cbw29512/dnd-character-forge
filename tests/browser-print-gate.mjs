import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  ["fighter","champion"],
  ["wizard","evoker"],
  ["cleric","life-domain"],
  ["rogue","thief"]
];

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
for(const [classId,subclass] of CASES)verifyPacket(classId,subclass);
console.log(`[browser-print] verified ${CASES.length} level-20 premium packets in headless Chrome`);

function verifyPacket(classId,subclass){
  const character=characterAt(classId,subclass),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${classId}-${subclass}`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`);
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);assert.equal(pages,model.packet.totalPages,`${slug}: browser PDF page count differs from packet model`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);
  execFileSync("pdftotext",["-layout",pdfPath,txtPath]);const extracted=readFileSync(txtPath,"utf8"),pageText=pdfPages(extracted);assert.equal(pageText.length,pages,`${slug}: extracted PDF page count mismatch`);
  for(let index=0;index<pageText.length;index++){const text=normalize(pageText[index]);assert.ok(text.length>80,`${slug}: page ${index+1} appears blank`);assert.match(text,new RegExp(`Page\\s+${index+1}\\s*\\/\\s*${pages}`,"i"),`${slug}: page ${index+1} is missing its packet page marker`);}
  const whole=normalize(extracted),refs=model.appendix.referencePages.flat(),spells=model.appendix.spellPages.flatMap(page=>page.entries),tokens=[character.name,"Rules Audit",...refs.map(item=>item.name),...spells.map(item=>item.name)];for(const token of tokens)assert.ok(whole.includes(normalize(token)),`${slug}: printed PDF lost expected content: ${token}`);
  console.log(`[browser-print] ${slug}: ${pages} Letter pages · ${refs.length} rules · ${spells.length} spells`);
}
function characterAt(classId,subclass){const state=createInitialState();state.ruleset="2024";state.constraints.level="20";state.constraints.class=classId;state.constraints.subclass=subclass;state.constraints.species="human";state.constraints.background="criminal";return generateCharacter(state);}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function pdfPages(text){const pages=text.split("\f");while(pages.length&&pages.at(-1).trim()==="")pages.pop();return pages;}
function normalize(value){return String(value??"").normalize("NFKC").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/\s+/g," ").trim();}
