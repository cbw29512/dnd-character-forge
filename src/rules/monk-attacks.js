const VERSATILE_DAMAGE=Object.freeze({quarterstaff:"1d8",spear:"1d8"});

export function monkWeaponDamage(weaponId,weapon,martialArtsDie){
  try{
    if(!weapon?.damage)throw new Error(`Monk weapon is missing normal damage: ${weaponId}`);
    const candidates=[weapon.damage,VERSATILE_DAMAGE[weaponId],martialArtsDie].filter(Boolean);
    if(candidates.some(die=>!/^1d\d+$/.test(die)))throw new Error(`Unsupported Monk weapon damage expression: ${candidates.join(", ")}`);
    return candidates.sort((a,b)=>dieSides(b)-dieSides(a))[0];
  }catch(error){console.error("[monk-attacks] weapon damage resolution failed",error);throw error;}
}

function dieSides(die){return Number(die.slice(2));}
export const MONK_VERSATILE_DAMAGE=VERSATILE_DAMAGE;
