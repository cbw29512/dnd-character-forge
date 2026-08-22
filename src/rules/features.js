export function applyClassAsi(scores,level,primary){
  try{if(level<4)return scores;const next={...scores},target=primary.find(ability=>next[ability]<20)||primary[0];next[target]=Math.min(20,next[target]+2);return next;}
  catch(error){console.error("[features] class ASI failed",error);throw error;}
}

export const applyFighterAsi=(scores,level)=>applyClassAsi(scores,level,[scores.str>=scores.dex?"str":"dex"]);
