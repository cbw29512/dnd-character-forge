const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const rows=(level,names,schools={})=>names.map(name=>Object.freeze({id:slug(name),name,level,school:schools[name]||null}));

const BARD_2014=[
  ...rows(0,["Dancing Lights","Light","Mage Hand","Mending","Message","Minor Illusion","Prestidigitation","True Strike","Vicious Mockery"]),
  ...rows(1,["Animal Friendship","Bane","Charm Person","Comprehend Languages","Cure Wounds","Detect Magic","Disguise Self","Faerie Fire","Feather Fall","Healing Word","Heroism","Hideous Laughter","Identify","Illusory Script","Longstrider","Silent Image","Sleep","Speak with Animals","Thunderwave","Unseen Servant"]),
  ...rows(2,["Animal Messenger","Blindness/Deafness","Calm Emotions","Detect Thoughts","Enhance Ability","Enthrall","Heat Metal","Hold Person","Invisibility","Knock","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Mouth","See Invisibility","Shatter","Silence","Suggestion","Zone of Truth"]),
  ...rows(3,["Bestow Curse","Clairvoyance","Dispel Magic","Fear","Glyph of Warding","Hypnotic Pattern","Major Image","Nondetection","Plant Growth","Sending","Speak with Dead","Speak with Plants","Stinking Cloud","Tiny Hut","Tongues"]),
  ...rows(4,["Compulsion","Confusion","Dimension Door","Freedom of Movement","Greater Invisibility","Hallucinatory Terrain","Locate Creature","Polymorph"]),
  ...rows(5,["Animate Objects","Awaken","Dominate Person","Dream","Geas","Greater Restoration","Hold Monster","Legend Lore","Mass Cure Wounds","Mislead","Modify Memory","Planar Binding","Raise Dead","Scrying","Seeming","Teleportation Circle"]),
  ...rows(6,["Eyebite","Find the Path","Guards and Wards","Irresistible Dance","Mass Suggestion","Programmed Illusion","True Seeing"]),
  ...rows(7,["Arcane Sword","Etherealness","Forcecage","Magnificent Mansion","Mirage Arcane","Project Image","Regenerate","Resurrection","Symbol","Teleport"]),
  ...rows(8,["Dominate Monster","Feeblemind","Glibness","Mind Blank","Power Word Stun"]),
  ...rows(9,["Foresight","Power Word Kill","True Polymorph"])
];

const S2024=Object.freeze({
  "Dancing Lights":"Illusion",Light:"Evocation","Mage Hand":"Conjuration",Mending:"Transmutation",Message:"Transmutation","Minor Illusion":"Illusion",Prestidigitation:"Transmutation","Starry Wisp":"Evocation","True Strike":"Divination","Vicious Mockery":"Enchantment",
  "Animal Friendship":"Enchantment",Bane:"Enchantment","Charm Person":"Enchantment","Color Spray":"Illusion",Command:"Enchantment","Comprehend Languages":"Divination","Cure Wounds":"Abjuration","Detect Magic":"Divination","Disguise Self":"Illusion","Dissonant Whispers":"Enchantment","Faerie Fire":"Evocation","Feather Fall":"Transmutation","Healing Word":"Abjuration",Heroism:"Enchantment","Hideous Laughter":"Enchantment",Identify:"Divination","Illusory Script":"Illusion",Longstrider:"Transmutation","Silent Image":"Illusion",Sleep:"Enchantment","Speak with Animals":"Divination",Thunderwave:"Evocation","Unseen Servant":"Conjuration",
  Aid:"Abjuration","Animal Messenger":"Enchantment","Blindness/Deafness":"Transmutation","Calm Emotions":"Enchantment","Detect Thoughts":"Divination","Enhance Ability":"Transmutation","Enlarge/Reduce":"Transmutation",Enthrall:"Enchantment","Heat Metal":"Transmutation","Hold Person":"Enchantment",Invisibility:"Illusion",Knock:"Transmutation","Lesser Restoration":"Abjuration","Locate Animals or Plants":"Divination","Locate Object":"Divination","Magic Mouth":"Illusion","Mirror Image":"Illusion","See Invisibility":"Divination",Shatter:"Evocation",Silence:"Illusion",Suggestion:"Enchantment","Zone of Truth":"Enchantment",
  "Bestow Curse":"Necromancy",Clairvoyance:"Divination","Dispel Magic":"Abjuration",Fear:"Illusion","Glyph of Warding":"Abjuration","Hypnotic Pattern":"Illusion","Major Image":"Illusion","Mass Healing Word":"Abjuration",Nondetection:"Abjuration","Plant Growth":"Transmutation",Sending:"Divination",Slow:"Transmutation","Speak with Dead":"Necromancy","Speak with Plants":"Transmutation","Stinking Cloud":"Conjuration","Tiny Hut":"Evocation",Tongues:"Divination",
  "Charm Monster":"Enchantment",Compulsion:"Enchantment",Confusion:"Enchantment","Dimension Door":"Conjuration","Freedom of Movement":"Abjuration","Greater Invisibility":"Illusion","Hallucinatory Terrain":"Illusion","Locate Creature":"Divination","Phantasmal Killer":"Illusion",Polymorph:"Transmutation",
  "Animate Objects":"Transmutation",Awaken:"Transmutation","Dominate Person":"Enchantment",Dream:"Illusion",Geas:"Enchantment","Greater Restoration":"Abjuration","Hold Monster":"Enchantment","Legend Lore":"Divination","Mass Cure Wounds":"Abjuration",Mislead:"Illusion","Modify Memory":"Enchantment","Planar Binding":"Abjuration","Raise Dead":"Necromancy",Scrying:"Divination",Seeming:"Illusion","Telepathic Bond":"Divination","Teleportation Circle":"Conjuration",
  Eyebite:"Necromancy","Find the Path":"Divination","Guards and Wards":"Abjuration","Heroes’ Feast":"Conjuration","Irresistible Dance":"Enchantment","Mass Suggestion":"Enchantment","Programmed Illusion":"Illusion","True Seeing":"Divination",
  "Arcane Sword":"Evocation",Etherealness:"Conjuration",Forcecage:"Evocation","Magnificent Mansion":"Conjuration","Mirage Arcane":"Illusion","Prismatic Spray":"Evocation","Project Image":"Illusion",Regenerate:"Transmutation",Resurrection:"Necromancy",Symbol:"Abjuration",Teleport:"Conjuration",
  "Antipathy/Sympathy":"Enchantment",Befuddlement:"Enchantment","Dominate Monster":"Enchantment",Glibness:"Enchantment","Mind Blank":"Abjuration","Power Word Stun":"Enchantment",
  Foresight:"Divination","Power Word Heal":"Enchantment","Power Word Kill":"Enchantment","Prismatic Wall":"Abjuration","True Polymorph":"Transmutation"
});
const BARD_2024=[
  ...rows(0,["Dancing Lights","Light","Mage Hand","Mending","Message","Minor Illusion","Prestidigitation","Starry Wisp","True Strike","Vicious Mockery"],S2024),
  ...rows(1,["Animal Friendship","Bane","Charm Person","Color Spray","Command","Comprehend Languages","Cure Wounds","Detect Magic","Disguise Self","Dissonant Whispers","Faerie Fire","Feather Fall","Healing Word","Heroism","Hideous Laughter","Identify","Illusory Script","Longstrider","Silent Image","Sleep","Speak with Animals","Thunderwave","Unseen Servant"],S2024),
  ...rows(2,["Aid","Animal Messenger","Blindness/Deafness","Calm Emotions","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Enthrall","Heat Metal","Hold Person","Invisibility","Knock","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Mouth","Mirror Image","See Invisibility","Shatter","Silence","Suggestion","Zone of Truth"],S2024),
  ...rows(3,["Bestow Curse","Clairvoyance","Dispel Magic","Fear","Glyph of Warding","Hypnotic Pattern","Major Image","Mass Healing Word","Nondetection","Plant Growth","Sending","Slow","Speak with Dead","Speak with Plants","Stinking Cloud","Tiny Hut","Tongues"],S2024),
  ...rows(4,["Charm Monster","Compulsion","Confusion","Dimension Door","Freedom of Movement","Greater Invisibility","Hallucinatory Terrain","Locate Creature","Phantasmal Killer","Polymorph"],S2024),
  ...rows(5,["Animate Objects","Awaken","Dominate Person","Dream","Geas","Greater Restoration","Hold Monster","Legend Lore","Mass Cure Wounds","Mislead","Modify Memory","Planar Binding","Raise Dead","Scrying","Seeming","Telepathic Bond","Teleportation Circle"],S2024),
  ...rows(6,["Eyebite","Find the Path","Guards and Wards","Heroes’ Feast","Irresistible Dance","Mass Suggestion","Programmed Illusion","True Seeing"],S2024),
  ...rows(7,["Arcane Sword","Etherealness","Forcecage","Magnificent Mansion","Mirage Arcane","Prismatic Spray","Project Image","Regenerate","Resurrection","Symbol","Teleport"],S2024),
  ...rows(8,["Antipathy/Sympathy","Befuddlement","Dominate Monster","Glibness","Mind Blank","Power Word Stun"],S2024),
  ...rows(9,["Foresight","Power Word Heal","Power Word Kill","Prismatic Wall","True Polymorph"],S2024)
];

export const BARD_SPELLS_2014=Object.freeze(BARD_2014);
export const BARD_SPELLS_2024=Object.freeze(BARD_2024);
export function bardSpellsFor(ruleset){try{if(ruleset==="2014")return BARD_SPELLS_2014;if(ruleset==="2024")return BARD_SPELLS_2024;throw new Error(`Unsupported Bard spell ruleset: ${ruleset}.`);}catch(error){console.error("[bard-spells] lookup failed",error);throw error;}}
export function bardSpellById(ruleset,id){try{const spell=bardSpellsFor(ruleset).find(item=>item.id===id);if(!spell)throw new Error(`Unknown ${ruleset} Bard spell: ${id}.`);return spell;}catch(error){console.error("[bard-spells] spell lookup failed",error);throw error;}}
