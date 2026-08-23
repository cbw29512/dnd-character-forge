import test from "node:test";
import assert from "node:assert/strict";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { RAW_2024 } from "../src/data/raw-2024.js";
import { WIZARD_SPELLS_2014, WIZARD_SPELLS_2024 } from "../src/data/wizard-spells.js";
import { CLERIC_SPELLS_2014, CLERIC_SPELLS_2024 } from "../src/data/cleric-spells.js";
import { PALADIN_SPELLS_2014, PALADIN_SPELLS_2024 } from "../src/data/paladin-spells.js";

for(const data of [RAW_2014,RAW_2024])test(`${data.ruleset} RAW content collections have unique IDs and names`,()=>{try{for(const key of ["species","backgrounds","classes","subclasses"])assertUnique(data[key]||[],key,data.ruleset);if(data.feats)assertUnique(data.feats,"feats",data.ruleset);for(const key of ["fightingStyles","armor","weapons"])assertUniqueObjectNames(data[key]||{},key,data.ruleset);}catch(error){console.error(`[test] ${data.ruleset} data integrity`,error);throw error;}});
for(const [label,ruleset,spells] of [["Wizard","2014",WIZARD_SPELLS_2014],["Wizard","2024",WIZARD_SPELLS_2024],["Cleric","2014",CLERIC_SPELLS_2014],["Cleric","2024",CLERIC_SPELLS_2024],["Paladin","2014",PALADIN_SPELLS_2014],["Paladin","2024",PALADIN_SPELLS_2024]])test(`${ruleset} ${label} spell catalog has unique IDs and names`,()=>{try{assertUnique(spells,`${label} spells`,ruleset);assert.ok(spells.some(spell=>spell.level===1));assert.ok(spells.some(spell=>spell.level===3));if(label!=="Paladin")assert.ok(spells.some(spell=>spell.level===0));}catch(error){console.error(`[test] ${ruleset} ${label} spell integrity`,error);throw error;}});

test("2024 restricted Weapon Mastery pools contain unique known weapons",()=>{
  try{for(const cls of RAW_2024.classes.filter(item=>item.masteryChoices)){assert.ok(cls.masteryChoices.length>0,`${cls.name} mastery pool is empty`);assert.equal(new Set(cls.masteryChoices).size,cls.masteryChoices.length,`${cls.name} mastery pool contains duplicates`);for(const weaponId of cls.masteryChoices)assert.ok(RAW_2024.weapons[weaponId],`${cls.name} mastery pool contains unknown weapon ${weaponId}`);}}
  catch(error){console.error("[test] 2024 class mastery-pool integrity",error);throw error;}
});

test("Paladin class and Oath of Devotion are present in both verified RAW catalogs",()=>{
  for(const data of [RAW_2014,RAW_2024]){const cls=data.classes.find(item=>item.id==="paladin"),oath=data.subclasses.find(item=>item.id==="oath-devotion");assert.ok(cls,`${data.ruleset} Paladin missing`);assert.equal(cls.maxLevel,20);assert.equal(cls.hitDie,10);assert.equal(cls.spellcasting,"paladin");assert.ok(oath,`${data.ruleset} Oath of Devotion missing`);assert.equal(oath.classId,"paladin");}
});

function assertUnique(items,label,ruleset){const ids=items.map(v=>v.id),names=items.map(v=>v.name.toLowerCase());assert.equal(new Set(ids).size,ids.length,`${ruleset} ${label} contains duplicate IDs`);assert.equal(new Set(names).size,names.length,`${ruleset} ${label} contains duplicate names`);}function assertUniqueObjectNames(collection,label,ruleset){const names=Object.values(collection).map(v=>v.name.toLowerCase());assert.equal(new Set(names).size,names.length,`${ruleset} ${label} contains duplicate names`);}
