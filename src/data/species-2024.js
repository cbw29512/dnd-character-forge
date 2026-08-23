export const DRAGONBORN_ANCESTRIES=Object.freeze([
  {id:"black",name:"Black",damageType:"Acid"},
  {id:"blue",name:"Blue",damageType:"Lightning"},
  {id:"brass",name:"Brass",damageType:"Fire"},
  {id:"bronze",name:"Bronze",damageType:"Lightning"},
  {id:"copper",name:"Copper",damageType:"Acid"},
  {id:"gold",name:"Gold",damageType:"Fire"},
  {id:"green",name:"Green",damageType:"Poison"},
  {id:"red",name:"Red",damageType:"Fire"},
  {id:"silver",name:"Silver",damageType:"Cold"},
  {id:"white",name:"White",damageType:"Cold"}
]);

export const ELF_LINEAGES=Object.freeze({
  drow:Object.freeze({id:"drow",name:"Drow",darkvision:120,cantrip:"Dancing Lights",level3:"Faerie Fire",level5:"Darkness"}),
  high:Object.freeze({id:"high",name:"High Elf",replaceableWizardCantrip:true,level3:"Detect Magic",level5:"Misty Step"}),
  wood:Object.freeze({id:"wood",name:"Wood Elf",speed:35,cantrip:"Druidcraft",level3:"Longstrider",level5:"Pass without Trace"})
});

export const GNOME_LINEAGES=Object.freeze({
  forest:Object.freeze({id:"forest",name:"Forest Gnome",cantrips:["Minor Illusion"],alwaysPrepared:["Speak with Animals"],freeUses:"PB"}),
  rock:Object.freeze({id:"rock",name:"Rock Gnome",cantrips:["Mending","Prestidigitation"],clockworkDevice:true})
});

export const GOLIATH_ANCESTRIES=Object.freeze({
  cloud:Object.freeze({id:"cloud",name:"Cloud's Jaunt",giant:"Cloud Giant"}),
  fire:Object.freeze({id:"fire",name:"Fire's Burn",giant:"Fire Giant"}),
  frost:Object.freeze({id:"frost",name:"Frost's Chill",giant:"Frost Giant"}),
  hill:Object.freeze({id:"hill",name:"Hill's Tumble",giant:"Hill Giant"}),
  stone:Object.freeze({id:"stone",name:"Stone's Endurance",giant:"Stone Giant"}),
  storm:Object.freeze({id:"storm",name:"Storm's Thunder",giant:"Storm Giant"})
});

export const TIEFLING_LEGACIES=Object.freeze({
  abyssal:Object.freeze({id:"abyssal",name:"Abyssal",resistance:"Poison",cantrip:"Poison Spray",level3:"Ray of Sickness",level5:"Hold Person"}),
  chthonic:Object.freeze({id:"chthonic",name:"Chthonic",resistance:"Necrotic",cantrip:"Chill Touch",level3:"False Life",level5:"Ray of Enfeeblement"}),
  infernal:Object.freeze({id:"infernal",name:"Infernal",resistance:"Fire",cantrip:"Fire Bolt",level3:"Hellish Rebuke",level5:"Darkness"})
});

export const SPECIES_2024=Object.freeze([
  Object.freeze({id:"dragonborn",name:"Dragonborn",speed:30,size:"Medium",traits:["Draconic Ancestry","Breath Weapon","Damage Resistance","Darkvision","Draconic Flight"]}),
  Object.freeze({id:"dwarf",name:"Dwarf",speed:30,size:"Medium",traits:["Darkvision","Dwarven Resilience","Dwarven Toughness","Stonecunning"]}),
  Object.freeze({id:"elf",name:"Elf",speed:30,size:"Medium",traits:["Darkvision","Elven Lineage","Fey Ancestry","Keen Senses","Trance"]}),
  Object.freeze({id:"gnome",name:"Gnome",speed:30,size:"Small",traits:["Darkvision","Gnomish Cunning","Gnomish Lineage"]}),
  Object.freeze({id:"goliath",name:"Goliath",speed:35,size:"Medium",traits:["Giant Ancestry","Large Form","Powerful Build"]}),
  Object.freeze({id:"halfling",name:"Halfling",speed:30,size:"Small",traits:["Brave","Halfling Nimbleness","Luck","Naturally Stealthy"]}),
  Object.freeze({id:"human",name:"Human",speed:30,size:"Small or Medium",traits:["Resourceful","Skillful","Versatile"],originFeat:true}),
  Object.freeze({id:"orc",name:"Orc",speed:30,size:"Medium",traits:["Adrenaline Rush","Darkvision","Relentless Endurance"]}),
  Object.freeze({id:"tiefling",name:"Tiefling",speed:30,size:"Small or Medium",traits:["Darkvision","Fiendish Legacy","Otherworldly Presence"]})
]);
