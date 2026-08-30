const RANGED_WEAPON_IDS=Object.freeze(new Set(["light-crossbow","shortbow","longbow"]));
const TWO_HANDED_MELEE_IDS=Object.freeze(new Set(["greataxe","greatsword"]));

export function isRangedWeaponId(id){
  try{return RANGED_WEAPON_IDS.has(id);}
  catch(error){console.error("[weapon-properties] ranged lookup failed",error);throw error;}
}

export function isMeleeWeaponId(id){
  try{return Boolean(id)&&!isRangedWeaponId(id);}
  catch(error){console.error("[weapon-properties] melee lookup failed",error);throw error;}
}

export function canUseDuelingOneHanded(id){
  try{return isMeleeWeaponId(id)&&!TWO_HANDED_MELEE_IDS.has(id);}
  catch(error){console.error("[weapon-properties] Dueling lookup failed",error);throw error;}
}
