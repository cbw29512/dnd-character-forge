// Class-aware sheet presentation contract.
// This file controls information hierarchy and visual identity only.
// It must never invent mechanics; rendered values still come from the validated character model.

const COMMON = Object.freeze({ secondary: Object.freeze(["savingThrows", "skills", "equipment"]) });

export const SHEET_PROFILES = Object.freeze({
  barbarian: Object.freeze({id:"barbarian",label:"Barbarian",theme:"primal",primary:Object.freeze(["classResources","attacks","feats","playReference","savingThrows"]),secondary:Object.freeze(["skills","equipment"])}),
  bard: Object.freeze({id:"bard",label:"Bard",theme:"performance",primary:Object.freeze(["classResources","spellcasting","spellReference","skills"]),secondary:Object.freeze(["attacks","savingThrows","equipment"])}),
  cleric: Object.freeze({id:"cleric",label:"Cleric",theme:"divine",primary:Object.freeze(["classResources","spellcasting","spellReference","playReference"]),secondary:Object.freeze(["attacks","savingThrows","skills","equipment"])}),
  druid: Object.freeze({id:"druid",label:"Druid",theme:"wild",primary:Object.freeze(["classResources","spellcasting","spellReference","playReference"]),secondary:Object.freeze(["attacks","savingThrows","skills","equipment"])}),
  fighter: Object.freeze({id:"fighter",label:"Fighter",theme:"martial",primary:Object.freeze(["attacks","classResources","playReference"]),secondary:COMMON.secondary}),
  monk: Object.freeze({id:"monk",label:"Monk",theme:"discipline",primary:Object.freeze(["classResources","attacks","playReference"]),secondary:COMMON.secondary}),
  paladin: Object.freeze({id:"paladin",label:"Paladin",theme:"oath",primary:Object.freeze(["classResources","attacks","spellcasting","spellReference","playReference"]),secondary:Object.freeze(["savingThrows","skills","equipment"])}),
  ranger: Object.freeze({id:"ranger",label:"Ranger",theme:"wilderness",primary:Object.freeze(["attacks","classResources","spellcasting","spellReference","playReference"]),secondary:Object.freeze(["savingThrows","skills","equipment"])}),
  rogue: Object.freeze({id:"rogue",label:"Rogue",theme:"cunning",primary:Object.freeze(["classResources","attacks","skills","playReference"]),secondary:Object.freeze(["savingThrows","equipment"])}),
  sorcerer: Object.freeze({id:"sorcerer",label:"Sorcerer",theme:"arcane-blood",primary:Object.freeze(["classResources","spellcasting","spellReference","playReference"]),secondary:Object.freeze(["attacks","savingThrows","skills","equipment"])}),
  warlock: Object.freeze({id:"warlock",label:"Warlock",theme:"pact",primary:Object.freeze(["classResources","spellcasting","spellReference","attacks","playReference"]),secondary:Object.freeze(["savingThrows","skills","equipment"])}),
  wizard: Object.freeze({id:"wizard",label:"Wizard",theme:"arcane",primary:Object.freeze(["spellcasting","spellReference","classResources","playReference"]),secondary:Object.freeze(["attacks","savingThrows","skills","equipment"])})
});

export function sheetProfileFor(classId){try{const profile=SHEET_PROFILES[classId];if(!profile)throw new Error(`No sheet profile is registered for class: ${classId}`);return profile;}catch(error){console.error("[sheet-profiles] failed to resolve class sheet profile",error);throw error;}}
export function orderedSheetSections(character){try{if(!character?.class?.id)throw new Error("Character class is required for sheet layout.");const profile=sheetProfileFor(character.class.id),available=new Set(["attacks","savingThrows","skills","playReference","equipment"]);if(character.feats?.length)available.add("feats");if(character.spells){available.add("spellcasting");if(character.ruleset==="2024")available.add("spellReference");}if(character.classResources?.length)available.add("classResources");return[...profile.primary,...profile.secondary].filter((section,index,values)=>available.has(section)&&values.indexOf(section)===index);}catch(error){console.error("[sheet-profiles] failed to order sheet sections",error);throw error;}}
