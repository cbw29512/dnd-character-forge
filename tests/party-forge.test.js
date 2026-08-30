import test from "node:test";
import assert from "node:assert/strict";
import { generateParty, PARTY_COMPOSITIONS } from "../src/rules/party-forge.js";

const FRONTLINE=new Set(["barbarian","fighter","paladin","monk"]);
const EXPERT=new Set(["rogue","ranger","bard"]);
const DIVINE=new Set(["cleric","druid","paladin","ranger"]);
const ARCANE=new Set(["wizard","sorcerer","warlock","bard"]);

for(const ruleset of ["2014","2024"]){
  test(`${ruleset} balanced Party Forge produces four distinct RAW-valid characters`,()=>{
    const party=generateParty({ruleset,level:5,size:4,composition:PARTY_COMPOSITIONS.BALANCED,allowDuplicateClasses:false,magicMode:"normal"});
    assert.equal(party.members.length,4);
    assert.equal(new Set(party.members.map(member=>member.id)).size,4);
    assert.equal(new Set(party.members.map(member=>member.name)).size,4);
    assert.equal(new Set(party.members.map(member=>member.class.id)).size,4);
    assert.ok(party.members.every(member=>member.ruleset===ruleset));
    assert.ok(party.members.every(member=>member.level===5));
    assert.ok(party.members.every(member=>member.sourceMode==="RAW"));
    assert.ok(party.members.every(member=>member.validation?.valid===true));
    assert.ok(party.members.every(member=>member.startingMagic));
    const ids=party.members.map(member=>member.class.id);
    assert.ok(ids.some(id=>FRONTLINE.has(id)),"balanced party should include a frontline class");
    assert.ok(ids.some(id=>EXPERT.has(id)),"balanced party should include an expert class");
    assert.ok(ids.some(id=>DIVINE.has(id)),"balanced party should include a divine-capable class");
    assert.ok(ids.some(id=>ARCANE.has(id)),"balanced party should include an arcane-capable class");
  });

  test(`${ruleset} random Party Forge honors the no-duplicate-class rule`,()=>{
    const party=generateParty({ruleset,level:1,size:6,composition:PARTY_COMPOSITIONS.RANDOM,allowDuplicateClasses:false});
    assert.equal(party.members.length,6);
    assert.equal(new Set(party.members.map(member=>member.class.id)).size,6);
    assert.ok(party.members.every(member=>member.validation?.valid===true));
  });
}

test("Party Forge rejects unsupported request boundaries",()=>{
  assert.throws(()=>generateParty({size:1}),/between 2 and 6/i);
  assert.throws(()=>generateParty({level:21}),/1 through 20/i);
  assert.throws(()=>generateParty({ruleset:"2030"}),/2014 and 2024/i);
  assert.throws(()=>generateParty({composition:"optimized"}),/composition mode/i);
});
