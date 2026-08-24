import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { validateMonkCharacter } from "../src/rules/monk-validation.js";
import { monkSaveDc } from "../src/rules/monk.js";
import { abilityMod } from "../src/rules/math.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildClassUtility } from "../src/print/class-utility.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function monkAt(ruleset){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level="20";
    state.constraints.class="monk";
    state.constraints.subclass="open-hand";
    state.constraints.species="human";
    state.constraints.background=ruleset==="2014"?"acolyte":"criminal";
    state.classSelections={monkTool:"Smith's Tools"};
    return generateCharacter(state);
  }catch(error){console.error(`[monk-production] ${ruleset} generation failed`,error);throw error;}
}

function assertCommon(character,die){
  try{
    const dex=abilityMod(character.abilities.dex),wis=abilityMod(character.abilities.wis),pb=character.proficiency;
    assert.equal(character.validation.valid,true);
    assert.equal(character.audit.status,"PASS");
    assert.equal(character.class.id,"monk");
    assert.equal(character.subclass.id,"open-hand");
    assert.equal(character.equipment.armor,null);
    assert.equal(character.equipment.shield,false);
    assert.equal(character.ac,10+dex+wis);
    assert.equal(character.speed,60);
    assert.equal(character.monk.unarmoredMovementBonus,30);
    assert.equal(character.monk.martialArtsDie,die);
    assert.equal(character.monk.resourcePoints,20);
    assert.equal(monkSaveDc(character),8+pb+wis);
    assert.equal(character.monkSelections.tool,"Smith's Tools");
    assert.ok(character.toolProficiencies.includes("Smith's Tools"));
    const unarmed=character.attacks.find(attack=>attack.id==="unarmed-strike");
    assert.ok(unarmed);
    assert.equal(unarmed.damage,`1${die}`);
    assert.equal(unarmed.attackBonus,dex+pb);
    assert.equal(unarmed.damageBonus,dex);
    for(const ability of ["str","dex","con","int","wis","cha"]){
      assert.equal(character.saveBonuses[ability],abilityMod(character.abilities[ability])+pb,`${ability} save must include Disciplined Survivor/Diamond Soul proficiency`);
    }
    assert.deepEqual(validateMonkCharacter(character),[]);
    const refs=buildQuickReference(character);
    assert.ok(refs.length>10);
    assert.ok(refs.every(item=>item.source?.version&&item.source?.page),"every Monk reference must carry verified provenance");
    const utility=buildClassUtility(character);
    assert.equal(utility.title,"Centered Discipline");
    assert.equal(utility.kind,"monk");
    assert.equal(utility.stats.length,4);
    assert.equal(utility.stats.find(item=>item.label==="Save DC")?.value,monkSaveDc(character));
    const model=buildPremiumPrintModel(character);
    assert.equal(model.packet.totalPages,1);
    assert.equal(model.profile.caster,false);
    assert.equal(model.classUtility.title,"Centered Discipline");
    assert.ok(model.ruleIndex.some(item=>item.name==="Quivering Palm"));
  }catch(error){console.error(`[monk-production] common ${character?.ruleset||"unknown"} contract failed`,error);throw error;}
}

test("2014 level-20 Open Hand Monk generates a complete RAW one-page model",()=>{
  try{
    const character=monkAt("2014");assertCommon(character,"d10");
    assert.equal(character.monk.resourceName,"Ki");
    assert.ok(character.features.includes("Ki-Empowered Strikes"));
    assert.ok(character.features.includes("Diamond Soul"));
    assert.ok(character.features.includes("Empty Body"));
    assert.ok(character.features.includes("Perfect Self"));
    assert.ok(character.features.includes("Tranquility"));
    assert.equal(character.features.includes("Perfect Focus"),false);
    assert.equal(character.features.includes("Body and Mind"),false);
    assert.equal(character.features.includes("Disciplined Survivor"),false);
    assert.equal(character.feats.some(feat=>feat.category==="Epic Boon"),false);
    const weapon=character.attacks.find(attack=>attack.id==="shortsword");
    assert.ok(weapon);assert.equal(weapon.damage,"1d10");assert.equal(weapon.abilityModifier,abilityMod(character.abilities.dex));
    const refs=buildQuickReference(character);
    assert.ok(refs.some(item=>item.name==="Perfect Self"&&item.text.includes("0 Ki")&&item.text.includes("4 Ki")));
    assert.ok(refs.some(item=>item.name==="Quivering Palm"&&item.text.includes("10d10 Necrotic")));
  }catch(error){console.error("[monk-production] 2014 contract failed",error);throw error;}
});

test("2024 level-20 Open Hand Monk generates a complete RAW one-page model",()=>{
  try{
    const character=monkAt("2024");assertCommon(character,"d12");
    assert.equal(character.monk.resourceName,"Focus");
    assert.ok(character.features.includes("Empowered Strikes"));
    assert.ok(character.features.includes("Disciplined Survivor"));
    assert.ok(character.features.includes("Perfect Focus"));
    assert.ok(character.features.includes("Superior Defense"));
    assert.ok(character.features.includes("Body and Mind"));
    assert.ok(character.features.includes("Fleet Step"));
    assert.equal(character.features.includes("Perfect Self"),false);
    assert.equal(character.features.includes("Empty Body"),false);
    assert.equal(character.features.includes("Diamond Soul"),false);
    assert.equal(character.abilityMaximums.dex,25);
    assert.equal(character.abilityMaximums.wis,25);
    assert.ok(character.abilities.dex<=25&&character.abilities.wis<=25);
    assert.ok(character.feats.some(feat=>feat.id==="boon-irresistible-offense"));
    assert.ok(character.equipment.gear.includes("Smith's Tools"));
    const spear=character.attacks.find(attack=>attack.id==="spear");
    assert.ok(spear);assert.equal(spear.damage,"1d12");assert.equal(spear.abilityModifier,abilityMod(character.abilities.dex));
    const refs=buildQuickReference(character);
    assert.ok(refs.some(item=>item.name==="Perfect Focus"&&item.text.includes("3 or fewer Focus")&&item.text.includes("have 4")));
    assert.ok(refs.some(item=>item.name==="Quivering Palm"&&item.text.includes("10d12 Force")));
    assert.ok(refs.some(item=>item.name==="Boon of Irresistible Offense"));
  }catch(error){console.error("[monk-production] 2024 contract failed",error);throw error;}
});

test("Monk validator rejects corrupted derived combat and selection state",()=>{
  try{
    const character=monkAt("2024");
    const corrupted=structuredClone(character);
    corrupted.ac+=1;
    corrupted.monkSelections.tool="Forgery Kit";
    corrupted.speed-=10;
    corrupted.attacks.find(attack=>attack.id==="unarmed-strike").damage="1d4";
    const errors=validateMonkCharacter(corrupted);
    assert.ok(errors.some(error=>error.includes("Monk AC should be")));
    assert.ok(errors.some(error=>error.includes("Unsupported Monk tool proficiency")));
    assert.ok(errors.some(error=>error.includes("Monk speed should be")));
    assert.ok(errors.some(error=>error.includes("Unarmed Strike damage should be")));
  }catch(error){console.error("[monk-production] corruption rejection failed",error);throw error;}
});
