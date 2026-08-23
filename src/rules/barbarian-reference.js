import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { MASTERY_REFERENCE } from "../data/quick-reference.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { referenceProvenance } from "../data/rule-provenance.js";
import { barbarianReferenceProvenance } from "../data/barbarian-provenance.js";
import { abilityMod } from "./math.js";
import { barbarianFrenzyDamage, barbarianIntimidatingPresenceDc } from "./barbarian.js";

const CLEAVE={category:"Weapon Mastery",timing:"On melee hit",text:"After hitting with this weapon, make one melee attack with it against a different creature within 5 ft of the first and within your reach. On a hit, deal weapon damage without a positive ability modifier. Once per turn."};

export function buildBarbarianQuickReference(character){
  try{
    if(character?.class?.id!=="barbarian")throw new Error("Barbarian reference builder received another class.");
    const safe={...character,features:[],masteryIds:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-irresistible-offense")},items=[...buildCoreQuickReference(safe)];
    const boon=(character.feats||[]).find(feat=>feat.id==="boon-irresistible-offense");if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[])items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));
    for(const mastery of masteryEntries(character))items.push(mastery);
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Barbarian quick-reference entries detected.");return items;
  }catch(error){console.error("[barbarian-reference] build failed",error);throw error;}
}
function featureReference(c,name){
  try{
    const b=c.barbarian,con=abilityMod(c.abilities.con),str=abilityMod(c.abilities.str),rageUses=b.unlimitedRage?"unlimited":`${b.rageUses} use${b.rageUses===1?"":"s"}`;
    const refs={
      Rage:rr("Barbarian","Bonus Action",c.ruleset==="2014"?`Enter Rage for up to 1 minute. Gain Advantage on Strength checks/saves, +${b.rageDamage} damage with qualifying Strength melee weapon attacks, and Resistance to Bludgeoning, Piercing, and Slashing damage. ${rageUses}; regain expended uses after a Long Rest.`:`Enter Rage for up to 10 minutes. Gain Advantage on Strength checks/saves, +${b.rageDamage} damage with qualifying Strength attacks, and Resistance to Bludgeoning, Piercing, and Slashing damage. ${rageUses}; regain one use on a Short Rest and all on a Long Rest.`),
      "Unarmored Defense":rr("Barbarian","Passive",`While not wearing armor, AC is 10 + Dexterity modifier + Constitution modifier${c.equipment.shield?" + Shield":""}. Current unarmored AC: ${10+abilityMod(c.abilities.dex)+con+(c.equipment.shield?2:0)}.`),
      "Weapon Mastery — Barbarian":rr("Barbarian","Passive",`Use the mastery properties of ${b.masteryCount} chosen weapons listed on this sheet. You can change one chosen weapon after a Long Rest.`),
      "Reckless Attack":rr("Barbarian","First Strength attack on your turn",c.ruleset==="2014"?"Choose to gain Advantage on Strength-based melee weapon attacks this turn; attack rolls against you have Advantage until your next turn.":"Choose to gain Advantage on Strength-based attack rolls this turn; attack rolls against you have Advantage until the start of your next turn."),
      "Danger Sense":rr("Barbarian","Dexterity save",c.ruleset==="2014"?"Gain Advantage on Dexterity saves against effects you can see while not Blinded, Deafened, or Incapacitated.":"Gain Advantage on Dexterity saving throws unless you have the Incapacitated condition."),
      "Primal Knowledge":rr("Barbarian","Applied / while raging","One extra Barbarian skill proficiency is already included. While raging, Acrobatics, Intimidation, Perception, Stealth, and Survival checks can use Strength instead of their normal ability."),
      "Ability Score Improvement":rr("Barbarian","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunit${(c.class.asiLevels||[]).filter(level=>c.level>=level).length===1?"y is":"ies are"} already included in the ability scores.`),
      "Extra Attack":rr("Barbarian","Attack action",`Attack ${b.attacksPerAction===2?"twice":b.attacksPerAction} instead of once when taking the Attack action.`),
      "Fast Movement":rr("Barbarian","Passive",`Speed increases by ${b.speedBonus} ft while not wearing Heavy armor; already included in Speed.`),
      "Feral Instinct":rr("Barbarian","Initiative",c.ruleset==="2014"?"You have Advantage on Initiative. If surprised and not Incapacitated, acting normally on your first turn requires entering Rage before doing anything else.":"You have Advantage on Initiative rolls."),
      "Instinctive Pounce":rr("Barbarian","When entering Rage","As part of the Bonus Action used to enter Rage, move up to half your Speed."),
      "Brutal Critical":rr("Barbarian","Critical Hit",`Roll ${b.brutalCriticalDice} additional weapon damage ${b.brutalCriticalDice===1?"die":"dice"} when determining extra damage for a melee weapon Critical Hit.`),
      "Brutal Strike":rr("Barbarian","Reckless Attack · one Strength hit",`Forgo Reckless Attack Advantage on one eligible attack. On a hit, deal +${b.brutalStrikeDice}d10 damage and apply ${b.brutalStrikeEffectCount} Brutal Strike effect. Available: ${b.brutalStrikeEffects.join(", ")}.`),
      "Improved Brutal Strike":rr("Barbarian","Brutal Strike",`Brutal Strike options now include ${b.brutalStrikeEffects.join(", ")}. At level 17, the extra damage becomes 2d10 and two different effects can be applied.`),
      "Relentless Rage":rr("Barbarian","When reduced to 0 HP while raging",c.ruleset==="2014"?"If not killed outright, make a DC 10 Constitution save to drop to 1 HP instead. Each later use before a Short or Long Rest raises the DC by 5.":`If not killed outright, make a DC 10 Constitution save to drop to ${b.relentlessRageHp} HP instead. Each later use before a Short or Long Rest raises the DC by 5.`),
      "Persistent Rage":rr("Barbarian","Rage",c.ruleset==="2014"?"Rage ends early only if you fall Unconscious or choose to end it.":"Rage lasts up to 10 minutes and ends early only if you become Unconscious, don Heavy armor, or choose to end it. Once per Long Rest when rolling Initiative, regain all Rage uses."),
      "Indomitable Might":rr("Barbarian","Strength check / save",`If the total for a Strength ${c.ruleset==="2014"?"check":"check or saving throw"} is lower than your Strength score (${c.abilities.str}), use ${c.abilities.str} instead.`),
      "Epic Boon":rr("Barbarian","Applied",`Your level-19 Epic Boon is ${c.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`),
      "Primal Champion":rr("Barbarian","Applied",`Strength and Constitution each increased by 4, to a class-feature maximum of ${b.primalChampionMaximum}. Current modifiers: STR ${signed(str)}, CON ${signed(con)}.`),
      Frenzy:rr("Berserker","While raging",c.ruleset==="2014"?"When entering Frenzy, make one melee weapon attack as a Bonus Action on each turn after this one while Rage lasts. When Rage ends, gain one level of Exhaustion.":`When you use Reckless Attack while raging, the first Strength-based hit on your turn deals +${barbarianFrenzyDamage(c)} damage.`),
      "Mindless Rage":rr("Berserker","While raging",c.ruleset==="2014"?"You cannot be Charmed or Frightened while raging; entering Rage suspends either condition for the duration.":"You are immune to Charmed and Frightened while raging; entering Rage ends either condition on you."),
      Retaliation:rr("Berserker","Reaction",`When a creature within 5 ft damages you, use your Reaction to make one melee attack against that creature.`),
      "Intimidating Presence":rr("Berserker",c.ruleset==="2014"?"Action":"Bonus Action",c.ruleset==="2014"?`Choose a creature within 30 ft that can see or hear you. It makes a Wisdom save DC ${barbarianIntimidatingPresenceDc(c)} or becomes Frightened until the end of your next turn; subsequent actions can extend the effect.`:`Creatures of your choice in a 30-ft emanation make a Wisdom save DC ${barbarianIntimidatingPresenceDc(c)} or become Frightened for 1 minute, repeating the save at the end of each turn.`)
    };
    const ref=refs[name];if(!ref)throw new Error(`Missing Barbarian play reference for ${name}.`);return ref;
  }catch(error){console.error(`[barbarian-reference] feature ${name} failed`,error);throw error;}
}
function boonReference(c){return rr("Epic Boon","Passive / Critical Hit",`The +1 ${String(c.epicBoonAbility||"Strength").toUpperCase()} increase and maximum of 30 are already applied. Your attacks ignore Resistance to Bludgeoning, Piercing, and Slashing damage; on a Critical Hit, deal extra damage equal to the increased ability score.`);}
function masteryEntries(c){
  try{if(c.ruleset!=="2024")return[];return(c.masteryIds||[]).map(weaponId=>{const weapon=RAW_2024.weapons[weaponId];if(!weapon?.mastery)throw new Error(`Missing Barbarian mastery data for ${weaponId}.`);const property=weapon.mastery,ref=property==="Cleave"?CLEAVE:MASTERY_REFERENCE[property];if(!ref)throw new Error(`Missing mastery reference for ${property}.`);const name=`${weapon.name} — ${property}`,source=property==="Cleave"?barbarianReferenceProvenance(c,"mastery",name):referenceProvenance(c,"mastery",name);return{id:`mastery:${weaponId}`,name,...ref,source};});}
  catch(error){console.error("[barbarian-reference] mastery build failed",error);throw error;}
}
function entry(c,id,name,ref,kind){return{id,name,...ref,source:barbarianReferenceProvenance(c,kind,name)};}
function rr(category,timing,text){return{category,timing,text};}
function signed(value){return value>=0?`+${value}`:`${value}`;}
