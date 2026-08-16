// Verified launch slice: SRD 5.1 Human + Fighter + Champion + Acolyte.
export const RAW_2014 = {
  ruleset: "2014",
  source: "RAW",
  species: [{ id: "human", name: "Human", speed: 30, size: "Medium", traits:["Ability Score Increase","Extra Language"], abilityAdds: { str:1,dex:1,con:1,int:1,wis:1,cha:1 }, extraSkills: 0 }],
  backgrounds: [{
    id: "acolyte", name: "Acolyte", skills: ["insight", "religion"],
    languages: 2, feature:"Shelter of the Faithful",
    equipment: ["Holy Symbol", "Prayer Book or Prayer Wheel", "5 Incense", "Vestments", "Common Clothes", "15 GP"]
  }],
  classes: [{
    id: "fighter", name: "Fighter", hitDie: 10, saves: ["str", "con"], skillCount: 2,
    skillChoices: ["acrobatics","animalHandling","athletics","history","insight","intimidation","perception","survival"],
    primary: ["str","dex"], subclassLevel: 3,
    equipmentPackages: [
      { id:"shield", armor:"chain-mail", weapons:["longsword","light-crossbow"], shield:true, styles:["defense","archery"], gear:["20 Bolts","Dungeoneer's Pack"] },
      { id:"greatsword", armor:"chain-mail", weapons:["greatsword","longsword","handaxe"], shield:false, styles:["defense","great-weapon"], gear:["Handaxe x2","Explorer's Pack"] }
    ]
  }],
  subclasses: [{ id:"champion", classId:"fighter", name:"Champion", level:3 }],
  fightingStyles: {
    defense:{name:"Defense",acBonus:1}, archery:{name:"Archery",rangedAttackBonus:2},
    "great-weapon":{name:"Great Weapon Fighting"}
  },
  armor: {
    "chain-mail": { name:"Chain Mail", formula:"fixed", base:16 },
    "leather": { name:"Leather Armor", formula:"light", base:11 }
  },
  weapons: {
    longsword:{name:"Longsword",damage:"1d8",ability:"str",type:"Slashing"},
    greatsword:{name:"Greatsword",damage:"2d6",ability:"str",type:"Slashing"},
    "light-crossbow":{name:"Light Crossbow",damage:"1d8",ability:"dex",type:"Piercing"},
    handaxe:{name:"Handaxe",damage:"1d6",ability:"str",type:"Slashing"}
  }
};
