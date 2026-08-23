const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const rows=(level,names,schools={})=>names.map(name=>Object.freeze({id:slug(name),name,level,school:schools[name]||null}));

const PALADIN_2014=[
  ...rows(1,["Bless","Command","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Divine Favor","Heroism","Protection from Evil and Good","Purify Food and Drink","Shield of Faith","Sanctuary"]),
  ...rows(2,["Aid","Branding Smite","Find Steed","Lesser Restoration","Locate Object","Magic Weapon","Protection from Poison","Zone of Truth"]),
  ...rows(3,["Beacon of Hope","Create Food and Water","Daylight","Dispel Magic","Magic Circle","Remove Curse","Revivify"]),
  ...rows(4,["Banishment","Death Ward","Freedom of Movement","Guardian of Faith","Locate Creature"]),
  ...rows(5,["Commune","Dispel Evil and Good","Flame Strike","Geas","Raise Dead"])
];

const SCHOOLS_2024=Object.freeze({
  "Bless":"Enchantment","Command":"Enchantment","Cure Wounds":"Abjuration","Detect Evil and Good":"Divination","Detect Magic":"Divination","Detect Poison and Disease":"Divination","Divine Favor":"Transmutation","Divine Smite":"Evocation","Heroism":"Enchantment","Protection from Evil and Good":"Abjuration","Purify Food and Drink":"Transmutation","Searing Smite":"Evocation","Shield of Faith":"Abjuration",
  "Aid":"Abjuration","Find Steed":"Conjuration","Gentle Repose":"Necromancy","Lesser Restoration":"Abjuration","Locate Object":"Divination","Magic Weapon":"Transmutation","Prayer of Healing":"Abjuration","Protection from Poison":"Abjuration","Shining Smite":"Transmutation","Warding Bond":"Abjuration","Zone of Truth":"Enchantment",
  "Beacon of Hope":"Abjuration","Create Food and Water":"Conjuration","Daylight":"Evocation","Dispel Magic":"Abjuration","Magic Circle":"Abjuration","Remove Curse":"Abjuration","Revivify":"Necromancy",
  "Aura of Life":"Abjuration","Banishment":"Abjuration","Death Ward":"Abjuration","Freedom of Movement":"Abjuration","Guardian of Faith":"Conjuration","Locate Creature":"Divination",
  "Commune":"Divination","Dispel Evil and Good":"Abjuration","Flame Strike":"Evocation","Geas":"Enchantment","Greater Restoration":"Abjuration","Raise Dead":"Necromancy"
});
const PALADIN_2024=[
  ...rows(1,["Bless","Command","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Divine Favor","Divine Smite","Heroism","Protection from Evil and Good","Purify Food and Drink","Searing Smite","Shield of Faith"],SCHOOLS_2024),
  ...rows(2,["Aid","Find Steed","Gentle Repose","Lesser Restoration","Locate Object","Magic Weapon","Prayer of Healing","Protection from Poison","Shining Smite","Warding Bond","Zone of Truth"],SCHOOLS_2024),
  ...rows(3,["Beacon of Hope","Create Food and Water","Daylight","Dispel Magic","Magic Circle","Remove Curse","Revivify"],SCHOOLS_2024),
  ...rows(4,["Aura of Life","Banishment","Death Ward","Freedom of Movement","Guardian of Faith","Locate Creature"],SCHOOLS_2024),
  ...rows(5,["Commune","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Raise Dead"],SCHOOLS_2024)
];

export const PALADIN_SPELLS_2014=Object.freeze(PALADIN_2014);
export const PALADIN_SPELLS_2024=Object.freeze(PALADIN_2024);
export function paladinSpellsFor(ruleset){
  try{if(ruleset==="2014")return PALADIN_SPELLS_2014;if(ruleset==="2024")return PALADIN_SPELLS_2024;throw new Error(`Unsupported Paladin spell ruleset: ${ruleset}.`);}
  catch(error){console.error("[paladin-spells] lookup failed",error);throw error;}
}
