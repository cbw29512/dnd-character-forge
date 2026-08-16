// Verified launch slice: SRD 5.2.1 Human + Fighter + Champion + non-spell backgrounds.
export const RAW_2024 = {
  ruleset: "2024", source: "RAW",
  species: [{ id:"human", name:"Human", speed:30, size:"Small or Medium", traits:["Resourceful","Skillful","Versatile"], extraSkills:1, originFeat:true }],
  backgrounds: [
    { id:"criminal", name:"Criminal", abilities:["dex","con","int"], feat:"alert", skills:["sleightOfHand","stealth"], tool:"Thieves' Tools", equipment:["2 Daggers","Thieves' Tools","Crowbar","2 Pouches","Traveler's Clothes","16 GP"] },
    { id:"soldier", name:"Soldier", abilities:["str","dex","con"], feat:"savage-attacker", skills:["athletics","intimidation"], tool:"Gaming Set", equipment:["Spear","Shortbow","20 Arrows","Gaming Set","Healer's Kit","Quiver","Traveler's Clothes","14 GP"] }
  ],
  feats: [
    { id:"alert", name:"Alert", category:"Origin" },
    { id:"savage-attacker", name:"Savage Attacker", category:"Origin" },
    { id:"skilled", name:"Skilled", category:"Origin", extraSkills:3 }
  ],
  classes: [{
    id:"fighter", name:"Fighter", hitDie:10, saves:["str","con"], skillCount:2,
    skillChoices:["acrobatics","animalHandling","athletics","history","insight","intimidation","persuasion","perception","survival"],
    primary:["str","dex"], subclassLevel:3,
    equipmentPackages:[
      { id:"heavy", armor:"chain-mail", weapons:["greatsword","flail","javelin"], shield:false, styles:["defense","great-weapon"], gear:["Javelin x8","Dungeoneer's Pack","4 GP"] },
      { id:"light", armor:"studded-leather", weapons:["scimitar","shortsword","longbow"], shield:false, styles:["defense","archery","two-weapon"], gear:["20 Arrows","Quiver","Dungeoneer's Pack","11 GP"] }
    ]
  }],
  subclasses:[{id:"champion",classId:"fighter",name:"Champion",level:3}],
  fightingStyles:{
    defense:{name:"Defense",acBonus:1}, archery:{name:"Archery",rangedAttackBonus:2},
    "great-weapon":{name:"Great Weapon Fighting"}, "two-weapon":{name:"Two-Weapon Fighting"}
  },
  armor:{
    "chain-mail":{name:"Chain Mail",formula:"fixed",base:16},
    "studded-leather":{name:"Studded Leather Armor",formula:"light",base:12}
  },
  weapons:{
    greatsword:{name:"Greatsword",damage:"2d6",ability:"str",type:"Slashing",mastery:"Graze"},
    longsword:{name:"Longsword",damage:"1d8",ability:"str",type:"Slashing",mastery:"Sap"},
    flail:{name:"Flail",damage:"1d8",ability:"str",type:"Bludgeoning",mastery:"Sap"},
    javelin:{name:"Javelin",damage:"1d6",ability:"str",type:"Piercing",mastery:"Slow"},
    scimitar:{name:"Scimitar",damage:"1d6",ability:"dex",type:"Slashing",mastery:"Nick"},
    shortsword:{name:"Shortsword",damage:"1d6",ability:"dex",type:"Piercing",mastery:"Vex"},
    longbow:{name:"Longbow",damage:"1d8",ability:"dex",type:"Piercing",mastery:"Slow"}
  }
};
