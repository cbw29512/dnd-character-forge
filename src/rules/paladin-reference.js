import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { MASTERY_REFERENCE, REFERENCE_2014, REFERENCE_2024 } from "../data/quick-reference.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { clericSpellsFor } from "../data/cleric-spells.js";
import { paladinReferenceProvenance } from "../data/paladin-provenance.js";
import { referenceProvenance } from "../data/rule-provenance.js";
import { abilityMod } from "./math.js";
import { paladinAuraBonus } from "./paladin.js";

export function buildPaladinQuickReference(character){
  try{
    if(character?.class?.id!=="paladin")throw new Error("Paladin reference builder received another class.");
    const safe={...character,features:[],fightingStyle:null,fightingStyles:[],masteryIds:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-truesight")},items=[...buildCoreQuickReference(safe)];
    for(const style of character.fightingStyles||[])items.push(entry(character,`style:${style.name}`,style.name,styleReference(character,style),"style"));
    const boon=(character.feats||[]).find(feat=>feat.id==="boon-truesight");if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[]){if(name==="Fighting Style"||name.startsWith("Fighting Style:"))continue;items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));}
    for(const mastery of masteryEntries(character))items.push(mastery);
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Paladin quick-reference entries detected.");return items;
  }catch(error){console.error("[paladin-reference] build failed",error);throw error;}
}
function featureReference(c,name){
  try{
    const p=c.paladin,cha=abilityMod(c.abilities.cha),aura=paladinAuraBonus(c),refs={
      "Divine Sense":c.ruleset==="2014"?rr("Paladin","Action",`Until the end of your next turn, sense Celestials, Fiends, and Undead within 60 ft that aren't behind Total Cover, learning their type but not identity; also sense consecrated or desecrated places/objects. ${p.divineSenseUses} uses per Long Rest.`):rr("Paladin","Bonus Action · Channel Divinity",`For 10 minutes or until Incapacitated, sense the location and creature type of Celestials, Fiends, and Undead within 60 ft, and sense consecrated or desecrated places/objects in that radius.`),
      "Lay on Hands":rr("Paladin","Action",`Healing pool: ${p.layOnHandsPool} HP per Long Rest. Touch a creature to restore any amount remaining. Spend 5 pool points per disease cured or poison neutralized; no effect on Undead or Constructs.`),
      "Lay On Hands":rr("Paladin","Bonus Action",`Healing pool: ${p.layOnHandsPool} HP per Long Rest. Touch yourself or another creature to restore any amount remaining. Spend 5 pool points to remove Poisoned instead of restoring those points as HP.`),
      Spellcasting:rr("Paladin","Magic",c.ruleset==="2014"?`Charisma spellcasting. Prepare ${p.prepared} Paladin spells after a Long Rest (Charisma modifier ${signed(cha)} + half Paladin level, rounded down; minimum 1). Oath spells are always prepared and don't count against that total.`:`Charisma spellcasting. ${p.prepared} normal Paladin spells are prepared at this level; after a Long Rest, replace one prepared spell with another Paladin spell for which you have slots. Always-prepared Paladin feature spells don't count against this total.`),
      "Divine Smite":rr("Paladin","On melee weapon hit",`Spend a spell slot for +2d8 Radiant damage at level 1, +1d8 per slot level above 1 (maximum 5d8). Add another 1d8 against a Fiend or Undead.`),
      "Divine Health":rr("Paladin","Passive","You are immune to disease."),
      "Sacred Oath":rr("Paladin","Subclass",`Your Sacred Oath is ${c.subclass?.name||"selected at Paladin level 3"}; its oath spells and Channel Divinity options are listed separately.`),
      "Oath of Devotion Spells":rr("Oath of Devotion","Always prepared",`Devotion spells gained through Paladin level ${c.level} are always prepared and don't count against your normal prepared-spell total.`),
      "Sacred Weapon":c.ruleset==="2014"?rr("Oath of Devotion","Action · Channel Divinity",`Imbue one held weapon for 1 minute. Add Charisma modifier ${signed(cha)} to its attack rolls (minimum +1), it becomes magical, and it sheds Bright Light 20 ft plus Dim Light 20 ft. The effect ends if you stop holding/carrying it or fall Unconscious.`):rr("Oath of Devotion","With Attack action · Channel Divinity",`When taking the Attack action, imbue one held Melee weapon for 10 minutes. Add Charisma modifier ${signed(Math.max(1,cha))} to its attack rolls (minimum +1); on each hit choose its normal damage type or Radiant. It sheds Bright Light 20 ft plus Dim Light 20 ft.`),
      "Turn the Unholy":rr("Oath of Devotion","Action · Channel Divinity",`Fiends and Undead within 30 ft that can see or hear you make a Wisdom save. On a failure, they are turned for 1 minute or until damaged: they must move away, can't willingly approach within 30 ft, and can't take Reactions.`),
      "Ability Score Improvement":rr("Paladin","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunit${(c.class.asiLevels||[]).filter(level=>c.level>=level).length===1?"y is":"ies are"} already included in the ability scores.`),
      "Extra Attack":rr("Paladin","Attack action",`Attack ${p.attacksPerAction===2?"twice":p.attacksPerAction} instead of once when taking the Attack action.`),
      "Aura of Protection":rr("Paladin","Passive aura",c.ruleset==="2014"?`While conscious, you and friendly creatures within ${p.auraRange} ft add ${signed(aura)} to saving throws.`:`While not Incapacitated, you and allies in your ${p.auraRange}-ft Emanation add ${signed(aura)} to saving throws. A creature can benefit from only one Paladin's Aura of Protection at a time.`),
      "Aura of Devotion":rr("Oath of Devotion","Aura",c.ruleset==="2014"?`While conscious, you and friendly creatures within ${p.auraRange} ft can't be Charmed.`:`You and allies have Immunity to Charmed while in your Aura of Protection; Charmed has no effect on an ally while it remains there.`),
      "Aura of Courage":rr("Paladin","Aura",c.ruleset==="2014"?`While conscious, you and friendly creatures within ${p.auraRange} ft can't be Frightened.`:`You and allies have Immunity to Frightened while in your Aura of Protection; Frightened has no effect on an ally while it remains there.`),
      "Improved Divine Smite":rr("Paladin","Melee weapon hit","Every melee weapon hit deals +1d8 Radiant damage. This stacks with any Divine Smite used on the same hit."),
      "Cleansing Touch":rr("Paladin","Action",`Touch yourself or a willing creature to end one spell affecting it. ${p.cleansingTouchUses} uses per Long Rest.`),
      "Purity of Spirit":rr("Oath of Devotion","Passive","You are always under the effects of Protection from Evil and Good."),
      "Aura Improvements":rr("Paladin","Passive","Aura of Protection and Aura of Courage expand to 30 ft; Oath of Devotion's aura expands with Aura of Protection."),
      "Paladin’s Smite":rr("Paladin","Always prepared / free cast","Divine Smite is always prepared. Cast it once without spending a spell slot; regain that free casting after a Long Rest. You can also cast it normally with spell slots."),
      "Channel Divinity":rr("Paladin","Class resource",`${p.channelDivinityUses} uses. Divine Sense and subclass/Paladin Channel Divinity effects spend this resource. Regain one expended use after a Short Rest and all after a Long Rest.`),
      "Faithful Steed":rr("Paladin","Always prepared / free cast","Find Steed is always prepared. Cast it once without spending a spell slot; regain that free casting after a Long Rest. You can also cast it with spell slots."),
      "Abjure Foes":rr("Paladin","Magic action · Channel Divinity",`Target up to ${Math.max(1,cha)} creatures you can see within 60 ft. Wisdom save vs spell save DC; failure causes Frightened for 1 minute or until damaged. While Frightened this way, a target can only move, take an action, or take a Bonus Action on each turn.`),
      "Radiant Strikes":rr("Paladin","Melee hit","When you hit with a Melee weapon attack or Unarmed Strike, deal +1d8 Radiant damage."),
      "Restoring Touch":rr("Paladin","With Lay On Hands","Spend 5 Lay On Hands pool points per condition removed: Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned. Those points don't also restore HP."),
      "Smite of Protection":rr("Oath of Devotion","After casting Divine Smite","Until the start of your next turn, you and allies have Half Cover while in your Aura of Protection."),
      "Aura Expansion":rr("Paladin","Passive","Aura of Protection becomes a 30-ft Emanation; Aura of Courage and Aura of Devotion operate within that expanded aura."),
      "Epic Boon":rr("Paladin","Applied",`Your level-19 Epic Boon is ${c.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`),
      "Holy Nimbus":c.ruleset==="2014"?rr("Oath of Devotion","Action · 1/Long Rest",`For 1 minute, emit Bright Light 30 ft and Dim Light 30 ft farther. An enemy that starts its turn in the Bright Light takes 10 Radiant damage. You have Advantage on saving throws against spells cast by Fiends or Undead.`):rr("Oath of Devotion","Bonus Action",`Empower Aura of Protection for 10 minutes: Advantage on saves forced by Fiends or Undead; enemies starting their turn in the aura take Radiant damage equal to Charisma modifier ${signed(cha)} + Proficiency Bonus ${signed(c.proficiency)}; the aura is sunlight. One use per Long Rest, or restore it by spending a level-5 spell slot.`),
      "Weapon Mastery — Paladin":rr("Paladin","After Long Rest",`Use the mastery properties of ${p.masteryCount} chosen Simple or Martial weapons listed below. After a Long Rest, change the kinds of weapons chosen.`)
    };
    const ref=refs[name];if(!ref)throw new Error(`Missing Paladin play reference for ${name}.`);return ref;
  }catch(error){console.error(`[paladin-reference] feature ${name} failed`,error);throw error;}
}
function styleReference(c,style){
  try{
    if(style.id==="blessed-warrior"){const names=clericCantripNames(c.spells?.cantrips?.all||[]);return rr("Fighting Style","Cantrips",`Learn two Cleric cantrips as Paladin spells using Charisma: ${names.join(", ")||"two legal Cleric cantrips"}. Whenever you gain a Paladin level, replace one with another Cleric cantrip.`);}
    const rules=c.ruleset==="2014"?REFERENCE_2014:REFERENCE_2024,ref=rules.style?.[style.name];if(ref)return ref;
    if(style.id==="dueling")return rr("Fighting Style","Passive","While wielding a melee weapon in one hand and no other weapons, gain +2 to damage rolls with it; already included in qualifying attack damage on this sheet.");
    if(style.id==="protection")return rr("Fighting Style","Reaction","While wielding a shield, when a creature you can see attacks a target other than you within 5 ft, impose Disadvantage on that attack roll.");
    throw new Error(`Missing Paladin Fighting Style reference for ${style.name}.`);
  }catch(error){console.error("[paladin-reference] style reference failed",error);throw error;}
}
function boonReference(c){return rr("Epic Boon","Passive",`The +1 ${pretty(c.epicBoonAbility)} increase and maximum of 30 are already applied. You have Truesight out to 60 ft.`);}
function masteryEntries(c){
  try{if(c.ruleset!=="2024")return[];return(c.masteryIds||[]).map(weaponId=>{const weapon=RAW_2024.weapons[weaponId];if(!weapon?.mastery)throw new Error(`Missing Paladin mastery data for ${weaponId}.`);const ref=MASTERY_REFERENCE[weapon.mastery];if(!ref)throw new Error(`Missing mastery reference for ${weapon.mastery}.`);const name=`${weapon.name} — ${weapon.mastery}`;return{id:`mastery:${weaponId}`,name,...ref,source:referenceProvenance(c,"mastery",name)};});}
  catch(error){console.error("[paladin-reference] mastery build failed",error);throw error;}
}
function clericCantripNames(ids){
  try{const byId=new Map(clericSpellsFor("2024").filter(spell=>spell.level===0).map(spell=>[spell.id,spell.name]));return ids.map(id=>{const name=byId.get(id);if(!name)throw new Error(`Unknown Blessed Warrior cantrip ${id}.`);return name;});}
  catch(error){console.error("[paladin-reference] Blessed Warrior cantrip labels failed",error);throw error;}
}
function entry(c,id,name,ref,kind){return{id,name,...ref,source:paladinReferenceProvenance(c,kind,name)};}
function rr(category,timing,text){return{category,timing,text};}
function signed(value){return Number(value)>=0?`+${value}`:`${value}`;}
function pretty(value){return String(value||"").replace(/^./,char=>char.toUpperCase());}
