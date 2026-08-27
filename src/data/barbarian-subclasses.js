const ORIGINAL_SOURCE=Object.freeze({
  version:"Character Forge Original",
  document:"Character Forge Original Game Content",
  page:"Barbarian subclass library",
  license:"Original Character Forge game content"
});

const IRON_TEMPEST_2014=Object.freeze({
  id:"iron-tempest",classId:"barbarian",name:"Path of the Iron Tempest",displayName:"Path of the Iron Tempest — Forge Original",level:3,contentKind:"forge-original",
  tagline:"Turn raw momentum into crushing battlefield control."
});
const STONEHEART_2014=Object.freeze({
  id:"stoneheart",classId:"barbarian",name:"Path of the Stoneheart",displayName:"Path of the Stoneheart — Forge Original",level:3,contentKind:"forge-original",
  tagline:"Become the immovable center of the fight."
});
const IRON_TEMPEST_2024=Object.freeze({...IRON_TEMPEST_2014});
const STONEHEART_2024=Object.freeze({...STONEHEART_2014});

export const BARBARIAN_FORGE_SUBCLASSES_2014=Object.freeze([IRON_TEMPEST_2014,STONEHEART_2014]);
export const BARBARIAN_FORGE_SUBCLASSES_2024=Object.freeze([IRON_TEMPEST_2024,STONEHEART_2024]);

const FEATURES=Object.freeze({
  "2014":Object.freeze({
    "iron-tempest":Object.freeze([
      feature(3,"Driving Fury","While raging, once on each of your turns when you hit with a Strength-based melee weapon attack after moving at least 10 feet since the start of the turn, the attack deals an extra 1d6 damage of the weapon's type. If the target is Large or smaller, you can also push it 5 feet away from you."),
      feature(6,"Unbroken Advance","While raging, nonmagical difficult terrain costs you no extra movement. You also have advantage on Strength checks made to resist or escape a grapple and on Strength or Dexterity saving throws made to avoid being knocked prone."),
      feature(10,"Steel Through the Gap","When you use Reckless Attack, the first opportunity attack made against you before the start of your next turn is made with disadvantage. If it misses, you can move 5 feet without provoking opportunity attacks from that creature."),
      feature(14,"Tempest Reprisal","While raging, when a creature within your reach misses you with a melee attack, you can use your reaction to make one melee weapon attack against that creature.")
    ]),
    stoneheart:Object.freeze([
      feature(3,"Stonehide Rage","When you enter your Rage, gain temporary hit points equal to your Barbarian level + your Constitution modifier (minimum 1). These temporary hit points vanish when the Rage ends."),
      feature(6,"Rooted Stance","While raging and standing on solid ground, you have advantage on checks and saving throws made to resist being moved against your will or knocked prone. When an effect would move you against your will, reduce that distance by 10 feet, to a minimum of 0 feet."),
      feature(10,"Weather the Blow","While raging, once per turn when you take damage, reduce the damage by your proficiency bonus after applying any resistance. This reduction cannot reduce the damage below 0."),
      feature(14,"The Mountain Remains","Once during each Rage, when damage would reduce you to 0 hit points without killing you outright, you can drop to 1 hit point instead. This feature functions before you decide whether to use Relentless Rage.")
    ])
  }),
  "2024":Object.freeze({
    "iron-tempest":Object.freeze([
      feature(3,"Driving Fury","While your Rage is active, once on each of your turns when you hit with a Strength-based attack using a melee weapon or an Unarmed Strike after moving at least 10 feet since the start of the turn, the attack deals an extra 1d6 damage of the attack's type. If the target is Large or smaller, you can also push it 5 feet away from you."),
      feature(6,"Unbroken Advance","While your Rage is active, Difficult Terrain costs you no extra movement. You also have Advantage on any ability check or saving throw you make to avoid or end the Grappled condition or to avoid being knocked Prone."),
      feature(10,"Steel Through the Gap","After you use Reckless Attack, the first Opportunity Attack made against you before the start of your next turn is made with Disadvantage. If that attack misses, you can immediately move 5 feet without provoking Opportunity Attacks from that creature."),
      feature(14,"Tempest Reprisal","While your Rage is active, when a creature within your reach misses you with a melee attack, you can take a Reaction to make one melee attack against that creature using a weapon or an Unarmed Strike.")
    ]),
    stoneheart:Object.freeze([
      feature(3,"Stonehide Rage","When you activate your Rage, gain Temporary Hit Points equal to your Barbarian level + your Constitution modifier (minimum 1). These Temporary Hit Points vanish when the Rage ends."),
      feature(6,"Rooted Stance","While your Rage is active and you are standing on solid ground, you have Advantage on ability checks and saving throws made to resist being moved against your will or knocked Prone. When an effect would move you against your will, reduce that distance by 10 feet, to a minimum of 0 feet."),
      feature(10,"Weather the Blow","While your Rage is active, once per turn when you take damage, reduce that damage by your Proficiency Bonus after applying any Resistance. This reduction cannot reduce the damage below 0."),
      feature(14,"The Mountain Remains","Once during each Rage, when damage would reduce you to 0 Hit Points without killing you outright, you can drop to 1 Hit Point instead. This feature functions before you decide whether to use Relentless Rage.")
    ])
  })
});

export function barbarianOriginalFeaturesFor(ruleset,level,subclassId){
  try{
    const value=Number(level),records=FEATURES[ruleset]?.[subclassId]||[];
    if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid Barbarian original-subclass level: ${level}.`);
    return records.filter(record=>value>=record.level).map(record=>record.name);
  }catch(error){console.error("[barbarian-subclasses] feature progression failed",error);throw error;}
}

export function barbarianOriginalReference(ruleset,subclassId,name){
  try{
    const record=(FEATURES[ruleset]?.[subclassId]||[]).find(item=>item.name===name);
    return record?Object.freeze({category:subclassName(subclassId),timing:timingFor(name),text:record.text}):null;
  }catch(error){console.error("[barbarian-subclasses] reference lookup failed",error);throw error;}
}

export function isBarbarianForgeOriginal(subclass){return subclass?.contentKind==="forge-original";}
export function barbarianOriginalSource(){return ORIGINAL_SOURCE;}
export function barbarianOriginalFeatureNames(){return new Set(Object.values(FEATURES).flatMap(bySubclass=>Object.values(bySubclass).flatMap(records=>records.map(record=>record.name))));}

function feature(level,name,text){return Object.freeze({level,name,text});}
function subclassName(id){return id==="iron-tempest"?"Iron Tempest":id==="stoneheart"?"Stoneheart":"Barbarian";}
function timingFor(name){
  const map={"Driving Fury":"Once per turn · while raging","Unbroken Advance":"While raging","Steel Through the Gap":"After Reckless Attack","Tempest Reprisal":"Reaction · while raging","Stonehide Rage":"When Rage begins","Rooted Stance":"While raging","Weather the Blow":"Once per turn · while raging","The Mountain Remains":"Once per Rage"};
  return map[name]||"Barbarian subclass";
}
