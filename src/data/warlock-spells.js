const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const rows=(level,names,schools={})=>names.map(name=>Object.freeze({id:slug(name),name,level,school:schools[name]||null}));
const unique=spells=>[...new Map(spells.map(spell=>[spell.id,spell])).values()];

const WARLOCK_2014=[
  ...rows(0,["Chill Touch","Eldritch Blast","Mage Hand","Minor Illusion","Poison Spray","Prestidigitation","True Strike"]),
  ...rows(1,["Charm Person","Comprehend Languages","Expeditious Retreat","Hellish Rebuke","Illusory Script","Protection from Evil and Good","Unseen Servant"]),
  ...rows(2,["Darkness","Enthrall","Hold Person","Invisibility","Mirror Image","Misty Step","Ray of Enfeeblement","Shatter","Spider Climb","Suggestion"]),
  ...rows(3,["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Tongues","Vampiric Touch"]),
  ...rows(4,["Banishment","Blight","Dimension Door","Hallucinatory Terrain"]),
  ...rows(5,["Contact Other Plane","Dream","Hold Monster","Scrying"]),
  ...rows(6,["Circle of Death","Conjure Fey","Create Undead","Eyebite","Flesh to Stone","Mass Suggestion","True Seeing"]),
  ...rows(7,["Etherealness","Finger of Death","Forcecage","Plane Shift"]),
  ...rows(8,["Demiplane","Dominate Monster","Feeblemind","Glibness","Power Word Stun"]),
  ...rows(9,["Astral Projection","Foresight","Imprisonment","Power Word Kill","True Polymorph"])
];

const S2024=Object.freeze({
  "Chill Touch":"Necromancy","Eldritch Blast":"Evocation","Mage Hand":"Conjuration","Minor Illusion":"Illusion","Poison Spray":"Necromancy",Prestidigitation:"Transmutation","True Strike":"Divination",
  Bane:"Enchantment","Charm Person":"Enchantment","Comprehend Languages":"Divination","Detect Magic":"Divination","Expeditious Retreat":"Transmutation","Hellish Rebuke":"Evocation",Hex:"Enchantment","Hideous Laughter":"Enchantment","Illusory Script":"Illusion","Protection from Evil and Good":"Abjuration","Speak with Animals":"Divination","Unseen Servant":"Conjuration",
  Darkness:"Evocation",Enthrall:"Enchantment","Hold Person":"Enchantment",Invisibility:"Illusion","Mind Spike":"Divination","Mirror Image":"Illusion","Misty Step":"Conjuration","Ray of Enfeeblement":"Necromancy","Spider Climb":"Transmutation",Suggestion:"Enchantment",
  Counterspell:"Abjuration","Dispel Magic":"Abjuration",Fear:"Illusion",Fly:"Transmutation","Gaseous Form":"Transmutation","Hypnotic Pattern":"Illusion","Magic Circle":"Abjuration","Major Image":"Illusion","Remove Curse":"Abjuration","Summon Undead":"Necromancy",Tongues:"Divination","Vampiric Touch":"Necromancy",
  Banishment:"Abjuration",Blight:"Necromancy","Charm Monster":"Enchantment","Dimension Door":"Conjuration","Hallucinatory Terrain":"Illusion",
  "Contact Other Plane":"Divination",Dream:"Illusion","Hold Monster":"Enchantment",Mislead:"Illusion","Planar Binding":"Abjuration",Scrying:"Divination","Teleportation Circle":"Conjuration",
  "Circle of Death":"Necromancy","Create Undead":"Necromancy",Eyebite:"Necromancy","True Seeing":"Divination",Etherealness:"Conjuration","Finger of Death":"Necromancy",Forcecage:"Evocation","Plane Shift":"Conjuration",
  Befuddlement:"Enchantment",Demiplane:"Conjuration","Dominate Monster":"Enchantment",Glibness:"Enchantment","Power Word Stun":"Enchantment","Astral Projection":"Necromancy",Foresight:"Divination",Gate:"Conjuration",Imprisonment:"Abjuration","Power Word Kill":"Enchantment","True Polymorph":"Transmutation",Weird:"Illusion"
});
const WARLOCK_2024=[
  ...rows(0,["Chill Touch","Eldritch Blast","Mage Hand","Minor Illusion","Poison Spray","Prestidigitation","True Strike"],S2024),
  ...rows(1,["Bane","Charm Person","Comprehend Languages","Detect Magic","Expeditious Retreat","Hellish Rebuke","Hex","Hideous Laughter","Illusory Script","Protection from Evil and Good","Speak with Animals","Unseen Servant"],S2024),
  ...rows(2,["Darkness","Enthrall","Hold Person","Invisibility","Mind Spike","Mirror Image","Misty Step","Ray of Enfeeblement","Spider Climb","Suggestion"],S2024),
  ...rows(3,["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Summon Undead","Tongues","Vampiric Touch"],S2024),
  ...rows(4,["Banishment","Blight","Charm Monster","Dimension Door","Hallucinatory Terrain"],S2024),
  ...rows(5,["Contact Other Plane","Dream","Hold Monster","Mislead","Planar Binding","Scrying","Teleportation Circle"],S2024),
  ...rows(6,["Circle of Death","Create Undead","Eyebite","True Seeing"],S2024),
  ...rows(7,["Etherealness","Finger of Death","Forcecage","Plane Shift"],S2024),
  ...rows(8,["Befuddlement","Demiplane","Dominate Monster","Glibness","Power Word Stun"],S2024),
  ...rows(9,["Astral Projection","Foresight","Gate","Imprisonment","Power Word Kill","True Polymorph","Weird"],S2024)
];

const FIEND_2014=[...rows(1,["Burning Hands","Command"]),...rows(2,["Blindness/Deafness","Scorching Ray"]),...rows(3,["Fireball","Stinking Cloud"]),...rows(4,["Fire Shield","Wall of Fire"]),...rows(5,["Flame Strike","Hallow"])];
const FIEND_2024=Object.freeze([
  Object.freeze({warlockLevel:3,...rows(1,["Burning Hands"])[0]}),Object.freeze({warlockLevel:3,...rows(1,["Command"])[0]}),Object.freeze({warlockLevel:3,...rows(2,["Scorching Ray"])[0]}),Object.freeze({warlockLevel:3,...rows(2,["Suggestion"])[0]}),
  Object.freeze({warlockLevel:5,...rows(3,["Fireball"])[0]}),Object.freeze({warlockLevel:5,...rows(3,["Stinking Cloud"])[0]}),Object.freeze({warlockLevel:7,...rows(4,["Fire Shield"])[0]}),Object.freeze({warlockLevel:7,...rows(4,["Wall of Fire"])[0]}),Object.freeze({warlockLevel:9,...rows(5,["Geas"])[0]}),Object.freeze({warlockLevel:9,...rows(5,["Insect Plague"])[0]})
]);

export const WARLOCK_SPELLS_2014=Object.freeze(WARLOCK_2014);
export const WARLOCK_SPELLS_2024=Object.freeze(WARLOCK_2024);
export const FIEND_EXPANDED_SPELLS_2014=Object.freeze(FIEND_2014);
export const FIEND_SPELLS_2024=FIEND_2024;
export function warlockSpellsFor(ruleset,{subclassId=null,includeFiend=false}={}){try{if(ruleset==="2014")return Object.freeze(unique([...WARLOCK_SPELLS_2014,...((includeFiend||subclassId==="fiend")?FIEND_EXPANDED_SPELLS_2014:[])]));if(ruleset==="2024")return WARLOCK_SPELLS_2024;throw new Error(`Unsupported Warlock spell ruleset: ${ruleset}.`);}catch(error){console.error("[warlock-spells] lookup failed",error);throw error;}}
export function warlockFiendAlwaysPrepared2024(level,subclassId){try{return subclassId==="fiend-patron"?Object.freeze(FIEND_SPELLS_2024.filter(spell=>Number(level)>=spell.warlockLevel)):Object.freeze([]);}catch(error){console.error("[warlock-spells] Fiend spell lookup failed",error);throw error;}}
export function warlockAlwaysPrepared2024(level,subclassId){try{const automatic=[...warlockFiendAlwaysPrepared2024(level,subclassId)];if(Number(level)>=9){const contact=WARLOCK_SPELLS_2024.find(spell=>spell.id==="contact-other-plane");if(!contact)throw new Error("Contact Other Plane is missing from the 2024 Warlock list.");automatic.push(contact);}return Object.freeze(unique(automatic));}catch(error){console.error("[warlock-spells] always-prepared lookup failed",error);throw error;}}
export function warlockSpellById(ruleset,id,options={}){try{const spell=warlockSpellsFor(ruleset,{...options,includeFiend:true}).find(item=>item.id===id)||FIEND_SPELLS_2024.find(item=>item.id===id);if(!spell)throw new Error(`Unknown ${ruleset} Warlock spell: ${id}.`);return spell;}catch(error){console.error("[warlock-spells] spell lookup failed",error);throw error;}}
