import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createInitialState } from "../src/state.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { entityProvenance } from "../src/data/rule-provenance.js";
import { pregenFingerprintPayload } from "../src/library/fingerprint.js";
import { renderCharacter } from "../src/ui/render.js";

function backgroundCharacter(background,selections={}){
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints.level="5";
    state.constraints.species="dwarf";
    state.constraints.class="fighter";
    state.constraints.subclass="champion";
    state.constraints.background=background;
    state.backgroundSelections={...selections};
    return generateCharacter(state);
  }catch(error){console.error(`[test] 2024 ${background} background`,error);throw error;}
}

test("2024 SRD background catalog is exactly Acolyte, Criminal, Sage, Soldier",()=>{
  assert.deepEqual(RAW_2024.backgrounds.map(item=>item.id),["acolyte","criminal","sage","soldier"]);
  for(const background of RAW_2024.backgrounds)assert.equal(entityProvenance("2024","background",background.id).page,"83");
});

test("Acolyte resolves fixed Magic Initiate Cleric choices and Calligrapher proficiency",()=>{
  const character=backgroundCharacter("acolyte",{spellcastingAbility:"wis",cantrip1:"guidance",cantrip2:"sacred-flame",level1Spell:"bless"});
  assert.equal(character.validation.valid,true);
  assert.deepEqual(character.backgroundChoices,{spellcastingAbility:"wis",cantrip1:"guidance",cantrip2:"sacred-flame",level1Spell:"bless"});
  assert.equal(character.magicInitiate.spellList,"cleric");
  assert.equal(character.magicInitiate.spellcastingAbility,"wis");
  assert.deepEqual(character.magicInitiate.cantrips,["guidance","sacred-flame"]);
  assert.equal(character.magicInitiate.level1Spell,"bless");
  assert.equal(character.magicInitiate.freeCastUses,1);
  assert.equal(character.magicInitiate.freeCastReset,"Long Rest");
  assert.deepEqual(character.toolProficiencies,["Calligrapher's Supplies"]);
  assert.ok(character.skills.includes("insight"));
  assert.ok(character.skills.includes("religion"));
  assert.ok(character.feats.some(feat=>feat.id==="magic-initiate-cleric"));
  const feat=buildQuickReference(character).find(item=>item.name==="Magic Initiate (Cleric)");
  assert.equal(feat.source.version,"SRD 5.2.1");
  assert.equal(feat.source.page,"87");
});

test("Sage resolves fixed Magic Initiate Wizard choices from the Wizard list only",()=>{
  const character=backgroundCharacter("sage",{spellcastingAbility:"int",cantrip1:"fire-bolt",cantrip2:"mage-hand",level1Spell:"shield"});
  assert.equal(character.validation.valid,true);
  assert.equal(character.magicInitiate.spellList,"wizard");
  assert.deepEqual(character.magicInitiate.cantrips,["fire-bolt","mage-hand"]);
  assert.equal(character.magicInitiate.level1Spell,"shield");
  assert.deepEqual(character.toolProficiencies,["Calligrapher's Supplies"]);
  assert.ok(character.skills.includes("arcana"));
  assert.ok(character.skills.includes("history"));
  assert.ok(character.feats.some(feat=>feat.id==="magic-initiate-wizard"));
  const feat=buildQuickReference(character).find(item=>item.name==="Magic Initiate (Wizard)");
  assert.equal(feat.source.page,"87");
});

test("Magic Initiate rejects duplicate cantrips and off-list fixed choices",()=>{
  assert.throws(()=>backgroundCharacter("acolyte",{cantrip1:"guidance",cantrip2:"guidance"}),/second cantrip.*unavailable/i);
  assert.throws(()=>backgroundCharacter("acolyte",{cantrip1:"fire-bolt"}),/first cantrip.*unavailable/i);
  assert.throws(()=>backgroundCharacter("sage",{level1Spell:"bless"}),/level-1 spell.*unavailable/i);
});

test("Soldier resolves a specific Gaming Set and removes the generic placeholder",()=>{
  const character=backgroundCharacter("soldier",{gamingSet:"Dragonchess Set"});
  assert.deepEqual(character.backgroundChoices,{gamingSet:"Dragonchess Set"});
  assert.deepEqual(character.toolProficiencies,["Dragonchess Set"]);
  assert.ok(character.inventory.some(item=>item.name==="Dragonchess Set"));
  assert.ok(!character.inventory.some(item=>item.name==="Gaming Set"));
  assert.ok(character.feats.some(feat=>feat.id==="savage-attacker"));
});

test("Criminal carries its exact fixed tool proficiency with no Magic Initiate state",()=>{
  const character=backgroundCharacter("criminal");
  assert.deepEqual(character.toolProficiencies,["Thieves' Tools"]);
  assert.equal(character.magicInitiate,null);
  assert.deepEqual(character.backgroundChoices,{});
  assert.ok(character.feats.some(feat=>feat.id==="alert"));
});

test("background choices and Origin Magic participate in saved-character fingerprints",()=>{
  const cleric=backgroundCharacter("acolyte",{spellcastingAbility:"wis",cantrip1:"guidance",cantrip2:"light",level1Spell:"bless"});
  const other=backgroundCharacter("acolyte",{spellcastingAbility:"cha",cantrip1:"guidance",cantrip2:"light",level1Spell:"bless"});
  const a=pregenFingerprintPayload(cleric),b=pregenFingerprintPayload(other);
  assert.deepEqual(a.backgroundChoices,cleric.backgroundChoices);
  assert.deepEqual(a.magicInitiate,cleric.magicInitiate);
  assert.deepEqual(a.toolProficiencies,["Calligrapher's Supplies"]);
  assert.notDeepEqual(a.magicInitiate,b.magicInitiate);
});

test("finished sheet and Forge UI expose background mechanics without stray markup",()=>{
  const character=backgroundCharacter("sage",{spellcastingAbility:"int",cantrip1:"fire-bolt",cantrip2:"mage-hand",level1Spell:"shield"}),target={innerHTML:""};
  renderCharacter(character,target);
  assert.match(target.innerHTML,/Origin Magic/);
  assert.match(target.innerHTML,/Save DC/);
  assert.match(target.innerHTML,/Spell Attack/);
  assert.match(target.innerHTML,/Tool Proficiencies/);
  assert.match(target.innerHTML,/Calligrapher&#39;s Supplies/);
  assert.doesNotMatch(target.innerHTML,/<\/section>;/);
  const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8"),app=fs.readFileSync(new URL("../src/app.js",import.meta.url),"utf8"),css=fs.readFileSync(new URL("../styles/components.css",import.meta.url),"utf8");
  assert.match(html,/id="backgroundChoicePanel"/);
  assert.match(app,/bindBackgroundOptions\(state\)/);
  assert.match(app,/resetBackgroundOptions\(state\)/);
  assert.match(app,/backgroundSelections=character\.ruleset==="2024"/);
  assert.match(css,/\.background-choice-fields/);
});
