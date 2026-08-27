import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { barbarianProgressionFor } from "../src/rules/barbarian.js";
import { buildQuickReference } from "../src/rules/reference-router.js";

const TABLE_2014=Object.freeze([
  row(1,2,2,0),row(2,2,2,0),row(3,3,2,0),row(4,3,2,0),row(5,3,2,0),
  row(6,4,2,0),row(7,4,2,0),row(8,4,2,0),row(9,4,3,1),row(10,4,3,1),
  row(11,4,3,1),row(12,5,3,1),row(13,5,3,2),row(14,5,3,2),row(15,5,3,2),
  row(16,5,4,2),row(17,6,4,3),row(18,6,4,3),row(19,6,4,3),row(20,null,4,3)
]);
const TABLE_2024=Object.freeze([
  row24(1,2,2,2),row24(2,2,2,2),row24(3,3,2,2),row24(4,3,2,3),row24(5,3,2,3),
  row24(6,4,2,3),row24(7,4,2,3),row24(8,4,2,3),row24(9,4,3,3,1,1),row24(10,4,3,4,1,1),
  row24(11,4,3,4,1,1),row24(12,5,3,4,1,1),row24(13,5,3,4,1,1,4),row24(14,5,3,4,1,1,4),row24(15,5,3,4,1,1,4),
  row24(16,5,4,4,1,1,4),row24(17,6,4,4,2,2,4),row24(18,6,4,4,2,2,4),row24(19,6,4,4,2,2,4),row24(20,6,4,4,2,2,4)
]);

function row(level,rages,rageDamage,brutalCriticalDice){return Object.freeze({level,rages,rageDamage,brutalCriticalDice});}
function row24(level,rages,rageDamage,masteryCount,brutalStrikeDice=0,brutalStrikeEffectCount=0,brutalStrikeOptions=0){return Object.freeze({level,rages,rageDamage,masteryCount,brutalStrikeDice,brutalStrikeEffectCount,brutalStrikeOptions});}
function stateFor(ruleset,level,{subclass="berserker",advancements=null}={}){const state=createInitialState();state.ruleset=ruleset;state.constraints.level=String(level);state.constraints.class="barbarian";state.constraints.subclass=level>=3?subclass:"random";state.constraints.species="human";state.constraints.background=ruleset==="2014"?"acolyte":"soldier";if(advancements)state.classSelections.advancements=advancements;return state;}

function expected2014FeatureState(level){return{
  extraAttack:level>=5,fastMovement:level>=5,feralInstinct:level>=7,relentlessRage:level>=11,persistentRage:level>=15,indomitableMight:level>=18,primalChampion:level>=20,
  frenzy:level>=3,mindlessRage:level>=6,intimidatingPresence:level>=10,retaliation:level>=14
};}
function expected2024FeatureState(level){return{
  primalKnowledge:level>=3,extraAttack:level>=5,fastMovement:level>=5,feralInstinct:level>=7,instinctivePounce:level>=7,relentlessRage:level>=11,persistentRage:level>=15,indomitableMight:level>=18,primalChampion:level>=20,
  frenzy:level>=3,mindlessRage:level>=6,retaliation:level>=10,intimidatingPresence:level>=14,epicBoon:level>=19
};}

test("2014 Barbarian matches the SRD progression table at every level 1-20",()=>{
  for(const expected of TABLE_2014){
    const c=generateCharacter(stateFor("2014",expected.level)),b=c.barbarian,p=barbarianProgressionFor("2014",expected.level,c.subclass?.id),flags=expected2014FeatureState(expected.level);
    assert.equal(c.validation.valid,true,`2014 L${expected.level}`);assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,true);
    assert.equal(b.rageUses,expected.rages);assert.equal(b.unlimitedRage,expected.level===20);assert.equal(b.rageDamage,expected.rageDamage);assert.equal(b.brutalCriticalDice,expected.brutalCriticalDice);assert.equal(b.masteryCount,0);assert.equal(b.brutalStrikeDice,0);assert.deepEqual(b,p);
    assert.equal(b.attacksPerAction,flags.extraAttack?2:1);assert.equal(b.speedBonus,flags.fastMovement?10:0);assert.equal(b.initiativeAdvantage,flags.feralInstinct);assert.equal(b.relentlessRage,flags.relentlessRage);assert.equal(b.persistentRage,flags.persistentRage);assert.equal(b.indomitableMight,flags.indomitableMight);assert.equal(b.primalChampion,flags.primalChampion);
    assert.equal(b.frenzy,flags.frenzy);assert.equal(b.mindlessRage,flags.mindlessRage);assert.equal(b.intimidatingPresence,flags.intimidatingPresence);assert.equal(b.retaliation,flags.retaliation);
    assert.equal(c.features.includes("Weapon Mastery — Barbarian"),false);assert.equal(c.features.includes("Primal Knowledge"),false);assert.equal(c.features.includes("Brutal Strike"),false);assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),false);
  }
});

test("2024 Barbarian matches the SRD progression table at every level 1-20",()=>{
  for(const expected of TABLE_2024){
    const c=generateCharacter(stateFor("2024",expected.level)),b=c.barbarian,p=barbarianProgressionFor("2024",expected.level,c.subclass?.id),flags=expected2024FeatureState(expected.level);
    assert.equal(c.validation.valid,true,`2024 L${expected.level}`);assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,true);
    assert.equal(b.rageUses,expected.rages);assert.equal(b.unlimitedRage,false);assert.equal(b.rageDamage,expected.rageDamage);assert.equal(b.masteryCount,expected.masteryCount);assert.equal(b.brutalCriticalDice,0);assert.equal(b.brutalStrikeDice,expected.brutalStrikeDice);assert.equal(b.brutalStrikeEffectCount,expected.brutalStrikeEffectCount);assert.equal(b.brutalStrikeEffects.length,expected.brutalStrikeOptions);assert.deepEqual(b,p);
    assert.equal(b.primalKnowledge,flags.primalKnowledge);assert.equal(b.attacksPerAction,flags.extraAttack?2:1);assert.equal(b.speedBonus,flags.fastMovement?10:0);assert.equal(b.initiativeAdvantage,flags.feralInstinct);assert.equal(b.instinctivePounce,flags.instinctivePounce);assert.equal(b.relentlessRage,flags.relentlessRage);assert.equal(b.relentlessRageHp,flags.relentlessRage?expected.level*2:0);assert.equal(b.persistentRage,flags.persistentRage);assert.equal(b.indomitableMight,flags.indomitableMight);assert.equal(b.primalChampion,flags.primalChampion);
    assert.equal(b.frenzy,flags.frenzy);assert.equal(b.mindlessRage,flags.mindlessRage);assert.equal(b.retaliation,flags.retaliation);assert.equal(b.intimidatingPresence,flags.intimidatingPresence);assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),flags.epicBoon);
    assert.equal(c.features.includes("Brutal Critical"),false);assert.equal(c.features.includes("Weapon Mastery — Barbarian"),true);
  }
});

test("Barbarian ASI and subclass unlock schedules remain edition-correct",()=>{
  const c14=generateCharacter(stateFor("2014",20)),c24=generateCharacter(stateFor("2024",20));
  assert.deepEqual(c14.class.asiLevels,[4,8,12,16,19]);assert.deepEqual(c24.class.asiLevels,[4,8,12,16]);assert.equal(c14.class.subclassLevel,3);assert.equal(c24.class.subclassLevel,3);
  assert.deepEqual(c14.classAdvancements.map(item=>item.level),[4,8,12,16,19]);assert.deepEqual(c24.classAdvancements.map(item=>item.level),[4,8,12,16]);
  assert.equal(c14.feats.some(feat=>feat.category==="Epic Boon"),false);assert.ok(c24.feats.some(feat=>feat.id==="boon-irresistible-offense"));
});

test("Barbarian starting equipment remains faithful to the encoded SRD package",()=>{
  const c14=generateCharacter(stateFor("2014",1)),c24=generateCharacter(stateFor("2024",1));
  assert.deepEqual(c14.equipment.weapons,["greataxe","handaxe","handaxe","javelin","javelin","javelin","javelin"]);assert.deepEqual(c14.equipment.gear,["Explorer's Pack"]);
  assert.deepEqual(c24.equipment.weapons,["greataxe","handaxe","handaxe","handaxe","handaxe"]);assert.deepEqual(c24.equipment.gear,["Explorer's Pack","15 GP"]);
  assert.equal(c14.equipment.armor,null);assert.equal(c24.equipment.armor,null);assert.equal(c14.equipment.shield,false);assert.equal(c24.equipment.shield,false);
});

test("2024 and 2014 Rage quick references preserve their different recovery contracts",()=>{
  const r14=buildQuickReference(generateCharacter(stateFor("2014",5))).find(item=>item.name==="Rage")?.text||"",r24=buildQuickReference(generateCharacter(stateFor("2024",5))).find(item=>item.name==="Rage")?.text||"";
  assert.match(r14,/regain expended uses after a Long Rest/i);assert.doesNotMatch(r14,/regain one use after a Short Rest/i);
  assert.match(r24,/regain one use after a Short Rest and all after a Long Rest/i);assert.match(r24,/up to 10 minutes/i);
});

test("legal advancement Speed bonuses coexist with Barbarian Fast Movement in both editions",()=>{
  for(const ruleset of ["2014","2024"]){
    const c=generateCharacter(stateFor(ruleset,8,{advancements:["fleet-vanguard","asi"]}));
    assert.equal(c.validation.valid,true);assert.equal(c.advancementSpeedBonus,5);assert.equal(c.barbarian.speedBonus,10);assert.equal(c.speed,45);assert.ok(c.feats.some(feat=>feat.id==="fleet-vanguard"));assert.equal(c.audit.rawIntegrity,false);
  }
});

test("Barbarian source provenance remains complete for class and Berserker mechanics",()=>{
  for(const ruleset of ["2014","2024"]){
    const c=generateCharacter(stateFor(ruleset,20)),refs=buildQuickReference(c);assert.equal(c.audit.status,"PASS");
    const classAudit=c.audit.mechanics.find(item=>item.label==="Class"),subclassAudit=c.audit.mechanics.find(item=>item.label==="Subclass");assert.ok(classAudit?.source?.version);assert.ok(classAudit?.source?.page);assert.ok(subclassAudit?.source?.version);assert.ok(subclassAudit?.source?.page);
    for(const item of refs){assert.ok(item.source?.version,`${ruleset} ${item.name}: source version missing`);assert.ok(item.source?.page,`${ruleset} ${item.name}: source page missing`);}
  }
});
