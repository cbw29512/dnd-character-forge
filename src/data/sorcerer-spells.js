const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const rows=(level,names,schools={})=>names.map(name=>Object.freeze({id:slug(name),name,level,school:schools[name]||null}));

const SORCERER_2014=[
  ...rows(0,["Acid Splash","Chill Touch","Dancing Lights","Fire Bolt","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","True Strike"]),
  ...rows(1,["Burning Hands","Charm Person","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Jump","Mage Armor","Magic Missile","Shield","Silent Image","Sleep","Thunderwave"]),
  ...rows(2,["Alter Self","Blindness/Deafness","Blur","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Mirror Image","Misty Step","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"]),
  ...rows(3,["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Water Breathing","Water Walk"]),
  ...rows(4,["Banishment","Blight","Confusion","Dimension Door","Dominate Beast","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"]),
  ...rows(5,["Animate Objects","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"]),
  ...rows(6,["Chain Lightning","Circle of Death","Disintegrate","Eyebite","Globe of Invulnerability","Mass Suggestion","Move Earth","Sunbeam","True Seeing"]),
  ...rows(7,["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"]),
  ...rows(8,["Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"]),
  ...rows(9,["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"])
];

const S2024=Object.freeze({
  "Acid Splash":"Evocation","Chill Touch":"Necromancy","Dancing Lights":"Illusion",Elementalism:"Transmutation","Fire Bolt":"Evocation",Light:"Evocation","Mage Hand":"Conjuration",Mending:"Transmutation",Message:"Transmutation","Minor Illusion":"Illusion","Poison Spray":"Necromancy",Prestidigitation:"Transmutation","Ray of Frost":"Evocation","Shocking Grasp":"Evocation","Sorcerous Burst":"Evocation","True Strike":"Divination",
  "Burning Hands":"Evocation","Charm Person":"Enchantment","Chromatic Orb":"Evocation","Color Spray":"Illusion","Comprehend Languages":"Divination","Detect Magic":"Divination","Disguise Self":"Illusion","Expeditious Retreat":"Transmutation","False Life":"Necromancy","Feather Fall":"Transmutation","Fog Cloud":"Conjuration",Grease:"Conjuration","Ice Knife":"Conjuration",Jump:"Transmutation","Mage Armor":"Abjuration","Magic Missile":"Evocation","Ray of Sickness":"Necromancy",Shield:"Abjuration","Silent Image":"Illusion",Sleep:"Enchantment",Thunderwave:"Evocation",
  "Alter Self":"Transmutation","Blindness/Deafness":"Transmutation",Blur:"Illusion",Darkness:"Evocation",Darkvision:"Transmutation","Detect Thoughts":"Divination","Dragon’s Breath":"Transmutation","Enhance Ability":"Transmutation","Enlarge/Reduce":"Transmutation","Flame Blade":"Evocation","Flaming Sphere":"Evocation","Gust of Wind":"Evocation","Hold Person":"Enchantment",Invisibility:"Illusion",Knock:"Transmutation",Levitate:"Transmutation","Magic Weapon":"Transmutation","Mirror Image":"Illusion","Misty Step":"Conjuration","Scorching Ray":"Evocation","See Invisibility":"Divination",Shatter:"Evocation","Spider Climb":"Transmutation",Suggestion:"Enchantment",Web:"Conjuration",
  Blink:"Transmutation",Clairvoyance:"Divination",Counterspell:"Abjuration",Daylight:"Evocation","Dispel Magic":"Abjuration",Fear:"Illusion",Fireball:"Evocation",Fly:"Transmutation","Gaseous Form":"Transmutation",Haste:"Transmutation","Hypnotic Pattern":"Illusion","Lightning Bolt":"Evocation","Major Image":"Illusion","Protection from Energy":"Abjuration","Sleet Storm":"Conjuration",Slow:"Transmutation","Stinking Cloud":"Conjuration",Tongues:"Divination","Vampiric Touch":"Necromancy","Water Breathing":"Transmutation","Water Walk":"Transmutation",
  Banishment:"Abjuration",Blight:"Necromancy","Charm Monster":"Enchantment",Confusion:"Enchantment","Dimension Door":"Conjuration","Dominate Beast":"Enchantment","Fire Shield":"Evocation","Greater Invisibility":"Illusion","Ice Storm":"Evocation",Polymorph:"Transmutation",Stoneskin:"Transmutation","Vitriolic Sphere":"Evocation","Wall of Fire":"Evocation",
  "Animate Objects":"Transmutation","Arcane Hand":"Evocation",Cloudkill:"Conjuration","Cone of Cold":"Evocation",Creation:"Illusion","Dominate Person":"Enchantment","Hold Monster":"Enchantment","Insect Plague":"Conjuration",Seeming:"Illusion",Telekinesis:"Transmutation","Teleportation Circle":"Conjuration","Wall of Stone":"Evocation",
  "Chain Lightning":"Evocation","Circle of Death":"Necromancy",Disintegrate:"Transmutation",Eyebite:"Necromancy","Flesh to Stone":"Transmutation","Freezing Sphere":"Evocation","Globe of Invulnerability":"Abjuration","Mass Suggestion":"Enchantment","Move Earth":"Transmutation",Sunbeam:"Evocation","True Seeing":"Divination",
  "Delayed Blast Fireball":"Evocation",Etherealness:"Conjuration","Finger of Death":"Necromancy","Fire Storm":"Evocation","Plane Shift":"Conjuration","Prismatic Spray":"Evocation","Reverse Gravity":"Transmutation",Teleport:"Conjuration",
  Demiplane:"Conjuration","Dominate Monster":"Enchantment",Earthquake:"Transmutation","Incendiary Cloud":"Conjuration","Power Word Stun":"Enchantment",Sunburst:"Evocation",
  Gate:"Conjuration","Meteor Swarm":"Evocation","Power Word Kill":"Enchantment","Time Stop":"Transmutation",Wish:"Conjuration"
});
const SORCERER_2024=[
  ...rows(0,["Acid Splash","Chill Touch","Dancing Lights","Elementalism","Fire Bolt","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","Sorcerous Burst","True Strike"],S2024),
  ...rows(1,["Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Grease","Ice Knife","Jump","Mage Armor","Magic Missile","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave"],S2024),
  ...rows(2,["Alter Self","Blindness/Deafness","Blur","Darkness","Darkvision","Detect Thoughts","Dragon’s Breath","Enhance Ability","Enlarge/Reduce","Flame Blade","Flaming Sphere","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Magic Weapon","Mirror Image","Misty Step","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],S2024),
  ...rows(3,["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing","Water Walk"],S2024),
  ...rows(4,["Banishment","Blight","Charm Monster","Confusion","Dimension Door","Dominate Beast","Fire Shield","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Vitriolic Sphere","Wall of Fire"],S2024),
  ...rows(5,["Animate Objects","Arcane Hand","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"],S2024),
  ...rows(6,["Chain Lightning","Circle of Death","Disintegrate","Eyebite","Flesh to Stone","Freezing Sphere","Globe of Invulnerability","Mass Suggestion","Move Earth","Sunbeam","True Seeing"],S2024),
  ...rows(7,["Delayed Blast Fireball","Etherealness","Finger of Death","Fire Storm","Plane Shift","Prismatic Spray","Reverse Gravity","Teleport"],S2024),
  ...rows(8,["Demiplane","Dominate Monster","Earthquake","Incendiary Cloud","Power Word Stun","Sunburst"],S2024),
  ...rows(9,["Gate","Meteor Swarm","Power Word Kill","Time Stop","Wish"],S2024)
];

export const SORCERER_SPELLS_2014=Object.freeze(SORCERER_2014);
export const SORCERER_SPELLS_2024=Object.freeze(SORCERER_2024);
export function sorcererSpellsFor(ruleset){try{if(ruleset==="2014")return SORCERER_SPELLS_2014;if(ruleset==="2024")return SORCERER_SPELLS_2024;throw new Error(`Unsupported Sorcerer spell ruleset: ${ruleset}.`);}catch(error){console.error("[sorcerer-spells] lookup failed",error);throw error;}}
export function sorcererSpellById(ruleset,id){try{const spell=sorcererSpellsFor(ruleset).find(item=>item.id===id);if(!spell)throw new Error(`Unknown ${ruleset} Sorcerer spell: ${id}.`);return spell;}catch(error){console.error("[sorcerer-spells] spell lookup failed",error);throw error;}}
