import test from "node:test";
import assert from "node:assert/strict";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { FORGE_ORIGINAL_BACKGROUNDS_2014, FORGE_ORIGINAL_BACKGROUNDS_2024 } from "../src/data/original-backgrounds.js";
import { pick, resetRandomHistory } from "../src/rules/random.js";

test("Forge-original source records stay explicitly non-SRD and Random-ineligible",()=>{
  for(const source of [...FORGE_ORIGINAL_BACKGROUNDS_2014,...FORGE_ORIGINAL_BACKGROUNDS_2024])assert.equal(source.randomEligible,false,`${source.id} source eligibility changed`);
  for(const data of [FORGE_2014,FORGE_2024]){
    const originals=data.backgrounds.filter(item=>item.contentKind==="forge-original");
    assert.equal(originals.length,12);
    assert.ok(originals.every(item=>item.randomEligible===false),`${data.ruleset} original Random exclusion is incomplete`);
  }
});

test("Random picker treats randomEligible false as authoritative even with legacy compatibility flag",()=>{
  const official={id:"official",randomEligible:true},blocked={id:"blocked",randomEligible:false,randomEligibleInForge:true};
  const original=Math.random;
  try{
    Math.random=()=>0;
    resetRandomHistory();
    for(let index=0;index<20;index++)assert.equal(pick([blocked,official]).id,"official");
    assert.throws(()=>pick([blocked]),/no Random-eligible choices/i);
  }finally{Math.random=original;resetRandomHistory();}
});

test("Random background selection does not repeat until an eligible five-option pool is exhausted",()=>{
  const original=Math.random;
  try{
    Math.random=()=>0;
    resetRandomHistory();
    const pool=FORGE_2024.backgrounds.filter(item=>item.randomEligible!==false).slice(0,5),chosen=Array.from({length:pool.length},()=>pick(pool).id);
    assert.equal(new Set(chosen).size,pool.length,`Random repeated early: ${chosen.join(", ")}`);
  }finally{Math.random=original;resetRandomHistory();}
});

test("all-Random class context favors official backgrounds that make sense for the generated class",()=>{
  const original=Math.random;
  try{
    Math.random=()=>0.30;
    resetRandomHistory();
    const fighter=FORGE_2024.classes.find(item=>item.id==="fighter");
    const sage=FORGE_2024.backgrounds.find(item=>item.id==="sage"),soldier=FORGE_2024.backgrounds.find(item=>item.id==="soldier");
    assert.equal(pick([fighter]).id,"fighter");
    assert.equal(pick([sage,soldier]).id,"soldier");
  }finally{Math.random=original;resetRandomHistory();}
});
