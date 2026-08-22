import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { BARBARIAN_TABLES, barbarianFeatures, barbarianProgression, barbarianResources } from "../src/rules/barbarian.js";

const RAGES_2014=[2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,"Unlimited"];
const RAGE_DAMAGE=[2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4];
const RAGES_2024=[2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6];
const MASTERY_2024=[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4];

function barbarianState(ruleset,level="random"){
  const state=createInitialState();state.ruleset=ruleset;state.constraints.class="barbarian";state.constraints.level=String(level);return state;
}

test("Barbarian progression covers every level 1-20 in both editions",()=>{try{for(const ruleset of ["2014","2024"]){assert.equal(Object.keys(BARBARIAN_TABLES[ruleset]).length,20);for(let level=1;level<=20;level++)assert.ok(barbarianProgression(ruleset,level));}}catch(error){console.error("[test] Barbarian level coverage",error);throw error;}});
test("2014 Rage uses and damage match the edition table exactly",()=>{try{for(let level=1;level<=20;level++){const row=barbarianProgression("2014",level);assert.equal(row.rages,RAGES_2014[level-1],`2014 level ${level} Rages`);assert.equal(row.rageDamage,RAGE_DAMAGE[level-1],`2014 level ${level} Rage Damage`);assert.equal("masteries" in row,false);}}catch(error){console.error("[test] 2014 Barbarian table",error);throw error;}});
test("2024 Rage uses, damage, and Weapon Mastery match the edition table exactly",()=>{try{for(let level=1;level<=20;level++){const row=barbarianProgression("2024",level);assert.equal(row.rages,RAGES_2024[level-1],`2024 level ${level} Rages`);assert.equal(row.rageDamage,RAGE_DAMAGE[level-1],`2024 level ${level} Rage Damage`);assert.equal(row.masteries,MASTERY_2024[level-1],`2024 level ${level} masteries`);}}catch(error){console.error("[test] 2024 Barbarian table",error);throw error;}});
test("level 20 preserves the critical edition difference in Rage uses",()=>{try{assert.equal(barbarianProgression("2014",20).rages,"Unlimited");assert.equal(barbarianProgression("2024",20).rages,6);}catch(error){console.error("[test] Barbarian level 20 edition difference",error);throw error;}});
test("Berserker subclass feature timing stays edition-correct",()=>{try{const old10=barbarianFeatures("2014",10,"path-berserker"),new10=barbarianFeatures("2024",10,"path-berserker");assert.ok(old10.includes("Intimidating Presence"));assert.ok(!old10.includes("Retaliation"));assert.ok(new10.includes("Retaliation"));assert.ok(!new10.includes("Intimidating Presence"));assert.ok(barbarianFeatures("2014",14,"path-berserker").includes("Retaliation"));assert.ok(barbarianFeatures("2024",14,"path-berserker").includes("Intimidating Presence"));}catch(error){console.error("[test] Berserker timing",error);throw error;}});
test("Barbarian sheet resources are derived from current level rather than constants",()=>{try{const old20=Object.fromEntries(barbarianResources("2014",20).map(item=>[item.id,item.value])),new10=Object.fromEntries(barbarianResources("2024",10).map(item=>[item.id,item.value]));assert.equal(old20["rage-uses"],"Unlimited");assert.equal(old20["rage-damage"],"+4");assert.equal(old20["weapon-masteries"],undefined);assert.equal(new10["rage-uses"],"4");assert.equal(new10["rage-damage"],"+3");assert.equal(new10["weapon-masteries"],"4");}catch(error){console.error("[test] Barbarian resources",error);throw error;}});

test("both editions generate valid Barbarian characters at every level 1-20",()=>{
  try{
    for(const ruleset of ["2014","2024"])for(let level=1;level<=20;level++){
      const character=generateCharacter(barbarianState(ruleset,level));
      assert.equal(character.class.id,"barbarian");assert.equal(character.level,level);assert.equal(character.validation.valid,true);
      if(level>=3)assert.equal(character.subclass.id,"path-berserker");else assert.equal(character.subclass,null);
      assert.doesNotThrow(()=>buildQuickReference(character),`${ruleset} Barbarian ${level} quick reference`);
    }
  }catch(error){console.error("[test] Barbarian full vertical slice",error);throw error;}
});

test("2024 Barbarian masteries, Fast Movement, and level 19-20 ability caps stay RAW",()=>{
  try{
    const level5=generateCharacter(barbarianState("2024",5)),level19=generateCharacter(barbarianState("2024",19)),level20=generateCharacter(barbarianState("2024",20));
    assert.equal(level5.speed,40);assert.equal(level5.masteryIds.length,3);
    assert.ok(level19.feats.some(feat=>feat.id==="boon-irresistible-offense"));assert.ok(level19.abilities.str<=30);assert.equal(level19.abilityMaximums.str,30);
    assert.ok(level20.abilities.str<=25);assert.ok(level20.abilities.con<=25);assert.equal(level20.abilityMaximums.str,25);assert.equal(level20.abilityMaximums.con,25);
  }catch(error){console.error("[test] 2024 Barbarian high-level mechanics",error);throw error;}
});

test("2014 level 20 Barbarian applies Primal Champion and unlimited Rage",()=>{
  try{const character=generateCharacter(barbarianState("2014",20)),resources=Object.fromEntries(character.classResources.map(item=>[item.id,item.value]));assert.equal(character.abilityMaximums.str,24);assert.equal(character.abilityMaximums.con,24);assert.ok(character.abilities.str<=24);assert.ok(character.abilities.con<=24);assert.equal(resources["rage-uses"],"Unlimited");}
  catch(error){console.error("[test] 2014 Barbarian capstone",error);throw error;}
});

test("selected level above 5 with Random class can only resolve to a verified high-level class",()=>{
  try{for(const ruleset of ["2014","2024"])for(const level of [6,10,15,20]){const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);const character=generateCharacter(state);assert.equal(character.class.id,"barbarian");assert.equal(character.level,level);}}
  catch(error){console.error("[test] high-level Random class coverage",error);throw error;}
});

test("1000 randomized Barbarians per edition pass validation and references",()=>{
  try{for(const ruleset of ["2014","2024"])for(let i=0;i<1000;i++){const character=generateCharacter(barbarianState(ruleset));assert.equal(character.validation.valid,true);assert.doesNotThrow(()=>buildQuickReference(character));}}
  catch(error){console.error("[test] Barbarian torture generation",error);throw error;}
});

test("invalid Barbarian editions and levels fail closed",()=>{try{assert.throws(()=>barbarianProgression("2024",0),/1 to 20/i);assert.throws(()=>barbarianProgression("2024",21),/1 to 20/i);assert.throws(()=>barbarianProgression("2099",1),/Unsupported Barbarian ruleset/i);}catch(error){console.error("[test] Barbarian fail-closed validation",error);throw error;}});
