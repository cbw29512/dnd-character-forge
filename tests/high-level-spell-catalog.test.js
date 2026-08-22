import test from "node:test";
import assert from "node:assert/strict";
import { wizardSpellsFor } from "../src/data/wizard-spells.js";
import { clericSpellsFor } from "../src/data/cleric-spells.js";

const names=(spells,level)=>spells.filter(spell=>spell.level===level).map(spell=>spell.name).sort();

test("2014 Wizard level 4 and 5 catalogs match the SRD set",()=>{
  assert.deepEqual(names(wizardSpellsFor("2014"),4),["Arcane Eye","Banishment","Black Tentacles","Blight","Confusion","Conjure Minor Elementals","Control Water","Dimension Door","Fabricate","Faithful Hound","Fire Shield","Greater Invisibility","Hallucinatory Terrain","Ice Storm","Locate Creature","Phantasmal Killer","Polymorph","Private Sanctum","Resilient Sphere","Secret Chest","Stone Shape","Stoneskin","Wall of Fire"].sort());
  assert.deepEqual(names(wizardSpellsFor("2014"),5),["Animate Objects","Arcane Hand","Cloudkill","Cone of Cold","Conjure Elemental","Contact Other Plane","Creation","Dominate Person","Dream","Geas","Hold Monster","Legend Lore","Mislead","Modify Memory","Passwall","Planar Binding","Scrying","Seeming","Telekinesis","Telepathic Bond","Teleportation Circle","Wall of Force","Wall of Stone"].sort());
});

test("2024 Wizard level 4 and 5 catalog additions remain edition-isolated",()=>{
  const l4=names(wizardSpellsFor("2024"),4),l5=names(wizardSpellsFor("2024"),5);
  for(const spell of ["Charm Monster","Divination","Vitriolic Sphere"])assert.ok(l4.includes(spell));
  for(const spell of ["Summon Dragon"])assert.ok(l5.includes(spell));
  assert.ok(!names(wizardSpellsFor("2014"),4).includes("Vitriolic Sphere"));assert.ok(!names(wizardSpellsFor("2014"),5).includes("Summon Dragon"));
});

test("Cleric level 4 and 5 catalogs preserve the 2024 Aura of Life difference",()=>{
  const old4=names(clericSpellsFor("2014"),4),modern4=names(clericSpellsFor("2024"),4),expected5=["Commune","Contagion","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Hallow","Insect Plague","Legend Lore","Mass Cure Wounds","Planar Binding","Raise Dead","Scrying"].sort();
  assert.deepEqual(old4,["Banishment","Control Water","Death Ward","Divination","Freedom of Movement","Guardian of Faith","Locate Creature","Stone Shape"].sort());
  assert.deepEqual(modern4,["Aura of Life",...old4].sort());
  assert.deepEqual(names(clericSpellsFor("2014"),5),expected5);assert.deepEqual(names(clericSpellsFor("2024"),5),expected5);
});

test("unsupported spell catalogs fail closed",()=>{assert.throws(()=>wizardSpellsFor("2099"),/Unsupported Wizard spell ruleset/i);assert.throws(()=>clericSpellsFor("2099"),/Unsupported Cleric spell ruleset/i);});
