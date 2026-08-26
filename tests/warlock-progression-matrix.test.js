import test from "node:test";
import assert from "node:assert/strict";
import { warlockProgressionFor } from "../src/rules/warlock.js";

const CANTRIPS=[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4];
const KNOWN_OR_PREPARED=[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15];
const INVOCATIONS_2014=[0,2,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8];
const INVOCATIONS_2024=[1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10];
const PACT_SLOTS=[1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4];
const SLOT_LEVEL=[1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5];

function expectedArcanum(level){
  const out={};
  if(level>=11)out[6]=1;
  if(level>=13)out[7]=1;
  if(level>=15)out[8]=1;
  if(level>=17)out[9]=1;
  return out;
}

test("2014 Warlock Pact Magic table matches every SRD level 1-20",()=>{
  for(let level=1;level<=20;level++){
    const row=warlockProgressionFor("2014",level,"fiend"),index=level-1;
    assert.equal(row.cantrips,CANTRIPS[index],`L${level} cantrips`);
    assert.equal(row.known,KNOWN_OR_PREPARED[index],`L${level} spells known`);
    assert.equal(row.prepared,null,`L${level} must not use prepared-spell count`);
    assert.equal(row.invocations,INVOCATIONS_2014[index],`L${level} invocations`);
    assert.equal(row.slotCount,PACT_SLOTS[index],`L${level} Pact slots`);
    assert.equal(row.slotLevel,SLOT_LEVEL[index],`L${level} Pact slot level`);
    assert.deepEqual(row.mysticArcanum,expectedArcanum(level),`L${level} Mystic Arcanum`);
    assert.equal(row.pactBoon,level>=3,`L${level} Pact Boon breakpoint`);
    assert.equal(row.eldritchMaster,level>=20,`L${level} Eldritch Master breakpoint`);
    assert.equal(row.magicalCunning,false,`L${level} must not leak Magical Cunning`);
    assert.equal(row.contactPatron,false,`L${level} must not leak Contact Patron`);
    assert.equal(row.epicBoon,false,`L${level} must not leak Epic Boon`);
  }
});

test("2024 Warlock Pact Magic table matches every SRD 5.2.1 level 1-20",()=>{
  for(let level=1;level<=20;level++){
    const row=warlockProgressionFor("2024",level,"fiend-patron"),index=level-1;
    assert.equal(row.cantrips,CANTRIPS[index],`L${level} cantrips`);
    assert.equal(row.known,null,`L${level} must not use spells-known count`);
    assert.equal(row.prepared,KNOWN_OR_PREPARED[index],`L${level} prepared spells`);
    assert.equal(row.invocations,INVOCATIONS_2024[index],`L${level} invocations`);
    assert.equal(row.slotCount,PACT_SLOTS[index],`L${level} Pact slots`);
    assert.equal(row.slotLevel,SLOT_LEVEL[index],`L${level} Pact slot level`);
    assert.deepEqual(row.mysticArcanum,expectedArcanum(level),`L${level} Mystic Arcanum`);
    assert.equal(row.pactBoon,false,`L${level} must not leak 2014 Pact Boon`);
    assert.equal(row.magicalCunning,level>=2,`L${level} Magical Cunning breakpoint`);
    assert.equal(row.contactPatron,level>=9,`L${level} Contact Patron breakpoint`);
    assert.equal(row.epicBoon,level>=19,`L${level} Epic Boon breakpoint`);
    assert.equal(row.eldritchMaster,level>=20,`L${level} Eldritch Master breakpoint`);
  }
});

test("Fiend subclass feature breakpoints stay edition-correct",()=>{
  for(const [ruleset,subclass] of [["2014","fiend"],["2024","fiend-patron"]]){
    for(let level=1;level<=20;level++){
      const row=warlockProgressionFor(ruleset,level,subclass);
      assert.equal(row.darkOnesBlessing,level>=(ruleset==="2014"?1:3),`${ruleset} L${level} Dark One's Blessing`);
      assert.equal(row.darkOnesOwnLuck,level>=6,`${ruleset} L${level} Dark One's Own Luck`);
      assert.equal(row.fiendishResilience,level>=10,`${ruleset} L${level} Fiendish Resilience`);
      assert.equal(row.hurlThroughHell,level>=14,`${ruleset} L${level} Hurl Through Hell`);
      assert.equal(row.fiendSpells,ruleset==="2024"&&level>=3,`${ruleset} L${level} Fiend spell model`);
    }
  }
});
