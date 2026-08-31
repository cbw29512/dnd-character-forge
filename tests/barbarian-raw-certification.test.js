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
  row24(6,4,2,3),row24(7,4,2,3),row24(8,4,2,3),row24(9,4,3,3,1,1,2),row24(10,4,3,4,1,1,2),
  row24(11,4,3,4,1,1,2),row24(12,5,3,4,1,1,2),row24(13,5,3,4,1,1,4),row24(14,5,3,4,1,1,4),row24(15,5,3,4,1,1,4),
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

function eq(actual,expected,ruleset,level,label){assert.equal(actual,expected,`${ruleset} Barbarian L${level}: ${label}`);}

test("2014 Barbarian matches the SRD progression table at every level 1-20",()=>{
  for(const expected of TABLE_2014){
    const c=generateCharacter(stateFor("2014",expected.level)),b=c.barbarian,p=barbarianProgressionFor("2014",expected.level,c.subclass?.id),flags=expected2014FeatureState(expected.level);
    eq(c.validation.valid,true,"2014",expected.level,"validation");eq(c.audit.status,"PASS","2014",expected.level,"audit status");eq(c.audit.rawIntegrity,true,"2014",expected.level,"RAW integrity");
    eq(b.rageUses,expected.rages,"2014",expected.level,"Rage uses");eq(b.unlimitedRage,expected.level===20,"2014",expected.level,"unlimited Rage");eq(b.rageDamage,expected.rageDamage,"2014",expected.level,"Rage damage");eq(b.brutalCriticalDice,expected.brutalCriticalDice,"2014",expected.level,"Brutal Critical dice");eq(b.masteryCount,0,"2014",expected.level,"Weapon Mastery count");eq(b.brutalStrikeDice,0,"2014",expected.level,"Brutal Strike dice");assert.deepEqual(b,p,`2014 Barbarian L${expected.level}: generated progression must equal resolver output`);
    eq(b.attacksPerAction,flags.extraAttack?2:1,"2014",expected.level,"attacks per Attack action");eq(b.speedBonus,flags.fastMovement?10:0,"2014",expected.level,"Fast Movement bonus");eq(b.initiativeAdvantage,flags.feralInstinct,"2014",expected.level,"Feral Instinct initiative advantage");eq(b.relentlessRage,flags.relentlessRage,"2014",expected.level,"Relentless Rage");eq(b.persistentRage,flags.persistentRage,"2014",expected.level,"Persistent Rage");eq(b.indomitableMight,flags.indomitableMight,"2014",expected.level,"Indomitable Might");eq(b.primalChampion,flags.primalChampion,"2014",expected.level,"Primal Champion");
    eq(b.frenzy,flags.frenzy,"2014",expected.level,"Berserker Frenzy");eq(b.mindlessRage,flags.mindlessRage,"2014",expected.level,"Berserker Mindless Rage");eq(b.intimidatingPresence,flags.intimidatingPresence,"2014",expected.level,"Berserker Intimidating Presence");eq(b.retaliation,flags.retaliation,"2014",expected.level,"Berserker Retaliation");
    eq(c.features.includes("Weapon Mastery — Barbarian"),false,"2014",expected.level,"no 2024 Weapon Mastery leakage");eq(c.features.includes("Primal Knowledge"),false,"2014",expected.level,"no 2024 Primal Knowledge leakage");eq(c.features.includes("Brutal Strike"),false,"2014",expected.level,"no 2024 Brutal Strike leakage");eq(c.feats.some(feat=>feat.category==="Epic Boon"),false,"2014",expected.level,"no 2024 Epic Boon leakage");
  }
});

test("2024 Barbarian matches the SRD progression table at every level 1-20",()=>{
  for(const expected of TABLE_2024){
    const c=generateCharacter(stateFor("2024",expected.level)),b=c.barbarian,p=barbarianProgressionFor("2024",expected.level,c.subclass?.id),flags=expected2024FeatureState(expected.level);
    eq(c.validation.valid,true,"2024",expected.level,"validation");eq(c.audit.status,"PASS","2024",expected.level,"audit status");eq(c.audit.rawIntegrity,true,"2024",expected.level,"RAW integrity");
    eq(b.rageUses,expected.rages,"2024",expected.level,"Rage uses");eq(b.unlimitedRage,false,"2024",expected.level,"no unlimited Rage");eq(b.rageDamage,expected.rageDamage,"2024",expected.level,"Rage damage");eq(b.masteryCount,expected.masteryCount,"2024",expected.level,"Weapon Mastery count");eq(b.brutalCriticalDice,0,"2024",expected.level,"no 2014 Brutal Critical dice");eq(b.brutalStrikeDice,expected.brutalStrikeDice,"2024",expected.level,"Brutal Strike dice");eq(b.brutalStrikeEffectCount,expected.brutalStrikeEffectCount,"2024",expected.level,"Brutal Strike simultaneous effect count");eq(b.brutalStrikeEffects.length,expected.brutalStrikeOptions,"2024",expected.level,"Brutal Strike option count");assert.deepEqual(b,p,`2024 Barbarian L${expected.level}: generated progression must equal resolver output`);
    eq(b.primalKnowledge,flags.primalKnowledge,"2024",expected.level,"Primal Knowledge");
    eq(b.attacksPerAction,flags.extraAttack?2:1,"2024",expected.level,"attacks per Attack action");
    eq(b.speedBonus,flags.fastMovement?10:0,"2024",expected.level,"Fast Movement bonus");
    eq(b.initiativeAdvantage,flags.feralInstinct,"2024",expected.level,"Feral Instinct initiative advantage");
    eq(b.instinctivePounce,flags.instinctivePounce,"2024",expected.level,"Instinctive Pounce");
    eq(b.relentlessRage,flags.relentlessRage,"2024",expected.level,"Relentless Rage");
    eq(b.relentlessRageHp,flags.relentlessRage?expected.level*2:0,"2024",expected.level,"Relentless Rage HP");
    eq(b.persistentRage,flags.persistentRage,"2024",expected.level,"Persistent Rage");
    eq(b.indomitableMight,flags.indomitableMight,"2024",expected.level,"Indomitable Might");
    eq(b.primalChampion,flags.primalChampion,"2024",expected.level,"Primal Champion");
    eq(b.frenzy,flags.frenzy,"2024",expected.level,"Berserker Frenzy");eq(b.mindlessRage,flags.mindlessRage,"2024",expected.level,"Berserker Mindless Rage");eq(b.retaliation,flags.retaliation,"2024",expected.level,"Berserker Retaliation");eq(b.intimidatingPresence,flags.intimidatingPresence,"2024",expected.level,"Berserker Intimidating Presence");eq(c.feats.some(feat=>feat.category==="Epic Boon"),flags.epicBoon,"2024",expected.level,"Epic Boon schedule");
    eq(c.features.includes("Brutal Critical"),false,"2024",expected.level,"no 2014 Brutal Critical leakage");eq(c.features.includes("Weapon Mastery — Barbarian"),true,"2024",expected.level,"Weapon Mastery feature");
  }
});

test("Barbarian ASI and subclass unlock schedules remain edition-correct",()=>{
  const c14=generateCharacter(stateFor("2014",20)),c24=generateCharacter(stateFor("2024",20));
  assert.deepEqual(c14.class.asiLevels,[4,8,12,16,19]);assert.deepEqual(c24.class.asiLevels,[4,8,12,16]);assert.equal(c14.class.subclassLevel,3);assert.equal(c24.class.subclassLevel,3);
  assert.deepEqual(c14.classAdvancements.map(item=>item.level),[4,8,12,16,19]);assert.deepEqual(c24.classAdvancements.map(item=>item.level),[4,8,12,16]);
  assert.equal(c14.feats.some(feat=>feat.category==="Epic Boon"),false);assert.ok(c24.feats.some(feat=>feat.id==="boon-irresistible-offense"));
});

test("Barbarian automatic starting equipment remains faithful to the encoded ready-to-play SRD package",()=>{
  const c14=generateCharacter(stateFor("2014",1)),c24=generateCharacter(stateFor("2024",1));
  assert.deepEqual(c14.equipment.weapons,["greataxe","handaxe","handaxe","javelin","javelin","javelin","javelin"]);assert.deepEqual(c14.equipment.gear,["Explorer's Pack"]);
  assert.equal(c24.equipment.startingGoldOnly,false);assert.deepEqual(c24.equipment.weapons,["greataxe","handaxe","handaxe","handaxe","handaxe"]);assert.deepEqual(c24.equipment.gear,["Explorer's Pack","15 GP"]);
  assert.equal(c14.equipment.armor,null);assert.equal(c24.equipment.armor,null);assert.equal(c14.equipment.shield,false);assert.equal(c24.equipment.shield,false);
});

test("2024 Barbarian starting-gold choice remains legal and distinct from automatic equipment",()=>{
  const state=stateFor("2024",1);state.classSelections.equipmentPackage="starting-gold";const c=generateCharacter(state);
  assert.equal(c.validation.valid,true);assert.equal(c.equipment.id,"starting-gold");assert.equal(c.equipment.startingGoldOnly,true);assert.deepEqual(c.equipment.weapons,[]);assert.deepEqual(c.equipment.gear,["75 GP"]);assert.equal(c.equipment.armor,null);assert.equal(c.equipment.shield,false);
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
