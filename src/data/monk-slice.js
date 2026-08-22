// Hidden Monk data used for integration testing before the class is exposed in RAW_2014/RAW_2024.
export const MONK_2014=Object.freeze({
  class:{id:"monk",name:"Monk",hitDie:8,saves:["str","dex"],skillCount:2,skillChoices:["acrobatics","athletics","history","insight","religion","stealth"],primary:["dex","wis"],abilityPriority:["dex","wis","con","str","cha","int"],subclassLevel:3,maxLevel:20,equipmentPackages:[{id:"staff-darts",armor:null,weapons:["quarterstaff"],shield:false,gear:["Dart x10","Explorer's Pack","Artisan's Tools"]}]},
  subclass:{id:"open-hand",classId:"monk",name:"Way of the Open Hand",level:3}
});

export const MONK_2024=Object.freeze({
  class:{id:"monk",name:"Monk",hitDie:8,saves:["str","dex"],skillCount:2,skillChoices:["acrobatics","athletics","history","insight","religion","stealth"],primary:["dex","wis"],abilityPriority:["dex","wis","con","str","cha","int"],subclassLevel:3,maxLevel:20,equipmentPackages:[{id:"spear-daggers",armor:null,weapons:["spear","dagger"],shield:false,gear:["Dagger x4","Artisan's Tools","Explorer's Pack","11 GP"]}]},
  subclass:{id:"open-hand",classId:"monk",name:"Warrior of the Open Hand",level:3}
});
