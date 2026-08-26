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
mkdirSync(OUT,{recursive:true});

const state=createInitialState();
state.ruleset="2014";
state.constraints.level="20";
state.constraints.class="fighter";
state.constraints.subclass="champion";
state.constraints.species="human";
state.constraints.background="acolyte";
state.classSelections={fightingStyle:"defense"};
const character=generateCharacter(state);
assert.equal(character.validation.valid,true,"2014 Fighter must validate");
assert.equal(character.audit.status,"PASS","2014 Fighter rules audit must pass");
assert.equal(character.audit.rawIntegrity,true,"2014 Fighter RAW integrity must pass");

const target={innerHTML:""};
const model=renderPremiumPrintSheet(character,target);
assert.equal(model.presentation.customization.packetMode,"table","2014 Fighter coverage must exercise stable Table packet");
assert.equal(model.packet.totalPages,1,"2014 Fighter Table model must be one page");

const slug="2014-human-fighter";
const htmlPath=path.join(OUT,`${slug}.html`);
const pdfPath=path.join(OUT,`${slug}.pdf`);
const txtPath=path.join(OUT,`${slug}.txt`);
const pngPrefix=path.join(OUT,`${slug}-page`);
writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});

const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});
const pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);
assert.equal(pages,1,"2014 Fighter browser PDF must be one page");
assert.match(info,/Page size:\s+612 x 792 pts/i,"2014 Fighter PDF must be US Letter");
execFileSync("pdftotext",["-layout",pdfPath,txtPath]);
execFileSync("pdftoppm",["-png","-r","96",pdfPath,pngPrefix]);
const extracted=normalize(readFileSync(txtPath,"utf8"));
assert.ok(extracted.length>500,"2014 Fighter PDF is suspiciously sparse");
assert.match(extracted,/Page\s+1\s*\/\s*1/i,"2014 Fighter page marker missing");
assert.ok(extracted.toLowerCase().includes("raw integrity"),"2014 Fighter RAW integrity marker missing");
for(const token of [character.name,...model.attacks.map(item=>item.name),...model.equipment,...model.ruleIndex.map(item=>item.name),...(model.classUtility?[model.classUtility.title]:[])]){
  assert.ok(extracted.toLowerCase().includes(normalize(token).toLowerCase()),`2014 Fighter PDF lost expected content: ${token}`);
}
console.log(`[fighter-2014-browser-print] ${slug}: 1 Letter page · ${model.ruleIndex.length} rules · ${model.equipment.length} equipment`);

function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function normalize(value){return String(value||"").replace(/\s+/g," ").trim();}
