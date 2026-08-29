export const ORIGIN_FEATS_2024=Object.freeze([
  Object.freeze({id:"alert",name:"Alert",category:"Origin",repeatable:false}),
  Object.freeze({id:"crafter",name:"Crafter",category:"Origin",repeatable:false}),
  Object.freeze({id:"healer",name:"Healer",category:"Origin",repeatable:false}),
  Object.freeze({id:"lucky",name:"Lucky",category:"Origin",repeatable:false}),
  Object.freeze({id:"magic-initiate",name:"Magic Initiate",category:"Origin",repeatable:true}),
  Object.freeze({id:"musician",name:"Musician",category:"Origin",repeatable:false}),
  Object.freeze({id:"savage-attacker",name:"Savage Attacker",category:"Origin",repeatable:false}),
  Object.freeze({id:"skilled",name:"Skilled",category:"Origin",repeatable:true}),
  Object.freeze({id:"tavern-brawler",name:"Tavern Brawler",category:"Origin",repeatable:false}),
  Object.freeze({id:"tough",name:"Tough",category:"Origin",repeatable:false})
]);

export const MAGIC_INITIATE_LISTS_2024=Object.freeze(["cleric","druid","wizard"]);

export const ARTISAN_TOOLS_2024=Object.freeze([
  "Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools","Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools"
]);

export const GAMING_SETS_2024=Object.freeze(["Dice Set","Dragonchess Set","Playing Card Set","Three-Dragon Ante Set"]);
export const MUSICAL_INSTRUMENTS_2024=Object.freeze(["Bagpipes","Drum","Dulcimer","Flute","Horn","Lute","Lyre","Pan Flute","Shawm","Viol"]);
export const OTHER_TOOLS_2024=Object.freeze(["Disguise Kit","Forgery Kit",...GAMING_SETS_2024,"Herbalism Kit",...MUSICAL_INSTRUMENTS_2024,"Navigator's Tools","Poisoner's Kit","Thieves' Tools"]);
export const TOOLS_2024=Object.freeze([...ARTISAN_TOOLS_2024,...OTHER_TOOLS_2024]);

export function originFeatById2024(id){
  try{return ORIGIN_FEATS_2024.find(feat=>feat.id===id)||null;}
  catch(error){console.error("[origin-feats-data] feat lookup failed",error);throw error;}
}
