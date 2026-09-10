import test from "node:test";
import assert from "node:assert/strict";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { FORGE_ORIGINAL_BACKGROUNDS_2014, FORGE_ORIGINAL_BACKGROUNDS_2024, isForgeOriginalBackground } from "../src/data/original-backgrounds.js";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { pick, resetRandomHistory } from "../src/rules/random.js";

test("Forge-original records remain opt-in and never enter the default Random pool",()=>{
  for(const source of [...FORGE_ORIGINAL_BACKGROUNDS_2014,...FORGE_ORIGINAL_BACKGROUNDS_2024])assert.equal(source.randomEligible,false,`${source.id} source eligibility changed`);
  for(const data of [FORGE_2014,FORGE_2024]){
    const originals=data.backgrounds.filter(item=>item.contentKind==="forge-original");
    assert.equal(originals.length,12);
    assert.ok(originals.every(item=>item.randomEligible===false&&item.randomEligibleInForge!==true),`${data.ruleset} Forge Original backgrounds must remain opt-in`);
    resetRandomHistory();
    for(let index=0;index<40;index+=1)assert.equal(isForgeOriginalBackground(pick(data.backgrounds)),false,`${data.ruleset} Random selected Forge Original content`);
  }
  resetRandomHistory();
});

test("RAW generator Random backgrounds stay inside verified SRD catalogs",()=>{
  for(const [ruleset,data] of [["2014",FORGE_2014],["2024",FORGE_2024]]){
    resetRandomHistory();
    for(let index=0;index<24;index+=1){
      const state=createInitialState();state.ruleset=ruleset;state.constraints.level="5";state.constraints.class="fighter";state.constraints.species=ruleset==="2014"?"human":"dwarf";state.constraints.subclass="champion";state.constraints.background="random";
      const character=generateCharacter(state);
      assert.equal(character.sourceMode,"RAW");
      const diagnostic=`bg=${character.background?.id}/${character.background?.contentKind||"srd"} subclass=${character.subclass?.id}/${character.subclass?.contentKind||"srd"} feats=${(character.feats||[]).map(feat=>`${feat.id}:${feat.contentKind||"srd"}`).join(",")||"none"} license=${character.audit?.license||"none"}`;
      assert.equal(character.audit.rawIntegrity,true,`${ruleset}: Random character crossed out of RAW (${diagnostic})`);
      assert.equal(isForgeOriginalBackground(character.background),false,`${ruleset}: ${character.background?.id} is not SRD`);
      assert.ok(data.backgrounds.some(item=>item.id===character.background.id));
    }
  }
  resetRandomHistory();
});

test("Random background selection does not repeat until a five-option pool is exhausted",()=>{
  const original=Math.random;
  try{
    Math.random=()=>0;
    resetRandomHistory();
    const pool=FORGE_2024.backgrounds.filter(item=>item.randomEligible!==false).slice(0,5),chosen=Array.from({length:pool.length},()=>pick(pool).id);
    assert.equal(new Set(chosen).size,pool.length,`Random repeated early: ${chosen.join(", ")}`);
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
