const freeze=record=>Object.freeze(record);

export const METAMAGIC_2014=Object.freeze([
  freeze({id:"careful-spell",name:"Careful Spell",cost:1,protectedTargets:"Charisma modifier (minimum 1)",saveEffect:"Automatically succeeds",successDamageProtection:false}),
  freeze({id:"distant-spell",name:"Distant Spell",cost:1,doubleRangeMinimumFeet:5,touchRangeFeet:30}),
  freeze({id:"empowered-spell",name:"Empowered Spell",cost:1,rerollDamageDice:"Charisma modifier (minimum 1)",mustUseNewRolls:true,canCombineWithOtherMetamagic:true}),
  freeze({id:"extended-spell",name:"Extended Spell",cost:1,minimumDurationMinutes:1,durationMultiplier:2,maximumDurationHours:24,concentrationSaveAdvantage:false}),
  freeze({id:"heightened-spell",name:"Heightened Spell",cost:3,disadvantageTargets:1,saveDisadvantage:"First saving throw against the spell"}),
  freeze({id:"quickened-spell",name:"Quickened Spell",cost:2,requiredCastingTime:"Action",newCastingTime:"Bonus Action",level1SpellTurnRestriction:false}),
  freeze({id:"subtle-spell",name:"Subtle Spell",cost:1,removesComponents:Object.freeze(["Verbal","Somatic"]),costlyMaterialException:false}),
  freeze({id:"twinned-spell",name:"Twinned Spell",cost:"Spell level (minimum 1)",singleTargetOnly:true,selfRangeAllowed:false,mustBeUnableToTargetMultipleAtCurrentLevel:true,effectiveLevelIncrease:0})
]);

export const METAMAGIC_2024=Object.freeze([
  freeze({id:"careful-spell",name:"Careful Spell",cost:1,protectedTargets:"Charisma modifier (minimum 1)",saveEffect:"Automatically succeeds",successDamageProtection:true}),
  freeze({id:"distant-spell",name:"Distant Spell",cost:1,doubleRangeMinimumFeet:5,touchRangeFeet:30}),
  freeze({id:"empowered-spell",name:"Empowered Spell",cost:1,rerollDamageDice:"Charisma modifier (minimum 1)",mustUseNewRolls:true,canCombineWithOtherMetamagic:true}),
  freeze({id:"extended-spell",name:"Extended Spell",cost:1,minimumDurationMinutes:1,durationMultiplier:2,maximumDurationHours:24,concentrationSaveAdvantage:true}),
  freeze({id:"heightened-spell",name:"Heightened Spell",cost:2,disadvantageTargets:1,saveDisadvantage:"Saving throws against the spell"}),
  freeze({id:"quickened-spell",name:"Quickened Spell",cost:2,requiredCastingTime:"Action",newCastingTime:"Bonus Action",level1SpellTurnRestriction:true}),
  freeze({id:"seeking-spell",name:"Seeking Spell",cost:1,rerollMissedSpellAttack:true,mustUseNewRoll:true,canCombineWithOtherMetamagic:true}),
  freeze({id:"subtle-spell",name:"Subtle Spell",cost:1,removesComponents:Object.freeze(["Verbal","Somatic","Material"]),costlyMaterialException:true}),
  freeze({id:"transmuted-spell",name:"Transmuted Spell",cost:1,damageTypes:Object.freeze(["Acid","Cold","Fire","Lightning","Poison","Thunder"])}),
  freeze({id:"twinned-spell",name:"Twinned Spell",cost:1,requiresUpcastAdditionalTarget:true,effectiveLevelIncrease:1})
]);

export function metamagicOptionsFor(ruleset){
  try{if(ruleset==="2014")return METAMAGIC_2014;if(ruleset==="2024")return METAMAGIC_2024;throw new Error(`Unsupported Sorcerer Metamagic ruleset: ${ruleset}.`);}
  catch(error){console.error("[sorcerer-metamagic] option lookup failed",error);throw error;}
}
export function metamagicById(ruleset,id){
  try{const option=metamagicOptionsFor(ruleset).find(item=>item.id===id);if(!option)throw new Error(`Unknown ${ruleset} Metamagic option: ${id}.`);return option;}
  catch(error){console.error("[sorcerer-metamagic] option resolution failed",error);throw error;}
}
