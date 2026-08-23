import { abilityMod, proficiencyBonus } from "./math.js";

const BRUTAL_2024_BASE=Object.freeze(["Forceful Blow","Hamstring Blow"]);
const BRUTAL_2024_IMPROVED=Object.freeze(["Staggering Blow","Sundering Blow"]);

export function barbarianProgressionFor(ruleset,level,subclassId=null){
  try{
    const value=Number(level);
    if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Barbarian level ${level}.`);
    if(ruleset==="2014")return Object.freeze({
      rageUses:value>=20?null:value>=17?6:value>=12?5:value>=6?4:value>=3?3:2,
      unlimitedRage:value>=20,
      rageDamage:value>=16?4:value>=9?3:2,
      masteryCount:0,
      attacksPerAction:value>=5?2:1,
      speedBonus:value>=5?10:0,
      initiativeAdvantage:value>=7,
      primalKnowledge:false,
      instinctivePounce:false,
      brutalCriticalDice:value>=17?3:value>=13?2:value>=9?1:0,
      brutalStrikeDice:0,
      brutalStrikeEffects:Object.freeze([]),
      brutalStrikeEffectCount:0,
      relentlessRage:value>=11,
      relentlessRageHp:value>=11?1:0,
      persistentRage:value>=15,
      indomitableMight:value>=18,
      primalChampion:value>=20,
      primalChampionMaximum:value>=20?24:20,
      frenzy:subclassId==="berserker"&&value>=3,
      mindlessRage:subclassId==="berserker"&&value>=6,
      retaliation:subclassId==="berserker"&&value>=14,
      intimidatingPresence:subclassId==="berserker"&&value>=10
    });
    if(ruleset!=="2024")throw new Error(`Unsupported Barbarian ruleset: ${ruleset}.`);
    const brutalEffects=value>=13?[...BRUTAL_2024_BASE,...BRUTAL_2024_IMPROVED]:value>=9?[...BRUTAL_2024_BASE]:[];
    return Object.freeze({
      rageUses:value>=17?6:value>=12?5:value>=6?4:value>=3?3:2,
      unlimitedRage:false,
      rageDamage:value>=16?4:value>=9?3:2,
      masteryCount:value>=10?4:value>=4?3:2,
      attacksPerAction:value>=5?2:1,
      speedBonus:value>=5?10:0,
      initiativeAdvantage:value>=7,
      primalKnowledge:value>=3,
      instinctivePounce:value>=7,
      brutalCriticalDice:0,
      brutalStrikeDice:value>=17?2:value>=9?1:0,
      brutalStrikeEffects:Object.freeze(brutalEffects),
      brutalStrikeEffectCount:value>=17?2:value>=9?1:0,
      relentlessRage:value>=11,
      relentlessRageHp:value>=11?2*value:0,
      persistentRage:value>=15,
      indomitableMight:value>=18,
      primalChampion:value>=20,
      primalChampionMaximum:value>=20?25:20,
      frenzy:subclassId==="berserker"&&value>=3,
      mindlessRage:subclassId==="berserker"&&value>=6,
      retaliation:subclassId==="berserker"&&value>=10,
      intimidatingPresence:subclassId==="berserker"&&value>=14
    });
  }catch(error){console.error("[barbarian] progression resolution failed",error);throw error;}
}

export function applyPrimalChampion(scores,maximums,ruleset,level){
  try{
    const nextScores={...scores},nextMaximums={...maximums},progression=barbarianProgressionFor(ruleset,level);
    if(!progression.primalChampion)return{scores:nextScores,maximums:nextMaximums};
    const featureMaximum=progression.primalChampionMaximum;
    for(const ability of ["str","con"]){
      nextScores[ability]=Math.min(featureMaximum,nextScores[ability]+4);
      nextMaximums[ability]=Math.max(nextMaximums[ability]??20,featureMaximum);
    }
    return{scores:nextScores,maximums:nextMaximums};
  }catch(error){console.error("[barbarian] Primal Champion application failed",error);throw error;}
}

export function barbarianIntimidatingPresenceDc(character){
  try{
    const ability=character.ruleset==="2014"?"cha":"str";
    return 8+proficiencyBonus(character.level)+abilityMod(character.abilities[ability]);
  }catch(error){console.error("[barbarian] Intimidating Presence DC failed",error);throw error;}
}

export function barbarianFrenzyDamage(character){
  try{
    const progression=character.barbarian||barbarianProgressionFor(character.ruleset,character.level,character.subclass?.id);
    if(!progression.frenzy)return null;
    return character.ruleset==="2024"?`${progression.rageDamage}d6`:"Bonus-action melee weapon attack while Frenzied";
  }catch(error){console.error("[barbarian] Frenzy damage resolution failed",error);throw error;}
}
