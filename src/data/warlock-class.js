const SLOT_TABLE_2014=Object.freeze([null,{slots:1,slotLevel:1},{slots:2,slotLevel:1},{slots:2,slotLevel:2},{slots:2,slotLevel:2},{slots:2,slotLevel:3},{slots:2,slotLevel:3},{slots:2,slotLevel:4},{slots:2,slotLevel:4},{slots:2,slotLevel:5},{slots:2,slotLevel:5},{slots:3,slotLevel:5},{slots:3,slotLevel:5},{slots:3,slotLevel:5},{slots:3,slotLevel:5},{slots:3,slotLevel:5},{slots:3,slotLevel:5},{slots:4,slotLevel:5},{slots:4,slotLevel:5},{slots:4,slotLevel:5},{slots:4,slotLevel:5}]);
const SPELLS_KNOWN_2014=Object.freeze([0,2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15]);
const CANTRIPS_2014=Object.freeze([0,2,2,2,2,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4]);
const INVOCATIONS_2014=Object.freeze([0,0,2,2,2,3,4,4,5,5,5,5,6,6,7,7,7,8,8,8,8]);
const SLOT_TABLE_2024=SLOT_TABLE_2014;
const CANTRIPS_2024=Object.freeze([0,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4]);
const PREPARED_2024=Object.freeze([0,2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15]);
const INVOCATIONS_2024=Object.freeze([0,1,3,3,3,5,5,6,6,7,7,7,8,8,9,9,9,9,10,10,10]);
const SKILLS=Object.freeze(["arcana","deception","history","intimidation","investigation","nature","religion"]);

function progression(level,ruleset){
  try{
    const value=Number(level);
    if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Warlock level ${level}.`);
    if(ruleset==="2014")return Object.freeze({pactMagic:SLOT_TABLE_2014[value],cantripsKnown:CANTRIPS_2014[value],spellsKnown:SPELLS_KNOWN_2014[value],invocationsKnown:INVOCATIONS_2014[value],subclassLevel:1,pactBoonLevel:3,mysticArcanum:Object.freeze([11,13,15,17].filter(required=>value>=required)),abilityScoreImprovement:[4,8,12,16,19].includes(value),magicalCunning:false,contactPatron:false,epicBoon:false,eldritchMaster:value>=20});
    if(ruleset==="2024")return Object.freeze({pactMagic:SLOT_TABLE_2024[value],cantripsKnown:CANTRIPS_2024[value],preparedSpells:PREPARED_2024[value],invocationsKnown:INVOCATIONS_2024[value],subclassLevel:3,pactBoonLevel:null,mysticArcanum:Object.freeze([11,13,15,17].filter(required=>value>=required)),abilityScoreImprovement:[4,8,12,16].includes(value),magicalCunning:value>=2,contactPatron:value>=9,epicBoon:value>=19,eldritchMaster:value>=20});
    throw new Error(`Unsupported Warlock ruleset: ${ruleset}.`);
  }catch(error){console.error("[warlock] progression resolution failed",error);throw error;}
}

export function warlockProgressionFor(ruleset,level){return progression(level,ruleset);}

export const WARLOCK_CLASS_2014=Object.freeze({id:"warlock",name:"Warlock",maxLevel:20,asiLevels:[4,8,12,16,19],hitDie:8,saves:["wis","cha"],skillCount:2,skillChoices:SKILLS,primary:["cha"],abilityPriority:["cha","con","dex","wis","int","str"],subclassLevel:1,spellcasting:"warlock",pactMagic:true,invocations:true,progression,equipmentPackages:[Object.freeze({id:"light-crossbow",armor:"leather",weapons:["light-crossbow","dagger","dagger"],shield:false,focus:"arcane-focus",gear:["20 Bolts","Component Pouch","Scholar's Pack"]})]});
export const WARLOCK_CLASS_2024=Object.freeze({id:"warlock",name:"Warlock",maxLevel:20,asiLevels:[4,8,12,16],epicBoon:{level:19,feat:"boon-combat-prowess"},hitDie:8,saves:["wis","cha"],skillCount:2,skillChoices:SKILLS,primary:["cha"],abilityPriority:["cha","con","dex","wis","int","str"],subclassLevel:3,spellcasting:"warlock",pactMagic:true,invocations:true,progression,equipmentPackages:[Object.freeze({id:"orb",armor:"leather",weapons:["sickle","dagger","dagger"],shield:false,focus:"arcane-focus-orb",gear:["Book (occult lore)","Scholar's Pack","15 GP"]}),Object.freeze({id:"gold",armor:null,weapons:[],shield:false,gear:["100 GP"]})]});

export const WARLOCK_SUBCLASSES_2014=Object.freeze([Object.freeze({id:"archfey",classId:"warlock",name:"The Archfey",level:1}),Object.freeze({id:"fiend",classId:"warlock",name:"The Fiend",level:1}),Object.freeze({id:"great-old-one",classId:"warlock",name:"The Great Old One",level:1})]);
export const WARLOCK_SUBCLASSES_2024=Object.freeze([Object.freeze({id:"fiend",classId:"warlock",name:"Fiend Patron",level:3})]);
