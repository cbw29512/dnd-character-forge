import assert from "node:assert/strict";
import test from "node:test";
import { generateParty } from "../src/rules/party-forge.js";
import { buildPartyQuickReference, renderPartyQuickReference } from "../src/ui/party-print-summary.js";

for(const ruleset of ["2014","2024"]){
  test(`${ruleset} Party Print builds a certified DM quick reference`,()=>{
    const party=generateParty({ruleset,level:5,size:4,composition:"balanced"});
    const model=buildPartyQuickReference(party.members),html=renderPartyQuickReference(party.members);
    assert.equal(model.ruleset,ruleset);
    assert.equal(model.size,4);
    assert.equal(model.certifiedCount,4);
    assert.equal(model.rows.length,4);
    assert.match(html,/Party Quick Reference/);
    assert.match(html,/4\/4 RULES LAWYER CERTIFIED/);
    assert.match(html,/PASSIVE PERCEPTION/);
    for(const [index,member] of party.members.entries()){
      const row=model.rows[index];
      assert.equal(row.name,member.name);
      assert.equal(row.ac,member.ac);
      assert.equal(row.hp,member.hp);
      assert.equal(row.passivePerception,member.passivePerception);
      assert.ok(row.attack.length>0);
      assert.ok(html.includes(member.name),`${ruleset}: summary omitted ${member.name}`);
    }
  });
}

test("Party Print quick reference rejects mixed rules editions",()=>{
  const a=generateParty({ruleset:"2014",level:5,size:2}).members[0];
  const b=generateParty({ruleset:"2024",level:5,size:2}).members[0];
  assert.throws(()=>buildPartyQuickReference([a,b]),/cannot mix rules editions/i);
});
