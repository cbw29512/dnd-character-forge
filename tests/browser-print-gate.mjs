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
  {ruleset:"2024",classId:"fighter",subclass:"champion",species:"human",background:"criminal"},
  {ruleset:"2024",classId:"wizard",subclass:"evoker",species:"human",background:"criminal"},
  {ruleset:"2024",classId:"cleric",subclass:"life-domain",species:"human",background:"criminal"},
  {ruleset:"2024",classId:"rogue",subclass:"thief",species:"human",background:"criminal"},
  {ruleset:"2014",classId:"wizard",subclass:"school-evocation",species:"human",background:"acolyte"},
  {ruleset:"2014",classId:"cleric",subclass:"life-domain",species:"human",background:"acolyte"}
];

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
for(const testCase of CASES)verifyPacket(testCase);
console.log(`[browser-print] verified ${CASES.length} level-20 premium packets in headless Chrome`);

function verifyPacket(testCase){
  const character=characterAt(testCase),target={innerHTML:""},model=renderPremiumPrintSheet(character,target),slug=`${testCase.ruleset}-${testCase.classId}-${testCase.subclass}`,htmlPath=path.join(OUT,`${slug}.html`),pdfPath=path.join(OUT,`${slug}.pdf`),txtPath=path.join(OUT,`${slug}.txt`);
  writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
  execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
  const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"}),pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);assert.equal(pages,model.packet.totalPages,`${slug}: browser PDF page count differs from packet model`);assert.match(info,/Page size:\s+612 x 792 pts/i,`${slug}: PDF is not US Letter`);
  execFileSync("pdftotext",["-layout",pdfPath,txtPath]);const extracted=readFileSync(txtPath,"utf8"),pageText=pdfPages(extracted);assert.equal(pageText.length,pages,`${slug}: extracted PDF page count mismatch`);
  for(let index=0;index<pageText.length;index++){const text=normalize(pageText[index]);assert.ok(text.length>80,`${slug}: page ${index+1} appears blank`);assert.match(text,new RegExp(`Page\\s+${index+1}\\s*\\/\\s*${pages}`,"i"),`${slug}: page ${index+1} is missing its packet page marker`);}
  const whole=normalize(extracted),refs=model.appendix.referencePages.flat(),spells=model.appendix.spellPages.flatMap(page=>page.entries),tokens=[character.name,"Rules Audit",...refs.map(item=>item.name),...spells.map(item=>item.name)];for(const token of tokens)assert.ok(whole.includes(normalize(token)),`${slug}: printed PDF lost expected content: ${token}`);
  if(testCase.ruleset==="2014"&&testCase.classId==="wizard"){assert.equal(character.spells.spellbook.all.length,44);assert.equal(spells.length,49);assert.ok(whole.includes("SRD 5.1"));assert.ok(whole.includes("Spell Mastery"));assert.ok(whole.includes("Signature Spells"));}
  if(testCase.ruleset==="2014"&&testCase.classId==="cleric"){assert.equal(character.spells.cantrips.all.length,5);assert.equal(character.spells.prepared.all.length,25);assert.equal(character.spells.alwaysPrepared.length,10);assert.equal(spells.length,40);assert.ok(whole.includes("SRD 5.1"));assert.ok(whole.includes("Cleric spell list pp.106-107"));assert.ok(whole.includes("Destroy Undead (CR 4)"));assert.ok(whole.includes("Divine Intervention"));assert.ok(whole.includes("Supreme Healing"));}
  console.log(`[browser-print] ${slug}: ${pages} Letter pages · ${refs.length} rules · ${spells.length} spells`);
}
function characterAt({ruleset,classId,subclass,species,background}){const state=createInitialState();state.ruleset=ruleset;state.constraints.level="20";state.constraints.class=classId;state.constraints.subclass=subclass;state.constraints.species=species;state.constraints.background=background;return generateCharacter(state);}
function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function pdfPages(text){const pages=text.split("\f");while(pages.length&&pages.at(-1).trim()==="")pages.pop();return pages;}
function normalize(value){return String(value??"").normalize("NFKC").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/\s+/g," ").trim();}
