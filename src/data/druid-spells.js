const slug=name=>name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const rows=(level,names,schools={})=>names.map(name=>Object.freeze({id:slug(name),name,level,school:schools[name]||null}));

const DRUID_2014=[
  ...rows(0,["Druidcraft","Guidance","Mending","Poison Spray","Produce Flame","Resistance","Shillelagh"]),
  ...rows(1,["Animal Friendship","Charm Person","Create or Destroy Water","Cure Wounds","Detect Magic","Detect Poison and Disease","Entangle","Faerie Fire","Fog Cloud","Goodberry","Healing Word","Jump","Longstrider","Purify Food and Drink","Speak with Animals","Thunderwave"]),
  ...rows(2,["Animal Messenger","Barkskin","Darkvision","Enhance Ability","Find Traps","Flame Blade","Flaming Sphere","Gust of Wind","Heat Metal","Hold Person","Lesser Restoration","Locate Animals or Plants","Locate Object","Moonbeam","Pass without Trace","Protection from Poison","Spike Growth"]),
  ...rows(3,["Call Lightning","Conjure Animals","Daylight","Dispel Magic","Meld into Stone","Plant Growth","Protection from Energy","Sleet Storm","Speak with Plants","Water Breathing","Water Walk","Wind Wall"]),
  ...rows(4,["Blight","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Dominate Beast","Freedom of Movement","Giant Insect","Hallucinatory Terrain","Ice Storm","Locate Creature","Polymorph","Stone Shape","Stoneskin","Wall of Fire"]),
  ...rows(5,["Antilife Shell","Awaken","Commune with Nature","Conjure Elemental","Contagion","Geas","Greater Restoration","Insect Plague","Mass Cure Wounds","Planar Binding","Reincarnate","Scrying","Tree Stride","Wall of Stone"]),
  ...rows(6,["Conjure Fey","Find the Path","Heal","Heroes’ Feast","Move Earth","Sunbeam","Transport via Plants","Wall of Thorns","Wind Walk"]),
  ...rows(7,["Fire Storm","Mirage Arcane","Plane Shift","Regenerate","Reverse Gravity"]),
  ...rows(8,["Animal Shapes","Antipathy/Sympathy","Control Weather","Earthquake","Feeblemind","Sunburst"]),
  ...rows(9,["Foresight","Shapechange","Storm of Vengeance","True Resurrection"])
];

const S2024=Object.freeze({
  Druidcraft:"Transmutation",Elementalism:"Transmutation",Guidance:"Divination",Mending:"Transmutation",Message:"Transmutation","Poison Spray":"Necromancy","Produce Flame":"Conjuration",Resistance:"Abjuration",Shillelagh:"Transmutation","Spare the Dying":"Necromancy","Starry Wisp":"Evocation",
  "Animal Friendship":"Enchantment","Charm Person":"Enchantment","Create or Destroy Water":"Transmutation","Cure Wounds":"Abjuration","Detect Magic":"Divination","Detect Poison and Disease":"Divination",Entangle:"Conjuration","Faerie Fire":"Evocation","Fog Cloud":"Conjuration",Goodberry:"Conjuration","Healing Word":"Abjuration","Ice Knife":"Conjuration",Jump:"Transmutation",Longstrider:"Transmutation","Protection from Evil and Good":"Abjuration","Purify Food and Drink":"Transmutation","Speak with Animals":"Divination",Thunderwave:"Evocation",
  Aid:"Abjuration","Animal Messenger":"Enchantment",Augury:"Divination",Barkskin:"Transmutation","Continual Flame":"Evocation",Darkvision:"Transmutation","Enhance Ability":"Transmutation","Enlarge/Reduce":"Transmutation","Find Traps":"Divination","Flame Blade":"Evocation","Flaming Sphere":"Evocation","Gust of Wind":"Evocation","Heat Metal":"Transmutation","Hold Person":"Enchantment","Lesser Restoration":"Abjuration","Locate Animals or Plants":"Divination","Locate Object":"Divination",Moonbeam:"Evocation","Pass without Trace":"Abjuration","Protection from Poison":"Abjuration","Spike Growth":"Transmutation",
  "Call Lightning":"Conjuration","Conjure Animals":"Conjuration",Daylight:"Evocation","Dispel Magic":"Abjuration","Meld into Stone":"Transmutation","Plant Growth":"Transmutation","Protection from Energy":"Abjuration",Revivify:"Necromancy","Sleet Storm":"Conjuration","Speak with Plants":"Transmutation","Water Breathing":"Transmutation","Water Walk":"Transmutation","Wind Wall":"Evocation",
  Blight:"Necromancy","Charm Monster":"Enchantment",Confusion:"Enchantment","Conjure Minor Elementals":"Conjuration","Conjure Woodland Beings":"Conjuration","Control Water":"Transmutation",Divination:"Divination","Dominate Beast":"Enchantment","Fire Shield":"Evocation","Freedom of Movement":"Abjuration","Giant Insect":"Conjuration","Hallucinatory Terrain":"Illusion","Ice Storm":"Evocation","Locate Creature":"Divination",Polymorph:"Transmutation","Stone Shape":"Transmutation",Stoneskin:"Transmutation","Wall of Fire":"Evocation",
  "Antilife Shell":"Abjuration",Awaken:"Transmutation","Commune with Nature":"Divination","Cone of Cold":"Evocation","Conjure Elemental":"Conjuration",Contagion:"Necromancy",Geas:"Enchantment","Greater Restoration":"Abjuration","Insect Plague":"Conjuration","Mass Cure Wounds":"Abjuration","Planar Binding":"Abjuration",Reincarnate:"Necromancy",Scrying:"Divination","Tree Stride":"Conjuration","Wall of Stone":"Evocation",
  "Conjure Fey":"Conjuration","Find the Path":"Divination","Flesh to Stone":"Transmutation",Heal:"Abjuration","Heroes’ Feast":"Conjuration","Move Earth":"Transmutation",Sunbeam:"Evocation","Transport via Plants":"Conjuration","Wall of Thorns":"Conjuration","Wind Walk":"Transmutation",
  "Fire Storm":"Evocation","Mirage Arcane":"Illusion","Plane Shift":"Conjuration",Regenerate:"Transmutation","Reverse Gravity":"Transmutation",Symbol:"Abjuration",
  "Animal Shapes":"Transmutation","Antipathy/Sympathy":"Enchantment",Befuddlement:"Enchantment","Control Weather":"Transmutation",Earthquake:"Transmutation","Incendiary Cloud":"Conjuration",Sunburst:"Evocation",Tsunami:"Conjuration",
  Foresight:"Divination",Shapechange:"Transmutation","Storm of Vengeance":"Conjuration"
});
const DRUID_2024=[
  ...rows(0,["Druidcraft","Elementalism","Guidance","Mending","Message","Poison Spray","Produce Flame","Resistance","Shillelagh","Spare the Dying","Starry Wisp"],S2024),
  ...rows(1,["Animal Friendship","Charm Person","Create or Destroy Water","Cure Wounds","Detect Magic","Detect Poison and Disease","Entangle","Faerie Fire","Fog Cloud","Goodberry","Healing Word","Ice Knife","Jump","Longstrider","Protection from Evil and Good","Purify Food and Drink","Speak with Animals","Thunderwave"],S2024),
  ...rows(2,["Aid","Animal Messenger","Augury","Barkskin","Continual Flame","Darkvision","Enhance Ability","Enlarge/Reduce","Find Traps","Flame Blade","Flaming Sphere","Gust of Wind","Heat Metal","Hold Person","Lesser Restoration","Locate Animals or Plants","Locate Object","Moonbeam","Pass without Trace","Protection from Poison","Spike Growth"],S2024),
  ...rows(3,["Call Lightning","Conjure Animals","Daylight","Dispel Magic","Meld into Stone","Plant Growth","Protection from Energy","Revivify","Sleet Storm","Speak with Plants","Water Breathing","Water Walk","Wind Wall"],S2024),
  ...rows(4,["Blight","Charm Monster","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Divination","Dominate Beast","Fire Shield","Freedom of Movement","Giant Insect","Hallucinatory Terrain","Ice Storm","Locate Creature","Polymorph","Stone Shape","Stoneskin","Wall of Fire"],S2024),
  ...rows(5,["Antilife Shell","Awaken","Commune with Nature","Cone of Cold","Conjure Elemental","Contagion","Geas","Greater Restoration","Insect Plague","Mass Cure Wounds","Planar Binding","Reincarnate","Scrying","Tree Stride","Wall of Stone"],S2024),
  ...rows(6,["Conjure Fey","Find the Path","Flesh to Stone","Heal","Heroes’ Feast","Move Earth","Sunbeam","Transport via Plants","Wall of Thorns","Wind Walk"],S2024),
  ...rows(7,["Fire Storm","Mirage Arcane","Plane Shift","Regenerate","Reverse Gravity","Symbol"],S2024),
  ...rows(8,["Animal Shapes","Antipathy/Sympathy","Befuddlement","Control Weather","Earthquake","Incendiary Cloud","Sunburst","Tsunami"],S2024),
  ...rows(9,["Foresight","Shapechange","Storm of Vengeance"],S2024)
];

const CIRCLE_EXTRAS_2014={
  arctic:[[2,"Hold Person"],[2,"Spike Growth"],[3,"Sleet Storm"],[3,"Slow"],[4,"Freedom of Movement"],[4,"Ice Storm"],[5,"Commune with Nature"],[5,"Cone of Cold"]],
  coast:[[2,"Mirror Image"],[2,"Misty Step"],[3,"Water Breathing"],[3,"Water Walk"],[4,"Control Water"],[4,"Freedom of Movement"],[5,"Conjure Elemental"],[5,"Scrying"]],
  desert:[[2,"Blur"],[2,"Silence"],[3,"Create Food and Water"],[3,"Protection from Energy"],[4,"Blight"],[4,"Hallucinatory Terrain"],[5,"Insect Plague"],[5,"Wall of Stone"]],
  forest:[[2,"Barkskin"],[2,"Spider Climb"],[3,"Call Lightning"],[3,"Plant Growth"],[4,"Divination"],[4,"Freedom of Movement"],[5,"Commune with Nature"],[5,"Tree Stride"]],
  grassland:[[2,"Invisibility"],[2,"Pass without Trace"],[3,"Daylight"],[3,"Haste"],[4,"Divination"],[4,"Freedom of Movement"],[5,"Dream"],[5,"Insect Plague"]],
  mountain:[[2,"Spider Climb"],[2,"Spike Growth"],[3,"Lightning Bolt"],[3,"Meld into Stone"],[4,"Stone Shape"],[4,"Stoneskin"],[5,"Passwall"],[5,"Wall of Stone"]],
  swamp:[[2,"Acid Arrow"],[2,"Darkness"],[3,"Water Walk"],[3,"Stinking Cloud"],[4,"Freedom of Movement"],[4,"Locate Creature"],[5,"Insect Plague"],[5,"Scrying"]]
};
const CIRCLE_2024={
  arid:[[0,"Fire Bolt"],[1,"Burning Hands"],[2,"Blur"],[3,"Fireball"],[4,"Blight"],[5,"Wall of Stone"]],
  polar:[[0,"Ray of Frost"],[1,"Fog Cloud"],[2,"Hold Person"],[3,"Sleet Storm"],[4,"Ice Storm"],[5,"Cone of Cold"]],
  temperate:[[0,"Shocking Grasp"],[1,"Sleep"],[2,"Misty Step"],[3,"Lightning Bolt"],[4,"Freedom of Movement"],[5,"Tree Stride"]],
  tropical:[[0,"Acid Splash"],[1,"Ray of Sickness"],[2,"Web"],[3,"Stinking Cloud"],[4,"Polymorph"],[5,"Insect Plague"]]
};

const EXTRA_SCHOOLS=Object.freeze({"Fire Bolt":"Evocation","Burning Hands":"Evocation",Blur:"Illusion",Fireball:"Evocation","Ray of Frost":"Evocation",Sleep:"Enchantment","Misty Step":"Conjuration","Lightning Bolt":"Evocation","Shocking Grasp":"Evocation","Acid Splash":"Evocation","Ray of Sickness":"Necromancy",Web:"Conjuration","Stinking Cloud":"Conjuration",Slow:"Transmutation","Mirror Image":"Illusion",Silence:"Illusion","Create Food and Water":"Conjuration","Spider Climb":"Transmutation",Invisibility:"Illusion",Haste:"Transmutation",Dream:"Illusion",Passwall:"Transmutation","Acid Arrow":"Evocation",Darkness:"Evocation"});
function circleRecords(table,ruleset){const base=ruleset==="2014"?DRUID_2014:DRUID_2024,seen=new Map(base.map(s=>[s.id,s]));return Object.entries(table).flatMap(([land,entries])=>entries.map(([level,name])=>{const id=slug(name),existing=seen.get(id);return Object.freeze(existing?{...existing,circleOnly:false,land}: {id,name,level,school:ruleset==="2024"?(EXTRA_SCHOOLS[name]||null):null,circleOnly:true,land});}));}
export const DRUID_SPELLS_2014=Object.freeze(DRUID_2014);
export const DRUID_SPELLS_2024=Object.freeze(DRUID_2024);
export const DRUID_CIRCLE_SPELLS_2014=Object.freeze(circleRecords(CIRCLE_EXTRAS_2014,"2014"));
export const DRUID_CIRCLE_SPELLS_2024=Object.freeze(circleRecords(CIRCLE_2024,"2024"));
export function druidSpellsFor(ruleset,{includeCircle=false}={}){try{const base=ruleset==="2014"?DRUID_SPELLS_2014:ruleset==="2024"?DRUID_SPELLS_2024:null;if(!base)throw new Error(`Unsupported Druid spell ruleset: ${ruleset}.`);return includeCircle?[...base,...(ruleset==="2014"?DRUID_CIRCLE_SPELLS_2014:DRUID_CIRCLE_SPELLS_2024)]:base;}catch(error){console.error("[druid-spells] lookup failed",error);throw error;}}
export function druidCircleSpellIds(ruleset,land,level){try{const table=ruleset==="2014"?CIRCLE_EXTRAS_2014:ruleset==="2024"?CIRCLE_2024:null;if(!table?.[land])throw new Error(`Unsupported ${ruleset} Circle land: ${land}.`);return table[land].filter(([minimum])=>Number(level)>=minimum).map(([,name])=>slug(name));}catch(error){console.error("[druid-spells] Circle spell lookup failed",error);throw error;}}
