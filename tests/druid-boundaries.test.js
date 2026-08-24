import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { druidFormById } from "../src/data/druid-forms.js";

function druid(ruleset,level,{subclass=null,classSelections={},spellSelections={}}={}){
  try{
    const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="druid";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"sage";if(subclass)state.constraints.subclass=subclass;state.classSelections=classSelections;state.spellSelections=spellSelections;return generateCharacter(state);
  }catch(error){console.error(`[test] ${ruleset} level-${level} Druid generation failed`,error);throw error;}
}

test("2014 Druid Wild Shape boundaries preserve seen-beast semantics and movement gates",()=>{
  const one=druid("2014",1);assert.equal(one.druid.wildShapeUses,0);assert.equal(one.druid.wildShapeTempHp,null);assert.deepEqual(one.druidSelections.fieldForms,[]);assert.ok(one.languages.includes("Druidic"));assert.ok(one.toolProficiencies.includes("Herbalism Kit"));
  const two=druid("2014",2,{subclass:"circle-land",classSelections:{circleLand:"forest",fieldForms:["wolf"]}});assert.equal(two.druid.wildShapeUses,2);assert.equal(two.druid.wildShapeTempHp,null);assert.equal(two.druid.maxCr,.25);assert.equal(two.druid.allowSwim,false);assert.equal(two.druid.allowFly,false);assert.equal(two.druidSelections.fieldForms.length,4);assert.equal(two.druidSelections.fieldFormsAreExamples,true);assert.ok(two.druidSelections.fieldForms.includes("wolf"));
  assert.throws(()=>druid("2014",4,{subclass:"circle-land",classSelections:{circleLand:"forest",fieldForms:["giant-eagle"]}}),/Illegal field forms/i);
  const eight=druid("2014",8,{subclass:"circle-land",classSelections:{circleLand:"forest",fieldForms:["giant-eagle"]}});assert.ok(eight.druidSelections.fieldForms.includes("giant-eagle"));assert.equal(druidFormById("2014","giant-eagle").type,"Beast");assert.equal(eight.druid.allowFly,true);
  const twenty=druid("2014",20,{subclass:"circle-land",classSelections:{circleLand:"forest",fieldForms:["giant-eagle","brown-bear","giant-spider","reef-shark"]}});assert.equal(twenty.druid.unlimitedWildShape,true);assert.equal(twenty.druid.wildShapeTempHp,null);assert.equal(twenty.spells.cantrips.all.length,5);assert.equal(twenty.spells.prepared.all.length,20+Math.floor((twenty.abilities.wis-10)/2));assert.equal(twenty.spells.alwaysPrepared.length,8);assert.equal(twenty.audit.status,"PASS");
});

test("2024 Druid known-form counts, temporary HP, and flight gates are exact",()=>{
  const one=druid("2024",1,{classSelections:{primalOrder:"magician"}});assert.equal(one.druid.knownFormCount,0);assert.equal(one.druid.wildShapeTempHp,0);assert.deepEqual(one.druidSelections.knownForms,[]);assert.equal(one.spells.cantrips.all.length,3);assert.ok(one.spells.alwaysPrepared.includes("speak-with-animals"));assert.ok(one.languages.includes("Druidic"));
  const two=druid("2024",2,{classSelections:{primalOrder:"warden",knownForms:["rat","riding-horse","spider","wolf"]}});assert.equal(two.druidSelections.knownForms.length,4);assert.equal(two.druid.wildShapeTempHp,2);assert.equal(two.druid.allowFly,false);for(const id of two.druidSelections.knownForms)assert.equal(Boolean(druidFormById("2024",id).speeds.fly),false);
  const four=druid("2024",4,{subclass:"circle-land",classSelections:{primalOrder:"magician",circleLand:"temperate"}});assert.equal(four.druidSelections.knownForms.length,6);assert.equal(four.druid.wildShapeTempHp,4);assert.equal(four.druid.maxCr,.5);assert.equal(four.druid.allowFly,false);
  assert.throws(()=>druid("2024",4,{subclass:"circle-land",classSelections:{primalOrder:"magician",circleLand:"temperate",knownForms:["pteranodon"]}}),/Illegal known Wild Shape forms/i);
  const eight=druid("2024",8,{subclass:"circle-land",classSelections:{primalOrder:"magician",circleLand:"temperate",elementalFury:"potent-spellcasting",knownForms:["pteranodon"]}});assert.equal(eight.druidSelections.knownForms.length,8);assert.equal(eight.druid.wildShapeTempHp,8);assert.ok(eight.druidSelections.knownForms.includes("pteranodon"));assert.equal(eight.druid.allowFly,true);
  assert.throws(()=>druid("2024",20,{subclass:"circle-land",classSelections:{primalOrder:"magician",circleLand:"temperate",elementalFury:"potent-spellcasting",knownForms:["giant-eagle"]}}),/Illegal known Wild Shape forms/i);
});

test("2024 level-20 Circle Druid carries full casting, forms, and Archdruid state",()=>{
  const c=druid("2024",20,{subclass:"circle-land",classSelections:{primalOrder:"magician",circleLand:"temperate",elementalFury:"potent-spellcasting",knownForms:["rat","riding-horse","spider","wolf","black-bear","reef-shark","brown-bear","pteranodon"]}});assert.equal(c.validation.valid,true);assert.equal(c.druid.wildShapeUses,4);assert.equal(c.druid.unlimitedWildShape,false);assert.equal(c.druid.wildShapeTempHp,20);assert.equal(c.druid.knownFormCount,8);assert.equal(c.druidSelections.knownForms.length,8);assert.equal(c.spells.cantrips.all.length,5);assert.equal(c.spells.prepared.all.length,22);assert.equal(c.spells.alwaysPrepared.length,7);assert.ok(c.spells.alwaysPrepared.includes("speak-with-animals"));assert.ok(c.spells.alwaysPrepared.includes("shocking-grasp"));assert.ok(c.features.includes("Beast Spells"));assert.ok(c.features.includes("Archdruid"));assert.ok(c.feats.some(feat=>feat.id==="boon-dimensional-travel"));assert.ok(c.inventory.some(item=>item.name==="Druidic Focus (Quarterstaff)"));assert.equal(c.audit.rawIntegrity,true);
});
