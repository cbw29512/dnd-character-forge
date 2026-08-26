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
assert.equal(character.validation?.valid,true,`2014 Fighter validation failed: ${(character.validation?.errors||[]).join(" | ")}`);
assert.equal(character.audit?.status,"PASS");
assert.equal(character.audit?.rawIntegrity,true);

const target={innerHTML:""};
const model=renderPremiumPrintSheet(character,target);
const slug="2014-human-fighter";
const htmlPath=path.join(OUT,`${slug}.html`);
const pdfPath=path.join(OUT,`${slug}.pdf`);
const txtPath=path.join(OUT,`${slug}.txt`);
const pngPrefix=path.join(OUT,`${slug}-page`);
writeFileSync(htmlPath,fixtureHtml(target.innerHTML),"utf8");
execFileSync(CHROME,["--headless","--no-sandbox","--disable-gpu","--allow-file-access-from-files","--no-pdf-header-footer",`--print-to-pdf=${pdfPath}`,pathToFileURL(htmlPath).href],{stdio:"pipe"});
const info=execFileSync("pdfinfo",[pdfPath],{encoding:"utf8"});
const pages=Number(info.match(/^Pages:\s+(\d+)/m)?.[1]||0);
assert.equal(model.packet.totalPages,1,"2014 Fighter model must remain a one-page profile");
assert.equal(pages,1,"2014 Fighter browser PDF must remain one page");
assert.match(info,/Page size:\s+612 x 792 pts/i,"2014 Fighter PDF is not US Letter");
execFileSync("pdftotext",["-layout",pdfPath,txtPath]);
execFileSync("pdftoppm",["-png","-r","96",pdfPath,pngPrefix]);
const whole=normalize(readFileSync(txtPath,"utf8"));
const fold=whole.toLowerCase();
assert.ok(whole.length>500,"2014 Fighter print is suspiciously sparse");
assert.ok(fold.includes("raw integrity"),"2014 Fighter print lost RAW integrity marker");
assert.ok(fold.includes("fighter"),"2014 Fighter class identity missing");
assert.ok(fold.includes("champion"),"2014 Fighter subclass identity missing");
assert.ok(fold.includes("action surge"),"2014 Fighter Action Surge missing");
assert.ok(fold.includes("second wind"),"2014 Fighter Second Wind missing");
assert.ok(fold.includes("extra attack"),"2014 Fighter Extra Attack missing");
assert.equal(fold.includes("weapon mastery"),false,"2014 Fighter leaked 2024 Weapon Mastery");
assert.equal(fold.includes("tactical mind"),false,"2014 Fighter leaked 2024 Tactical Mind");
for(const token of [character.name,...model.attacks.map(item=>item.name),...model.equipment,...model.ruleIndex.map(item=>item.name)]){
  assert.ok(fold.includes(normalize(token).toLowerCase()),`2014 Fighter PDF lost expected content: ${token}`);
}
console.log(`[fighter-browser-print] ${slug}: ${pages} Letter page · ${model.ruleIndex.length} rules · ${model.equipment.length} equipment`);

function fixtureHtml(packet){return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/responsive.css"></head><body class="premium-print-active"><div id="premiumPrintRoot" class="premium-print-root">${packet}</div></body></html>`;}
function normalize(value){return String(value||"").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/\s+/g," ").trim();}
