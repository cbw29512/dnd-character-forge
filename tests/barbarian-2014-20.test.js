import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { abilityMod, averageHp } from "../src/rules/math.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { buildPremiumPrintModel } from "../src/print/model.js";

function berserker(level="20"){
  try{const state=createInitialState();state.ruleset="2014";state.constraints.level=level;state.constraints.class="barbarian";state.constraints.subclass="berserker";state.constraints.species="human";state.constraints.background="acolyte";return generateCharacter(state);}
  catch(error){console.error("[test] 2014 Berserker generation failed",error);throw error;}
}

test("2014 level-20 Berserker preserves legacy Barbarian progression",()=>{
  const c=berserker(),b=c.barbarian;assert.equal(c.validation.valid,true);assert.equal(c.class.hitDie,12);assert.deepEqual(c.saves,["str","con"]);assert.equal(b.unlimitedRage,true);assert.equal(b.rageUses,null);assert.equal(b.rageDamage,4);assert.equal(b.masteryCount,0);assert.equal(b.brutalCriticalDice,3);assert.equal(b.brutalStrikeDice,0);assert.equal(b.frenzy,true);assert.equal(b.mindlessRage,true);assert.equal(b.intimidatingPresence,true);assert.equal(b.retaliation,true);assert.equal(c.masteryIds.length,0);
  assert.equal(c.abilityMaximums.str,24);assert.equal(c.abilityMaximums.con,24);assert.equal(c.abilities.str,24);assert.equal(c.abilities.con,24);assert.equal(c.speed,40);assert.equal(c.initiativeAdvantage,true);assert.equal(c.ac,10+abilityMod(c.abilities.dex)+abilityMod(c.abilities.con));assert.equal(c.hp,averageHp(12,20,abilityMod(c.abilities.con))+c.speciesHpBonus);
  assert.ok(c.features.includes("Brutal Critical"));assert.equal(c.features.includes("Brutal Strike"),false);assert.equal(c.features.includes("Weapon Mastery — Barbarian"),false);assert.equal(c.feats.some(feat=>feat.category==="Epic Boon"),false);
});

test("2014 Berserker references and premium sheet are fully sourced",()=>{
  const c=berserker(),refs=buildQuickReference(c),model=buildPremiumPrintModel(c);for(const item of refs){assert.ok(item.source?.version,`${item.name} missing source`);assert.ok(item.source?.page,`${item.name} missing page`);}assert.equal(model.classUtility.title,"Primal Fury");assert.match(model.classUtility.stats.find(item=>item.label==="Rage").value.toString(),/∞/);assert.ok(model.ruleIndex.some(item=>item.name==="Brutal Critical"));assert.equal(c.audit.status,"PASS");assert.equal(c.audit.rawIntegrity,true);
});

test("2014 Berserker play references preserve legacy Rage and subclass restrictions",()=>{
  const lowRefs=buildQuickReference(berserker("10")),highRefs=buildQuickReference(berserker()),low=name=>lowRefs.find(item=>item.name===name)?.text||"",high=name=>highRefs.find(item=>item.name===name)?.text||"";
  const rage=low("Rage"),presence=low("Intimidating Presence"),persistent=high("Persistent Rage"),retaliation=high("Retaliation"),frenzy=high("Frenzy");
  assert.match(rage,/cannot cast or concentrate on spells/i);assert.match(rage,/attacked a hostile creature/i);assert.match(rage,/taken damage/i);assert.match(rage,/Bonus Action/i);assert.match(presence,/Wisdom save DC/i);assert.match(presence,/more than 60 ft away/i);assert.match(presence,/24 hours/i);
  assert.match(persistent,/Unconscious/i);assert.match(persistent,/Bonus Action to end it/i);assert.match(retaliation,/melee weapon attack/i);assert.match(frenzy,/each turn after this one/i);assert.match(frenzy,/one level of Exhaustion/i);
});
