import { abilityMod, proficiencyBonus } from "./math.js";

export function monkProgressionFor(ruleset,level,subclassId=null){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Monk level ${level}.`);const openHand=subclassId==="open-hand";
    if(ruleset==="2014")return Object.freeze({
      martialArtsDie:martialArtsDie2014(value),resourceName:"Ki",resourcePoints:value>=2?value:0,resourceRecovery:"Short or Long Rest",unarmoredMovementBonus:movementBonus(value),attacksPerAction:value>=5?2:1,
      unarmoredDefense:true,martialArts:true,flurryOfBlows:value>=2,flurryStrikeCount:value>=2?2:0,patientDefense:value>=2,stepOfTheWind:value>=2,uncannyMetabolism:false,
      deflectMissiles:value>=3,deflectAttacks:false,slowFall:value>=4,stunningStrike:value>=5,stunningStrikeOncePerTurn:false,empoweredStrikes:value>=6,evasion:value>=7,stillnessOfMind:value>=7,acrobaticMovement:value>=9,
      heightenedFocus:false,selfRestoration:false,purityOfBody:value>=10,tongueOfSunAndMoon:value>=13,deflectEnergy:false,allSaveProficiency:value>=14,saveReroll:value>=14,timelessBody:value>=15,perfectFocus:false,initiativeResourceFloor:value>=20?4:0,
      emptyBody:value>=18,superiorDefense:false,epicBoon:false,bodyAndMind:false,bodyAndMindMaximum:20,
      openHandTechnique:openHand&&value>=3,wholenessOfBody:openHand&&value>=6,wholenessAction:openHand&&value>=6?"Action":null,wholenessUses:openHand&&value>=6?1:0,tranquility:openHand&&value>=11,fleetStep:false,quiveringPalm:openHand&&value>=17,quiveringPalmCost:openHand&&value>=17?3:0,quiveringPalmDamage:openHand&&value>=17?"Fail: 0 HP; Success: 10d10 Necrotic":null
    });
    if(ruleset!=="2024")throw new Error(`Unsupported Monk ruleset: ${ruleset}.`);
    return Object.freeze({
      martialArtsDie:martialArtsDie2024(value),resourceName:"Focus",resourcePoints:value>=2?value:0,resourceRecovery:"Short or Long Rest",unarmoredMovementBonus:movementBonus(value),attacksPerAction:value>=5?2:1,
      unarmoredDefense:true,martialArts:true,flurryOfBlows:value>=2,flurryStrikeCount:value>=10?3:value>=2?2:0,patientDefense:value>=2,stepOfTheWind:value>=2,uncannyMetabolism:value>=2,
      deflectMissiles:false,deflectAttacks:value>=3,slowFall:value>=4,stunningStrike:value>=5,stunningStrikeOncePerTurn:value>=5,empoweredStrikes:value>=6,evasion:value>=7,stillnessOfMind:false,acrobaticMovement:value>=9,
      heightenedFocus:value>=10,selfRestoration:value>=10,purityOfBody:false,tongueOfSunAndMoon:false,deflectEnergy:value>=13,allSaveProficiency:value>=14,saveReroll:value>=14,timelessBody:false,perfectFocus:value>=15,initiativeResourceFloor:value>=15?4:0,
      emptyBody:false,superiorDefense:value>=18,epicBoon:value>=19,bodyAndMind:value>=20,bodyAndMindMaximum:value>=20?25:20,
      openHandTechnique:openHand&&value>=3,wholenessOfBody:openHand&&value>=6,wholenessAction:openHand&&value>=6?"Bonus Action":null,wholenessUses:null,tranquility:false,fleetStep:openHand&&value>=11,quiveringPalm:openHand&&value>=17,quiveringPalmCost:openHand&&value>=17?4:0,quiveringPalmDamage:openHand&&value>=17?"Fail: 10d12 Force; Success: half":null
    });
  }catch(error){console.error("[monk] progression resolution failed",error);throw error;}
}

export function applyBodyAndMind(scores,maximums,ruleset,level){
  try{
    const nextScores={...scores},nextMaximums={...maximums},progression=monkProgressionFor(ruleset,level);if(!progression.bodyAndMind)return{scores:nextScores,maximums:nextMaximums};
    for(const ability of ["dex","wis"]){nextScores[ability]=Math.min(25,nextScores[ability]+4);nextMaximums[ability]=Math.max(nextMaximums[ability]??20,25);}return{scores:nextScores,maximums:nextMaximums};
  }catch(error){console.error("[monk] Body and Mind application failed",error);throw error;}
}

export function monkSaveDc(character){
  try{return 8+proficiencyBonus(character.level)+abilityMod(character.abilities.wis);}catch(error){console.error("[monk] save DC failed",error);throw error;}
}

export function monkWholenessUses(character){
  try{const p=character.monk||monkProgressionFor(character.ruleset,character.level,character.subclass?.id);if(!p.wholenessOfBody)return 0;return character.ruleset==="2014"?1:Math.max(1,abilityMod(character.abilities.wis));}catch(error){console.error("[monk] Wholeness uses failed",error);throw error;}
}

function martialArtsDie2014(level){return level>=17?"d10":level>=11?"d8":level>=5?"d6":"d4";}
function martialArtsDie2024(level){return level>=17?"d12":level>=11?"d10":level>=5?"d8":"d6";}
function movementBonus(level){if(level<2)return 0;if(level>=18)return 30;if(level>=14)return 25;if(level>=10)return 20;if(level>=6)return 15;return 10;}
