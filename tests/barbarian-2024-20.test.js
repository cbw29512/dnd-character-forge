import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { abilityMod, averageHp } from "../src/rules/math.js";
import { barbarianIntimidatingPresenceDc } from "../src/rules/barbarian.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function berserker(level="20"){
  try{const state=createInitialState();state.ruleset="2024";state.constraints.level=level;state.constraints.class="barbarian";state.constraints.subclass="berserker";state.constraints.species="human";state.constraints.background="soldier";return generateCharacter(state);}
  catch(error){console.error("[test] 2024 Berserker generation failed",error);throw error;}
}

test("2024 level-20 Berserker uses the revised Barbarian progression",()=>{
  const c=berserker(),b=c.barbarian;assert.equal(c.validation.valid,true);assert.equal(c.class.hitDie,12);assert.deepEqual(c.saves,["str","con"]);assert.equal(b.rageUses,6);assert.equal(b.unlimitedRage,false);assert.equal(b.rageDamage,4);assert.equal(b.masteryCount,4);assert.equal(b.brutalCriticalDice,0);assert.equal(b.brutalStrikeDice,2);assert.equal(b.brutalStrikeEffectCount,2);assert.deepEqual(b.brutalStrikeEffects,["Forceful Blow","Hamstring Blow","Staggering Blow","Sundering Blow"]);assert.equal(b.frenzy,true);assert.equal(b.retaliation,true);assert.equal(b.intimidatingPresence,true);assert.equal(c.masteryIds.length,4);
  assert.ok(c.abilityMaximums.str>=25);assert.ok(c.abilityMaximums.con>=25);assert.equal(c.abilities.str,25);assert.equal(c.abilities.con,23);assert.equal(c.speed,40);assert.equal(c.initiativeAdvantage,true);assert.equal(c.ac,10+abilityMod(c.abilities.dex)+abilityMod(c.abilities.con));assert.equal(c.hp,averageHp(12,20,abilityMod(c.abilities.con))+c.speciesHpBonus);assert.equal(barbarianIntimidatingPresenceDc(c),8+c.proficiency+abilityMod(c.abilities.str));
  assert.ok(c.features.includes("Brutal Strike"));assert.ok(c.features.includes("Improved Brutal Strike"));assert.ok(c.features.includes("Weapon Mastery — Barbarian"));assert.equal(c.features.includes("Brutal Critical"),false);assert.ok(c.feats.some(feat=>feat.id==="boon-irresistible-offense"));
});

test("2024 Barbarian mastery fill never leaves its legal melee weapon pool",()=>{
  const expected=["greataxe","handaxe","greatsword","longsword","flail","javelin","scimitar","shortsword","dagger","quarterstaff","mace"];
  for(let i=0;i<200;i++){const c=berserker(),legal=new Set(c.class.masteryChoices);assert.deepEqual(c.class.masteryChoices,expected);assert.equal(c.masteryIds.length,4);assert.equal(new Set(c.masteryIds).size,4);for(const weaponId of c.masteryIds)assert.ok(legal.has(weaponId),`illegal Barbarian mastery ${weaponId}`);assert.equal(c.masteryIds.includes("shortbow"),false);assert.equal(c.masteryIds.includes("longbow"),false);}
});

test("2024 Greataxe Cleave and Barbarian references remain sourced",()=>{
  const c=berserker(),refs=buildQuickReference(c),cleave=refs.find(item=>item.name==="Greataxe — Cleave"),model=buildPremiumPrintModel(c);assert.ok(cleave,"Greataxe Cleave reference missing");assert.equal(cleave.source.version,"SRD 5.2.1");assert.equal(cleave.source.page,"90");for(const item of refs){assert.ok(item.source?.version,`${item.name} missing source`);assert.ok(item.source?.page,`${item.name} missing page`);}assert.equal(model.classUtility.title,"Primal Fury");assert.equal(model.classUtility.stats.find(item=>item.label==="Rage").value,6);assert.ok(model.ruleIndex.some(item=>item.name==="Brutal Strike"));assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,true);
});

test("2024 level-20 references preserve Persistent Rage, Berserker recharge, and Epic Boon wording",()=>{
  const refs=buildQuickReference(berserker()),byName=name=>refs.find(item=>item.name===name)?.text||"",rage=byName("Rage"),persistent=byName("Persistent Rage"),retaliation=byName("Retaliation"),presence=byName("Intimidating Presence"),boon=byName("Boon of Irresistible Offense"),brutal=byName("Brutal Strike");
  assert.match(rage,/cannot cast spells or maintain Concentration/i);assert.match(rage,/Persistent Rage makes it last 10 minutes/i);assert.match(persistent,/once per Long Rest/i);assert.match(persistent,/Unconscious/i);assert.match(persistent,/Heavy armor/i);assert.doesNotMatch(persistent,/choose to end|voluntar/i);
  assert.match(retaliation,/weapon or Unarmed Strike/i);assert.match(presence,/30-ft Emanation/i);assert.match(presence,/one use per Long Rest/i);assert.match(presence,/expend a Rage use/i);
  assert.match(boon,/roll a 20 on the d20 for an attack roll/i);assert.match(boon,/Bludgeoning, Piercing, and Slashing damage you deal ignores Resistance/i);assert.doesNotMatch(boon,/Critical Hit/i);
  assert.match(brutal,/forgo Advantage/i);assert.match(brutal,/Forceful: push 15 ft/i);assert.match(brutal,/Hamstring: reduce target Speed by 15 ft/i);assert.match(brutal,/Staggering:/i);assert.match(brutal,/Sundering:/i);
});

test("2024 Rage before Persistent Rage keeps the round-to-round maintenance contract",()=>{
  const refs=buildQuickReference(berserker("5")),rage=refs.find(item=>item.name==="Rage")?.text||"";assert.match(rage,/end of your next turn/i);assert.match(rage,/attack roll against an enemy/i);assert.match(rage,/forcing an enemy to make a save/i);assert.match(rage,/Bonus Action/i);assert.match(rage,/up to 10 minutes/i);assert.match(rage,/Incapacitated/i);assert.match(rage,/Heavy armor/i);
});
