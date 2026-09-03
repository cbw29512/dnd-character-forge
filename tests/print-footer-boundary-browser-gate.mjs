import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FORGE_BUILD } from "../src/rules/certification.js";

const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-print");
const CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
const TABLE_PDF=new RegExp(`^(?:2014|2024)-(?:human|dwarf)-(?:${CLASSES.join("|")})\\.pdf$`);
const files=readdirSync(OUT).filter(name=>TABLE_PDF.test(name)).sort();
assert.equal(files.length,24,`print footer boundary gate expected 24 standard Table PDFs, found ${files.length}`);

const temp=mkdtempSync(path.join(os.tmpdir(),"character-forge-footer-boundary-"));
const footerWords=new Set(["rules","lawyer","certified","pass","raw","integrity","page","contains","srd","material","wizards","of","the","coast","llc","cc","by",...CLASSES]);
const failures=[];
try{
  for(const name of files){
    const pdf=path.join(OUT,name),bbox=path.join(temp,`${name}.html`);
    execFileSync("pdftotext",["-bbox-layout","-f","1","-l","1",pdf,bbox],{stdio:"pipe"});
    const source=readFileSync(bbox,"utf8"),page=source.match(/<page\b[^>]*>([\s\S]*?)<\/page>/)?.[1]||"";
    const words=[...page.matchAll(/<word xMin="([^"]+)" yMin="([^"]+)" xMax="([^"]+)" yMax="([^"]+)">([\s\S]*?)<\/word>/g)].map(match=>({yMin:Number(match[2]),text:decode(match[5])}));
    const certification=words.find(word=>word.text.includes(FORGE_BUILD.id));
    if(!certification){failures.push(`${name}: certification token ${FORGE_BUILD.id} missing from page one`);continue;}
    const collisions=words.filter(word=>word.yMin>=certification.yMin-0.25&&word.yMin<=certification.yMin+28&&!footerWord(word.text));
    if(collisions.length){
      const sample=collisions.slice(0,12).map(word=>`${word.text}@${word.yMin.toFixed(1)}pt`).join(" · "),more=collisions.length>12?` · +${collisions.length-12} more`:"";
      failures.push(`${name}: body text entered certification/footer zone: ${sample}${more}`);
    }
  }
}finally{
  rmSync(temp,{recursive:true,force:true});
}
assert.deepEqual(failures,[],`print footer boundary failures:\n${failures.join("\n")}`);
console.log(`[print-footer-boundary] verified ${files.length} Table PDF page-one boundaries against ${FORGE_BUILD.id}`);

function footerWord(value){
  const raw=decode(value).trim();
  if(!raw||/^[^a-z0-9]+$/i.test(raw))return true;
  if(/^[A-Z]{1,2}$/.test(raw))return true;
  const compact=raw.normalize("NFKD").replace(/[’‘]/g,"'").toLowerCase().replace(/[^a-z0-9]+/g,"");
  if(!compact||compact.length===1||footerWords.has(compact))return true;
  if(compact===FORGE_BUILD.id.toLowerCase().replace(/[^a-z0-9]+/g,""))return true;
  if(/^\d+$/.test(compact))return true;
  if(compact.includes("creativecommons")||compact.includes("dndbeyond")||compact.includes("dndwizards")||compact.includes("systemsreferencedocument"))return true;
  return false;
}
function decode(value){return String(value||"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#39;/g,"'").replace(/&#x([0-9a-f]+);/gi,(_,hex)=>String.fromCodePoint(parseInt(hex,16))).replace(/&#(\d+);/g,(_,num)=>String.fromCodePoint(Number(num)));}
