import test from "node:test";
import assert from "node:assert/strict";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { FORGE_ORIGINAL_BACKGROUNDS_2014, FORGE_ORIGINAL_BACKGROUNDS_2024 } from "../src/data/original-backgrounds.js";
import { pick, resetRandomHistory } from "../src/rules/random.js";

test("Forge-original source records stay explicitly non-SRD while combined Forge catalogs allow diverse Random backgrounds",()=>{
  for(const source of [...FORGE_ORIGINAL_BACKGROUNDS_2014,...FORGE_ORIGINAL_BACKGROUNDS_2024])assert.equal(source.randomEligible,false,`${source.id} source eligibility changed`);
  for(const data of [FORGE_2014,FORGE_2024]){
    const originals=data.backgrounds.filter(item=>item.contentKind==="forge-original");
    assert.equal(originals.length,12);
    assert.ok(originals.every(item=>item.randomEligible===false&&item.randomEligibleInForge===true),`${data.ruleset} Forge Random flags are incomplete`);
  }
});

test("Random background selection does not repeat until a five-option pool is exhausted",()=>{
  const original=Math.random;
  try{
    Math.random=()=>0;
    resetRandomHistory();
    const pool=FORGE_2024.backgrounds.slice(0,5),chosen=Array.from({length:5},()=>pick(pool).id);
    assert.equal(new Set(chosen).size,5,`Random repeated early: ${chosen.join(", ")}`);
  }finally{Math.random=original;resetRandomHistory();}
});

test("all-Random class context favors backgrounds that make sense for the generated class",()=>{
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
