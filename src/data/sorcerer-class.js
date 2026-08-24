export const SORCERER_CLASS_2014=Object.freeze({
  id:"sorcerer",name:"Sorcerer",maxLevel:20,asiLevels:[4,8,12,16,19],hitDie:6,saves:["con","cha"],skillCount:2,skillChoices:["arcana","deception","insight","intimidation","persuasion","religion"],primary:["cha"],abilityPriority:["cha","con","dex","wis","int","str"],subclassLevel:1,spellcasting:"sorcerer",
  equipmentPackages:[Object.freeze({id:"draconic-focus",armor:null,weapons:["light-crossbow","dagger","dagger"],shield:false,focus:"Arcane Focus",gear:["20 Bolts","Dungeoneer's Pack","Arcane Focus"]})]
});

export const SORCERER_CLASS_2024=Object.freeze({
  id:"sorcerer",name:"Sorcerer",maxLevel:20,asiLevels:[4,8,12,16],epicBoon:{level:19,feat:"boon-dimensional-travel"},hitDie:6,saves:["con","cha"],skillCount:2,skillChoices:["arcana","deception","insight","intimidation","persuasion","religion"],primary:["cha"],abilityPriority:["cha","con","dex","wis","int","str"],subclassLevel:3,spellcasting:"sorcerer",
  equipmentPackages:[Object.freeze({id:"draconic-focus",armor:null,weapons:["spear","dagger","dagger"],shield:false,focus:"Arcane Focus (crystal)",gear:["Arcane Focus (crystal)","Dungeoneer's Pack","28 GP"]})]
});

export const SORCERER_SUBCLASS_2014=Object.freeze({id:"draconic-bloodline",classId:"sorcerer",name:"Draconic Bloodline",level:1});
export const SORCERER_SUBCLASS_2024=Object.freeze({id:"draconic-sorcery",classId:"sorcerer",name:"Draconic Sorcery",level:3});

export const DRACONIC_ANCESTRIES_2014=Object.freeze([
  Object.freeze({id:"black",name:"Black",damageType:"Acid"}),Object.freeze({id:"blue",name:"Blue",damageType:"Lightning"}),Object.freeze({id:"brass",name:"Brass",damageType:"Fire"}),Object.freeze({id:"bronze",name:"Bronze",damageType:"Lightning"}),Object.freeze({id:"copper",name:"Copper",damageType:"Acid"}),Object.freeze({id:"gold",name:"Gold",damageType:"Fire"}),Object.freeze({id:"green",name:"Green",damageType:"Poison"}),Object.freeze({id:"red",name:"Red",damageType:"Fire"}),Object.freeze({id:"silver",name:"Silver",damageType:"Cold"}),Object.freeze({id:"white",name:"White",damageType:"Cold"})
]);

export const DRACONIC_AFFINITIES_2024=Object.freeze(["Acid","Cold","Fire","Lightning","Poison"]);
