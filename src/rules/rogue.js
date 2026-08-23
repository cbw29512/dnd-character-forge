import { abilityMod } from "./math.js";

export const CUNNING_STRIKE_OPTIONS_2024=Object.freeze([
  Object.freeze({id:"poison",name:"Poison",minimumLevel:5,cost:1,save:"con",requires:"Poisoner's Kit",effect:"Failed save: Poisoned for 1 minute; repeat the save at the end of each turn, ending on a success."}),
  Object.freeze({id:"trip",name:"Trip",minimumLevel:5,cost:1,save:"dex",effect:"Large or smaller target; failed save: Prone."}),
  Object.freeze({id:"withdraw",name:"Withdraw",minimumLevel:5,cost:1,save:null,effect:"Immediately move up to half your Speed without provoking Opportunity Attacks."}),
  Object.freeze({id:"stealth-attack",name:"Stealth Attack",minimumLevel:9,cost:1,save:null,subclass:"thief",effect:"If hidden, the attack doesn't end the Hide action's Invisible condition if you end the turn behind Three-Quarters or Total Cover."}),
  Object.freeze({id:"daze",name:"Daze",minimumLevel:14,cost:2,save:"con",effect:"Failed save: on its next turn, the target can only move, take an action, or take a Bonus Action—one of those three."}),
  Object.freeze({id:"knock-out",name:"Knock Out",minimumLevel:14,cost:6,save:"con",effect:"Failed save: Unconscious for 1 minute or until damaged; repeat the save at the end of each turn, ending on a success."}),
  Object.freeze({id:"obscure",name:"Obscure",minimumLevel:14,cost:3,save:"dex",effect:"Failed save: Blinded until the end of the target's next turn."})
]);

export function rogueProgressionFor(level,subclassId=null){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported 2024 Rogue level ${level}.`);
    const options=CUNNING_STRIKE_OPTIONS_2024.filter(option=>value>=option.minimumLevel&&(!option.subclass||option.subclass===subclassId));
    return Object.freeze({
      sneakAttackDice:Math.ceil(value/2),
      expertiseCount:value>=6?4:2,
      masteryCount:2,
      maxCunningStrikeEffects:value<5?0:value<11?1:2,
      cunningStrikeOptions:Object.freeze(options.map(option=>option.id)),
      reliableTalent:value>=7,
      slipperyMind:value>=15,
      strokeOfLuck:value>=20,
      thiefReflexes:value>=17&&subclassId==="thief"
    });
  }catch(error){console.error("[rogue] progression lookup failed",error);throw error;}
}

export function rogueCunningStrikeDc(character){
  try{if(character?.class?.id!=="rogue")throw new Error("Cunning Strike DC requires a Rogue character.");return 8+abilityMod(character.abilities.dex)+character.proficiency;}
  catch(error){console.error("[rogue] Cunning Strike DC failed",error);throw error;}
}

export function rogueSaveProficiencies(level){
  try{return Number(level)>=15?["dex","int","wis","cha"]:["dex","int"];}
  catch(error){console.error("[rogue] save proficiency lookup failed",error);throw error;}
}
