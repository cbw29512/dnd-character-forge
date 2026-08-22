// Edition-isolated Monk progression. Keep this module independent from selectable class data
// until Monk generation, Open Hand mechanics, advancement, references, and validation are complete.
import { abilityMod } from "./math.js";

const MARTIAL_ARTS_2014=Object.freeze(["1d4","1d4","1d4","1d4","1d6","1d6","1d6","1d6","1d6","1d6","1d8","1d8","1d8","1d8","1d8","1d8","1d10","1d10","1d10","1d10"]);
const MARTIAL_ARTS_2024=Object.freeze(["1d6","1d6","1d6","1d6","1d8","1d8","1d8","1d8","1d8","1d8","1d10","1d10","1d10","1d10","1d10","1d10","1d12","1d12","1d12","1d12"]);
const MOVEMENT=Object.freeze([0,10,10,10,10,15,15,15,15,20,20,20,20,25,25,25,25,30,30,30]);
const ALL_SAVES=Object.freeze(["str","dex","con","int","wis","cha"]);

const P2014=Object.freeze({
  1:["Unarmored Defense","Martial Arts"],2:["Ki","Unarmored Movement"],3:["Monastic Tradition","Deflect Missiles"],4:["Ability Score Improvement","Slow Fall"],5:["Extra Attack","Stunning Strike"],6:["Ki-Empowered Strikes","Monastic Tradition feature"],7:["Evasion","Stillness of Mind"],8:["Ability Score Improvement"],9:["Unarmored Movement Improvement"],10:["Purity of Body"],11:["Monastic Tradition feature"],12:["Ability Score Improvement"],13:["Tongue of the Sun and Moon"],14:["Diamond Soul"],15:["Timeless Body"],16:["Ability Score Improvement"],17:["Monastic Tradition feature"],18:["Empty Body"],19:["Ability Score Improvement"],20:["Perfect Self"]
});
const P2024=Object.freeze({
  1:["Martial Arts","Unarmored Defense"],2:["Monk's Focus","Unarmored Movement","Uncanny Metabolism"],3:["Deflect Attacks","Monk Subclass"],4:["Ability Score Improvement","Slow Fall"],5:["Extra Attack","Stunning Strike"],6:["Empowered Strikes","Subclass feature"],7:["Evasion"],8:["Ability Score Improvement"],9:["Acrobatic Movement"],10:["Heightened Focus","Self-Restoration"],11:["Subclass feature"],12:["Ability Score Improvement"],13:["Deflect Energy"],14:["Disciplined Survivor"],15:["Perfect Focus"],16:["Ability Score Improvement"],17:["Subclass feature"],18:["Superior Defense"],19:["Epic Boon"],20:["Body and Mind"]
});
const OPEN_HAND_2014=Object.freeze([{level:3,name:"Open Hand Technique"},{level:6,name:"Wholeness of Body"},{level:11,name:"Tranquility"},{level:17,name:"Quivering Palm"}]);
const OPEN_HAND_2024=Object.freeze([{level:3,name:"Open Hand Technique"},{level:6,name:"Wholeness of Body"},{level:11,name:"Fleet Step"},{level:17,name:"Quivering Palm"}]);

function tableFor(ruleset){if(ruleset==="2014")return P2014;if(ruleset==="2024")return P2024;throw new Error(`Unsupported Monk ruleset: ${ruleset}`);}
function validateLevel(level){const numeric=Number(level);if(!Number.isInteger(numeric)||numeric<1||numeric>20)throw new Error(`Monk level must be an integer from 1 to 20: ${level}`);return numeric;}

export function monkProgression(ruleset,level){
  try{
    const numeric=validateLevel(level),table=tableFor(ruleset),martialArts=(ruleset==="2014"?MARTIAL_ARTS_2014:MARTIAL_ARTS_2024)[numeric-1];
    return{level:numeric,martialArts,focusPoints:numeric>=2?numeric:0,unarmoredMovement:MOVEMENT[numeric-1],features:[...table[numeric]]};
  }catch(error){console.error("[monk] progression lookup failed",error);throw error;}
}

export function monkFeatures(ruleset,level,subclassId=null){
  try{
    const numeric=validateLevel(level),table=tableFor(ruleset),features=[];
    for(let current=1;current<=numeric;current++)features.push(...table[current]);
    if(subclassId&&subclassId!=="open-hand")throw new Error(`Unsupported Monk subclass for ${ruleset}: ${subclassId}`);
    if(subclassId){const subclass=ruleset==="2014"?OPEN_HAND_2014:OPEN_HAND_2024;for(const feature of subclass)if(numeric>=feature.level)features.push(feature.name);}
    const bookkeeping=new Set(["Monastic Tradition","Monastic Tradition feature","Monk Subclass","Subclass feature","Ability Score Improvement","Epic Boon"]);
    return[...new Set(features)].filter(name=>!bookkeeping.has(name));
  }catch(error){console.error("[monk] feature resolution failed",error);throw error;}
}

export function monkResources(ruleset,level){
  try{
    const row=monkProgression(ruleset,level),resources=[{id:"martial-arts",name:"Martial Arts",value:row.martialArts,detail:"Current Martial Arts die."}];
    if(row.focusPoints>0)resources.push({id:ruleset==="2014"?"ki":"focus",name:ruleset==="2014"?"Ki Points":"Focus Points",value:row.focusPoints,detail:"Regain expended points after the edition-specific rest recovery."});
    if(row.unarmoredMovement>0)resources.push({id:"unarmored-movement",name:"Unarmored Movement",value:`+${row.unarmoredMovement} ft.`,detail:"Applies while meeting the edition-specific armor and shield restrictions."});
    resources.push({id:"flurry-strikes",name:"Flurry of Blows",value:`${monkFlurryStrikes(ruleset,level)} strikes`,detail:"Number of Unarmed Strikes granted when Flurry of Blows is used."});
    return resources;
  }catch(error){console.error("[monk] resource build failed",error);throw error;}
}

export function monkSaveDC(wisdomModifier,proficiencyBonus){
  try{if(!Number.isInteger(wisdomModifier)||!Number.isInteger(proficiencyBonus))throw new Error("Monk save DC requires integer Wisdom modifier and proficiency bonus.");return 8+wisdomModifier+proficiencyBonus;}
  catch(error){console.error("[monk] save DC calculation failed",error);throw error;}
}

export function monkUnarmoredAc(abilities){try{return 10+abilityMod(abilities.dex)+abilityMod(abilities.wis);}catch(error){console.error("[monk] unarmored AC failed",error);throw error;}}
export function monkSpeed(baseSpeed,ruleset,level,{armored=false,shield=false}={}){try{const row=monkProgression(ruleset,level);return armored||shield?baseSpeed:baseSpeed+row.unarmoredMovement;}catch(error){console.error("[monk] speed calculation failed",error);throw error;}}
export function monkExtraSaveProficiencies(level){try{return validateLevel(level)>=14?[...ALL_SAVES]:[];}catch(error){console.error("[monk] extra save lookup failed",error);throw error;}}
export function monkAttackCount(level){try{return validateLevel(level)>=5?2:1;}catch(error){console.error("[monk] attack count failed",error);throw error;}}
export function monkFlurryStrikes(ruleset,level){try{const numeric=validateLevel(level);tableFor(ruleset);return ruleset==="2024"&&numeric>=10?3:2;}catch(error){console.error("[monk] Flurry count failed",error);throw error;}}
export function applyMonkAbilityProgression(abilities,ruleset,level){try{const numeric=validateLevel(level),next={...abilities};tableFor(ruleset);if(ruleset==="2024"&&numeric>=20){next.dex=Math.min(25,next.dex+4);next.wis=Math.min(25,next.wis+4);}return next;}catch(error){console.error("[monk] ability progression failed",error);throw error;}}

export const MONK_TABLES=Object.freeze({"2014":P2014,"2024":P2024});
