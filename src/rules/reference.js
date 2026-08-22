import { buildQuickReference as buildLegacyReference, masteryEntries } from "./reference-legacy.js";
import { abilityMod } from "./math.js";
import { monkFlurryStrikes, monkProgression, monkSaveDC } from "./monk.js";

export { masteryEntries };

export function buildQuickReference(character){
  try{
    if(character.class?.id!=="monk")return buildLegacyReference(character);
    const base=buildLegacyReference({...character,features:[]}),features=(character.features||[]).map(name=>({id:`feature:${name}`,name,...required(monkReference(character,name),name)})),items=[...base,...features],ids=items.map(item=>item.id);
    if(new Set(ids).size!==ids.length)throw new Error("Duplicate quick-reference entries detected.");
    return items;
  }catch(error){console.error("[reference] build failed",error);throw error;}
}

function monkReference(character,name){
  try{
    const old=character.ruleset==="2014",row=monkProgression(character.ruleset,character.level),wis=abilityMod(character.abilities.wis),dc=monkSaveDC(wis,character.proficiency),flurry=monkFlurryStrikes(character.ruleset,character.level),focus=row.focusPoints;
    const shared={
      "Unarmored Defense":ref("Monk","Passive",`While wearing no armor and using no shield, AC is 10 + DEX modifier + WIS modifier; the generated AC already applies this.`),
      "Martial Arts":ref("Monk","Attack / Bonus Action",`Your Martial Arts die is ${row.martialArts}. The generated Monk weapon and Unarmed Strike attacks use Dexterity. After attacking with an eligible Monk weapon or Unarmed Strike, you can make one Unarmed Strike as a Bonus Action when the edition requirements are met.`),
      "Unarmored Movement":ref("Monk","Passive",`While unarmored and using no shield, your movement bonus is +${row.unarmoredMovement} ft; the printed Speed already includes it.`),
      "Slow Fall":ref("Monk","Reaction",`Reduce falling damage by ${character.level*5} when the feature's trigger is met.`),
      "Extra Attack":ref("Monk","Attack action","Attack twice instead of once when you take the Attack action."),
      "Evasion":ref("Monk","Dexterity save",old?"On an effect that normally deals half damage on a successful Dexterity save, take no damage on a success and half on a failure.":"On an effect that normally deals half damage on a successful Dexterity save, take no damage on a success and half on a failure; unavailable while Incapacitated."),
      "Open Hand Technique":ref("Open Hand","With Flurry of Blows",old?`When a Flurry attack hits, choose one Open Hand effect: DEX save DC ${dc} or fall Prone; STR save DC ${dc} or be pushed up to 15 ft; or the target can't take Reactions until the end of your next turn.`:`When a Flurry Unarmed Strike hits, choose one effect: Addle prevents Opportunity Attacks until the start of the target's next turn; Push requires STR save DC ${dc} or moves it up to 15 ft; Topple requires DEX save DC ${dc} or knocks it Prone.`),
      "Wholeness of Body":ref("Open Hand",old?"Action":"Bonus Action",old?`Once per Long Rest, regain ${character.level*3} HP.`:`Regain ${row.martialArts} + ${Math.max(1,wis)} HP. You can use this ${Math.max(1,wis)} time${Math.max(1,wis)===1?"":"s"} per Long Rest.`),
      "Quivering Palm":ref("Open Hand","After an Unarmed Strike",old?`Spend 3 Ki after hitting to start vibrations. Later, use an Action to end them: CON save DC ${dc}; failure reduces the creature to 0 HP, success deals 10d10 Necrotic damage.`:`Spend 4 Focus after hitting to start vibrations. Later, as an Action or by replacing an attack, end them: CON save DC ${dc}; failure takes 10d12 Force damage, success takes half.`)
    };
    if(shared[name])return shared[name];
    if(old)return monk2014(character,name,{row,dc,focus});
    return monk2024(character,name,{row,dc,focus,flurry,wis});
  }catch(error){console.error(`[reference] Monk ${name} failed`,error);throw error;}
}

function monk2014(character,name,{row,dc,focus}){
  const entries={
    "Ki":ref("Monk","Resource",`You have ${focus} Ki points. Your Ki save DC is ${dc}. Spend Ki on Flurry of Blows, Patient Defense, Step of the Wind, and later Monk features; regain spent Ki after the RAW rest requirement.`),
    "Deflect Missiles":ref("Monk","Reaction",`When hit by a ranged weapon attack, reduce its damage by 1d10 + ${abilityMod(character.abilities.dex)} + ${character.level}. If reduced to 0, you can spend 1 Ki to make the feature's return attack when eligible.`),
    "Stunning Strike":ref("Monk","On melee weapon hit",`Spend 1 Ki after hitting; the target makes a CON save DC ${dc} or is Stunned until the end of your next turn.`),
    "Ki-Empowered Strikes":ref("Monk","Passive","Your Unarmed Strikes count as magical for overcoming resistance and immunity to nonmagical attacks and damage."),
    "Stillness of Mind":ref("Monk","Action","Use your Action to end one effect on yourself that is causing you to be Charmed or Frightened."),
    "Unarmored Movement Improvement":ref("Monk","Movement","While using Unarmored Movement, you can move along vertical surfaces and across liquids on your turn without falling during the move."),
    "Purity of Body":ref("Monk","Passive","You are immune to disease and poison."),
    "Tongue of the Sun and Moon":ref("Monk","Communication","You understand all spoken languages, and creatures that understand a language can understand what you say."),
    "Diamond Soul":ref("Monk","Saving throws","You are proficient in all saving throws; the sheet already applies those proficiencies. On a failed save, spend 1 Ki to reroll it and use the new result."),
    "Timeless Body":ref("Monk","Passive","You suffer none of the frailty of old age, can't be magically aged, and no longer need food or water."),
    "Empty Body":ref("Monk","Action",`Spend 4 Ki to become Invisible for 1 minute and gain resistance to all damage except Force. You can also spend 8 Ki to cast Astral Projection on yourself under the feature's restrictions.`),
    "Perfect Self":ref("Monk","Initiative","When rolling Initiative with no Ki points remaining, regain 4 Ki points."),
    "Tranquility":ref("Open Hand","After Long Rest","Gain the effect of Sanctuary until your next Long Rest; it can end early under the spell/feature conditions.")
  };
  return entries[name]||null;
}

function monk2024(character,name,{row,dc,focus,flurry}){
  const entries={
    "Monk's Focus":ref("Monk","Resource",`You have ${focus} Focus Points and a Focus save DC of ${dc}. Flurry of Blows makes ${flurry} Unarmed Strikes; Patient Defense and Step of the Wind use the current 2024 Focus rules. Regain all Focus after a Short or Long Rest.`),
    "Uncanny Metabolism":ref("Monk","Initiative",`Once per Long Rest when rolling Initiative, regain all expended Focus Points and regain HP equal to your Monk level plus one roll of your Martial Arts die (${row.martialArts}).`),
    "Deflect Attacks":ref("Monk","Reaction",`When an attack dealing Bludgeoning, Piercing, or Slashing damage hits you, reduce the damage by 1d10 + ${abilityMod(character.abilities.dex)} + ${character.level}. If reduced to 0, you can spend 1 Focus to redirect the attack under the feature's rules; save DC ${dc}.`),
    "Stunning Strike":ref("Monk","Once per turn on Monk attack hit",`Spend 1 Focus; the target makes a CON save DC ${dc}. On a failure it is Stunned until the start of your next turn; on a success its Speed is halved and the next attack against it has Advantage before the start of your next turn.`),
    "Empowered Strikes":ref("Monk","Passive","Your Unarmed Strikes can deal Force damage instead of their normal damage type; the generated Unarmed Strike entry exposes this option."),
    "Acrobatic Movement":ref("Monk","Movement","While Unarmored Movement applies, you can move along vertical surfaces and across liquids during your turn without falling during the move."),
    "Heightened Focus":ref("Monk","Focus options",`Flurry of Blows now makes ${flurry} Unarmed Strikes. Patient Defense and Step of the Wind also gain their level-10 improvements.`),
    "Self-Restoration":ref("Monk","End of turn / passive","At the end of each of your turns, you can end Charmed, Frightened, or Poisoned on yourself. You also don't gain Exhaustion from lack of food or drink."),
    "Deflect Energy":ref("Monk","Reaction","Deflect Attacks can now reduce damage from attacks dealing any damage type except Psychic."),
    "Disciplined Survivor":ref("Monk","Saving throws","You are proficient in all saving throws; the sheet already applies those proficiencies. When you fail a save, spend 1 Focus to reroll it and use the new result."),
    "Perfect Focus":ref("Monk","Initiative","When rolling Initiative, if you have fewer than 4 Focus Points, your Focus total becomes 4."),
    "Superior Defense":ref("Monk","Bonus Action","Spend 3 Focus to gain resistance to all damage except Force for 1 minute or until Incapacitated."),
    "Body and Mind":ref("Monk","Passive","Dexterity and Wisdom each increase by 4, to a maximum of 25; these increases and maxima are already applied to the generated character."),
    "Fleet Step":ref("Open Hand","Step of the Wind","When you take a Bonus Action other than Step of the Wind, you can use Step of the Wind immediately afterward without spending Focus.")
  };
  return entries[name]||null;
}

function ref(category,timing,text){return{category,timing,text};}
function required(entry,name){if(!entry)throw new Error(`Missing quick reference for ${name}.`);return entry;}
