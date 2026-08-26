import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";

const EDITIONS=[
  {ruleset:"2014",data:FORGE_2014,version:"SRD 5.1"},
  {ruleset:"2024",data:FORGE_2024,version:"SRD 5.2.1"}
];

function maxCharacter(ruleset,data,classId){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level="20";
  state.constraints.class=classId;
  state.constraints.subclass="random";
  state.constraints.species=data.species[0].id;
  state.constraints.background=data.backgrounds[0].id;
  return generateCharacter(state);
}

for(const {ruleset,data,version} of EDITIONS){
  test(`${ruleset} every supported class has edition-correct provenance on audit mechanics and quick references`,()=>{
    for(const cls of data.classes){
      const character=maxCharacter(ruleset,data,cls.id);
      assert.equal(character.validation?.valid,true,`${ruleset} ${cls.id}: invalid character`);
      assert.equal(character.audit?.status,"PASS",`${ruleset} ${cls.id}: audit failed`);
      assert.equal(character.audit?.rawIntegrity,true,`${ruleset} ${cls.id}: RAW integrity failed`);
      assert.ok(character.audit.mechanics.length>0,`${ruleset} ${cls.id}: no audited mechanics`);
      for(const mechanic of character.audit.mechanics){
        assert.equal(mechanic.source?.version,version,`${ruleset} ${cls.id} ${mechanic.label}: wrong source version`);
        assert.ok(String(mechanic.source?.page||"").trim(),`${ruleset} ${cls.id} ${mechanic.label}: source page missing`);
        assert.match(mechanic.source?.pdfUrl||"",/\.pdf$/,`${ruleset} ${cls.id} ${mechanic.label}: PDF source missing`);
      }
      const references=buildQuickReference(character);
      assert.ok(references.length>0,`${ruleset} ${cls.id}: no quick references`);
      for(const item of references){
        assert.equal(item.source?.version,version,`${ruleset} ${cls.id} ${item.name}: quick reference crossed editions`);
        assert.ok(String(item.source?.page||"").trim(),`${ruleset} ${cls.id} ${item.name}: reference page missing`);
        assert.match(item.source?.pdfUrl||"",/\.pdf$/,`${ruleset} ${cls.id} ${item.name}: reference PDF missing`);
      }
    }
  });
}
