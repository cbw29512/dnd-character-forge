import { REFERENCE_2014, REFERENCE_2024, MASTERY_REFERENCE } from "../data/quick-reference.js";
import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { abilityMod } from "./math.js";

const dataFor=ruleset=>ruleset==="2014"?RAW_2014:RAW_2024,refsFor=ruleset=>ruleset==="2014"?REFERENCE_2014:REFERENCE_2024;
export function buildQuickReference(character){
  try{
    const rules=refsFor(character.ruleset),items=[];
    for(const trait of character.species.traits||[])push(items,`species:${trait}`,trait,required(rules.species?.[trait],trait));
    if(character.background.feature)push(items,`background:${character.background.feature}`,character.background.feature,required(rules.background?.[character.background.feature],character.background.feature));
    for(const feat of character.feats||[])push(items,`feat:${feat.id}`,feat.name,dynamicFeat(character,feat)||required(rules.feat?.[feat.name],feat.name));
    if(character.fightingStyle)push(items,`style:${character.fightingStyle.name}`,character.fightingStyle.name,required(rules.style?.[character.fightingStyle.name],character.fightingStyle.name));
    for(const name of character.features||[]){if(name==="Fighting Style"||name.startsWith("Fighting Style:"))continue;push(items,`feature:${name}`,name,dynamicFeature(character,name)||required(rules.feature?.[name],name));}
    for(const mastery of masteryEntries(character))push(items,`mastery:${mastery.weaponId}`,`${mastery.weaponName} — ${mastery.property}`,required(MASTERY_REFERENCE[mastery.property],mastery.property));
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate quick-reference entries detected.");return items;
  }catch(error){console.error("[reference] build failed",error);throw error;}
}
export function masteryEntries(character){try{if(character.ruleset!=="2024"||!character.masteryIds?.length)return[];const data=dataFor(character.ruleset);return character.masteryIds.map(weaponId=>{const weapon=data.weapons[weaponId];if(!weapon)throw new Error(`Unknown mastery weapon ${weaponId}.`);if(!weapon.mastery)throw new Error(`${weapon.name} is missing its Weapon Mastery property.`);if(!MASTERY_REFERENCE[weapon.mastery])throw new Error(`Missing quick reference for ${weapon.mastery}.`);return{weaponId,weaponName:weapon.name,property:weapon.mastery};});}catch(error){console.error("[reference] mastery lookup failed",error);throw error;}}
function dynamicFeat(){return null;}
function dynamicFeature(character,name){
  try{
    if(character.class.id==="barbarian")return barbarianReference(character,name);
    if(character.class.id==="rogue")return rogueReference(character,name);
    if(name==="Spellcasting")return spellcasting(character);
    if(name==="Second Wind")return secondWind(character);
    if(name==="Weapon Mastery")return{category:"Fighter",timing:"Passive",text:`Use the mastery properties for ${character.masteryIds.length} chosen weapons listed below. After a Long Rest, you can change one chosen weapon.`};
    if(name==="Tactical Shift")return{category:"Fighter",timing:"With Second Wind",text:`After using Second Wind as a Bonus Action, move up to ${Math.floor(character.speed/2)} ft without provoking Opportunity Attacks.`};
    if(name==="Arcane Recovery")return arcaneRecovery(character);
    if(name==="Scholar")return{category:"Wizard",timing:"Passive",text:`Expertise is already applied to ${pretty(character.expertise[0])}.`};
    if(name==="Channel Divinity: Preserve Life"||name==="Preserve Life")return preserveLife(character);
    if(name==="Sear Undead")return searUndead(character);
    return null;
  }catch(error){console.error(`[reference] dynamic ${name} failed`,error);throw error;}
}
function rogueReference(character,name){
  try{
    const old=character.ruleset==="2014",sneak=Object.fromEntries((character.classResources||[]).map(item=>[item.id,item.value]))["sneak-attack"],dc=8+character.proficiency+abilityMod(character.abilities.dex);
    const common={
      "Expertise":{category:"Rogue",timing:"Passive",text:`Expertise is already applied to ${character.expertise.map(pretty).join(", ")}; those checks add double Proficiency Bonus.`},
      "Sneak Attack":{category:"Rogue",timing:"Once per turn",text:`Deal ${sneak} extra damage on one qualifying Finesse or Ranged weapon hit when you have Advantage, or when the edition-specific adjacent-ally condition is met and you don't have Disadvantage.`},
      "Thieves' Cant":{category:"Rogue",timing:"Language",text:old?"You know the secret Rogue cant used to hide messages in ordinary conversation and recognize its signs.":"Thieves' Cant and the additional Rogue language are already included in Languages."},
      "Cunning Action":{category:"Rogue",timing:"Bonus Action",text:"Take Dash, Disengage, or Hide as a Bonus Action on your turn."},
      "Uncanny Dodge":{category:"Rogue",timing:"Reaction",text:"When an attacker you can see hits you with an attack roll, halve that attack's damage against you."},
      "Evasion":{category:"Rogue",timing:"Dexterity save",text:old?"On an effect that normally deals half damage on a successful Dexterity save, take no damage on a success and half on a failure.":"On an effect that normally deals half damage on a successful Dexterity save, take no damage on a success and half on a failure; unavailable while Incapacitated."},
      "Reliable Talent":{category:"Rogue",timing:"Proficient ability check",text:old?"For an ability check that adds your Proficiency Bonus, treat a d20 roll of 9 or lower as 10.":"For an ability check using a skill or tool proficiency, treat a d20 roll of 9 or lower as 10."},
      "Slippery Mind":{category:"Rogue",timing:"Passive",text:old?"Wisdom saving throw proficiency is already included in Saving Throws.":"Wisdom and Charisma saving throw proficiencies are already included in Saving Throws."},
      "Elusive":{category:"Rogue",timing:"Passive",text:old?"While you aren't Incapacitated, no attack roll can have Advantage against you.":"No attack roll can have Advantage against you unless you have the Incapacitated condition."},
      "Stroke of Luck":{category:"Rogue",timing:old?"Miss or failed check":"Failed D20 Test",text:old?"Turn one missed attack into a hit, or treat a failed ability-check d20 as 20. One use; regain after a Short or Long Rest.":"Turn a failed D20 Test into a 20. One use; regain after a Short or Long Rest."},
      "Fast Hands":{category:"Thief",timing:"Bonus Action",text:old?"Use Cunning Action for Sleight of Hand, Thieves' Tools to disarm a trap/open a lock, or Use an Object.":"As a Bonus Action, make the specified Sleight of Hand/Thieves' Tools check, take Utilize, or take the Magic action to use a magic item requiring that action."},
      "Second-Story Work":{category:"Thief",timing:"Movement",text:old?"Climbing no longer costs extra movement; running jump distance increases by your DEX modifier in feet.":"You have a Climb Speed equal to your Speed and can determine jump distance using Dexterity instead of Strength."},
      "Use Magic Device":{category:"Thief",timing:"Magic items",text:old?"Ignore class, race, and level requirements for using magic items.":"Attune to up to four magic items; on a 6 on 1d6, a charged property spends no charge; use any Spell Scroll with Intelligence, with an Arcana check of DC 10 + spell level for level 2+ scrolls."},
      "Thief's Reflexes":{category:"Thief",timing:"First combat round",text:old?"Take two turns in round one, at normal Initiative and Initiative −10; unavailable while surprised.":"Take two turns in round one, at normal Initiative and Initiative −10."}
    };
    if(common[name])return common[name];
    if(name==="Weapon Mastery")return{category:"Rogue",timing:"Passive",text:`Use the mastery properties for ${character.masteryIds.length} proficient weapon choices listed below; choices can change after a Long Rest.`};
    if(name==="Steady Aim")return{category:"Rogue",timing:"Bonus Action",text:"If you haven't moved this turn, gain Advantage on your next attack this turn; after using it, your Speed is 0 until the turn ends."};
    if(name==="Cunning Strike")return{category:"Rogue",timing:"With Sneak Attack",text:`Forgo Sneak Attack dice for an effect (save DC ${dc}): Poison costs 1d6 and requires a Poisoner's Kit; Trip costs 1d6; Withdraw costs 1d6 and moves you up to half Speed without Opportunity Attacks.`};
    if(name==="Improved Cunning Strike")return{category:"Rogue",timing:"With Sneak Attack",text:"Use up to two Cunning Strike effects on the same Sneak Attack, paying each effect's die cost."};
    if(name==="Devious Strikes")return{category:"Rogue",timing:"With Sneak Attack",text:`Additional Cunning Strike choices (save DC ${dc}): Daze costs 2d6, Obscure costs 3d6, and Knock Out costs 6d6.`};
    if(name==="Blindsense")return{category:"Rogue",timing:"Passive",text:"If you can hear, you know the location of hidden or invisible creatures within 10 feet of you."};
    if(name==="Supreme Sneak")return{category:"Thief",timing:old?"Stealth":"Cunning Strike",text:old?"You have Advantage on Dexterity (Stealth) checks if you move no more than half your Speed on the same turn.":"Stealth Attack costs 1d6 Sneak Attack damage; when attacking from the Hide action's Invisible condition, the attack need not end it if you finish the turn behind Three-Quarters or Total Cover."};
    if(name==="Roguish Archetype"||name==="Rogue Subclass")return{category:"Rogue",timing:"Level 3",text:"Thief is the SRD subclass used by this generated Rogue."};
    return null;
  }catch(error){console.error(`[reference] Rogue ${name} failed`,error);throw error;}
}
function barbarianReference(character,name){
  try{
    const old=character.ruleset==="2014",rage=Object.fromEntries((character.classResources||[]).map(item=>[item.id,item.value]));
    const common={
      "Unarmored Defense":{category:"Barbarian",timing:"Passive",text:"Without armor, AC is 10 + DEX modifier + CON modifier. A shield is allowed."},
      "Reckless Attack":{category:"Barbarian",timing:"First attack on your turn",text:old?"Choose to gain Advantage on Strength-based melee weapon attacks this turn; attacks against you have Advantage until your next turn.":"Choose to gain Advantage on Strength-based attacks until your next turn; attacks against you have Advantage for the same period."},
      "Danger Sense":{category:"Barbarian",timing:"Dexterity saves",text:old?"Advantage on Dexterity saves against effects you can see while not blinded, deafened, or incapacitated.":"Advantage on Dexterity saving throws while you are not Incapacitated."},
      "Extra Attack":{category:"Barbarian",timing:"Attack action",text:"Attack twice instead of once when you take the Attack action."},
      "Fast Movement":{category:"Barbarian",timing:"Passive",text:"Speed is increased by 10 ft while not wearing Heavy armor; the printed Speed already includes this."},
      "Feral Instinct":{category:"Barbarian",timing:"Initiative",text:old?"Advantage on Initiative. If surprised and able to act, you can act on turn one if Rage is the first thing you do.":"Advantage on Initiative rolls."},
      "Relentless Rage":{category:"Barbarian",timing:"When Rage would leave you at 0 HP",text:old?"Make a DC 10 CON save; on success, drop to 1 HP instead. Each later use before a Short or Long Rest raises the DC by 5.":`Make a DC 10 CON save; on success, HP becomes ${character.level*2}. Each later use before a Short or Long Rest raises the DC by 5.`},
      "Indomitable Might":{category:"Barbarian",timing:"Strength test",text:old?"If a Strength check total is below your Strength score, use the score instead.":"If a Strength check or Strength save total is below your Strength score, use the score instead."},
      "Primal Champion":{category:"Barbarian",timing:"Passive",text:old?"STR and CON each increase by 4, with a maximum of 24; these increases are already applied.":"STR and CON each increase by 4, with a maximum of 25; these increases are already applied."},
      "Frenzy":{category:"Berserker",timing:"While raging",text:old?"When entering Rage, you may frenzy. Starting on later turns of that Rage, make one melee weapon attack as a Bonus Action; when the Rage ends, gain one Exhaustion level.":`When Reckless Attack is used during Rage, the first Strength-based hit that turn deals ${rage["rage-damage"]?.replace("+","")||2}d6 extra damage of the attack's type.`},
      "Mindless Rage":{category:"Berserker",timing:"While raging",text:old?"You can't be charmed or frightened while raging; an existing such effect is suspended for the Rage.":"You are immune to Charmed and Frightened while raging; entering Rage ends either condition on you."},
      "Retaliation":{category:"Berserker",timing:"Reaction",text:"When a creature within 5 ft damages you, make one melee attack against it."}
    };
    if(common[name])return common[name];
    if(name==="Rage")return{category:"Barbarian",timing:"Bonus Action",text:old?`You have ${rage["rage-uses"]} Rages per Long Rest. While raging without Heavy armor: Advantage on STR checks/saves, +${rage["rage-damage"]?.replace("+","")} damage on qualifying Strength melee weapon attacks, and resistance to Bludgeoning/Piercing/Slashing. You can't cast or concentrate on spells.`:`You have ${rage["rage-uses"]} Rages. Enter as a Bonus Action without Heavy armor. Gain STR check/save Advantage, ${rage["rage-damage"]} damage on qualifying Strength attacks, and Bludgeoning/Piercing/Slashing resistance; no spells or Concentration. Regain one use on Short Rest and all on Long Rest.`};
    if(name==="Weapon Mastery")return{category:"Barbarian",timing:"Passive",text:`Use the mastery properties for ${character.masteryIds.length} chosen Simple or Martial melee weapons listed below; after a Long Rest, you can change one choice.`};
    if(name==="Primal Knowledge")return{category:"Barbarian",timing:"Passive / while raging",text:"One extra Barbarian skill proficiency is already applied. During Rage, Acrobatics, Intimidation, Perception, Stealth, or Survival checks can use Strength instead of their normal ability."};
    if(name==="Instinctive Pounce")return{category:"Barbarian",timing:"With Rage Bonus Action",text:`When you enter Rage, you can move up to ${Math.floor(character.speed/2)} ft as part of that Bonus Action.`};
    if(name.startsWith("Brutal Critical")){const dice=name.includes("3")?3:name.includes("2")?2:1;return{category:"Barbarian",timing:"Melee critical hit",text:`Roll ${dice} additional weapon damage ${dice===1?"die":"dice"} when determining the critical hit's extra damage.`};}
    if(name==="Brutal Strike")return{category:"Barbarian",timing:"With Reckless Attack",text:"Forgo Reckless Attack Advantage on one eligible Strength attack; on hit, deal +1d10 weapon-type damage and choose Forceful Blow or Hamstring Blow."};
    if(name==="Improved Brutal Strike")return{category:"Barbarian",timing:"With Brutal Strike",text:character.level>=17?"Brutal Strike deals +2d10 and can apply two different Brutal Strike effects.":"Brutal Strike gains Staggering Blow and Sundering Blow as additional effect choices."};
    if(name==="Persistent Rage")return{category:"Barbarian",timing:"Rage / Initiative",text:old?"Rage ends early only if you fall unconscious or choose to end it.":"Once per Long Rest when rolling Initiative, regain all expended Rages. Rage lasts up to 10 minutes without round-by-round extension and has narrower early-ending conditions."};
    if(name==="Intimidating Presence")return{category:"Berserker",timing:old?"Action":"Bonus Action",text:old?`Choose a creature you can see within 30 ft; WIS save DC ${8+character.proficiency+abilityMod(character.abilities.cha)} or Frightened until the end of your next turn, with Action-based extension.`:`Creatures of your choice in a 30-ft Emanation make WIS saves against DC ${8+character.proficiency+abilityMod(character.abilities.str)} or become Frightened for up to 1 minute. One free use per Long Rest; expend a Rage use to restore it.`};
    if(name==="Ability Score Improvement")return{category:"Barbarian",timing:"Level progression",text:"Character Forge selected the repeatable RAW Ability Score Improvement option and already applied it to the generated ability scores."};
    if(name==="Epic Boon")return{category:"Barbarian",timing:"Level 19",text:"Character Forge selected an eligible SRD Epic Boon; its separate feat reference is included on this sheet."};
    if(name==="Primal Path"||name==="Barbarian Subclass")return{category:"Barbarian",timing:"Level 3",text:"Path of the Berserker is the SRD subclass used by this generated Barbarian."};
    return null;
  }catch(error){console.error(`[reference] Barbarian ${name} failed`,error);throw error;}
}
function spellcasting(character){try{const base="Use the spell section above for save DC, attack bonus, slots, and prepared spells. Expended spell slots return after a Long Rest.";if(character.ruleset==="2014"&&character.class.id==="wizard")return{category:"Wizard",timing:"Magic / Ritual",text:`${base} A Ritual-tag spell in your spellbook can be cast as a Ritual without being prepared.`};if(character.ruleset==="2014"&&character.class.id==="cleric")return{category:"Cleric",timing:"Magic / Ritual",text:`${base} A prepared Cleric spell with the Ritual tag can be cast as a Ritual.`};if(character.ruleset==="2024"&&character.class.id==="wizard")return{category:"Wizard",timing:"Magic",text:`${base} After a Long Rest, you can replace prepared level 1+ spells with legal spells from your spellbook; Ritual Adept is listed separately.`};return{category:"Cleric",timing:"Magic",text:`${base} After a Long Rest, you can replace prepared level 1+ spells with other Cleric spells for which you have slots.`};}catch(error){console.error("[reference] spellcasting failed",error);throw error;}}
function secondWind(character){const healing=`1d10 + ${character.level} HP`;if(character.ruleset==="2014")return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. One use; regain it after a Short or Long Rest.`};const uses=character.level>=4?3:2;return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. ${uses} uses; regain one after a Short Rest and all after a Long Rest.`};}
function arcaneRecovery(character){const levels=Math.ceil(character.level/2),limit=`up to ${levels} total spell-slot level${levels===1?"":"s"}`;return character.ruleset==="2014"?{category:"Wizard",timing:"After Short Rest",text:`Once per day, recover expended slots totaling ${limit}; none can be level 6+.`}:{category:"Wizard",timing:"After Short Rest",text:`Recover expended slots totaling ${limit}; none can be level 6+. Once used, it returns after a Long Rest.`};}
function preserveLife(character){const pool=5*character.level;if(character.ruleset==="2014")return{category:"Life Domain",timing:"Action · Channel Divinity",text:`Distribute up to ${pool} HP among creatures within 30 ft, but no creature can be healed above half its maximum. It has no effect on Undead or Constructs.`};return{category:"Life Domain",timing:"Magic action · Channel Divinity",text:`Distribute up to ${pool} HP among Bloodied creatures within 30 ft, including yourself, but no creature can be healed above half its maximum.`};}
function searUndead(character){const dice=Math.max(1,abilityMod(character.abilities.wis));return{category:"Cleric",timing:"With Turn Undead",text:`Roll ${dice}d8. Each Undead that fails its Turn Undead save takes that much Radiant damage; this damage does not end the turning effect.`};}
function push(items,id,name,entry){items.push({id,name,...entry});}function required(entry,name){if(!entry)throw new Error(`Missing quick reference for ${name}.`);return entry;}function pretty(value){return String(value||"the chosen skill").replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}
