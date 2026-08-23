import { abilityMod } from "./math.js";

const SLOTS_2014=Object.freeze({
  1:{},2:{1:2},3:{1:3},4:{1:3},5:{1:4,2:2},6:{1:4,2:2},7:{1:4,2:3},8:{1:4,2:3},9:{1:4,2:3,3:2},10:{1:4,2:3,3:2},11:{1:4,2:3,3:3},12:{1:4,2:3,3:3},13:{1:4,2:3,3:3,4:1},14:{1:4,2:3,3:3,4:1},15:{1:4,2:3,3:3,4:2},16:{1:4,2:3,3:3,4:2},17:{1:4,2:3,3:3,4:3,5:1},18:{1:4,2:3,3:3,4:3,5:1},19:{1:4,2:3,3:3,4:3,5:2},20:{1:4,2:3,3:3,4:3,5:2}
});
const SLOTS_2024=Object.freeze({
  1:{1:2},2:{1:2},3:{1:3},4:{1:3},5:{1:4,2:2},6:{1:4,2:2},7:{1:4,2:3},8:{1:4,2:3},9:{1:4,2:3,3:2},10:{1:4,2:3,3:2},11:{1:4,2:3,3:3},12:{1:4,2:3,3:3},13:{1:4,2:3,3:3,4:1},14:{1:4,2:3,3:3,4:1},15:{1:4,2:3,3:3,4:2},16:{1:4,2:3,3:3,4:2},17:{1:4,2:3,3:3,4:3,5:1},18:{1:4,2:3,3:3,4:3,5:1},19:{1:4,2:3,3:3,4:3,5:2},20:{1:4,2:3,3:3,4:3,5:2}
});
const PREPARED_2024=Object.freeze({1:2,2:3,3:4,4:5,5:6,6:6,7:7,8:7,9:9,10:9,11:10,12:10,13:11,14:11,15:12,16:12,17:14,18:14,19:15,20:15});

export function paladinProgressionFor(ruleset,level,subclassId=null,chaModifier=0){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Paladin level ${level}.`);
    if(ruleset==="2014")return Object.freeze({
      layOnHandsPool:5*value,divineSenseUses:Math.max(1,1+Number(chaModifier||0)),masteryCount:0,prepared:value>=2?Math.max(1,Math.floor(value/2)+Number(chaModifier||0)):0,slots:Object.freeze({...SLOTS_2014[value]}),fightingStyle:value>=2,divineSmite:value>=2,channelDivinityUses:value>=3?1:0,divineHealth:value>=3,attacksPerAction:value>=5?2:1,auraProtection:value>=6,auraRange:value>=18?30:value>=6?10:0,auraCourage:value>=10,radiantStrikes:false,improvedDivineSmite:value>=11,cleansingTouchUses:value>=14?Math.max(1,Number(chaModifier||0)):0,abjureFoes:false,restoringTouch:false,faithfulSteed:false,paladinsSmite:false,epicBoon:false,sacredWeapon:subclassId==="oath-devotion"&&value>=3,auraDevotion:subclassId==="oath-devotion"&&value>=7,purityOfSpirit:subclassId==="oath-devotion"&&value>=15,smiteOfProtection:false,holyNimbus:subclassId==="oath-devotion"&&value>=20
    });
    if(ruleset!=="2024")throw new Error(`Unsupported Paladin ruleset: ${ruleset}.`);
    return Object.freeze({
      layOnHandsPool:5*value,divineSenseUses:0,masteryCount:2,prepared:PREPARED_2024[value],slots:Object.freeze({...SLOTS_2024[value]}),fightingStyle:value>=2,divineSmite:false,channelDivinityUses:value<3?0:value<11?2:3,divineHealth:false,attacksPerAction:value>=5?2:1,auraProtection:value>=6,auraRange:value>=18?30:value>=6?10:0,auraCourage:value>=10,radiantStrikes:value>=11,improvedDivineSmite:false,cleansingTouchUses:0,abjureFoes:value>=9,restoringTouch:value>=14,faithfulSteed:value>=5,paladinsSmite:value>=2,epicBoon:value>=19,sacredWeapon:subclassId==="oath-devotion"&&value>=3,auraDevotion:subclassId==="oath-devotion"&&value>=7,purityOfSpirit:false,smiteOfProtection:subclassId==="oath-devotion"&&value>=15,holyNimbus:subclassId==="oath-devotion"&&value>=20
    });
  }catch(error){console.error("[paladin] progression resolution failed",error);throw error;}
}

export function paladinPreparedCount(character){
  try{return paladinProgressionFor(character.ruleset,character.level,character.subclass?.id,abilityMod(character.abilities.cha)).prepared;}
  catch(error){console.error("[paladin] prepared count failed",error);throw error;}
}

export function paladinSpellSlots(ruleset,level){
  try{const progression=paladinProgressionFor(ruleset,level);return Object.freeze({...progression.slots});}
  catch(error){console.error("[paladin] spell-slot lookup failed",error);throw error;}
}

export function paladinMaxSpellLevel(ruleset,level){
  try{const levels=Object.keys(paladinSpellSlots(ruleset,level)).map(Number);return levels.length?Math.max(...levels):0;}
  catch(error){console.error("[paladin] max spell level failed",error);throw error;}
}

export function paladinAuraBonus(character){
  try{return Math.max(1,abilityMod(character.abilities.cha));}
  catch(error){console.error("[paladin] aura bonus failed",error);throw error;}
}
