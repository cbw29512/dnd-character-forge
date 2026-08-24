import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { MASTERY_REFERENCE, REFERENCE_2014, REFERENCE_2024 } from "../data/quick-reference.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024 } from "../data/ranger-spells.js";
import { rangerReferenceProvenance } from "../data/ranger-provenance.js";
import { referenceProvenance } from "../data/rule-provenance.js";

export function buildRangerQuickReference(character){
  try{
    if(character?.class?.id!=="ranger")throw new Error("Ranger reference builder received another class.");
    const safe={...character,features:[],fightingStyle:null,fightingStyles:[],masteryIds:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-dimensional-travel")},items=[...buildCoreQuickReference(safe)];
    for(const style of character.fightingStyles||[])items.push(entry(character,`style:${style.name}`,style.name,styleReference(character,style),"style"));
    const boon=(character.feats||[]).find(feat=>feat.id==="boon-dimensional-travel");if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[]){if(name==="Fighting Style"||name.startsWith("Fighting Style:"))continue;items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));}
    for(const mastery of masteryEntries(character))items.push(mastery);
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Ranger quick-reference entries detected.");return items;
  }catch(error){console.error("[ranger-reference] build failed",error);throw error;}
}

function featureReference(c,name){
  try{
    const p=c.ranger,s=c.rangerSelections||{},refs={
      "Favored Enemy":c.ruleset==="2014"?rr("Ranger","Exploration",favoredEnemy2014(s)):rr("Ranger","Hunter's Mark",`Hunter's Mark is always prepared. Cast it ${p.hunterMarkFreeCasts} times without a spell slot per Long Rest; spell-slot castings remain available. Its extra damage die is ${p.hunterMarkDie}.`),
      "Natural Explorer":rr("Ranger","Favored terrain",`Favored terrain: ${(s.naturalExplorerTerrains||[]).map(pretty).join(", ")}. In that terrain, double your Proficiency Bonus on proficient Intelligence or Wisdom checks related to it. Travel of an hour or more also grants the encoded exploration benefits: normal group pace through difficult terrain, magical-only getting lost, continued alertness, normal-pace solo stealth, doubled forage, and extra tracking details.`),
      Spellcasting:rr("Ranger","Magic",c.ruleset==="2014"?`Wisdom spellcasting. You know ${p.known} Ranger spell${p.known===1?"":"s"} at this level. You regain spell slots after a Long Rest and can replace one known Ranger spell whenever you gain a Ranger level.`:`Wisdom spellcasting. You have ${p.prepared} normal prepared Ranger spells. Hunter's Mark is additional and always prepared. After a Long Rest, you can replace one prepared Ranger spell with another legal Ranger spell.`),
      "Primeval Awareness":rr("Ranger","Action · spell slot","Spend one Ranger spell slot. For 1 minute per slot level, sense whether Aberrations, Celestials, Dragons, Elementals, Fey, Fiends, or Undead are present within 1 mile, or within 6 miles in favored terrain. You learn neither location nor number."),
      "Ability Score Improvement":rr("Ranger","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunities are already reflected in the ability scores.`),
      "Extra Attack":rr("Ranger","Attack action",`Attack ${p.attacksPerAction===2?"twice":p.attacksPerAction} instead of once when taking the Attack action.`),
      "Hunter's Prey":rr("Hunter","Subclass choice",c.ruleset==="2024"?`Current Hunter's Prey option: ${prettyChoice(c,s.huntersPrey)}. Whenever you finish a Short or Long Rest, you can replace it with the other Hunter's Prey option.`:`Current Hunter's Prey option: ${prettyChoice(c,s.huntersPrey)}.`),
      "Colossus Slayer":rr("Hunter","Once per turn",`When you hit a creature with a weapon and it is missing any Hit Points, the weapon deals +1d8 damage. This extra damage can occur only once per turn.`),
      "Giant Killer":rr("Hunter","Reaction",`When a Large or larger creature within 5 ft hits or misses you with an attack, use your Reaction immediately after its attack to attack that creature if you can see it.`),
      "Horde Breaker":rr("Hunter","Once on your turn",c.ruleset==="2014"?`After making a weapon attack, make one additional attack with the same weapon against a different creature within 5 ft of the original target and within the weapon's range.`:`When you make a weapon attack, make one additional attack with the same weapon against a different creature within 5 ft of the original target, within range, that you haven't attacked this turn.`),
      "Defensive Tactics":rr("Hunter","Subclass choice",c.ruleset==="2024"?`Current Defensive Tactics option: ${prettyChoice(c,s.defensiveTactics)}. Whenever you finish a Short or Long Rest, you can replace it with the other Defensive Tactics option.`:`Current Defensive Tactics option: ${prettyChoice(c,s.defensiveTactics)}.`),
      "Escape the Horde":rr("Hunter","Opportunity Attacks","Opportunity Attacks against you have Disadvantage."),
      "Multiattack Defense":rr("Hunter","After a creature hits you",c.ruleset==="2014"?`Gain +4 AC against all later attacks made by that creature for the rest of the turn.`:`That creature has Disadvantage on all other attack rolls against you for the rest of this turn.`),
      "Steel Will":rr("Hunter","Passive","You have Advantage on saving throws against being Frightened."),
      "Land's Stride":rr("Ranger","Movement","Nonmagical difficult terrain costs you no extra movement. Nonmagical plants don't slow or damage you when you pass through them, and you have Advantage on saves against magically created or manipulated plants that impede movement."),
      "Hide in Plain Sight":rr("Ranger","1 minute preparation","Create camouflage from natural materials. While remaining still without moving or taking actions, gain +10 to Dexterity (Stealth). Moving or taking an action or Reaction ends the benefit until you camouflage again."),
      Multiattack:rr("Hunter","Subclass choice",`Current Hunter Multiattack option: ${prettyChoice(c,s.multiattack)}.`),
      Volley:rr("Hunter","Action","Make one ranged attack against any number of creatures within 10 ft of a point you can see within your weapon's range. Use ammunition normally and roll separately for each target."),
      "Whirlwind Attack":rr("Hunter","Action","Make one melee attack against any number of creatures within 5 ft of you, with a separate attack roll for each target."),
      Vanish:rr("Ranger","Bonus Action / exploration","Take the Hide action as a Bonus Action. You also can't be tracked by nonmagical means unless you choose to leave a trail."),
      "Superior Hunter's Defense":rr("Hunter","Subclass choice",c.ruleset==="2014"?`Current Superior Hunter's Defense option: ${prettyChoice(c,s.superiorDefense)}.`:`When you take damage, use a Reaction to gain Resistance to that damage and any other damage of the same type until the end of the current turn.`),
      Evasion:rr("Hunter","Dexterity save","When an effect allows a Dexterity save for half damage, take no damage on a success and half damage on a failure."),
      "Stand Against the Tide":rr("Hunter","Reaction","When a hostile creature misses you with a melee attack, use your Reaction to force it to repeat that attack against another creature of your choice other than itself."),
      "Uncanny Dodge":rr("Hunter","Reaction","When an attacker you can see hits you with an attack, halve that attack's damage against you."),
      "Feral Senses":c.ruleset==="2014"?rr("Ranger","Passive","Attacking a creature you can't see doesn't impose Disadvantage solely for that reason. You also know the location of invisible creatures within 30 ft unless they are hidden from you or you are Blinded or Deafened."):rr("Ranger","Passive",`You have Blindsight out to ${p.blindsightRange} ft.`),
      "Foe Slayer":c.ruleset==="2014"?rr("Ranger","Once on each turn","Against a favored enemy, add your Wisdom modifier to one attack roll or one damage roll. Decide before or after the roll, but before its effects are applied."):rr("Ranger","Hunter's Mark","Hunter's Mark now uses a d10 for its extra damage instead of a d6."),
      "Weapon Mastery — Ranger":rr("Ranger","After Long Rest",`Use the mastery properties of ${p.masteryCount} chosen proficient weapons shown below. After a Long Rest, you can change the weapon choices.`),
      "Deft Explorer":rr("Ranger","Applied","Gain Expertise in one skill proficiency and learn two additional languages. Both are already reflected on this sheet."),
      Roving:rr("Ranger","Passive",`While not wearing Heavy armor, Speed increases by ${p.speedBonus} ft. You also gain a Climb Speed and Swim Speed equal to your Speed.`),
      Expertise:rr("Ranger","Applied",`At Ranger 9, choose two additional skill proficiencies for Expertise. This character has ${p.expertiseCount} total Ranger Expertise choices.`),
      Tireless:rr("Ranger","Magic action / Short Rest",`Magic action: gain 1d8 + Wisdom modifier Temporary Hit Points, ${p.tirelessUses} use${p.tirelessUses===1?"":"s"} per Long Rest. Whenever you finish a Short Rest, reduce your Exhaustion level by 1.`),
      "Relentless Hunter":rr("Ranger","Concentration","Taking damage can't break your Concentration on Hunter's Mark."),
      "Nature's Veil":rr("Ranger","Bonus Action",`Become Invisible until the end of your next turn. ${p.natureVeilUses} use${p.natureVeilUses===1?"":"s"} per Long Rest.`),
      "Precise Hunter":rr("Ranger","Marked target","You have Advantage on attack rolls against the creature currently marked by your Hunter's Mark."),
      "Hunter's Lore":rr("Hunter","Marked target","While a creature is marked by your Hunter's Mark, you know whether it has any Immunities, Resistances, or Vulnerabilities and learn what they are."),
      "Superior Hunter's Prey":rr("Hunter","Once per turn","When you deal damage to a creature marked by Hunter's Mark, you can also deal Hunter's Mark's extra damage to a different creature you can see within 30 ft of the first."),
      "Epic Boon":rr("Ranger","Applied",`Your level-19 Epic Boon is ${c.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`)
    };
    const ref=refs[name];if(!ref)throw new Error(`Missing Ranger play reference for ${name}.`);return ref;
  }catch(error){console.error(`[ranger-reference] feature ${name} failed`,error);throw error;}
}

function styleReference(c,style){
  try{
    if(style.id==="druidic-warrior"){const names=druidCantripNames(c.spells?.cantrips?.all||[]);return rr("Fighting Style","Cantrips",`Learn two Druid cantrips as Ranger spells using Wisdom: ${names.join(", ")||"two legal Druid cantrips"}. Whenever you gain a Ranger level, replace one with another Druid cantrip.`);}
    const rules=c.ruleset==="2014"?REFERENCE_2014:REFERENCE_2024,ref=rules.style?.[style.name];if(ref)return ref;
    if(style.id==="dueling")return rr("Fighting Style","Passive","While wielding a melee weapon in one hand and no other weapons, gain +2 to its damage rolls; already included in qualifying attack damage.");
    if(style.id==="two-weapon")return rr("Fighting Style","Two-weapon attack","Add your ability modifier to the damage of your off-hand/two-weapon attack when it would otherwise be omitted.");
    throw new Error(`Missing Ranger Fighting Style reference for ${style.name}.`);
  }catch(error){console.error("[ranger-reference] style reference failed",error);throw error;}
}
function boonReference(c){return rr("Epic Boon","After Attack or Magic action",`The +1 ${pretty(c.epicBoonAbility)} increase and maximum of 30 are already applied. Immediately after taking the Attack or Magic action, teleport up to 30 ft to an unoccupied space you can see.`);}
function masteryEntries(c){try{if(c.ruleset!=="2024")return[];return(c.masteryIds||[]).map(weaponId=>{const weapon=RAW_2024.weapons[weaponId];if(!weapon?.mastery)throw new Error(`Missing Ranger mastery data for ${weaponId}.`);const ref=MASTERY_REFERENCE[weapon.mastery];if(!ref)throw new Error(`Missing mastery reference for ${weapon.mastery}.`);const name=`${weapon.name} — ${weapon.mastery}`;return{id:`mastery:${weaponId}`,name,...ref,source:referenceProvenance(c,"mastery",name)};});}catch(error){console.error("[ranger-reference] mastery build failed",error);throw error;}}
function favoredEnemy2014(selections){const enemies=(selections.favoredEnemies||[]).map(pretty),languages=(selections.favoredEnemyLanguages||[]).filter(Boolean);return`Favored enemies: ${enemies.join(", ")}. You have Advantage on Wisdom (Survival) checks to track them and Intelligence checks to recall information about them.${languages.length?` Associated languages learned: ${languages.join(", ")}.`:""}`;}
function druidCantripNames(ids){try{const byId=new Map(RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024.map(spell=>[spell.id,spell.name]));return ids.map(id=>{const name=byId.get(id);if(!name)throw new Error(`Unknown Druidic Warrior cantrip ${id}.`);return name;});}catch(error){console.error("[ranger-reference] Druidic Warrior labels failed",error);throw error;}}
function prettyChoice(c,id){if(!id)return"—";const names={"colossus-slayer":"Colossus Slayer","giant-killer":"Giant Killer","horde-breaker":"Horde Breaker","escape-the-horde":"Escape the Horde","multiattack-defense":"Multiattack Defense","steel-will":"Steel Will",volley:"Volley","whirlwind-attack":"Whirlwind Attack",evasion:"Evasion","stand-against-the-tide":"Stand Against the Tide","uncanny-dodge":"Uncanny Dodge"};return names[id]||pretty(id);}
function entry(c,id,name,ref,kind){return{id,name,...ref,source:rangerReferenceProvenance(c,kind,name)};}
function rr(category,timing,text){return{category,timing,text};}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());}
