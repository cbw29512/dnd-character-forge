import test from "node:test";
import assert from "node:assert/strict";
import { validateVisibleForgeSelections } from "../src/ui/forge-preflight.js";

function rootWith(valuesById){
  try{
    return{getElementById(id){const values=valuesById[id];return values?{options:values.map(value=>({value}))}:null;}};
  }catch(error){
    console.error("[forge-preflight-test] mock root failed",error);
    throw error;
  }
}

function stateWith(overrides={}){
  try{
    return{ruleset:"2024",constraints:{level:"random",species:"random",class:"random",subclass:"random",background:"random",name:"",...overrides}};
  }catch(error){
    console.error("[forge-preflight-test] state fixture failed",error);
    throw error;
  }
}

test("Random choices do not require a matching option",()=>{
  assert.equal(validateVisibleForgeSelections(stateWith(),rootWith({})),true);
});

test("legal locked choices pass preflight",()=>{
  const state=stateWith({level:"5",species:"human",class:"fighter",subclass:"champion",background:"soldier"});
  const root=rootWith({level:["random","5"],species:["random","human"],class:["random","fighter"],subclass:["random","champion"],background:["random","soldier"]});
  assert.equal(validateVisibleForgeSelections(state,root),true);
});

test("stale locked choice names the exact field and recovery",()=>{
  const state=stateWith({class:"wizard"});
  const root=rootWith({class:["random","fighter"]});
  assert.throws(()=>validateVisibleForgeSelections(state,root),/Class "wizard" is not available under 2024 rules.*Set Class to Random/);
});
