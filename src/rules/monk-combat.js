import { abilityMod } from "./math.js";

export function monkArmorClass(character,acBonus=0){
  try{
    if(character?.class?.id!=="monk")throw new Error("Monk AC requires a Monk character.");
    if(character.equipment?.armor||character.equipment?.shield)throw new Error("Monk Unarmored Defense cannot be applied while wearing armor or wielding a shield.");
    return 10+abilityMod(character.abilities.dex)+abilityMod(character.abilities.wis)+acBonus;
  }catch(error){console.error("[monk-combat] AC derivation failed",error);throw error;}
}

export function monkWeaponAttack(character,id,weapon,proficiencyBonus){
  try{
    if(character?.class?.id!=="monk"||!character.monk)throw new Error("Monk weapon attack requires Monk progression data.");
    if(!weapon)throw new Error(`Monk weapon data is missing for ${id}.`);
    const isMonkWeapon=(character.class.monkWeaponChoices||[]).includes(id),dex=abilityMod(character.abilities.dex),base=abilityMod(character.abilities[weapon.ability]);
    const modifier=isMonkWeapon?Math.max(dex,base):base,damage=isMonkWeapon?largerDamageDie(weapon.damage,character.monk.martialArtsDie):weapon.damage;
    return {...weapon,id,abilityModifier:modifier,attackBonus:modifier+proficiencyBonus,damageBonus:modifier,damage};
  }catch(error){console.error("[monk-combat] weapon attack derivation failed",error);throw error;}
}

export function monkUnarmedAttack(character,proficiencyBonus){
  try{
    if(character?.class?.id!=="monk"||!character.monk)throw new Error("Monk unarmed strike requires Monk progression data.");
    const modifier=abilityMod(character.abilities.dex);
    return{id:"unarmed-strike",name:"Unarmed Strike",damage:`1${character.monk.martialArtsDie}`,ability:"dex",type:"Bludgeoning",attackBonus:modifier+proficiencyBonus,damageBonus:modifier};
  }catch(error){console.error("[monk-combat] unarmed strike derivation failed",error);throw error;}
}

export function monkSpeedBonus(character){
  try{
    if(character?.class?.id!=="monk")return 0;
    if(character.equipment?.armor||character.equipment?.shield)return 0;
    return character.monk?.unarmoredMovementBonus||0;
  }catch(error){console.error("[monk-combat] speed derivation failed",error);throw error;}
}

export function monkHasSaveProficiency(character,ability){
  try{return Boolean(character?.saves?.includes(ability)||character?.monk?.allSaveProficiency);}catch(error){console.error("[monk-combat] save proficiency resolution failed",error);throw error;}
}

function largerDamageDie(normalDamage,martialArtsDie){
  try{
    const normal=String(normalDamage).match(/^(\d+)d(\d+)$/),martial=String(martialArtsDie).match(/^d(\d+)$/);if(!normal||!martial)return normalDamage;
    if(Number(normal[1])!==1)return normalDamage;
    return Number(martial[1])>Number(normal[2])?`1d${martial[1]}`:normalDamage;
  }catch(error){console.error("[monk-combat] damage die comparison failed",error);throw error;}
}
