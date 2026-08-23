import { rogueCunningStrikeDc } from "../rules/rogue.js";

export function buildQuickTurn(character){
  try{
    const builders={fighter:fighterTurn,wizard:wizardTurn,cleric:clericTurn,rogue:rogueTurn};
    return (builders[character?.class?.id]||defaultTurn)(character).slice(0,3);
  }catch(error){console.error("[print-quick-turn] build failed",error);return defaultTurn(character);}
}
function fighterTurn(character){
  const attacks=character.fighter?.attacksPerAction||1,steps=[`Take the Attack action: ${attacks} attack${attacks===1?"":"s"} with your best weapon.`];
  if(character.fighter?.actionSurgeUses)steps.push("Use Action Surge when another action can swing the fight.");
  else steps.push("Keep pressure on the highest-priority target and protect your positioning.");
  steps.push(character.fighter?.secondWindUses?"Use Second Wind when the healing and repositioning value matter most.":"Use your class resources before the fight is already decided.");
  return steps;
}
function wizardTurn(character){
  const dc=character.spells?.saveDc;return[
    `Choose the spell that changes the battlefield most${dc?` (save DC ${dc})`:""}.`,
    "Use a cantrip when the encounter does not justify spending a spell slot.",
    character.level>=5?"Protect concentration and keep distance; use Memorize Spell after a Short Rest when preparation needs change.":"Protect concentration and keep distance from melee threats."
  ];
}
function clericTurn(character){
  const steps=["Decide early whether the fight needs concentration, damage, support, or recovery."];
  if(character.cleric?.channelDivinityUses)steps.push(`You have ${character.cleric.channelDivinityUses} Channel Divinity uses; spend them when Divine Spark, Turn Undead, or your domain option creates real value.`);
  else steps.push("Use your best prepared spell or cantrip while preserving positioning.");
  steps.push(character.subclass?.id==="life-domain"?"Keep a fast healing option available for an ally who suddenly drops.":"Keep a recovery option available for a sudden emergency.");return steps;
}
function rogueTurn(character){
  try{
    const steps=[`Set up Sneak Attack${character.rogue?.sneakAttackDice?` (${character.rogue.sneakAttackDice}d6)`:""} before choosing your target.`];
    if(character.level>=5)steps.push(`Use Cunning Strike (DC ${rogueCunningStrikeDc(character)}) only when its effect is worth giving up Sneak Attack dice.`);
    else if(character.level>=2)steps.push("Use Cunning Action to Dash, Disengage, or Hide when positioning creates more value than standing still.");
    else steps.push("Use normal movement and cover to preserve the position needed for your next Sneak Attack.");
    if(character.level>=3)steps.push("Use Cunning Action for positioning; if you have not moved, Steady Aim can create Advantage for the next attack this turn.");
    else steps.push("End your turn where enemies must spend movement or actions to reach you.");
    return steps;
  }catch(error){console.error("[print-quick-turn] Rogue turn failed",error);throw error;}
}
function defaultTurn(){return["Use your strongest reliable action for the current objective.","Spend limited resources only when they materially improve the outcome.","End your turn in a position that helps the party and limits enemy options."];}
