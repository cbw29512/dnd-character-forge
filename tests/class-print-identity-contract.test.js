import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRINT_THEMES } from "../src/print/theme.js";

const MARTIAL=read("styles/print/premium-class-martial.css");
const DIVINE_WILD=read("styles/print/premium-class-divine-wild.css");
const ARCANE=read("styles/print/premium-class-arcane.css");
const LOAD_POINT=read("styles/print/premium-sorcerer.css");
const ALL=[MARTIAL,DIVINE_WILD,ARCANE].join("\n");

const GROUPS=Object.freeze({
  barbarian:"martial",fighter:"martial",monk:"martial",rogue:"martial",
  cleric:"divine-wild",druid:"divine-wild",paladin:"divine-wild",ranger:"divine-wild",
  bard:"arcane",sorcerer:"arcane",warlock:"arcane",wizard:"arcane"
});

for(const [classId,theme] of Object.entries(PRINT_THEMES)){
  test(`${classId} has a dedicated premium print identity`,()=>{
    try{
      assert.equal(typeof GROUPS[classId],"string",`${classId}: identity group missing`);
      assert.match(ALL,new RegExp(`\\.theme-${escapeRegex(theme.id)}\\s+\\.ps-frame\\b`),`${classId}: frame identity missing`);
      assert.match(ALL,new RegExp(`\\.theme-${escapeRegex(theme.id)}\\s+\\.ps-panel\\b`),`${classId}: panel identity missing`);
      assert.match(ALL,new RegExp(`\\.theme-${escapeRegex(theme.id)}\\s+\\.ps-stat\\b`),`${classId}: stat geometry missing`);
      assert.match(ALL,new RegExp(`\\.theme-${escapeRegex(theme.id)}\\s+\\.ps-portrait-art\\b`),`${classId}: portrait geometry missing`);
      const utility=classId==="rogue"?"ps-rogue":`utility-${classId}`;
      assert.match(ALL,new RegExp(`\\.${escapeRegex(utility)}\\b`),`${classId}: class resource styling missing`);
    }catch(error){console.error(`[class-print-identity] ${classId} contract failed`,error);throw error;}
  });
}

test("class identity sheets load after the shared premium stack",()=>{
  try{
    for(const file of ["premium-class-martial.css","premium-class-divine-wild.css","premium-class-arcane.css"]){
      assert.match(LOAD_POINT,new RegExp(`@import url\\("\\./${escapeRegex(file)}"\\);`),`${file}: final override import missing`);
    }
    const firstRule=LOAD_POINT.indexOf("@media print");
    const lastImport=LOAD_POINT.lastIndexOf("@import");
    assert.ok(lastImport>=0&&lastImport<firstRule,"class identity imports must precede the load-point rules");
  }catch(error){console.error("[class-print-identity] load order contract failed",error);throw error;}
});

function read(path){
  try{return readFileSync(new URL(`../${path}`,import.meta.url),"utf8");}
  catch(error){console.error(`[class-print-identity] failed reading ${path}`,error);throw error;}
}
function escapeRegex(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
