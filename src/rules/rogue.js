import { abilityMod } from "./math.js";

export const CUNNING_STRIKE_OPTIONS_2024=Object.freeze([
  Object.freeze({id:"poison",name:"Poison",minimumLevel:5,cost:1,save:"con",requires:"Poisoner's Kit"}),
  Object.freeze({id:"trip",name:"Trip",minimumLevel:5,cost:1,save:"dex"}),
  Object.freeze({id:"withdraw",name:"Withdraw",minimumLevel:5,cost:1,save:null}),
  Object.freeze({id:"stealth-attack",name:"Stealth Attack",minimumLevel:9,cost:1,save:null,subclass:"thief"}),
  Object.freeze({id:"daze",name:"Daze",minimumLevel:14,cost:2,save:"con"}),
  Object.freeze({id:"knock-out",name:"Knock Out",minimumLevel:14,cost:6,save:"con"}),
  Object.freeze({id:"obscure",name:"Obscure",minimumLevel:14,cost:3,save:"dex"})
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
