import { abilityMod } from "./math.js";

const RANGED_WEAPON_IDS=new Set(["longbow","shortbow","light-crossbow"]);

export function warlockPactWeaponId(character){
  try{
    if(character?.ruleset!=="2024"||character?.class?.id!=="warlock")return null;
    if(!character.warlockSelections?.invocations?.all?.includes("pact-of-the-blade"))return null;
    const id=(character.equipment?.weapons||[]).find(weaponId=>!RANGED_WEAPON_IDS.has(weaponId));
    if(!id)throw new Error("Pact of the Blade needs a verified melee weapon to use as the generated pact weapon.");
    return id;
  }catch(error){console.error("[warlock-combat] pact weapon lookup failed",error);throw error;}
}

export function warlockWeaponAttack(character,id,weapon,proficiencyBonus,{attackStyleBonus=0,damageStyleBonus=0}={}){
  try{
    const pactWeaponId=warlockPactWeaponId(character),usesCharisma=pactWeaponId===id,ability=usesCharisma?"cha":weapon.ability,mod=abilityMod(character.abilities[ability]);
    return{...weapon,id,ability,attackBonus:mod+proficiencyBonus+attackStyleBonus,damageBonus:mod+damageStyleBonus,pactWeapon:usesCharisma};
  }catch(error){console.error(`[warlock-combat] weapon attack failed for ${id}`,error);throw error;}
}
