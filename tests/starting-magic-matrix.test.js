import test from "node:test";
import assert from "node:assert/strict";
import { MAGIC_MODES } from "../src/state.js";
import { forgeDataFor } from "../src/data/forge-data.js";
import { STARTING_MAGIC_ITEM_CATALOG, generateStartingMagic, magicItemEligibleForClass } from "../src/rules/magic-starting.js";

const CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
const LEVELS=[1,2,4,5,10,11,16,17,20];
const MODES=[MAGIC_MODES.NO_MAGIC,MAGIC_MODES.LOW_MAGIC,MAGIC_MODES.NORMAL_MAGIC,MAGIC_MODES.HIGH_MAGIC];

for(const ruleset of ["2014","2024"]){
  test(`${ruleset} starting resources resolve for every class, tier boundary, and explicit magic mode`,()=>{
    try{
      const data=forgeDataFor(ruleset);
      for(const classId of CLASSES)for(const level of LEVELS)for(const mode of MODES){
        const plan=generateStartingMagic({ruleset,level,mode,classId});
        assert.equal(plan.ruleset,ruleset,`${ruleset} ${classId} L${level} ${mode}: wrong ruleset`);
        assert.equal(plan.level,level,`${ruleset} ${classId} L${level} ${mode}: wrong level`);
        assert.equal(plan.mode,mode,`${ruleset} ${classId} L${level} ${mode}: explicit mode changed`);
        assert.equal(plan.requestedMode,mode,`${ruleset} ${classId} L${level} ${mode}: requested mode lost`);
        assert.ok(String(plan.gold||"").trim(),`${ruleset} ${classId} L${level} ${mode}: gold guidance missing`);
        assert.ok(String(plan.source||"").trim(),`${ruleset} ${classId} L${level} ${mode}: source guidance missing`);
        if(mode===MAGIC_MODES.NO_MAGIC){assert.deepEqual(plan.items,[],`${ruleset} ${classId} L${level}: No Magic created items`);continue;}
        const expected=Object.values(plan.allowance||{}).reduce((sum,count)=>sum+Number(count||0),0);
        assert.equal(plan.items.length,expected,`${ruleset} ${classId} L${level} ${mode}: allowance count mismatch`);
        assert.equal(new Set(plan.items.map(item=>item.id)).size,plan.items.length,`${ruleset} ${classId} L${level} ${mode}: duplicate magic items`);
        for(const item of plan.items){
          assert.ok(item.id&&item.name&&item.rarity,`${ruleset} ${classId} L${level} ${mode}: incomplete item`);
          assert.equal(typeof item.attunement,"boolean",`${ruleset} ${classId} ${item.name}: attunement metadata missing`);
          assert.equal(item.source,plan.source,`${ruleset} ${classId} L${level} ${mode}: item provenance lost`);
          assert.equal(magicItemEligibleForClass({ruleset,classId,item}),true,`${ruleset} ${classId} ${item.name}: generated ineligible item`);
          if(classId==="wizard")assert.equal(item.kind==="weapon",false,`${ruleset} Wizard received excluded weapon candidate`);
          if(item.kind==="weapon"){
            assert.match(item.baseItemId||"",/^weapon-plus-[123]$/,`${ruleset} ${classId}: concrete weapon lost its verified template id`);
            assert.ok(item.weaponId&&data.weapons[item.weaponId],`${ruleset} ${classId}: concrete magic weapon is not in the verified weapon catalog`);
            assert.equal(item.name.startsWith("Weapon, "),false,`${ruleset} ${classId}: generic magic weapon leaked into final output`);
            assert.ok(item.name.startsWith(data.weapons[item.weaponId].name),`${ruleset} ${classId}: magic weapon name does not match its verified weapon record`);
          }
        }
      }
    }catch(error){console.error(`[test] ${ruleset} starting magic matrix failed`,error);throw error;}
  });
}

test("starting magic catalog carries explicit attunement and eligibility metadata",()=>{
  try{
    assert.ok(STARTING_MAGIC_ITEM_CATALOG.length>0);
    for(const item of STARTING_MAGIC_ITEM_CATALOG){
      assert.ok(item.id&&item.name&&item.rarity&&item.kind,`Incomplete catalog entry ${item.id||"unknown"}`);
      assert.equal(typeof item.attunement,"boolean",`${item.name}: attunement must be explicit`);
      assert.ok(item.eligibility&&typeof item.eligibility==="object",`${item.name}: eligibility metadata missing`);
      assert.ok(item.eligibility.classIds===null||Array.isArray(item.eligibility.classIds),`${item.name}: class allow-list shape is invalid`);
      assert.ok(Array.isArray(item.eligibility.excludedClassIds),`${item.name}: class exclusion list missing`);
      assert.equal(typeof item.eligibility.requiresClassWeapon,"boolean",`${item.name}: weapon eligibility flag missing`);
      if(item.kind==="weapon")assert.equal(item.eligibility.requiresClassWeapon,true,`${item.name}: magic weapon must require a verified class weapon`);
    }
  }catch(error){console.error("[test] magic catalog eligibility metadata failed",error);throw error;}
});

test("class allow-lists, class exclusions, verified-weapon requirements, and duplicate blocking are enforced",()=>{
  try{
    const base=STARTING_MAGIC_ITEM_CATALOG.find(item=>item.id==="potion-of-healing");
    const fighterOnly={...base,id:"fighter-only-test",eligibility:{classIds:["fighter"],excludedClassIds:[],requiresClassWeapon:false}};
    assert.equal(magicItemEligibleForClass({ruleset:"2024",classId:"fighter",item:fighterOnly}),true);
    assert.equal(magicItemEligibleForClass({ruleset:"2024",classId:"wizard",item:fighterOnly}),false);
    assert.equal(magicItemEligibleForClass({ruleset:"2024",classId:"fighter",item:fighterOnly,usedIds:[fighterOnly.id]}),false);
    const weapon=STARTING_MAGIC_ITEM_CATALOG.find(item=>item.id==="weapon-plus-1");
    assert.equal(magicItemEligibleForClass({ruleset:"2024",classId:"wizard",item:weapon}),false,"Wizard catalog exclusion must remain explicit and testable");
    assert.equal(magicItemEligibleForClass({ruleset:"2024",classId:"fighter",item:weapon}),true,"Fighter should have a verified package weapon for magic weapon resolution");
  }catch(error){console.error("[test] magic eligibility policy failed",error);throw error;}
});

test("2024 Low Normal and High intentionally share the same official allocation at every tier boundary",()=>{
  try{
    for(const level of LEVELS){
      const plans=[MAGIC_MODES.LOW_MAGIC,MAGIC_MODES.NORMAL_MAGIC,MAGIC_MODES.HIGH_MAGIC].map(mode=>generateStartingMagic({ruleset:"2024",level,mode,classId:"fighter"}));
      assert.deepEqual(plans[0].allowance,plans[1].allowance,`2024 L${level}: Low and Normal diverged`);
      assert.deepEqual(plans[1].allowance,plans[2].allowance,`2024 L${level}: Normal and High diverged`);
      assert.equal(plans[0].gold,plans[2].gold,`2024 L${level}: campaign label changed official gold guidance`);
    }
  }catch(error){console.error("[test] 2024 starting magic allocation parity failed",error);throw error;}
});
