import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { FORGE_2024 } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

const GOLD=Object.freeze({
  barbarian:{gp:75,option:"B"},bard:{gp:90,option:"B"},cleric:{gp:110,option:"B"},druid:{gp:50,option:"B"},fighter:{gp:155,option:"C"},monk:{gp:50,option:"B"},paladin:{gp:150,option:"B"},ranger:{gp:150,option:"B"},rogue:{gp:100,option:"B"},sorcerer:{gp:50,option:"B"},warlock:{gp:100,option:"B"},wizard:{gp:55,option:"B"}
});

function stateFor(classId,{level="1",classSelections={}}={}){
  const state=createInitialState();state.ruleset="2024";state.constraints.class=classId;state.constraints.level=level;state.constraints.species="dwarf";state.constraints.background="criminal";state.classSelections={...classSelections};return state;
}
function forge(classId,options={}){return generateCharacter(stateFor(classId,options));}
function quantity(character,name){return character.inventory.find(item=>item.name===name)?.quantity||0;}

test("every SRD 5.2.1 class exposes the exact starting-gold option and source page",()=>{
  for(const [classId,expected] of Object.entries(GOLD)){
    const cls=FORGE_2024.classes.find(item=>item.id===classId);assert.ok(cls,`missing ${classId}`);
    const gold=cls.equipmentPackages.find(pkg=>pkg.id==="starting-gold");assert.ok(gold,`${classId} missing starting-gold package`);
    assert.equal(gold.srdOption,expected.option,`${classId} option letter drift`);assert.deepEqual(gold.gear,[`${expected.gp} GP`]);assert.equal(gold.startingGoldOnly,true);assert.equal(gold.source,"SRD 5.2.1");assert.ok(Number.isInteger(gold.srdPage)&&gold.srdPage>0);
    const ready=cls.equipmentPackages.filter(pkg=>!pkg.startingGoldOnly);assert.equal(ready.length,classId==="fighter"?2:1,`${classId} ready-package count drift`);assert.deepEqual(ready.map(pkg=>pkg.srdOption),classId==="fighter"?["A","B"]:["A"]);
  }
});

test("explicit starting-gold choice generates only the class gold package for all 12 classes",()=>{
  for(const [classId,{gp}] of Object.entries(GOLD)){
    const character=forge(classId,{classSelections:{equipmentPackage:"starting-gold"}});assert.equal(character.validation.valid,true,`${classId} invalid`);assert.equal(character.equipment.id,"starting-gold");assert.equal(character.equipment.startingGoldOnly,true);assert.deepEqual(character.equipment.weapons,[]);assert.equal(character.equipment.armor,null);assert.equal(character.equipment.shield,false);assert.equal(quantity(character,`${gp} GP`),1,`${classId} gold missing`);
    const restored=classSelectionsFromCharacter(character);assert.equal(restored.equipmentPackage,"starting-gold",`${classId} equipment choice did not restore`);
  }
});

test("automatic 2024 pregens stay ready to play instead of randomly choosing gold-only equipment",()=>{
  for(const classId of Object.keys(GOLD))for(let attempt=0;attempt<8;attempt++)assert.equal(forge(classId).equipment.startingGoldOnly,false,`${classId} automatic generation returned starting gold`);
});

test("Monk starting gold does not silently add its chosen tool as purchased equipment",()=>{
  const character=forge("monk",{classSelections:{equipmentPackage:"starting-gold",monkTool:"Smith's Tools"}});assert.equal(character.equipment.id,"starting-gold");assert.deepEqual(character.equipment.gear,["50 GP"]);assert.ok(character.toolProficiencies.includes("Smith's Tools"));assert.equal(quantity(character,"Smith's Tools"),0);
});

test("Fighter Fighting Style is independent from the legal starting-equipment package",()=>{
  const heavyArcher=forge("fighter",{classSelections:{equipmentPackage:"heavy",fightingStyle:"archery"}});assert.equal(heavyArcher.equipment.id,"heavy");assert.equal(heavyArcher.fightingStyle.id,"archery");assert.equal(heavyArcher.validation.valid,true);
  const goldGreatWeapon=forge("fighter",{classSelections:{equipmentPackage:"starting-gold",fightingStyle:"great-weapon"}});assert.equal(goldGreatWeapon.equipment.id,"starting-gold");assert.equal(goldGreatWeapon.fightingStyle.id,"great-weapon");assert.equal(goldGreatWeapon.masteryIds.length,3);assert.equal(goldGreatWeapon.validation.valid,true);
});

test("Paladin and Ranger Fighting Styles remain legal with the starting-gold package",()=>{
  const paladin=forge("paladin",{level:"2",classSelections:{equipmentPackage:"starting-gold",fightingStyle:"defense"}});assert.equal(paladin.equipment.id,"starting-gold");assert.equal(paladin.fightingStyle.id,"defense");assert.equal(paladin.validation.valid,true);
  const ranger=forge("ranger",{level:"2",classSelections:{equipmentPackage:"starting-gold",fightingStyle:"archery"}});assert.equal(ranger.equipment.id,"starting-gold");assert.equal(ranger.fightingStyle.id,"archery");assert.equal(ranger.validation.valid,true);
});

test("2024 class UI exposes Package A/B and Fighter A/B/C while 2014 stays unchanged",()=>{
  for(const [classId,{gp,option}] of Object.entries(GOLD)){
    const state=stateFor(classId),field=classChoiceFieldsForState(state).find(item=>item.key==="equipmentPackage");assert.ok(field,`${classId} missing Starting Equipment selector`);assert.equal(field.type,"single");assert.equal(field.defaultLabel,"Automatic ready-to-play package");assert.ok(field.options.some(item=>item.id==="starting-gold"&&item.name===`Package ${option} — ${gp} GP`));assert.equal(field.options.length,classId==="fighter"?3:2);
    state.ruleset="2014";assert.equal(classChoiceFieldsForState(state).some(item=>item.key==="equipmentPackage"),false,`${classId} leaked 2024 equipment selector into 2014`);
  }
});
