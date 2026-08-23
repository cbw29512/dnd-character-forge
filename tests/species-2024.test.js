import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { generateCharacter } from "../src/rules/generator.js";
import { abilityMod, averageHp } from "../src/rules/math.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { dragonbornBreath, speciesDarkvision } from "../src/rules/species.js";
import { pregenFingerprintPayload } from "../src/library/fingerprint.js";

const EXPECTED_SPECIES=["dragonborn","dwarf","elf","gnome","goliath","halfling","human","orc","tiefling"];
const ENTITY_PAGES={dragonborn:"84",dwarf:"84",elf:"84",gnome:"85",goliath:"85",halfling:"86",human:"86",orc:"86",tiefling:"86"};

function make(species,level=5,selections={}){
  try{
    const state=createInitialState();
    state.ruleset="2024";
    state.constraints.species=species;
    state.constraints.class="fighter";
    state.constraints.background="criminal";
    state.constraints.level=String(level);
    state.constraints.subclass=level>=3?"champion":"random";
    state.speciesSelections={...selections};
    return generateCharacter(state);
  }catch(error){console.error(`[test] 2024 ${species} level ${level}`,error);throw error;}
}

test("SRD 5.2.1 species catalog contains all nine species exactly once",()=>{
  try{assert.deepEqual(RAW_2024.species.map(item=>item.id).sort(),[...EXPECTED_SPECIES].sort());assert.equal(new Set(RAW_2024.species.map(item=>item.name)).size,9);}
  catch(error){console.error("[test] 2024 species catalog",error);throw error;}
});

test("every 2024 species generates a validated level-5 Fighter with sourced species references",()=>{
  try{
    const selections={dragonborn:{ancestry:"red"},elf:{lineage:"drow",spellcastingAbility:"cha",keenSense:"perception"},gnome:{lineage:"forest",spellcastingAbility:"wis"},goliath:{giantAncestry:"stone"},human:{size:"Small",skill:"arcana"},tiefling:{size:"Small",legacy:"infernal",spellcastingAbility:"cha"}};
    for(const id of EXPECTED_SPECIES){const character=make(id,5,selections[id]||{});assert.equal(character.validation.valid,true);assert.equal(character.species.id,id);assert.equal(character.audit.mechanics.find(item=>item.label==="Species").source.page,ENTITY_PAGES[id]);const refs=buildQuickReference(character).filter(item=>item.id.startsWith("species:"));assert.ok(refs.length>0,`${id} missing species references`);for(const ref of refs){assert.equal(ref.source.version,"SRD 5.2.1");assert.ok(ref.source.page);assert.match(ref.source.pdfUrl,/SRD_CC_v5\.2\.1\.pdf$/);}}
  }catch(error){console.error("[test] 2024 species generation matrix",error);throw error;}
});

test("Dragonborn ancestry, Breath Weapon, resistance, scaling, and flight are exact",()=>{
  try{
    const levels=[[1,"1d10"],[5,"2d10"],[11,"3d10"],[17,"4d10"]];
    for(const [level,dice] of levels){const character=make("dragonborn",level,{ancestry:"red"}),breath=dragonbornBreath(character),refs=buildQuickReference(character);assert.equal(character.speciesChoices.damageType,"Fire");assert.equal(breath.dice,dice);assert.equal(breath.uses,character.proficiency);assert.equal(breath.dc,8+abilityMod(character.abilities.con)+character.proficiency);assert.match(refs.find(item=>item.name==="Breath Weapon").text,new RegExp(`${dice} Fire`));assert.match(refs.find(item=>item.name==="Damage Resistance").text,/Fire damage/);assert.equal(refs.some(item=>item.name==="Draconic Flight"),level>=5);}
  }catch(error){console.error("[test] Dragonborn progression",error);throw error;}
});

test("Dwarven Toughness adds exactly one Hit Point per character level",()=>{
  try{for(const level of [1,5,20]){const character=make("dwarf",level),base=averageHp(character.class.hitDie,level,abilityMod(character.abilities.con));assert.equal(character.speciesHpBonus,level);assert.equal(character.hp,base+level);const ref=buildQuickReference(character).find(item=>item.name==="Dwarven Toughness");assert.match(ref.text,new RegExp(`increased by ${level}`));assert.equal(speciesDarkvision(character),120);}}
  catch(error){console.error("[test] Dwarf HP progression",error);throw error;}
});

test("Elf lineages resolve exact speed, Darkvision, Keen Senses, and level-gated magic",()=>{
  try{
    const drow=make("elf",5,{lineage:"drow",spellcastingAbility:"cha",keenSense:"perception"});assert.equal(speciesDarkvision(drow),120);assert.ok(drow.skills.includes("perception"));assert.deepEqual(drow.speciesMagic.cantrips,["Dancing Lights"]);assert.deepEqual(drow.speciesMagic.spells,["Faerie Fire","Darkness"]);
    const high=make("elf",5,{lineage:"high",spellcastingAbility:"int",keenSense:"survival",cantrip:"fire-bolt"});assert.equal(high.speciesChoices.cantripName,"Fire Bolt");assert.deepEqual(high.speciesMagic.cantrips,["Fire Bolt"]);assert.deepEqual(high.speciesMagic.spells,["Detect Magic","Misty Step"]);
    const wood=make("elf",5,{lineage:"wood",spellcastingAbility:"wis",keenSense:"insight"});assert.equal(wood.speed,35);assert.equal(speciesDarkvision(wood),60);assert.deepEqual(wood.speciesMagic.cantrips,["Druidcraft"]);assert.deepEqual(wood.speciesMagic.spells,["Longstrider","Pass without Trace"]);
  }catch(error){console.error("[test] Elf lineages",error);throw error;}
});

test("Gnome lineages preserve their distinct magic and Forest Gnome free-use text",()=>{
  try{
    const forest=make("gnome",5,{lineage:"forest",spellcastingAbility:"wis"}),forestRef=buildQuickReference(forest).find(item=>item.name==="Gnomish Lineage");assert.deepEqual(forest.speciesMagic.cantrips,["Minor Illusion"]);assert.deepEqual(forest.speciesMagic.spells,["Speak with Animals"]);assert.match(forestRef.text,new RegExp(`${forest.proficiency} times per Long Rest`));
    const rock=make("gnome",5,{lineage:"rock",spellcastingAbility:"int"}),rockRef=buildQuickReference(rock).find(item=>item.name==="Gnomish Lineage");assert.deepEqual(rock.speciesMagic.cantrips,["Mending","Prestidigitation"]);assert.match(rockRef.text,/Tiny AC 5, 1 HP clockwork device/);
  }catch(error){console.error("[test] Gnome lineages",error);throw error;}
});

test("Goliath Giant Ancestry and Large Form are level-correct",()=>{
  try{
    const before=make("goliath",4,{giantAncestry:"stone"}),after=make("goliath",5,{giantAncestry:"stone"});assert.equal(before.speed,35);assert.equal(before.speciesTraits.includes("Large Form"),false);assert.equal(after.speciesTraits.includes("Large Form"),true);const refs=buildQuickReference(after),ancestry=refs.find(item=>item.name==="Giant Ancestry"),large=refs.find(item=>item.name==="Large Form");assert.match(ancestry.text,/1d12/);assert.match(ancestry.text,new RegExp(`${after.proficiency} uses`));assert.match(large.text,/Speed increases from 35 ft to 45 ft/);
  }catch(error){console.error("[test] Goliath progression",error);throw error;}
});

test("Halfling, Human, and Orc traits resolve usable current mechanics",()=>{
  try{
    const halfling=make("halfling",5),halflingRefs=buildQuickReference(halfling);assert.ok(halflingRefs.some(item=>item.name==="Luck"));assert.ok(halflingRefs.some(item=>item.name==="Naturally Stealthy"));
    const human=make("human",5,{size:"Small",skill:"arcana"}),humanRefs=buildQuickReference(human);assert.equal(human.size,"Small");assert.ok(human.skills.includes("arcana"));assert.match(humanRefs.find(item=>item.name==="Skillful").text,/Arcana/);assert.match(humanRefs.find(item=>item.name==="Versatile").text,/Origin feat/);
    const orc=make("orc",5),rush=buildQuickReference(orc).find(item=>item.name==="Adrenaline Rush");assert.equal(speciesDarkvision(orc),120);assert.match(rush.text,new RegExp(`gain ${orc.proficiency} Temporary Hit Points`));assert.match(rush.text,new RegExp(`${orc.proficiency} uses`));assert.match(rush.text,/Short or Long Rest/);
  }catch(error){console.error("[test] Halfling Human Orc traits",error);throw error;}
});

test("Tiefling Fiendish Legacy gains exact level-gated spells and shared Thaumaturgy",()=>{
  try{
    const one=make("tiefling",1,{size:"Medium",legacy:"infernal",spellcastingAbility:"cha"}),three=make("tiefling",3,{size:"Medium",legacy:"infernal",spellcastingAbility:"cha"}),five=make("tiefling",5,{size:"Medium",legacy:"infernal",spellcastingAbility:"cha"});
    assert.deepEqual(one.speciesMagic.cantrips,["Fire Bolt","Thaumaturgy"]);assert.deepEqual(one.speciesMagic.spells,[]);assert.deepEqual(three.speciesMagic.spells,["Hellish Rebuke"]);assert.deepEqual(five.speciesMagic.spells,["Hellish Rebuke","Darkness"]);const refs=buildQuickReference(five);assert.match(refs.find(item=>item.name==="Fiendish Legacy").text,/Resistance to Fire/);assert.match(refs.find(item=>item.name==="Otherworldly Presence").text,/Thaumaturgy/);
  }catch(error){console.error("[test] Tiefling legacy progression",error);throw error;}
});

test("species choices and size participate in mechanical fingerprints",()=>{
  try{
    const infernal=make("tiefling",5,{size:"Medium",legacy:"infernal",spellcastingAbility:"cha"}),abyssal=structuredClone(infernal);abyssal.speciesChoices={...infernal.speciesChoices,legacy:"abyssal",legacyName:"Abyssal"};
    const a=pregenFingerprintPayload(infernal),b=pregenFingerprintPayload(abyssal);assert.notDeepEqual(a.speciesChoices,b.speciesChoices);
    const small=make("human",5,{size:"Small",skill:"arcana"}),medium=structuredClone(small);medium.size="Medium";assert.notEqual(pregenFingerprintPayload(small).size,pregenFingerprintPayload(medium).size);
  }catch(error){console.error("[test] species fingerprint state",error);throw error;}
});

test("invalid fixed species choices fail closed instead of being replaced with Random",()=>{
  try{assert.throws(()=>make("dragonborn",5,{ancestry:"plaid"}),/Dragonborn ancestry/);assert.throws(()=>make("elf",5,{lineage:"moon",spellcastingAbility:"int"}),/Elf lineage/);assert.throws(()=>make("tiefling",5,{legacy:"unknown",spellcastingAbility:"cha"}),/Tiefling Fiendish Legacy/);}
  catch(error){console.error("[test] invalid species choices",error);throw error;}
});
