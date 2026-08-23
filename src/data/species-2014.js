export const LANGUAGES_2014=Object.freeze(["Common","Dwarvish","Elvish","Giant","Gnomish","Goblin","Halfling","Orc","Abyssal","Celestial","Draconic","Deep Speech","Infernal","Primordial","Sylvan","Undercommon"]);

export const DWARF_TOOLS_2014=Object.freeze([
  Object.freeze({id:"smiths-tools",name:"Smith's Tools"}),
  Object.freeze({id:"brewers-supplies",name:"Brewer's Supplies"}),
  Object.freeze({id:"masons-tools",name:"Mason's Tools"})
]);

export const DRAGONBORN_ANCESTRIES_2014=Object.freeze([
  Object.freeze({id:"black",name:"Black",damageType:"Acid",area:"5 by 30 ft line",save:"dex"}),
  Object.freeze({id:"blue",name:"Blue",damageType:"Lightning",area:"5 by 30 ft line",save:"dex"}),
  Object.freeze({id:"brass",name:"Brass",damageType:"Fire",area:"5 by 30 ft line",save:"dex"}),
  Object.freeze({id:"bronze",name:"Bronze",damageType:"Lightning",area:"5 by 30 ft line",save:"dex"}),
  Object.freeze({id:"copper",name:"Copper",damageType:"Acid",area:"5 by 30 ft line",save:"dex"}),
  Object.freeze({id:"gold",name:"Gold",damageType:"Fire",area:"15 ft cone",save:"dex"}),
  Object.freeze({id:"green",name:"Green",damageType:"Poison",area:"15 ft cone",save:"con"}),
  Object.freeze({id:"red",name:"Red",damageType:"Fire",area:"15 ft cone",save:"dex"}),
  Object.freeze({id:"silver",name:"Silver",damageType:"Cold",area:"15 ft cone",save:"con"}),
  Object.freeze({id:"white",name:"White",damageType:"Cold",area:"15 ft cone",save:"con"})
]);

const race=(id,name,size,speed,abilityAdds,fixedLanguages,traits,extra={})=>Object.freeze({id,name,size,speed,abilityAdds:Object.freeze(abilityAdds),fixedLanguages:Object.freeze(fixedLanguages),traits:Object.freeze(traits),...extra});

export const SPECIES_2014=Object.freeze([
  race("dwarf","Dwarf","Medium",25,{con:2,wis:1},["Common","Dwarvish"],["Ability Score Increase","Darkvision","Dwarven Resilience","Dwarven Combat Training","Tool Proficiency","Stonecunning","Dwarven Toughness"],{subrace:"hill",subraceName:"Hill Dwarf"}),
  race("elf","Elf","Medium",30,{dex:2,int:1},["Common","Elvish"],["Ability Score Increase","Darkvision","Keen Senses","Fey Ancestry","Trance","Elf Weapon Training","Cantrip","Extra Language"],{subrace:"high",subraceName:"High Elf"}),
  race("halfling","Halfling","Small",25,{dex:2,cha:1},["Common","Halfling"],["Ability Score Increase","Lucky","Brave","Halfling Nimbleness","Naturally Stealthy"],{subrace:"lightfoot",subraceName:"Lightfoot"}),
  race("human","Human","Medium",30,{str:1,dex:1,con:1,int:1,wis:1,cha:1},["Common"],["Ability Score Increase","Extra Language"]),
  race("dragonborn","Dragonborn","Medium",30,{str:2,cha:1},["Common","Draconic"],["Ability Score Increase","Draconic Ancestry","Breath Weapon","Damage Resistance"]),
  race("gnome","Gnome","Small",25,{int:2,con:1},["Common","Gnomish"],["Ability Score Increase","Darkvision","Gnome Cunning","Artificer's Lore","Tinker"],{subrace:"rock",subraceName:"Rock Gnome"}),
  race("half-elf","Half-Elf","Medium",30,{cha:2},["Common","Elvish"],["Ability Score Increase","Darkvision","Fey Ancestry","Skill Versatility","Extra Language"],{variableAbilityAdds:2}),
  race("half-orc","Half-Orc","Medium",30,{str:2,con:1},["Common","Orc"],["Ability Score Increase","Darkvision","Menacing","Relentless Endurance","Savage Attacks"]),
  race("tiefling","Tiefling","Medium",30,{int:1,cha:2},["Common","Infernal"],["Ability Score Increase","Darkvision","Hellish Resistance","Infernal Legacy"])
]);
