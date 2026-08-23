import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { validateCharacter } from "../src/rules/validation.js";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { DRAGONBORN_ANCESTRIES_2014, DWARF_TOOLS_2014 } from "../src/data/species-2014.js";
import { buildQuickReference } from "../src/rules/reference.js";
import { dragonbornBreath, speciesDarkvision, speciesChoiceLabel } from "../src/rules/species.js";
import { entityProvenance } from "../src/data/rule-provenance.js";

function make(speciesId,level=5,selections={},classId="fighter"){
  const state=createInitialState();state.ruleset="2014";state.constraints.level=String(level);state.constraints.class=classId;state.constraints.subclass=classId==="fighter"&&level>=3?"champion":classId==="wizard"&&level>=2?"school-evocation":classId==="cleric"?"life-domain":classId==="rogue"&&level>=3?"thief":"random";state.constraints.species=speciesId;state.constraints.background="acolyte";state.speciesSelections=selections;return generateCharacter(state);
}

function racialLanguageCount(race){return race.fixedLanguages.length+(["elf","human","half-elf"].includes(race.id)?1:0);}

test("SRD 5.1 race catalog contains exactly the nine verified races",()=>{
  assert.deepEqual(RAW_2014.species.map(item=>item.id),["dwarf","elf","halfling","human","dragonborn","gnome","half-elf","half-orc","tiefling"]);
});

test("every 2014 race generates, validates, and has sourced race references",()=>{
  for(const race of RAW_2014.species){
    const character=make(race.id);assert.equal(character.validation.valid,true,race.name);assert.equal(character.size,race.size);assert.equal(character.speed,race.speed);for(const language of race.fixedLanguages)assert.ok(character.languages.includes(language),`${race.name} ${language}`);
    const refs=buildQuickReference(character).filter(item=>item.id.startsWith("species:"));assert.equal(refs.length,race.traits.length,race.name);for(const ref of refs){assert.equal(ref.source.version,"SRD 5.1",`${race.name} ${ref.name}`);assert.ok(ref.source.page);}
  }
});

test("Hill Dwarf resolves subrace, tool choice, Darkvision, and exact Toughness HP",()=>{
  const character=make("dwarf",10,{tool:"masons-tools"});assert.equal(speciesChoiceLabel(character),"Dwarf — Hill Dwarf");assert.equal(character.speciesChoices.toolName,"Mason's Tools");assert.ok(character.toolProficiencies.includes("Mason's Tools"));assert.equal(character.speciesHpBonus,10);assert.equal(speciesDarkvision(character),60);assert.ok(DWARF_TOOLS_2014.some(item=>item.id===character.speciesChoices.tool));
});

test("High Elf fixes Wizard cantrip and extra language while granting Perception",()=>{
  const character=make("elf",5,{cantrip:"fire-bolt",extraLanguage:"Dwarvish"},"wizard");assert.equal(speciesChoiceLabel(character),"Elf — High Elf");assert.equal(character.speciesChoices.cantripName,"Fire Bolt");assert.deepEqual(character.speciesMagic,{ability:"int",cantrips:["Fire Bolt"],spells:[]});assert.ok(character.skills.includes("perception"));assert.ok(character.languages.includes("Dwarvish"));assert.equal(speciesDarkvision(character),60);
});

test("Lightfoot Halfling is Small with fixed 25-foot speed",()=>{
  const character=make("halfling");assert.equal(speciesChoiceLabel(character),"Halfling — Lightfoot");assert.equal(character.size,"Small");assert.equal(character.speed,25);assert.equal(speciesDarkvision(character),null);
});

test("Human resolves one distinct extra racial language",()=>{
  const character=make("human",5,{extraLanguage:"Draconic"});assert.ok(character.languages.includes("Common"));assert.ok(character.languages.includes("Draconic"));assert.equal(character.speciesChoices.extraLanguage,"Draconic");
});

test("2014 Dragonborn ancestry and Breath Weapon scaling are exact",()=>{
  for(const [level,dice] of [[1,"2d6"],[5,"2d6"],[6,"3d6"],[10,"3d6"],[11,"4d6"],[15,"4d6"],[16,"5d6"],[20,"5d6"]]){
    const character=make("dragonborn",level,{ancestry:"red"}),breath=dragonbornBreath(character);assert.equal(breath.dice,dice);assert.equal(breath.damageType,"Fire");assert.equal(breath.area,"15 ft cone");assert.equal(breath.save,"dex");assert.equal(breath.recharge,"Short or Long Rest");assert.equal(breath.dc,8+Math.floor((character.abilities.con-10)/2)+character.proficiency);
  }
  assert.equal(DRAGONBORN_ANCESTRIES_2014.length,10);
});

test("Rock Gnome has Tinker's Tools and 60-foot Darkvision",()=>{
  const character=make("gnome");assert.equal(speciesChoiceLabel(character),"Gnome — Rock Gnome");assert.ok(character.toolProficiencies.includes("Tinker's Tools"));assert.equal(speciesDarkvision(character),60);
});

test("Half-Elf resolves two distinct non-Charisma +1 abilities, two skills, and extra language",()=>{
  const character=make("half-elf",5,{ability1:"str",ability2:"dex",skill1:"stealth",skill2:"persuasion",extraLanguage:"Dwarvish"},"wizard");assert.equal(character.speciesAbilityAdds.cha,2);assert.equal(character.speciesAbilityAdds.str,1);assert.equal(character.speciesAbilityAdds.dex,1);assert.equal(character.speciesChoices.ability1,"str");assert.equal(character.speciesChoices.ability2,"dex");assert.ok(character.skills.includes("stealth"));assert.ok(character.skills.includes("persuasion"));assert.ok(character.languages.includes("Dwarvish"));assert.equal(speciesDarkvision(character),60);
});

test("Half-Orc grants Menacing and keeps legacy endurance/critical traits sourced",()=>{
  const character=make("half-orc");assert.ok(character.skills.includes("intimidation"));assert.equal(speciesDarkvision(character),60);const names=buildQuickReference(character).map(item=>item.name);assert.ok(names.includes("Relentless Endurance"));assert.ok(names.includes("Savage Attacks"));
});

test("Tiefling Infernal Legacy gates Hellish Rebuke and Darkness at levels 3 and 5",()=>{
  const one=make("tiefling",1),three=make("tiefling",3),five=make("tiefling",5);assert.deepEqual(one.speciesMagic.spells,[]);assert.deepEqual(three.speciesMagic.spells,["Hellish Rebuke (2nd-level)"]);assert.deepEqual(five.speciesMagic.spells,["Hellish Rebuke (2nd-level)","Darkness"]);assert.equal(five.speciesMagic.ability,"cha");assert.equal(speciesDarkvision(five),60);
});

test("Acolyte language grants never collide with racial languages across all nine races",()=>{
  for(const race of RAW_2014.species)for(let iteration=0;iteration<25;iteration++){
    const character=make(race.id);const expected=racialLanguageCount(race)+2;assert.equal(character.languages.length,expected,`${race.name} language entitlement`);assert.equal(new Set(character.languages).size,expected,`${race.name} duplicate language`);for(const fixed of race.fixedLanguages)assert.ok(character.languages.includes(fixed));if(character.speciesChoices.extraLanguage)assert.ok(character.languages.includes(character.speciesChoices.extraLanguage));
  }
});

test("Rogue combinations preserve every racial and Acolyte language plus Thieves' Cant",()=>{
  for(const race of RAW_2014.species){const character=make(race.id,5,{},"rogue"),expected=racialLanguageCount(race)+3;assert.equal(character.languages.length,expected,race.name);assert.equal(new Set(character.languages).size,expected,race.name);assert.ok(character.languages.includes("Thieves’ Cant"),race.name);}
});

test("all nine race identities have official SRD 5.1 provenance",()=>{
  const expected={dwarf:"3–4",elf:"4",halfling:"4–5",human:"5",dragonborn:"5–6",gnome:"6","half-elf":"6–7","half-orc":"7",tiefling:"7"};for(const [id,page] of Object.entries(expected))assert.equal(entityProvenance("2014","species",id).page,page,id);
});

test("invalid fixed 2014 race choices fail closed",()=>{
  assert.throws(()=>make("dragonborn",5,{ancestry:"plaid"}),/ancestry/i);assert.throws(()=>make("dwarf",5,{tool:"glassblowers-tools"}),/tool/i);assert.throws(()=>make("elf",5,{cantrip:"eldritch-blast",extraLanguage:"Dwarvish"},"wizard"),/cantrip/i);assert.throws(()=>make("half-elf",5,{ability1:"str",ability2:"str",skill1:"stealth",skill2:"persuasion",extraLanguage:"Dwarvish"},"wizard"),/second \+1 ability/i);
});

test("tampered 2014 race state is rejected by central validation",()=>{
  const original=make("dwarf",10,{tool:"masons-tools"}),tampered=structuredClone(original);tampered.speed=30;tampered.speciesAbilityAdds={con:2,wis:2};const validation=validateCharacter(tampered,tampered.sourceMode);assert.equal(validation.valid,false);assert.ok(validation.errors.some(error=>/speed|ability increases/i.test(error)));
});
