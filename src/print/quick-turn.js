import { rogueCunningStrikeDc } from "../rules/rogue.js";

export function buildQuickTurn(character){
  try{
    const builders={barbarian:barbarianTurn,fighter:fighterTurn,wizard:wizardTurn,cleric:clericTurn,rogue:rogueTurn};
    return (builders[character?.class?.id]||defaultTurn)(character).slice(0,3);
  }catch(error){console.error("[print-quick-turn] build failed",error);return defaultTurn(character);}
}
function barbarianTurn(character){
  try{
    const b=character.barbarian;if(!b)throw new Error("Barbarian Quick Turn requires progression data.");const rage=b.unlimitedRage?"unlimited Rage":`${b.rageUses} Rage use${b.rageUses===1?"":"s"}`;
    const steps=[`Enter Rage when the fight justifies it; you have ${rage} and deal +${b.rageDamage} qualifying Rage damage.`];
    if(character.level>=9&&character.ruleset==="2024")steps.push(`Use Reckless Attack deliberately; on one eligible hit, Brutal Strike can trade its Advantage for +${b.brutalStrikeDice}d10 and ${b.brutalStrikeEffectCount} effect${b.brutalStrikeEffectCount===1?"":"s"}.`);else if(character.level>=2)steps.push("Use Reckless Attack when Advantage is worth giving enemies Advantage against you until your next turn.");else steps.push("Close distance, attack with Strength, and use Rage resistance to hold the dangerous space.");
    if(b.frenzy)steps.push(character.ruleset==="2014"?"If you chose Frenzy, remember the bonus-action melee attack starts on later turns and Exhaustion arrives when Rage ends.":`Berserker Frenzy adds ${b.rageDamage}d6 to your first Strength-based hit each turn when Reckless Attack is active during Rage.`);else if(b.relentlessRage)steps.push(`Relentless Rage can keep you standing at ${b.relentlessRageHp} HP if its Constitution save succeeds.`);else steps.push("End your turn where your Rage resistance and threat protect the rest of the party.");
    return steps;
  }catch(error){console.error("[print-quick-turn] Barbarian turn failed",error);throw error;}
}
function fighterTurn(character){
  const attacks=character.fighter?.attacksPerAction||1,steps=[`Take the Attack action: ${attacks} attack${attacks===1?"":"s"} with your best weapon.`];
  if(character.fighter?.actionSurgeUses)steps.push("Use Action Surge when another action can swing the fight.");
  else steps.push("Keep pressure on the highest-priority target and protect your positioning.");
  if(character.fighter?.secondWindUses)steps.push(character.ruleset==="2014"?"Use Second Wind when its self-healing matters most.":"Use Second Wind when the healing and repositioning value matter most.");
  else steps.push("Use your class resources before the fight is already decided.");
  return steps;
}
function wizardTurn(character){
  const dc=character.spells?.saveDc,third=character.ruleset==="2014"?"Protect concentration and keep distance; after a Short Rest, use Arcane Recovery when recovered spell slots will matter.":character.level>=5?"Protect concentration and keep distance; use Memorize Spell after a Short Rest when preparation needs change.":"Protect concentration and keep distance from melee threats.";return[
    `Choose the spell that changes the battlefield most${dc?` (save DC ${dc})`:""}.`,
    "Use a cantrip when the encounter does not justify spending a spell slot.",
    third
  ];
}
function clericTurn(character){
  const steps=["Decide early whether the fight needs concentration, damage, support, or recovery."];
  if(character.cleric?.channelDivinityUses){const options=character.ruleset==="2014"?"Turn Undead or Preserve Life":"Divine Spark, Turn Undead, or your domain option";steps.push(`You have ${character.cleric.channelDivinityUses} Channel Divinity uses; spend them when ${options} creates real value.`);}
  else steps.push("Use your best prepared spell or cantrip while preserving positioning.");
  steps.push(character.subclass?.id==="life-domain"?"Keep a fast healing option available for an ally who suddenly drops.":"Keep a recovery option available for a sudden emergency.");return steps;
}
function rogueTurn(character){
  try{
    const steps=[`Set up Sneak Attack${character.rogue?.sneakAttackDice?` (${character.rogue.sneakAttackDice}d6)`:""} before choosing your target.`];
    if(character.ruleset==="2014"){
      if(character.level>=2)steps.push("Use Cunning Action to Dash, Disengage, or Hide when positioning creates more value than standing still.");else steps.push("Use normal movement and cover to preserve the position needed for your next Sneak Attack.");
      if(character.subclass?.id==="thief"&&character.level>=17)steps.push("In round one, plan around Thief’s Reflexes: your second turn happens at Initiative minus 10 unless you are surprised.");else if(character.subclass?.id==="thief"&&character.level>=3)steps.push("Use Fast Hands or Cunning Action to create position and tempo without giving up your action.");else steps.push("End your turn where enemies must spend movement or actions to reach you.");
      return steps;
    }
    if(character.level>=5)steps.push(`Use Cunning Strike (DC ${rogueCunningStrikeDc(character)}) only when its effect is worth giving up Sneak Attack dice.`);else if(character.level>=2)steps.push("Use Cunning Action to Dash, Disengage, or Hide when positioning creates more value than standing still.");else steps.push("Use normal movement and cover to preserve the position needed for your next Sneak Attack.");
    if(character.level>=3)steps.push("Use Cunning Action for positioning; if you have not moved, Steady Aim can create Advantage for the next attack this turn.");else steps.push("End your turn where enemies must spend movement or actions to reach you.");
    return steps;
  }catch(error){console.error("[print-quick-turn] Rogue turn failed",error);throw error;}
}
function defaultTurn(){return["Use your strongest reliable action for the current objective.","Spend limited resources only when they materially improve the outcome.","End your turn in a position that helps the party and limits enemy options."];}
