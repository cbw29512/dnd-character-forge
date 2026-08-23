import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { MASTERY_REFERENCE } from "../data/quick-reference.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { referenceProvenance } from "../data/rule-provenance.js";
import { barbarianReferenceProvenance } from "../data/barbarian-provenance.js";
import { abilityMod } from "./math.js";
import { barbarianFrenzyDamage, barbarianIntimidatingPresenceDc } from "./barbarian.js";

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
      Rage:rr("Barbarian","Bonus Action",rageText(c,rageUses)),
      "Unarmored Defense":rr("Barbarian","Passive",`While not wearing armor, AC is 10 + Dexterity modifier + Constitution modifier${c.equipment.shield?" + Shield":""}. Current unarmored AC: ${10+abilityMod(c.abilities.dex)+con+(c.equipment.shield?2:0)}.`),
      "Weapon Mastery — Barbarian":rr("Barbarian","After Long Rest",`Use the mastery properties of ${b.masteryCount} chosen Simple or Martial Melee weapons listed on this sheet. After a Long Rest, you can change one chosen weapon.`),
      "Reckless Attack":rr("Barbarian","First attack roll on your turn",c.ruleset==="2014"?"Choose to gain Advantage on Strength-based melee weapon attacks this turn; attack rolls against you have Advantage until your next turn.":"Choose to attack recklessly: Strength-based attack rolls have Advantage until the start of your next turn, and attack rolls against you have Advantage for the same duration."),
      "Danger Sense":rr("Barbarian","Dexterity save",c.ruleset==="2014"?"Gain Advantage on Dexterity saves against effects you can see while not Blinded, Deafened, or Incapacitated.":"Gain Advantage on Dexterity saving throws unless you have the Incapacitated condition."),
      "Primal Knowledge":rr("Barbarian","Applied / while raging","One extra Barbarian skill proficiency is already included. While raging, Acrobatics, Intimidation, Perception, Stealth, and Survival checks can use Strength instead of their normal ability."),
      "Ability Score Improvement":rr("Barbarian","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunit${(c.class.asiLevels||[]).filter(level=>c.level>=level).length===1?"y is":"ies are"} already included in the ability scores.`),
      "Extra Attack":rr("Barbarian","Attack action",`Attack ${b.attacksPerAction===2?"twice":b.attacksPerAction} instead of once when taking the Attack action.`),
      "Fast Movement":rr("Barbarian","Passive",`Speed increases by ${b.speedBonus} ft while not wearing Heavy armor; already included in Speed.`),
      "Feral Instinct":rr("Barbarian","Initiative",c.ruleset==="2014"?"You have Advantage on Initiative. If surprised and not Incapacitated, acting normally on your first turn requires entering Rage before doing anything else.":"You have Advantage on Initiative rolls."),
      "Instinctive Pounce":rr("Barbarian","When entering Rage","As part of the Bonus Action used to enter Rage, move up to half your Speed."),
      "Brutal Critical":rr("Barbarian","Critical Hit",`Roll ${b.brutalCriticalDice} additional weapon damage ${b.brutalCriticalDice===1?"die":"dice"} when determining extra damage for a melee weapon Critical Hit.`),
      "Brutal Strike":rr("Barbarian","Reckless Attack · one Strength hit",brutalStrikeText(c)),
      "Improved Brutal Strike":rr("Barbarian","Brutal Strike",improvedBrutalStrikeText(c)),
      "Relentless Rage":rr("Barbarian","When reduced to 0 HP while raging",c.ruleset==="2014"?"If not killed outright, make a DC 10 Constitution save to drop to 1 HP instead. Each later use before a Short or Long Rest raises the DC by 5.":`If not killed outright, make a DC 10 Constitution save to drop to ${b.relentlessRageHp} HP instead. Each later use before a Short or Long Rest raises the DC by 5.`),
      "Persistent Rage":rr("Barbarian","Rage",c.ruleset==="2014"?"Rage ends early only if you fall Unconscious or use a Bonus Action to end it.":"When Initiative is rolled, you can regain all expended Rage uses once per Long Rest. Rage now lasts 10 minutes without round-to-round extension and ends early only if you become Unconscious or don Heavy armor."),
      "Indomitable Might":rr("Barbarian","Strength check / save",`If the total for a Strength ${c.ruleset==="2014"?"check":"check or saving throw"} is lower than your Strength score (${c.abilities.str}), use ${c.abilities.str} instead.`),
      "Epic Boon":rr("Barbarian","Applied",`Your level-19 Epic Boon is ${c.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`),
      "Primal Champion":rr("Barbarian","Applied",`Strength and Constitution each increased by 4, to a class-feature maximum of ${b.primalChampionMaximum}. Current modifiers: STR ${signed(str)}, CON ${signed(con)}.`),
      Frenzy:rr("Berserker","While raging",c.ruleset==="2014"?"When entering Frenzy, make one melee weapon attack as a Bonus Action on each turn after this one while Rage lasts. When Rage ends, gain one level of Exhaustion.":`When Reckless Attack is used while raging, the first Strength-based hit on your turn deals +${barbarianFrenzyDamage(c)} damage of the same type as the weapon or Unarmed Strike.`),
      "Mindless Rage":rr("Berserker","While raging",c.ruleset==="2014"?"You cannot be Charmed or Frightened while raging; entering Rage suspends either condition for the duration.":"You are immune to Charmed and Frightened while raging; entering Rage ends either condition on you."),
      Retaliation:rr("Berserker","Reaction",c.ruleset==="2014"?"When a creature within 5 ft damages you, use your Reaction to make a melee weapon attack against that creature.":"When you take damage from a creature within 5 ft, use your Reaction to make one melee attack against it using a weapon or Unarmed Strike."),
      "Intimidating Presence":rr("Berserker",c.ruleset==="2014"?"Action":"Bonus Action",intimidatingPresenceText(c))
    };
    const ref=refs[name];if(!ref)throw new Error(`Missing Barbarian play reference for ${name}.`);return ref;
  }catch(error){console.error(`[barbarian-reference] feature ${name} failed`,error);throw error;}
}
function rageText(c,rageUses){
  try{
    const b=c.barbarian;
    if(c.ruleset==="2014"){
      const duration=b.persistentRage?"Persistent Rage makes it last up to 1 minute unless you fall Unconscious or end it as a Bonus Action.":"It lasts up to 1 minute and ends early if you fall Unconscious, end it as a Bonus Action, or your turn ends without having attacked a hostile creature since your previous turn or taken damage since then.";
      return `Enter Rage as a Bonus Action. Gain Advantage on Strength checks/saves, +${b.rageDamage} damage with qualifying Strength melee weapon attacks, and Resistance to Bludgeoning, Piercing, and Slashing damage. You cannot cast or concentrate on spells. ${duration} ${rageUses}; regain expended uses after a Long Rest.`;
    }
    const duration=b.persistentRage?"Persistent Rage makes it last 10 minutes without extension; it ends early only if you become Unconscious or don Heavy armor.":"It lasts through the end of your next turn; extend it one round by making an attack roll against an enemy, forcing an enemy to make a save, or taking a Bonus Action, up to 10 minutes. It ends early if you don Heavy armor or become Incapacitated.";
    return `Enter Rage as a Bonus Action while not wearing Heavy armor. Gain Advantage on Strength checks/saves, +${b.rageDamage} damage when a Strength attack with a weapon or Unarmed Strike deals damage, and Resistance to Bludgeoning, Piercing, and Slashing damage. You cannot cast spells or maintain Concentration. ${duration} ${rageUses}; regain one use after a Short Rest and all after a Long Rest.`;
  }catch(error){console.error("[barbarian-reference] Rage text failed",error);throw error;}
}
function brutalStrikeText(c){
  try{
    const b=c.barbarian,effects=["Forceful: push 15 ft, then move up to half Speed straight toward the target without provoking Opportunity Attacks","Hamstring: reduce target Speed by 15 ft until the start of your next turn"];
    if(b.brutalStrikeEffects.includes("Staggering Blow"))effects.push("Staggering: target has Disadvantage on its next save and cannot make Opportunity Attacks until the start of your next turn");
    if(b.brutalStrikeEffects.includes("Sundering Blow"))effects.push("Sundering: before your next turn, the next attack by another creature against the target gains +5");
    return `After using Reckless Attack, forgo Advantage on one Strength-based attack roll that does not have Disadvantage. On a hit, deal +${b.brutalStrikeDice}d10 damage of the attack's type and apply ${b.brutalStrikeEffectCount===2?"two different effects":"one effect"}: ${effects.join("; ")}.`;
  }catch(error){console.error("[barbarian-reference] Brutal Strike text failed",error);throw error;}
}
function improvedBrutalStrikeText(c){
  try{const b=c.barbarian;return b.brutalStrikeDice>=2?"Brutal Strike deals 2d10 extra damage and can apply two different Brutal Strike effects on the same use.":"Adds Staggering Blow and Sundering Blow to the Brutal Strike options; at Barbarian 17, damage becomes 2d10 and two different effects can be applied.";}catch(error){console.error("[barbarian-reference] Improved Brutal Strike text failed",error);throw error;}
}
function intimidatingPresenceText(c){
  try{
    const dc=barbarianIntimidatingPresenceDc(c);
    if(c.ruleset==="2014")return `Choose one creature within 30 ft that can see or hear you. Wisdom save DC ${dc}; failure Frightens it until the end of your next turn. Subsequent actions can extend the duration; the effect ends if it finishes a turn out of your sight or more than 60 ft away. On a successful save, that creature is immune to this feature for 24 hours.`;
    return `Creatures of your choice in a 30-ft Emanation make a Wisdom save DC ${dc}; failure Frightens for 1 minute, repeating the save at the end of each of their turns. One use per Long Rest; after using it, expend a Rage use (no action) to restore the use early.`;
  }catch(error){console.error("[barbarian-reference] Intimidating Presence text failed",error);throw error;}
}
function boonReference(c){return rr("Epic Boon","Passive / attack roll of 20",`The +1 ${String(c.epicBoonAbility||"Strength").toUpperCase()} increase and maximum of 30 are already applied. Bludgeoning, Piercing, and Slashing damage you deal ignores Resistance. When you roll a 20 on the d20 for an attack roll, deal extra damage equal to the ability score increased by this feat; the extra damage has the attack's type.`);}
function masteryEntries(c){
  try{if(c.ruleset!=="2024")return[];return(c.masteryIds||[]).map(weaponId=>{const weapon=RAW_2024.weapons[weaponId];if(!weapon?.mastery)throw new Error(`Missing Barbarian mastery data for ${weaponId}.`);const property=weapon.mastery,ref=MASTERY_REFERENCE[property];if(!ref)throw new Error(`Missing mastery reference for ${property}.`);const name=`${weapon.name} — ${property}`,source=referenceProvenance(c,"mastery",name);return{id:`mastery:${weaponId}`,name,...ref,source};});}
  catch(error){console.error("[barbarian-reference] mastery build failed",error);throw error;}
}
function entry(c,id,name,ref,kind){return{id,name,...ref,source:barbarianReferenceProvenance(c,kind,name)};}
function rr(category,timing,text){return{category,timing,text};}
function signed(value){return value>=0?`+${value}`:`${value}`;}
