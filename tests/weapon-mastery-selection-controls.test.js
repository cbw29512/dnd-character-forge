import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { forgeDataFor } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";
import { classChoiceFieldsForState } from "../src/ui/class-options.js";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

function stateFor(classId,level=1,{ruleset="2024",weaponMasteries=null}={}){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.level=String(level);
    state.constraints.class=classId;
    state.constraints.subclass=level>=3?({barbarian:"berserker",fighter:"champion",ranger:"hunter",rogue:"thief",paladin:"oath-devotion"}[classId]||"random"):"random";
    state.constraints.species="dwarf";
    state.constraints.background=ruleset==="2014"?"acolyte":"sage";
    if(weaponMasteries!==null)state.classSelections.weaponMasteries=weaponMasteries;
    return state;
  }catch(error){console.error("[weapon-mastery-test] state fixture failed",error);throw error;}
}

function masteryField(classId,level,ruleset="2024"){
  try{return classChoiceFieldsForState(stateFor(classId,level,{ruleset})).find(field=>field.key==="weaponMasteries")||null;}
  catch(error){console.error("[weapon-mastery-test] field lookup failed",error);throw error;}
}

test("2024 Weapon Mastery controls expose exact class progression counts",()=>{
  const cases=[["barbarian",1,2],["barbarian",4,3],["barbarian",10,4],["fighter",1,3],["fighter",4,4],["fighter",10,5],["fighter",16,6],["paladin",1,2],["ranger",1,2],["rogue",1,2]];
  for(const [classId,level,count] of cases){const field=masteryField(classId,level);assert.ok(field,`${classId} L${level} missing mastery field`);assert.equal(field.max,count,`${classId} L${level} mastery count drifted`);assert.ok(field.options.every(option=>option.name.includes(" — ")),`${classId} mastery labels must show the property`);}
  assert.equal(masteryField("wizard",1),null);
  assert.equal(masteryField("fighter",4,"2014"),null);
});

test("fixed Fighter Weapon Masteries survive generation exactly",()=>{
  const requested=["greatsword","longbow","spear"],character=generateCharacter(stateFor("fighter",1,{weaponMasteries:requested}));
  assert.deepEqual(character.masteryIds,requested);
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.rawIntegrity,true);
});

test("legacy display-form weapon names canonicalize to engine ids",()=>{
  const character=generateCharacter(stateFor("fighter",1,{weaponMasteries:["Greatsword","Longbow","Spear"]}));
  assert.deepEqual(character.masteryIds,["greatsword","longbow","spear"]);
});

test("partial Weapon Mastery locks fill remaining slots with distinct legal choices",()=>{
  const data=forgeDataFor("2024"),character=generateCharacter(stateFor("fighter",4,{weaponMasteries:["Longbow"]})),pool=character.class.masteryChoices?.length?character.class.masteryChoices:Object.keys(data.weapons);
  assert.equal(character.masteryIds.length,4);
  assert.ok(character.masteryIds.includes("longbow"));
  assert.equal(new Set(character.masteryIds).size,4);
  for(const id of character.masteryIds){assert.ok(data.weapons[id],`unknown mastery weapon ${id}`);assert.ok(pool.includes(id),`mastery ${id} escaped Fighter pool`);}
});

test("duplicate, excessive, and unsupported stale mastery state canonicalizes to the legal cap",()=>{
  const stale=["Greatsword","greatsword","not-a-weapon","Longbow","Spear","Dagger"],character=generateCharacter(stateFor("fighter",1,{weaponMasteries:stale}));
  assert.deepEqual(character.masteryIds,["greatsword","longbow","spear"]);
  assert.equal(new Set(character.masteryIds).size,3);
});

test("class-specific mastery pools discard stale weapons that the class cannot master",()=>{
  const rogue=generateCharacter(stateFor("rogue",1,{weaponMasteries:["Greatsword","Longbow","Shortbow","Dagger"]}));
  assert.deepEqual(rogue.masteryIds,["shortbow","dagger"]);
  const barbarian=generateCharacter(stateFor("barbarian",1,{weaponMasteries:["Longbow","Shortbow","Greataxe"]}));
  assert.equal(barbarian.masteryIds.length,2);
  assert.ok(barbarian.masteryIds.includes("greataxe"));
  assert.equal(barbarian.masteryIds.includes("longbow"),false);
  assert.equal(barbarian.masteryIds.includes("shortbow"),false);
});

test("level shrink cannot preserve mastery choices above the new cap",()=>{
  const stale=["greataxe","handaxe","greatsword","longsword","flail","javelin"],character=generateCharacter(stateFor("fighter",4,{weaponMasteries:stale}));
  assert.deepEqual(character.masteryIds,stale.slice(0,4));
  assert.equal(character.fighter.masteryCount,4);
});

test("edition switch discards 2024 Weapon Mastery state",()=>{
  const character=generateCharacter(stateFor("fighter",4,{ruleset:"2014",weaponMasteries:["Greatsword","Longbow","Spear"]}));
  assert.deepEqual(character.masteryIds,[]);
  assert.equal(character.fighter.masteryCount,0);
  assert.equal(character.validation.valid,true);
});

test("malformed persisted mastery state is discarded rather than crashing generation",()=>{
  const character=generateCharacter(stateFor("fighter",1,{weaponMasteries:"Greatsword"}));
  assert.equal(character.masteryIds.length,3);
  assert.equal(new Set(character.masteryIds).size,3);
});

test("saved characters restore resolved Weapon Masteries into Forge state",()=>{
  const character=generateCharacter(stateFor("fighter",10,{weaponMasteries:["Greatsword","Longbow"]})),restored=classSelectionsFromCharacter(character);
  assert.deepEqual(restored.weaponMasteries,character.masteryIds);
  assert.equal(restored.weaponMasteries.length,5);
});
