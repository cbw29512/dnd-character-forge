import { abilityMod } from "./math.js";

export const BARBARIAN_MASTERY_WEAPONS_2024=Object.freeze(["greataxe","handaxe","greatsword","longsword","flail","javelin","scimitar","shortsword","dagger","quarterstaff","mace"]);
export const BRUTAL_STRIKE_OPTIONS_2024=Object.freeze([
  Object.freeze({id:"forceful-blow",name:"Forceful Blow",minimumLevel:9,effect:"Push the target 15 feet straight away, then move up to half your Speed straight toward it without provoking Opportunity Attacks."}),
  Object.freeze({id:"hamstring-blow",name:"Hamstring Blow",minimumLevel:9,effect:"Reduce the target's Speed by 15 feet until the start of your next turn; only the most recent Hamstring Blow applies."}),
  Object.freeze({id:"staggering-blow",name:"Staggering Blow",minimumLevel:13,effect:"The target has Disadvantage on its next saving throw and can't make Opportunity Attacks until the start of your next turn."}),
  Object.freeze({id:"sundering-blow",name:"Sundering Blow",minimumLevel:13,effect:"Before your next turn, the next attack roll made by another creature against the target gains +5; only one Sundering Blow bonus can apply to a roll."})
]);

export function barbarianProgressionFor(ruleset,level,subclassId=null){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Barbarian level ${level}.`);if(!["2014","2024"].includes(ruleset))throw new Error(`Unsupported Barbarian ruleset ${ruleset}.`);
    const rageDamage=value>=16?4:value>=9?3:2,attacksPerAction=value>=5?2:1,berserker=subclassId==="path-berserker";
    if(ruleset==="2014")return Object.freeze({
      rageUses:value>=20?"Unlimited":value>=17?6:value>=12?5:value>=6?4:value>=3?3:2,
      rageDamage,
      masteryCount:0,
      attacksPerAction,
      fastMovementBonus:value>=5?10:0,
      initiativeAdvantage:value>=7,
      brutalCriticalDice:value>=17?3:value>=13?2:value>=9?1:0,
      brutalStrikeDice:0,
      maxBrutalStrikeEffects:0,
      brutalStrikeOptions:Object.freeze([]),
      primalKnowledge:false,
      instinctivePounce:false,
      relentlessRage:value>=11,
      persistentRage:value>=15,
      indomitableMight:value>=18,
      primalChampion:value>=20,
      primalChampionMaximum:value>=20?24:20,
      frenzy:berserker&&value>=3,
      frenzyDamageDice:null,
      mindlessRage:berserker&&value>=6,
      intimidatingPresence:berserker&&value>=10,
      retaliation:berserker&&value>=14
    });
    const options=BRUTAL_STRIKE_OPTIONS_2024.filter(option=>value>=option.minimumLevel).map(option=>option.id);
    return Object.freeze({
      rageUses:value>=17?6:value>=12?5:value>=6?4:value>=3?3:2,
      rageDamage,
      masteryCount:value>=10?4:value>=4?3:2,
      attacksPerAction,
      fastMovementBonus:value>=5?10:0,
      initiativeAdvantage:value>=7,
      brutalCriticalDice:0,
      brutalStrikeDice:value>=17?2:value>=9?1:0,
      maxBrutalStrikeEffects:value>=17?2:value>=9?1:0,
      brutalStrikeOptions:Object.freeze(options),
      primalKnowledge:value>=3,
      instinctivePounce:value>=7,
      relentlessRage:value>=11,
      persistentRage:value>=15,
      indomitableMight:value>=18,
      primalChampion:value>=20,
      primalChampionMaximum:value>=20?25:20,
      frenzy:berserker&&value>=3,
      frenzyDamageDice:berserker&&value>=3?`${rageDamage}d6`:null,
      mindlessRage:berserker&&value>=6,
      intimidatingPresence:berserker&&value>=14,
      retaliation:berserker&&value>=10
    });
  }catch(error){console.error("[barbarian] progression lookup failed",error);throw error;}
}

export function applyPrimalChampion(scores,maximums,ruleset,level){
  try{
    const nextScores={...scores},nextMaximums={...maximums};if(Number(level)<20)return{scores:nextScores,maximums:nextMaximums};
    const cap=ruleset==="2014"?24:ruleset==="2024"?25:null;if(!cap)throw new Error(`Unsupported Primal Champion ruleset ${ruleset}.`);
    for(const ability of ["str","con"]){nextScores[ability]=Math.min(cap,nextScores[ability]+4);nextMaximums[ability]=Math.max(nextMaximums[ability]??20,cap);}
    return{scores:nextScores,maximums:nextMaximums};
  }catch(error){console.error("[barbarian] Primal Champion application failed",error);throw error;}
}

export function barbarianIntimidatingPresenceDc(character){
  try{
    if(character?.class?.id!=="barbarian"||character?.subclass?.id!=="path-berserker")throw new Error("Intimidating Presence DC requires a Berserker Barbarian.");
    const requiredLevel=character.ruleset==="2014"?10:character.ruleset==="2024"?14:null;if(!requiredLevel||character.level<requiredLevel)throw new Error(`Intimidating Presence is unavailable at Barbarian level ${character.level}.`);
    const ability=character.ruleset==="2014"?"cha":"str";return 8+character.proficiency+abilityMod(character.abilities[ability]);
  }catch(error){console.error("[barbarian] Intimidating Presence DC failed",error);throw error;}
}
