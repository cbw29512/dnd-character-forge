import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { CHAIN_FAMILIARS_2024 } from "../src/data/warlock-class.js";
import { buildWarlockPremiumPrintModel } from "../src/print/warlock-model.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference-router.js";
import { warlockProgressionFor } from "../src/rules/warlock.js";

function forge(ruleset,level,{subclass="random",classSelections={},spellSelections={}}={}){
  try{
    const state=createInitialState();
    state.ruleset=ruleset;
    state.constraints.class="warlock";
    state.constraints.level=String(level);
    state.constraints.subclass=subclass;
    state.classSelections={...classSelections};
    state.spellSelections={...state.spellSelections,...spellSelections};
    return generateCharacter(state);
  }catch(error){console.error(`[warlock-production-test] forge ${ruleset} level ${level} failed`,error);throw error;}
}

test("Warlock Pact Magic progression preserves edition-specific prepared/known state",()=>{
  try{
    const legacy=warlockProgressionFor("2014",20,"fiend"),revised=warlockProgressionFor("2024",20,"fiend-patron");
    assert.equal(legacy.known,15);assert.equal(legacy.prepared,null);assert.equal(legacy.invocations,8);assert.equal(legacy.slotCount,4);assert.equal(legacy.slotLevel,5);
    assert.equal(revised.known,null);assert.equal(revised.prepared,15);assert.equal(revised.invocations,10);assert.equal(revised.slotCount,4);assert.equal(revised.slotLevel,5);assert.deepEqual(Object.keys(revised.mysticArcanum),["6","7","8","9"]);
  }catch(error){console.error("[warlock-production-test] progression contract failed",error);throw error;}
});

test("2014 Pact of the Tome and Book of Ancient Secrets generate complete non-duplicate bonus magic",()=>{
  try{
    const character=forge("2014",20,{subclass:"fiend",classSelections:{pactBoon:"tome",eldritchInvocations:["book-of-ancient-secrets"]}});
    assert.equal(character.validation.valid,true);
    assert.equal(character.warlockSelections.pactBoon.id,"tome");
    assert.equal(character.spells.tome.cantrips.length,3);
    assert.equal(character.spells.tome.rituals.length,2);
    const active=[...character.spells.cantrips.all,...character.spells.known.all,...character.spells.tome.cantrips,...character.spells.tome.rituals,...Object.values(character.spells.mysticArcanum)];
    assert.equal(new Set(active).size,active.length);
  }catch(error){console.error("[warlock-production-test] 2014 Tome contract failed",error);throw error;}
});

test("2014 Beguiling Influence applies both granted skill proficiencies",()=>{
  try{
    const character=forge("2014",2,{subclass:"fiend",classSelections:{eldritchInvocations:["beguiling-influence"]}});
    assert.equal(character.validation.valid,true);
    assert.ok(character.skills.includes("deception"));
    assert.ok(character.skills.includes("persuasion"));
    assert.ok(character.skillBonuses.deception>=character.proficiency-1);
    assert.ok(character.skillBonuses.persuasion>=character.proficiency-1);
  }catch(error){console.error("[warlock-production-test] Beguiling Influence contract failed",error);throw error;}
});

test("2024 Pact invocations produce Tome magic, a legal Chain familiar, and a Charisma pact weapon attack",()=>{
  try{
    const character=forge("2024",5,{subclass:"fiend-patron",classSelections:{eldritchInvocations:["pact-of-the-tome","pact-of-the-chain","pact-of-the-blade"]}});
    assert.equal(character.validation.valid,true);
    assert.equal(character.spells.tome.cantrips.length,3);
    assert.equal(character.spells.tome.rituals.length,2);
    assert.ok(CHAIN_FAMILIARS_2024.includes(character.warlockSelections.familiarForm));
    const pactAttack=character.attacks.find(attack=>attack.pactWeapon);
    assert.ok(pactAttack,"Pact weapon attack should be present");
    assert.equal(pactAttack.ability,"cha");
    assert.equal(pactAttack.attackBonus,character.proficiency+Math.floor((character.abilities.cha-10)/2));
  }catch(error){console.error("[warlock-production-test] 2024 pact invocation contract failed",error);throw error;}
});

test("2024 level-20 Fiend Warlock carries Contact Patron, all Mystic Arcana, and its Epic Boon",()=>{
  try{
    const character=forge("2024",20,{subclass:"fiend-patron"});
    assert.equal(character.validation.valid,true);
    assert.ok(character.features.includes("Contact Patron"));
    assert.ok(character.spells.alwaysPrepared.includes("contact-other-plane"));
    assert.deepEqual(Object.keys(character.spells.mysticArcanum),["6","7","8","9"]);
    assert.ok(character.feats.some(feat=>feat.id==="boon-fate"));
    assert.equal(character.warlock.invocations,10);
  }catch(error){console.error("[warlock-production-test] 2024 capstone contract failed",error);throw error;}
});

test("2024 Fiend Patron play references preserve the exact SRD 5.2.1 mechanics",()=>{
  try{
    const character=forge("2024",20,{subclass:"fiend-patron"}),refs=buildQuickReference(character),byName=new Map(refs.map(item=>[item.name,item]));
    const blessing=byName.get("Dark One's Blessing"),luck=byName.get("Dark One's Own Luck"),resilience=byName.get("Fiendish Resilience"),hurl=byName.get("Hurl Through Hell");
    assert.ok(blessing&&luck&&resilience&&hurl,"All four Fiend Patron feature references must be present");
    assert.match(blessing.text,/within 10 feet/i,"Dark One's Blessing must include the nearby-enemy trigger");
    assert.match(blessing.text,/Temporary Hit Points/i);
    assert.match(luck.text,/Charisma modifier/i,"Dark One's Own Luck must use Charisma-modifier uses");
    assert.match(luck.text,/Long Rest/i);
    assert.match(resilience.timing,/Short or Long Rest/i,"Fiendish Resilience choice must refresh after either rest");
    assert.match(resilience.text,/other than Force/i,"Fiendish Resilience must exclude Force");
    assert.match(hurl.text,/Charisma save/i,"Hurl Through Hell must use a Charisma save");
    assert.match(hurl.text,/8d10 Psychic/i,"Hurl Through Hell damage must be 8d10 Psychic");
    assert.match(hurl.text,/Incapacitated/i);
    assert.match(hurl.text,/Long Rest/i);
    assert.match(hurl.text,/Pact Magic slot/i,"Hurl Through Hell must support Pact-slot recharge");
  }catch(error){console.error("[warlock-production-test] 2024 Fiend Patron SRD contract failed",error);throw error;}
});

test("Warlock premium print inventory is normalized into readable equipment lines",()=>{
  try{
    const character=forge("2024",20,{subclass:"fiend-patron"}),model=buildWarlockPremiumPrintModel(character);
    assert.ok(model.equipment.length>0,"Warlock print model should include equipment");
    assert.ok(model.equipment.every(item=>typeof item==="string"&&item.trim()),"Every Warlock print equipment entry must be a non-empty string");
    assert.equal(model.equipment.some(item=>item.includes("[object Object]")),false,"Warlock print model must never stringify inventory objects implicitly");
    assert.ok(model.equipment.some(item=>/^2 × Dagger\b/.test(item)),"Duplicate daggers should print as a consolidated quantity");
  }catch(error){console.error("[warlock-production-test] print equipment contract failed",error);throw error;}
});
