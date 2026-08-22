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
function dynamicFeat(character,feat){try{if(feat.id==="boon-irresistible-offense")return{category:"Epic Boon",timing:"Passive / on natural 20",text:"STR is increased by 1 in the generated scores. Your Bludgeoning, Piercing, and Slashing damage ignores Resistance; on an attack-roll natural 20, deal extra damage equal to the ability score this boon increased."};return null;}catch(error){console.error("[reference] dynamic feat failed",error);throw error;}}
function dynamicFeature(character,name){
  try{
    if(character.class.id==="barbarian")return barbarianReference(character,name);
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
    if(name==="Epic Boon")return{category:"Barbarian",timing:"Level 19",text:"Character Forge selected the SRD-recommended Boon of Irresistible Offense; its separate feat reference is included on this sheet."};
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
