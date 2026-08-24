import test from "node:test";
import assert from "node:assert/strict";
import { DRACONIC_AFFINITIES_2024, DRACONIC_ANCESTRIES_2014, SORCERER_CLASS_2014, SORCERER_CLASS_2024, SORCERER_SUBCLASS_2014, SORCERER_SUBCLASS_2024 } from "../src/data/sorcerer-class.js";
import { sorcererProgressionFor, sorcererSlotCreation } from "../src/rules/sorcerer.js";

const CANTRIPS=[4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6];
const KNOWN_2014=[2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15];
const PREPARED_2024=[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];

function assertSharedClassSchema(record){
  try{
    assert.equal(record.id,"sorcerer");assert.equal(record.hitDie,6);assert.deepEqual(record.saves,["con","cha"]);assert.equal(record.skillCount,2);assert.equal(record.spellcasting,"sorcerer");assert.deepEqual(record.primary,["cha"]);
  }catch(error){console.error("[sorcerer-test] class schema failed",error);throw error;}
}

test("Sorcerer class schema stays edition-correct",()=>{
  try{
    assertSharedClassSchema(SORCERER_CLASS_2014);assertSharedClassSchema(SORCERER_CLASS_2024);
    assert.equal(SORCERER_CLASS_2014.subclassLevel,1);assert.deepEqual(SORCERER_CLASS_2014.asiLevels,[4,8,12,16,19]);
    assert.equal(SORCERER_CLASS_2024.subclassLevel,3);assert.deepEqual(SORCERER_CLASS_2024.asiLevels,[4,8,12,16]);assert.equal(SORCERER_CLASS_2024.epicBoon.feat,"boon-dimensional-travel");
    assert.deepEqual(SORCERER_SUBCLASS_2014,{id:"draconic-bloodline",classId:"sorcerer",name:"Draconic Bloodline",level:1});
    assert.deepEqual(SORCERER_SUBCLASS_2024,{id:"draconic-sorcery",classId:"sorcerer",name:"Draconic Sorcery",level:3});
  }catch(error){console.error("[sorcerer-test] edition class schema failed",error);throw error;}
});

test("2014 Sorcerer progression matches all 20 SRD rows",()=>{
  try{
    for(let level=1;level<=20;level++){
      const p=sorcererProgressionFor("2014",level,"draconic-bloodline");
      assert.equal(p.cantrips,CANTRIPS[level-1]);assert.equal(p.known,KNOWN_2014[level-1]);assert.equal(p.prepared,null);assert.equal(p.sorceryPoints,level>=2?level:0);
      assert.equal(p.metamagicCount,level<3?0:level<10?2:level<17?3:4);assert.equal(p.innateSorcery,false);assert.equal(p.sorcerousRestoration,level>=20);assert.equal(p.sorcerousRestorationAmount,level>=20?4:0);
      assert.equal(p.draconicResilience,true);assert.equal(p.draconicHpBonus,level);assert.equal(p.draconicArmorFormula,"13 + DEX");assert.equal(p.elementalAffinity,level>=6);assert.equal(p.dragonWings,level>=14);assert.equal(p.draconicPresence,level>=18);assert.equal(p.dragonCompanion,false);
    }
  }catch(error){console.error("[sorcerer-test] 2014 progression matrix failed",error);throw error;}
});

test("2024 Sorcerer progression matches all 20 SRD 5.2.1 rows",()=>{
  try{
    for(let level=1;level<=20;level++){
      const p=sorcererProgressionFor("2024",level,"draconic-sorcery");
      assert.equal(p.cantrips,CANTRIPS[level-1]);assert.equal(p.prepared,PREPARED_2024[level-1]);assert.equal(p.known,null);assert.equal(p.sorceryPoints,level>=2?level:0);
      assert.equal(p.metamagicCount,level<2?0:level<10?2:level<17?4:6);assert.equal(p.innateSorcery,true);assert.equal(p.innateSorceryUses,2);assert.equal(p.sorcerousRestoration,level>=5);assert.equal(p.sorcerousRestorationAmount,level>=5?Math.floor(level/2):0);assert.equal(p.sorceryIncarnate,level>=7);assert.equal(p.epicBoon,level>=19);assert.equal(p.arcaneApotheosis,level>=20);
      assert.equal(p.draconicResilience,level>=3);assert.equal(p.draconicHpBonus,level>=3?level:0);assert.equal(p.draconicArmorFormula,level>=3?"10 + DEX + CHA":null);assert.equal(p.draconicSpells,level>=3);assert.equal(p.elementalAffinity,level>=6);assert.equal(p.dragonWings,level>=14);assert.equal(p.dragonCompanion,level>=18);assert.equal(p.draconicPresence,false);
    }
  }catch(error){console.error("[sorcerer-test] 2024 progression matrix failed",error);throw error;}
});

test("Draconic choices and Flexible Casting are fail-closed and edition-specific",()=>{
  try{
    assert.equal(DRACONIC_ANCESTRIES_2014.length,10);assert.deepEqual([...new Set(DRACONIC_ANCESTRIES_2014.map(item=>item.damageType))].sort(),["Acid","Cold","Fire","Lightning","Poison"]);assert.deepEqual(DRACONIC_AFFINITIES_2024,["Acid","Cold","Fire","Lightning","Poison"]);
    assert.deepEqual(sorcererSlotCreation("2014",5),{slotLevel:5,cost:7,minimumSorcererLevel:null});assert.deepEqual(sorcererSlotCreation("2024",5),{slotLevel:5,cost:7,minimumSorcererLevel:9});
    assert.throws(()=>sorcererProgressionFor("2014",0),/Unsupported 2014 Sorcerer level 0/);assert.throws(()=>sorcererProgressionFor("2024",21),/Unsupported 2024 Sorcerer level 21/);assert.throws(()=>sorcererProgressionFor("2030",5),/Unsupported Sorcerer ruleset/);assert.throws(()=>sorcererSlotCreation("2024",6),/cannot create spell slot level 6/);
  }catch(error){console.error("[sorcerer-test] fail-closed contract failed",error);throw error;}
});
