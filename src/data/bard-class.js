const ALL_SKILLS=Object.freeze(["acrobatics","animalHandling","arcana","athletics","deception","history","insight","intimidation","investigation","medicine","nature","perception","performance","persuasion","religion","sleightOfHand","stealth","survival"]);
export const BARD_INSTRUMENTS=Object.freeze(["Bagpipes","Drum","Dulcimer","Flute","Horn","Lute","Lyre","Pan Flute","Shawm","Viol"]);

export const BARD_CLASS_2014=Object.freeze({
  id:"bard",name:"Bard",maxLevel:20,asiLevels:[4,8,12,16,19],hitDie:8,saves:["dex","cha"],skillCount:3,skillChoices:ALL_SKILLS,primary:["cha"],abilityPriority:["cha","dex","con","wis","int","str"],subclassLevel:3,spellcasting:"bard",instrumentCount:3,instrumentChoices:BARD_INSTRUMENTS,
  equipmentPackages:[Object.freeze({id:"lore-rapier",armor:"leather",weapons:["rapier","dagger"],shield:false,focus:"Lute",gear:["Diplomat's Pack","Lute"]})]
});

export const BARD_CLASS_2024=Object.freeze({
  id:"bard",name:"Bard",maxLevel:20,asiLevels:[4,8,12,16],epicBoon:{level:19,feat:"boon-spell-recall"},hitDie:8,saves:["dex","cha"],skillCount:3,skillChoices:ALL_SKILLS,primary:["cha"],abilityPriority:["cha","dex","con","wis","int","str"],subclassLevel:3,spellcasting:"bard",instrumentCount:3,instrumentChoices:BARD_INSTRUMENTS,
  equipmentPackages:[Object.freeze({id:"entertainer",armor:"leather",weapons:["dagger","dagger"],shield:false,focus:"Lute",gear:["Musical Instrument (Lute)","Entertainer's Pack","19 GP"]})]
});

export const BARD_SUBCLASS_2014=Object.freeze({id:"college-lore",classId:"bard",name:"College of Lore",level:3});
export const BARD_SUBCLASS_2024=Object.freeze({id:"college-lore",classId:"bard",name:"College of Lore",level:3});
