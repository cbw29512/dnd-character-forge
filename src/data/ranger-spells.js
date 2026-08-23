const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const rows=(level,names,schools={})=>names.map(name=>Object.freeze({id:slug(name),name,level,school:schools[name]||null}));

const RANGER_2014=[
  ...rows(1,["Alarm","Animal Friendship","Cure Wounds","Detect Magic","Detect Poison and Disease","Fog Cloud","Goodberry","Hunter's Mark","Jump","Longstrider","Speak with Animals"]),
  ...rows(2,["Animal Messenger","Barkskin","Darkvision","Find Traps","Lesser Restoration","Locate Animals or Plants","Locate Object","Pass without Trace","Protection from Poison","Silence","Spike Growth"]),
  ...rows(3,["Conjure Animals","Daylight","Nondetection","Plant Growth","Protection from Energy","Speak with Plants","Water Breathing","Water Walk","Wind Wall"]),
  ...rows(4,["Conjure Woodland Beings","Freedom of Movement","Locate Creature","Stoneskin"]),
  ...rows(5,["Commune with Nature","Tree Stride"])
];

const SCHOOLS_2024=Object.freeze({
  "Alarm":"Abjuration","Animal Friendship":"Enchantment","Cure Wounds":"Abjuration","Detect Magic":"Divination","Detect Poison and Disease":"Divination","Ensnaring Strike":"Conjuration","Entangle":"Conjuration","Fog Cloud":"Conjuration","Goodberry":"Conjuration","Hunter's Mark":"Divination","Jump":"Transmutation","Longstrider":"Transmutation","Speak with Animals":"Divination",
  "Aid":"Abjuration","Animal Messenger":"Enchantment","Barkskin":"Transmutation","Darkvision":"Transmutation","Enhance Ability":"Transmutation","Find Traps":"Divination","Gust of Wind":"Evocation","Lesser Restoration":"Abjuration","Locate Animals or Plants":"Divination","Locate Object":"Divination","Magic Weapon":"Transmutation","Pass without Trace":"Abjuration","Protection from Poison":"Abjuration","Silence":"Illusion","Spike Growth":"Transmutation",
  "Conjure Animals":"Conjuration","Daylight":"Evocation","Dispel Magic":"Abjuration","Meld into Stone":"Transmutation","Nondetection":"Abjuration","Plant Growth":"Transmutation","Protection from Energy":"Abjuration","Revivify":"Necromancy","Speak with Plants":"Transmutation","Water Breathing":"Transmutation","Water Walk":"Transmutation","Wind Wall":"Evocation",
  "Conjure Woodland Beings":"Conjuration","Dominate Beast":"Enchantment","Freedom of Movement":"Abjuration","Locate Creature":"Divination","Stoneskin":"Transmutation",
  "Commune with Nature":"Divination","Greater Restoration":"Abjuration","Tree Stride":"Conjuration"
});
const RANGER_2024=[
  ...rows(1,["Alarm","Animal Friendship","Cure Wounds","Detect Magic","Detect Poison and Disease","Ensnaring Strike","Entangle","Fog Cloud","Goodberry","Hunter's Mark","Jump","Longstrider","Speak with Animals"],SCHOOLS_2024),
  ...rows(2,["Aid","Animal Messenger","Barkskin","Darkvision","Enhance Ability","Find Traps","Gust of Wind","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Weapon","Pass without Trace","Protection from Poison","Silence","Spike Growth"],SCHOOLS_2024),
  ...rows(3,["Conjure Animals","Daylight","Dispel Magic","Meld into Stone","Nondetection","Plant Growth","Protection from Energy","Revivify","Speak with Plants","Water Breathing","Water Walk","Wind Wall"],SCHOOLS_2024),
  ...rows(4,["Conjure Woodland Beings","Dominate Beast","Freedom of Movement","Locate Creature","Stoneskin"],SCHOOLS_2024),
  ...rows(5,["Commune with Nature","Greater Restoration","Tree Stride"],SCHOOLS_2024)
];

const DRUID_CANTRIP_SCHOOLS=Object.freeze({Druidcraft:"Transmutation",Elementalism:"Transmutation",Guidance:"Divination",Mending:"Transmutation",Message:"Transmutation","Poison Spray":"Necromancy","Produce Flame":"Conjuration",Resistance:"Abjuration",Shillelagh:"Transmutation","Spare the Dying":"Necromancy","Starry Wisp":"Evocation"});
const DRUID_CANTRIPS_2024=rows(0,["Druidcraft","Elementalism","Guidance","Mending","Message","Poison Spray","Produce Flame","Resistance","Shillelagh","Spare the Dying","Starry Wisp"],DRUID_CANTRIP_SCHOOLS);

export const RANGER_SPELLS_2014=Object.freeze(RANGER_2014);
export const RANGER_SPELLS_2024=Object.freeze(RANGER_2024);
export const RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024=Object.freeze(DRUID_CANTRIPS_2024);

export function rangerSpellsFor(ruleset){
  try{if(ruleset==="2014")return RANGER_SPELLS_2014;if(ruleset==="2024")return RANGER_SPELLS_2024;throw new Error(`Unsupported Ranger spell ruleset: ${ruleset}.`);}
  catch(error){console.error("[ranger-spells] lookup failed",error);throw error;}
}
