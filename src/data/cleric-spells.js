const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const BASE_CATALOG={
  0:[["Guidance","Divination"],["Light","Evocation"],["Mending","Transmutation"],["Resistance","Abjuration"],["Sacred Flame","Evocation"],["Spare the Dying","Necromancy"],["Thaumaturgy","Transmutation"]],
  1:[["Bane","Enchantment"],["Bless","Enchantment"],["Command","Enchantment"],["Create or Destroy Water","Transmutation"],["Cure Wounds","Abjuration"],["Detect Evil and Good","Divination"],["Detect Magic","Divination"],["Detect Poison and Disease","Divination"],["Guiding Bolt","Evocation"],["Healing Word","Abjuration"],["Inflict Wounds","Necromancy"],["Protection from Evil and Good","Abjuration"],["Purify Food and Drink","Transmutation"],["Sanctuary","Abjuration"],["Shield of Faith","Abjuration"]],
  2:[["Aid","Abjuration"],["Augury","Divination"],["Blindness/Deafness","Transmutation"],["Calm Emotions","Enchantment"],["Continual Flame","Evocation"],["Enhance Ability","Transmutation"],["Find Traps","Divination"],["Gentle Repose","Necromancy"],["Hold Person","Enchantment"],["Lesser Restoration","Abjuration"],["Locate Object","Divination"],["Prayer of Healing","Abjuration"],["Protection from Poison","Abjuration"],["Silence","Illusion"],["Spiritual Weapon","Evocation"],["Warding Bond","Abjuration"],["Zone of Truth","Enchantment"]],
  3:[["Animate Dead","Necromancy"],["Beacon of Hope","Abjuration"],["Bestow Curse","Necromancy"],["Clairvoyance","Divination"],["Create Food and Water","Conjuration"],["Daylight","Evocation"],["Dispel Magic","Abjuration"],["Glyph of Warding","Abjuration"],["Magic Circle","Abjuration"],["Mass Healing Word","Abjuration"],["Meld into Stone","Transmutation"],["Protection from Energy","Abjuration"],["Remove Curse","Abjuration"],["Revivify","Necromancy"],["Sending","Divination"],["Speak with Dead","Necromancy"],["Spirit Guardians","Conjuration"],["Tongues","Divination"],["Water Walk","Transmutation"]]
};
const HIGH_2014={
  4:[["Banishment",null],["Control Water",null],["Death Ward",null],["Divination",null],["Freedom of Movement",null],["Guardian of Faith",null],["Locate Creature",null],["Stone Shape",null]],
  5:[["Commune",null],["Contagion",null],["Dispel Evil and Good",null],["Flame Strike",null],["Geas",null],["Greater Restoration",null],["Hallow",null],["Insect Plague",null],["Legend Lore",null],["Mass Cure Wounds",null],["Planar Binding",null],["Raise Dead",null],["Scrying",null]],
  6:[["Blade Barrier",null],["Create Undead",null],["Find the Path",null],["Forbiddance",null],["Harm",null],["Heal",null],["Heroes’ Feast",null],["Planar Ally",null],["True Seeing",null],["Word of Recall",null]],
  7:[["Conjure Celestial",null],["Divine Word",null],["Etherealness",null],["Fire Storm",null],["Plane Shift",null],["Regenerate",null],["Resurrection",null],["Symbol",null]],
  8:[["Antimagic Field",null],["Control Weather",null],["Earthquake",null],["Holy Aura",null]],
  9:[["Astral Projection",null],["Gate",null],["Mass Heal",null],["True Resurrection",null]]
};
const HIGH_2024={
  4:[["Aura of Life","Abjuration"],["Banishment","Abjuration"],["Control Water","Transmutation"],["Death Ward","Abjuration"],["Divination","Divination"],["Freedom of Movement","Abjuration"],["Guardian of Faith","Conjuration"],["Locate Creature","Divination"],["Stone Shape","Transmutation"]],
  5:[["Commune","Divination"],["Contagion","Necromancy"],["Dispel Evil and Good","Abjuration"],["Flame Strike","Evocation"],["Geas","Enchantment"],["Greater Restoration","Abjuration"],["Hallow","Abjuration"],["Insect Plague","Conjuration"],["Legend Lore","Divination"],["Mass Cure Wounds","Abjuration"],["Planar Binding","Abjuration"],["Raise Dead","Necromancy"],["Scrying","Divination"]],
  6:[["Blade Barrier","Evocation"],["Create Undead","Necromancy"],["Find the Path","Divination"],["Forbiddance","Abjuration"],["Harm","Necromancy"],["Heal","Abjuration"],["Heroes’ Feast","Conjuration"],["Planar Ally","Conjuration"],["Sunbeam","Evocation"],["True Seeing","Divination"],["Word of Recall","Conjuration"]],
  7:[["Conjure Celestial","Conjuration"],["Divine Word","Evocation"],["Etherealness","Conjuration"],["Fire Storm","Evocation"],["Plane Shift","Conjuration"],["Regenerate","Transmutation"],["Resurrection","Necromancy"],["Symbol","Abjuration"]],
  8:[["Antimagic Field","Abjuration"],["Control Weather","Transmutation"],["Earthquake","Transmutation"],["Holy Aura","Abjuration"],["Sunburst","Evocation"]],
  9:[["Astral Projection","Necromancy"],["Gate","Conjuration"],["Mass Heal","Abjuration"],["Power Word Heal","Enchantment"],["True Resurrection","Necromancy"]]
};
const build=(catalog,withSchools)=>Object.entries(catalog).flatMap(([level,entries])=>entries.map(([name,school])=>({id:slug(name),name,level:Number(level),school:withSchools?school:null})));

export const CLERIC_SPELLS_2014=[...build(BASE_CATALOG,false),...build(HIGH_2014,false)];
export const CLERIC_SPELLS_2024=[...build(BASE_CATALOG,true),...build(HIGH_2024,true)];
export function clericSpellsFor(ruleset){
  try{return ruleset==="2014"?CLERIC_SPELLS_2014:CLERIC_SPELLS_2024;}
  catch(error){console.error("[cleric-spells] lookup failed",error);throw error;}
}
