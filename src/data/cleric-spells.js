const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const CATALOG={
  0:[["Guidance","Divination"],["Light","Evocation"],["Mending","Transmutation"],["Resistance","Abjuration"],["Sacred Flame","Evocation"],["Spare the Dying","Necromancy"],["Thaumaturgy","Transmutation"]],
  1:[["Bane","Enchantment"],["Bless","Enchantment"],["Command","Enchantment"],["Create or Destroy Water","Transmutation"],["Cure Wounds","Abjuration"],["Detect Evil and Good","Divination"],["Detect Magic","Divination"],["Detect Poison and Disease","Divination"],["Guiding Bolt","Evocation"],["Healing Word","Abjuration"],["Inflict Wounds","Necromancy"],["Protection from Evil and Good","Abjuration"],["Purify Food and Drink","Transmutation"],["Sanctuary","Abjuration"],["Shield of Faith","Abjuration"]],
  2:[["Aid","Abjuration"],["Augury","Divination"],["Blindness/Deafness","Transmutation"],["Calm Emotions","Enchantment"],["Continual Flame","Evocation"],["Enhance Ability","Transmutation"],["Find Traps","Divination"],["Gentle Repose","Necromancy"],["Hold Person","Enchantment"],["Lesser Restoration","Abjuration"],["Locate Object","Divination"],["Prayer of Healing","Abjuration"],["Protection from Poison","Abjuration"],["Silence","Illusion"],["Spiritual Weapon","Evocation"],["Warding Bond","Abjuration"],["Zone of Truth","Enchantment"]],
  3:[["Animate Dead","Necromancy"],["Beacon of Hope","Abjuration"],["Bestow Curse","Necromancy"],["Clairvoyance","Divination"],["Create Food and Water","Conjuration"],["Daylight","Evocation"],["Dispel Magic","Abjuration"],["Glyph of Warding","Abjuration"],["Magic Circle","Abjuration"],["Mass Healing Word","Abjuration"],["Meld into Stone","Transmutation"],["Protection from Energy","Abjuration"],["Remove Curse","Abjuration"],["Revivify","Necromancy"],["Sending","Divination"],["Speak with Dead","Necromancy"],["Spirit Guardians","Conjuration"],["Tongues","Divination"],["Water Walk","Transmutation"]]
};
const build=withSchools=>Object.entries(CATALOG).flatMap(([level,entries])=>entries.map(([name,school])=>({id:slug(name),name,level:Number(level),school:withSchools?school:null})));

export const CLERIC_SPELLS_2014=build(false);
export const CLERIC_SPELLS_2024=build(true);
export function clericSpellsFor(ruleset){
  try{return ruleset==="2014"?CLERIC_SPELLS_2014:CLERIC_SPELLS_2024;}
  catch(error){console.error("[cleric-spells] lookup failed",error);throw error;}
}
