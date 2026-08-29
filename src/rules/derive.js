import { ABILITIES, SKILLS } from "../schema.js";
import { abilityMod, calculateAc, averageHp } from "./math.js";
import { speciesHpBonus, speciesSpeed, speciesMagic } from "./species.js";
import { uniqueStrings, uniqueBy, consolidateInventory } from "./duplicates.js";
import { monkArmorClass, monkHasSaveProficiency, monkSpeedBonus, monkUnarmedAttack, monkWeaponAttack } from "./monk-combat.js";
import { validateMonkCharacter } from "./monk-validation.js";
import { validateClassAdvancements } from "./advancement-feats.js";
import { validateWeaponMasteryCharacter } from "./weapon-mastery-selections.js";
import { sorcererArmorClass, sorcererDraconicHpBonus } from "./sorcerer-combat.js";
import { warlockWeaponAttack } from "./warlock-combat.js";
import { isForgeOriginalSubclass, originalSubclassFeaturesFor } from "../data/original-subclasses.js";
import { originFeatInstanceKey } from "./origin-feats.js";
import { canUseDuelingOneHanded, isRangedWeaponId } from "./weapon-properties.js";

export function deriveCharacter(character,data){
  try{
    const dex=abilityMod(character.abilities.dex),con=abilityMod(character.abilities.con),pb=character.proficiency;
    const effectiveSkills=uniqueStrings([...(character.skills||[]),...(character.warlockSelections?.bonusSkills||[])]);
    const styles=character.fightingStyles?.length?character.fightingStyles:(character.fightingStyle?[character.fightingStyle]:[]);
    const acBonus=character.homebrewAcBonus+styles.reduce((sum,style)=>sum+(style.acBonus||0),0),armor=character.equipment.armor?data.armor[character.equipment.armor]:null;
    const baseAc=character.class.id==="monk"?monkArmorClass(character,acBonus):character.class.id==="barbarian"&&!armor?10+dex+con+(character.equipment.shield?2:0)+acBonus:calculateAc(armor,dex,character.equipment.shield,acBonus),ac=character.class.id==="sorcerer"?sorcererArmorClass(character,baseAc):baseAc;
    const speciesBonusHp=speciesHpBonus(character),draconicHpBonus=sorcererDraconicHpBonus(character),toughHpBonus=character.ruleset==="2024"&&character.feats.some(feat=>feat.id==="tough")?2*character.level:0,hp=averageHp(character.class.hitDie,character.level,con)+speciesBonusHp+draconicHpBonus+toughHpBonus,alert=character.feats.some(f=>f.id==="alert")?pb:0;
    const saveBonuses=Object.fromEntries(ABILITIES.map(a=>[a,abilityMod(character.abilities[a])+((character.class.id==="monk"?monkHasSaveProficiency(character,a):character.saves.includes(a))?pb:0)]));
    const thaumaturge=character.ruleset==="2024"&&character.class.id==="cleric"&&character.divineOrder==="thaumaturge"?Math.max(1,abilityMod(character.abilities.wis)):0,magician=character.ruleset==="2024"&&character.class.id==="druid"&&character.druidSelections?.primalOrder==="magician"?Math.max(1,abilityMod(character.abilities.wis)):0;
    const skillBonuses=Object.fromEntries(Object.entries(SKILLS).map(([s,a])=>[s,abilityMod(character.abilities[a])+(effectiveSkills.includes(s)?pb:0)+(character.expertise.includes(s)?pb:0)+(["arcana","religion"].includes(s)?thaumaturge:0)+(["arcana","nature"].includes(s)?magician:0)]));
    const weaponAttacks=character.equipment.weapons.map(id=>{
      const weapon=data.weapons[id];if(!weapon)throw new Error(`Unknown equipped weapon: ${id}.`);
      if(character.class.id==="monk")return monkWeaponAttack(character,id,weapon,pb);
      const styleBonus=isRangedWeaponId(id)?styles.reduce((sum,style)=>sum+(style.rangedAttackBonus||0),0):0,damageStyleBonus=canUseDuelingOneHanded(id)?styles.reduce((sum,style)=>sum+(style.meleeDamageBonus||0),0):0;
      if(character.class.id==="warlock")return warlockWeaponAttack(character,id,weapon,pb,{attackStyleBonus:styleBonus,damageStyleBonus});
      const mod=abilityMod(character.abilities[weapon.ability]);return{...weapon,id,attackBonus:mod+pb+styleBonus,damageBonus:mod+damageStyleBonus};
    });
    const attacks=character.class.id==="monk"?[...weaponAttacks,monkUnarmedAttack(character,pb)]:weaponAttacks;
    const focusLabel=character.class.id==="druid"?"Druidic Focus":"Arcane Focus",attackInventory=weaponAttacks.map(attack=>character.equipment.focus===attack.id?`${focusLabel} (${attack.name})`:attack.name),inventory=consolidateInventory([...attackInventory,...character.equipment.gear,...(character.backgroundEquipment||character.background.equipment||[])]),saveProficiencies=character.class.id==="monk"&&character.monk?.allSaveProficiency?[...ABILITIES]:uniqueStrings(character.saves);
    const originalFeatures=character.class.id!=="barbarian"&&isForgeOriginalSubclass(character.subclass)?originalSubclassFeaturesFor(character.ruleset,character.class.id,character.level,character.subclass.id):[];
    const next={...character,skills:effectiveSkills,expertise:uniqueStrings(character.expertise),saves:saveProficiencies,languages:uniqueStrings(character.languages),toolProficiencies:uniqueStrings(character.toolProficiencies||[]),feats:uniqueBy(character.feats,originFeatInstanceKey),homebrew:uniqueBy(character.homebrew,item=>item.id),features:uniqueStrings([...(character.features||[]),...originalFeatures]),ac,hp,speciesHpBonus:speciesBonusHp,draconicHpBonus,toughHpBonus,initiative:dex+alert,initiativeAdvantage:Boolean(character.barbarian?.initiativeAdvantage||character.fighter?.initiativeAdvantage),speed:speciesSpeed(character)+(character.barbarian?.speedBonus||0)+(character.ranger?.speedBonus||0)+monkSpeedBonus(character)+Number(character.advancementSpeedBonus||0),attacks:uniqueBy(attacks,attack=>attack.name),saveBonuses,skillBonuses,passivePerception:10+skillBonuses.perception,masteryIds:[...(character.masteryIds||[])],inventory};
    const derived={...next,speciesMagic:speciesMagic(next)},advancementErrors=validateClassAdvancements(derived);if(advancementErrors.length)throw new Error(`Derived advancement validation failed: ${advancementErrors.join(" ")}`);
    const masteryErrors=validateWeaponMasteryCharacter(derived,data);if(masteryErrors.length)throw new Error(`Derived Weapon Mastery validation failed: ${masteryErrors.join(" ")}`);
    if(derived.class.id==="monk"){const errors=validateMonkCharacter(derived);if(errors.length)throw new Error(`Derived Monk validation failed: ${errors.join(" ")}`);}
    return derived;
  }catch(error){console.error("[derive] character derivation failed",error);throw error;}
}
