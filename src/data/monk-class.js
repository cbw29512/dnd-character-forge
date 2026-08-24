import { BARD_INSTRUMENTS } from "./bard-class.js";

const MONK_SKILLS=Object.freeze(["acrobatics","athletics","history","insight","religion","stealth"]);
const ARTISAN_TOOLS=Object.freeze(["Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools","Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools"]);
export const MONK_TOOL_CHOICES=Object.freeze([...ARTISAN_TOOLS,...BARD_INSTRUMENTS]);

export const MONK_CLASS_2014=Object.freeze({
  id:"monk",name:"Monk",maxLevel:20,asiLevels:[4,8,12,16,19],hitDie:8,saves:["str","dex"],skillCount:2,skillChoices:MONK_SKILLS,primary:["dex","wis"],abilityPriority:["dex","wis","con","str","int","cha"],subclassLevel:3,toolCount:1,toolChoices:MONK_TOOL_CHOICES,
  monkWeaponChoices:Object.freeze(["shortsword","handaxe","javelin","dagger","quarterstaff","mace"]),
  equipmentPackages:[Object.freeze({id:"open-hand",armor:null,weapons:["shortsword","dart","dart","dart","dart","dart","dart","dart","dart","dart","dart"],shield:false,gear:["Dungeoneer's Pack"]})]
});

export const MONK_CLASS_2024=Object.freeze({
  id:"monk",name:"Monk",maxLevel:20,asiLevels:[4,8,12,16],epicBoon:{level:19,feat:"boon-irresistible-offense"},hitDie:8,saves:["str","dex"],skillCount:2,skillChoices:MONK_SKILLS,primary:["dex","wis"],abilityPriority:["dex","wis","con","str","int","cha"],subclassLevel:3,toolCount:1,toolChoices:MONK_TOOL_CHOICES,startingToolInEquipment:true,
  monkWeaponChoices:Object.freeze(["spear","handaxe","javelin","dagger","quarterstaff","mace","sickle","scimitar","shortsword"]),
  equipmentPackages:[Object.freeze({id:"open-hand",armor:null,weapons:["spear","dagger","dagger","dagger","dagger","dagger"],shield:false,gear:["Explorer's Pack","11 GP"]})]
});

export const MONK_SUBCLASS_2014=Object.freeze({id:"open-hand",classId:"monk",name:"Way of the Open Hand",level:3});
export const MONK_SUBCLASS_2024=Object.freeze({id:"open-hand",classId:"monk",name:"Warrior of the Open Hand",level:3});

export const MONK_WEAPONS_2014=Object.freeze({dart:Object.freeze({name:"Dart",damage:"1d4",ability:"dex",type:"Piercing"})});
export const MONK_WEAPONS_2024=Object.freeze({spear:Object.freeze({name:"Spear",damage:"1d6",ability:"str",type:"Piercing",mastery:"Sap"})});
