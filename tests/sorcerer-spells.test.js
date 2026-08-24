import test from "node:test";
import assert from "node:assert/strict";
import { sorcererSpellById, sorcererSpellsFor } from "../src/data/sorcerer-spells.js";

const EXPECTED_2014={
  0:["Acid Splash","Chill Touch","Dancing Lights","Fire Bolt","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","True Strike"],
  1:["Burning Hands","Charm Person","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Jump","Mage Armor","Magic Missile","Shield","Silent Image","Sleep","Thunderwave"],
  2:["Alter Self","Blindness/Deafness","Blur","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Mirror Image","Misty Step","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],
  3:["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Water Breathing","Water Walk"],
  4:["Banishment","Blight","Confusion","Dimension Door","Dominate Beast","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"],
  5:["Animate Objects","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"],
  6:["Chain Lightning","Circle of Death","Disintegrate","Eyebite","Globe of Invulnerability","Mass Suggestion","Move Earth","Sunbeam","True Seeing"],
  7:["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"],
  8:["Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"],9:["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"]
};
const EXPECTED_2024={
  0:["Acid Splash","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Sorcerous Burst","True Strike"],
  1:["Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Grease","Ice Knife","Jump","Mage Armor","Magic Missile","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave"],
  2:["Alter Self","Blindness/Deafness","Blur","Darkness","Darkvision","Detect Thoughts","Dragon’s Breath","Enhance Ability","Enlarge/Reduce","Flame Blade","Flaming Sphere","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Magic Weapon","Mirror Image","Misty Step","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],
  3:["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing","Water Walk"],
  4:["Banishment","Blight","Charm Monster","Confusion","Dimension Door","Dominate Beast","Fire Shield","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Vitriolic Sphere","Wall of Fire"],
  5:["Animate Objects","Arcane Hand","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"],
  6:["Chain Lightning","Circle of Death","Disintegrate","Eyebite","Flesh to Stone","Freezing Sphere","Globe of Invulnerability","Mass Suggestion","Move Earth","Sunbeam","True Seeing"],
  7:["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"],
  8:["Demiplane","Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"],9:["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"]
};

function assertExactCatalog(ruleset,expected){
  try{
    const catalog=sorcererSpellsFor(ruleset);assert.equal(new Set(catalog.map(item=>item.id)).size,catalog.length);assert.equal(new Set(catalog.map(item=>item.name)).size,catalog.length);
    for(let level=0;level<=9;level++)assert.deepEqual(catalog.filter(item=>item.level===level).map(item=>item.name),expected[level]);
  }catch(error){console.error(`[sorcerer-spells-test] ${ruleset} exact catalog failed`,error);throw error;}
}

test("2014 Sorcerer spell catalog exactly matches the SRD list",()=>{assertExactCatalog("2014",EXPECTED_2014);});
test("2024 Sorcerer spell catalog exactly matches SRD 5.2.1 and carries schools",()=>{
  try{assertExactCatalog("2024",EXPECTED_2024);for(const spell of sorcererSpellsFor("2024"))assert.ok(spell.school,`${spell.name} is missing its school.`);}
  catch(error){console.error("[sorcerer-spells-test] 2024 school metadata failed",error);throw error;}
});
test("edition-only Sorcerer spells stay isolated and lookup fails closed",()=>{
  try{
    assert.equal(sorcererSpellById("2014","magic-missile").name,"Magic Missile");assert.equal(sorcererSpellById("2024","sorcerous-burst").level,0);
    assert.equal(sorcererSpellsFor("2014").some(item=>item.id==="sorcerous-burst"),false);assert.equal(sorcererSpellsFor("2024").some(item=>item.id==="demiplane"),true);assert.equal(sorcererSpellsFor("2014").some(item=>item.id==="demiplane"),false);
    assert.throws(()=>sorcererSpellById("2024","imaginary-spell"),/Unknown 2024 Sorcerer spell/);assert.throws(()=>sorcererSpellsFor("2030"),/Unsupported Sorcerer spell ruleset/);
  }catch(error){console.error("[sorcerer-spells-test] edition isolation failed",error);throw error;}
});
