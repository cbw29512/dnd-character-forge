export function abilityMod(score){
  try{return Math.floor((score-10)/2);}
  catch(error){console.error("[math] abilityMod failed",error);throw error;}
}
export function proficiencyBonus(level){
  try{return 2+Math.floor((level-1)/4);}
  catch(error){console.error("[math] proficiencyBonus failed",error);throw error;}
}
export function calculateAc(armor,dexMod,shield=false,bonus=0){
  try{
    if(!armor)return 10+dexMod+(shield?2:0)+bonus;
    let base=armor.base;if(armor.formula==="light")base+=dexMod;if(armor.formula==="medium")base+=Math.min(dexMod,2);
    return base+(shield?2:0)+bonus;
  }catch(error){console.error("[math] calculateAc failed",error);throw error;}
}
export function averageHp(hitDie,level,conMod){
  try{const perLevel=Math.floor(hitDie/2)+1;return hitDie+conMod+Math.max(0,level-1)*(perLevel+conMod);}
  catch(error){console.error("[math] averageHp failed",error);throw error;}
}
