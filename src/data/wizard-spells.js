const slug = name => name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const make = (level, names, evocationNames=[]) => {
  const evocations = new Set(evocationNames);
  return names.map(name=>({ id:slug(name), name, level, school:evocations.has(name)?"Evocation":null }));
};

const COMMON_CANTRIPS = ["Acid Splash","Chill Touch","Dancing Lights","Fire Bolt","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","True Strike"];
const COMMON_L1 = ["Alarm","Burning Hands","Charm Person","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Find Familiar","Fog Cloud","Grease","Identify","Illusory Script","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Evil and Good","Shield","Silent Image","Sleep","Thunderwave","Unseen Servant"];
const COMMON_L3 = ["Animate Dead","Bestow Curse","Blink","Clairvoyance","Counterspell","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Glyph of Warding","Haste","Hypnotic Pattern","Lightning Bolt","Magic Circle","Major Image","Nondetection","Phantom Steed","Protection from Energy","Remove Curse","Sending","Sleet Storm","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing"];
const L2_2014 = ["Alter Self","Arcane Lock","Blindness/Deafness","Blur","Continual Flame","Darkness","Darkvision","Detect Thoughts","Enlarge/Reduce","Flaming Sphere","Gentle Repose","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Magic Weapon","Mirror Image","Misty Step","Nystul's Magic Aura","Ray of Enfeeblement","Rope Trick","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"];
const L2_2024 = ["Alter Self","Arcane Lock","Augury","Blindness/Deafness","Blur","Continual Flame","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Flaming Sphere","Gentle Repose","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Magic Weapon","Mirror Image","Misty Step","Ray of Enfeeblement","Rope Trick","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"];
const EVO_0 = ["Acid Splash","Fire Bolt","Light","Ray of Frost","Shocking Grasp"];
const EVO_1 = ["Burning Hands","Magic Missile","Thunderwave"];
const EVO_2 = ["Continual Flame","Flaming Sphere","Gust of Wind","Scorching Ray","Shatter"];
const EVO_3 = ["Fireball","Lightning Bolt"];

export const WIZARD_SPELLS_2014 = [
  ...make(0,COMMON_CANTRIPS,EVO_0), ...make(1,COMMON_L1,EVO_1), ...make(2,L2_2014,EVO_2), ...make(3,COMMON_L3,EVO_3)
];
export const WIZARD_SPELLS_2024 = [
  ...make(0,[...COMMON_CANTRIPS,"Thunderclap"],[...EVO_0,"Thunderclap"]), ...make(1,COMMON_L1,EVO_1), ...make(2,L2_2024,EVO_2), ...make(3,[...COMMON_L3,"Speak with Dead"],EVO_3)
];

export function wizardSpellsFor(ruleset) {
  try { return ruleset === "2014" ? WIZARD_SPELLS_2014 : WIZARD_SPELLS_2024; }
  catch (error) { console.error("[wizard-spells] lookup failed", error); throw error; }
}
