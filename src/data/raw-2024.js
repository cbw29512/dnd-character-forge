import { SPECIES_2024 } from "./species-2024.js";

// Verified launch slices use only SRD 5.2.1 content encoded and tested by Character Forge.
export const RAW_2024={
  ruleset:"2024",source:"RAW",
  species:SPECIES_2024,
  backgrounds:[
    {id:"acolyte",name:"Acolyte",abilities:["int","wis","cha"],feat:"magic-initiate-cleric",magicInitiateList:"cleric",skills:["insight","religion"],tool:"Calligrapher's Supplies",equipment:["Calligrapher's Supplies","Book (prayers)","Holy Symbol","Parchment (10 sheets)","Robe","8 GP"]},
    {id:"criminal",name:"Criminal",abilities:["dex","con","int"],feat:"alert",skills:["sleightOfHand","stealth"],tool:"Thieves' Tools",equipment:["2 Daggers","Thieves' Tools","Crowbar","2 Pouches","Traveler's Clothes","16 GP"]},
    {id:"sage",name:"Sage",abilities:["con","int","wis"],feat:"magic-initiate-wizard",magicInitiateList:"wizard",skills:["arcana","history"],tool:"Calligrapher's Supplies",equipment:["Quarterstaff","Calligrapher's Supplies","Book (history)","Parchment (8 sheets)","Robe","8 GP"]},
    {id:"soldier",name:"Soldier",abilities:["str","dex","con"],feat:"savage-attacker",skills:["athletics","intimidation"],toolChoices:["Dice Set","Dragonchess Set","Playing Card Set","Three-Dragon Ante Set"],equipment:["Spear","Shortbow","20 Arrows","Gaming Set","Healer's Kit","Quiver","Traveler's Clothes","14 GP"]}
  ],
  feats:[
    {id:"alert",name:"Alert",category:"Origin"},
    {id:"magic-initiate-cleric",name:"Magic Initiate (Cleric)",category:"Origin",spellList:"cleric",backgroundOnly:true},
    {id:"magic-initiate-wizard",name:"Magic Initiate (Wizard)",category:"Origin",spellList:"wizard",backgroundOnly:true},
    {id:"savage-attacker",name:"Savage Attacker",category:"Origin"},
    {id:"skilled",name:"Skilled",category:"Origin",extraSkills:3},
    {id:"boon-combat-prowess",name:"Boon of Combat Prowess",category:"Epic Boon",abilityAdd:1,abilityMaximum:30},
    {id:"boon-spell-recall",name:"Boon of Spell Recall",category:"Epic Boon",abilityAdd:1,abilityMaximum:30,abilityChoices:["int","wis","cha"]}
  ],
  classes:[
    {id:"fighter",name:"Fighter",maxLevel:20,asiLevels:[4,6,8,12,14,16],epicBoon:{level:19,feat:"boon-combat-prowess"},hitDie:10,saves:["str","con"],skillCount:2,skillChoices:["acrobatics","animalHandling","athletics","history","insight","intimidation","persuasion","perception","survival"],primary:["str","dex"],abilityPriority:["str","dex","con","wis","cha","int"],subclassLevel:3,equipmentPackages:[{id:"heavy",armor:"chain-mail",weapons:["greatsword","flail","javelin"],shield:false,styles:["defense","great-weapon"],gear:["Javelin x8","Dungeoneer's Pack","4 GP"]},{id:"light",armor:"studded-leather",weapons:["scimitar","shortsword","longbow"],shield:false,styles:["defense","archery","two-weapon"],gear:["20 Arrows","Quiver","Dungeoneer's Pack","11 GP"]}]},
    {id:"wizard",name:"Wizard",maxLevel:20,asiLevels:[4,8,12,16],epicBoon:{level:19,feat:"boon-spell-recall"},hitDie:6,saves:["int","wis"],skillCount:2,skillChoices:["arcana","history","insight","investigation","medicine","nature","religion"],primary:["int"],abilityPriority:["int","con","dex","wis","cha","str"],subclassLevel:3,spellcasting:"wizard",equipmentPackages:[{id:"scholar",armor:null,weapons:["dagger","quarterstaff"],shield:false,focus:"quarterstaff",gear:["Dagger","Robe","Spellbook","Scholar's Pack","5 GP"]}]},
    {id:"cleric",name:"Cleric",maxLevel:5,asiLevels:[4],hitDie:8,saves:["wis","cha"],skillCount:2,skillChoices:["history","insight","medicine","persuasion","religion"],primary:["wis"],abilityPriority:["wis","con","str","dex","cha","int"],subclassLevel:3,spellcasting:"cleric",equipmentPackages:[{id:"priest",armor:"chain-shirt",weapons:["mace"],shield:true,gear:["Holy Symbol","Priest's Pack","7 GP"]}]}
  ],
  subclasses:[{id:"champion",classId:"fighter",name:"Champion",level:3},{id:"evoker",classId:"wizard",name:"Evoker",level:3},{id:"life-domain",classId:"cleric",name:"Life Domain",level:3}],
  fightingStyles:{defense:{name:"Defense",acBonus:1},archery:{name:"Archery",rangedAttackBonus:2},"great-weapon":{name:"Great Weapon Fighting"},"two-weapon":{name:"Two-Weapon Fighting"}},
  armor:{"chain-mail":{name:"Chain Mail",formula:"fixed",base:16},"studded-leather":{name:"Studded Leather Armor",formula:"light",base:12},"chain-shirt":{name:"Chain Shirt",formula:"medium",base:13}},
  weapons:{greatsword:{name:"Greatsword",damage:"2d6",ability:"str",type:"Slashing",mastery:"Graze"},longsword:{name:"Longsword",damage:"1d8",ability:"str",type:"Slashing",mastery:"Sap"},flail:{name:"Flail",damage:"1d8",ability:"str",type:"Bludgeoning",mastery:"Sap"},javelin:{name:"Javelin",damage:"1d6",ability:"str",type:"Piercing",mastery:"Slow"},scimitar:{name:"Scimitar",damage:"1d6",ability:"dex",type:"Slashing",mastery:"Nick"},shortsword:{name:"Shortsword",damage:"1d6",ability:"dex",type:"Piercing",mastery:"Vex"},longbow:{name:"Longbow",damage:"1d8",ability:"dex",type:"Piercing",mastery:"Slow"},dagger:{name:"Dagger",damage:"1d4",ability:"dex",type:"Piercing",mastery:"Nick"},quarterstaff:{name:"Quarterstaff",damage:"1d6",ability:"str",type:"Bludgeoning",mastery:"Topple"},mace:{name:"Mace",damage:"1d6",ability:"str",type:"Bludgeoning",mastery:"Sap"}}
};
