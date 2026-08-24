import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { monkReferenceProvenance } from "../data/monk-provenance.js";
import { monkSaveDc, monkWholenessUses } from "./monk.js";
import { abilityMod } from "./math.js";

export function buildMonkQuickReference(character){
  try{
    if(character?.class?.id!=="monk")throw new Error("Monk reference builder received another class.");
    const safe={...character,features:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-irresistible-offense")};
    const items=[...buildCoreQuickReference(safe)],boon=(character.feats||[]).find(feat=>feat.id==="boon-irresistible-offense");
    if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[])items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Monk quick-reference entries detected.");return items;
  }catch(error){console.error("[monk-reference] build failed",error);throw error;}
}

function featureReference(c,name){
  try{
    const p=c.monk,dc=monkSaveDc(c),wis=abilityMod(c.abilities.wis),refs=c.ruleset==="2014"?legacy(c,p,dc):revised(c,p,dc,wis),ref=refs[name];
    if(!ref)throw new Error(`Missing Monk play reference for ${name}.`);return ref;
  }catch(error){console.error(`[monk-reference] feature ${name} failed`,error);throw error;}
}

function shared(c,p,dc){
  try{return{
    "Unarmored Defense":rr("Monk","Passive",`While unarmored and not using a shield, AC is 10 + Dexterity + Wisdom; this sheet calculates ${c.ac}.`),
    "Martial Arts":rr("Monk","Attack / Bonus Action",`Unarmed Strikes and legal Monk weapons use Dexterity when better and can use your ${p.martialArtsDie} Martial Arts die. Your edition's Bonus Action Unarmed Strike timing applies.`),
    "Unarmored Movement":rr("Monk","Passive",`While unarmored and not using a shield, Speed increases by ${p.unarmoredMovementBonus} ft.`),
    "Ability Score Improvement":rr("Monk","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunities are already reflected in the ability scores.`),
    "Slow Fall":rr("Monk","Reaction",`When you fall, reduce the falling damage you take by ${5*c.level}.`),
    "Extra Attack":rr("Monk","Attack action",`Attack ${p.attacksPerAction} times whenever you take the Attack action on your turn.`),
    "Evasion":rr("Monk","Dexterity save","For effects that deal half damage on a successful Dexterity save, take no damage on a success and half on a failure, subject to your edition's incapacitation wording."),
    "Unarmored Movement Improvement":rr("Monk","Movement","While eligible for Unarmored Movement, you can move along vertical surfaces and across liquids during your turn without falling during that movement."),
    "Open Hand Technique":openHand(c,dc),
    "Wholeness of Body":wholeness(c,p),
    "Quivering Palm":quivering(c,p,dc)
  };}catch(error){console.error("[monk-reference] shared references failed",error);throw error;}
}

function legacy(c,p,dc){
  try{return{...shared(c,p,dc),
    Ki:rr("Monk","Resource",`${p.resourcePoints} Ki. Regain all after a Short or Long Rest after at least 30 minutes meditating. Ki save DC ${dc}. Flurry, Patient Defense, and Step of the Wind each cost 1 Ki.`),
    "Monastic Tradition":rr("Monk","Subclass","Way of the Open Hand grants features at Monk levels 3, 6, 11, and 17."),
    "Deflect Missiles":rr("Monk","Reaction","Reduce ranged weapon damage by 1d10 + Dexterity modifier + Monk level. If reduced to 0, you can catch the missile and spend 1 Ki to make the feature's return attack."),
    "Stunning Strike":rr("Monk","On hit",`When you hit with a melee weapon attack, spend 1 Ki; the target makes a Constitution save (DC ${dc}) or is Stunned until the end of your next turn.`),
    "Ki-Empowered Strikes":rr("Monk","Passive","Your Unarmed Strikes count as magical for overcoming resistance and immunity to nonmagical attacks and damage."),
    "Stillness of Mind":rr("Monk","Action","Use your action to end one effect on yourself causing Charmed or Frightened."),
    "Purity of Body":rr("Monk","Passive","You are immune to disease and poison."),
    "Tongue of the Sun and Moon":rr("Monk","Communication","You understand all spoken languages, and any creature that understands a language can understand what you say."),
    "Diamond Soul":rr("Monk","Saving throws",`You are proficient in all saving throws. After a failed save, spend 1 Ki to reroll and use the second result.`),
    "Timeless Body":rr("Monk","Passive","You suffer none of the frailty of old age, can't be magically aged, and no longer need food or water; you can still die of old age."),
    "Empty Body":rr("Monk","Action","Spend 4 Ki to become invisible for 1 minute and gain resistance to all damage except Force. Spend 8 Ki to cast Astral Projection on yourself without material components."),
    "Perfect Self":rr("Monk","Roll Initiative","If you roll Initiative with 0 Ki, regain 4 Ki."),
    Tranquility:rr("Open Hand","After Long Rest",`Gain Sanctuary after a Long Rest until the next Long Rest or until the spell ends normally; its save DC is ${dc}.`)
  };}catch(error){console.error("[monk-reference] 2014 references failed",error);throw error;}
}

function revised(c,p,dc,wis){
  try{return{...shared(c,p,dc),
    "Monk's Focus":rr("Monk","Resource",`${p.resourcePoints} Focus Points; regain all after a Short or Long Rest. Save DC ${dc}. Flurry costs 1 Focus for two Unarmed Strikes; Patient Defense and Step of the Wind also have no-cost and 1-Focus modes.`),
    "Uncanny Metabolism":rr("Monk","Roll Initiative",`Once per Long Rest when Initiative is rolled, regain all Focus and regain HP equal to Monk level + one ${p.martialArtsDie}.`),
    "Monk Subclass":rr("Monk","Subclass","Warrior of the Open Hand grants features at Monk levels 3, 6, 11, and 17."),
    "Deflect Attacks":rr("Monk","Reaction",`Against a hit dealing Bludgeoning, Piercing, or Slashing damage, reduce total damage by 1d10 + Dexterity modifier + Monk level. If reduced to 0, spend 1 Focus to redirect for 2${p.martialArtsDie} + Dexterity modifier damage on a failed Dexterity save (DC ${dc}).`),
    "Stunning Strike":rr("Monk","Once per turn on hit",`Spend 1 Focus after an Unarmed Strike or Monk-weapon hit. Constitution save DC ${dc}: failed = Stunned until your next turn starts; successful = Speed halved and the next attack against the target before then has Advantage.`),
    "Empowered Strikes":rr("Monk","Damage choice","Your Unarmed Strike can deal Force damage instead of its normal damage type."),
    "Acrobatic Movement":rr("Monk","Movement","While unarmored and not using a shield, move along vertical surfaces and across liquids on your turn without falling during the movement."),
    "Heightened Focus":rr("Monk","Focus upgrade",`Flurry makes three Unarmed Strikes for 1 Focus; paid Patient Defense grants 2${p.martialArtsDie} Temporary HP; paid Step of the Wind can carry one willing Large-or-smaller creature within 5 ft without provoking Opportunity Attacks.`),
    "Self-Restoration":rr("Monk","End of turn","End Charmed, Frightened, or Poisoned on yourself at the end of each turn. Forgoing food and drink doesn't give you Exhaustion."),
    "Deflect Energy":rr("Monk","Reaction upgrade","Deflect Attacks now works against attacks dealing any damage type."),
    "Disciplined Survivor":rr("Monk","Saving throws","You are proficient in all saving throws. After a failed save, spend 1 Focus to reroll and use the new roll."),
    "Perfect Focus":rr("Monk","Roll Initiative","If you have 3 or fewer Focus and don't use Uncanny Metabolism, regain expended Focus until you have 4."),
    "Superior Defense":rr("Monk","Start of turn","Spend 3 Focus to gain resistance to all damage except Force for 1 minute or until Incapacitated."),
    "Epic Boon":rr("Monk","Applied",`Your level-19 Epic Boon is ${c.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`),
    "Body and Mind":rr("Monk","Applied",`Dexterity and Wisdom each increase by 4 to a maximum of 25; this sheet has already applied the increases.`),
    "Fleet Step":rr("Open Hand","After another Bonus Action","After taking a Bonus Action other than Step of the Wind, you can also use Step of the Wind immediately afterward.")
  };}catch(error){console.error("[monk-reference] 2024 references failed",error);throw error;}
}

function openHand(c,dc){
  try{return c.ruleset==="2014"?rr("Open Hand","Flurry hit",`On a Flurry of Blows hit, choose one: Dexterity save DC ${dc} or Prone; Strength save DC ${dc} or push up to 15 ft; or the target can't take Reactions until the end of your next turn.`):rr("Open Hand","Flurry hit",`On a Flurry of Blows hit, choose one: Addle prevents Opportunity Attacks until its next turn; Push requires Strength save DC ${dc} or moves it up to 15 ft; Topple requires Dexterity save DC ${dc} or Prone.`);}catch(error){console.error("[monk-reference] Open Hand reference failed",error);throw error;}
}
function wholeness(c,p){
  try{return c.ruleset==="2014"?rr("Open Hand","Action","Regain HP equal to three times Monk level; once per Long Rest."):rr("Open Hand","Bonus Action",`Roll ${p.martialArtsDie} and regain that result + Wisdom modifier HP, minimum 1. ${monkWholenessUses(c)} use${monkWholenessUses(c)===1?"":"s"} per Long Rest.`);}catch(error){console.error("[monk-reference] Wholeness reference failed",error);throw error;}
}
function quivering(c,p,dc){
  try{return c.ruleset==="2014"?rr("Open Hand","3 Ki + later Action",`After an Unarmed Strike hit, spend 3 Ki to seed vibrations for ${c.level} days. Later, while on the same plane, use an action: Constitution save DC ${dc}; fail = 0 HP, success = 10d10 Necrotic. One creature can be seeded at a time.`):rr("Open Hand","4 Focus + later end",`After an Unarmed Strike hit, spend 4 Focus to seed vibrations for ${c.level} days. End them with an action or by forgoing one Attack-action attack while on the same plane: Constitution save DC ${dc}; fail = 10d12 Force, success = half. One creature can be seeded at a time.`);}catch(error){console.error("[monk-reference] Quivering Palm reference failed",error);throw error;}
}
function boonReference(c){
  try{return rr("Epic Boon","Passive / roll of 20",`The +1 ${pretty(c.epicBoonAbility)} increase and maximum of 30 are already applied. Your Bludgeoning, Piercing, and Slashing damage ignores Resistance. On an attack-roll d20 result of 20, deal extra damage equal to the ability score increased by this feat.`);}catch(error){console.error("[monk-reference] boon reference failed",error);throw error;}
}
function entry(c,id,name,ref,kind){try{return{id,name,...ref,source:monkReferenceProvenance(c,kind,name)};}catch(error){console.error(`[monk-reference] entry ${name} failed`,error);throw error;}}
function rr(category,timing,text){return{category,timing,text};}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase()).trim();}
