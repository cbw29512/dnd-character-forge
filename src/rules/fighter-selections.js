import { pick } from "./random.js";

export function resolveFighterEquipment(cls,selections={}){
  try{
    const packages=cls?.equipmentPackages||[],classPool=cls?.styleChoices||[],requested=selections.fightingStyle||null;
    if(!packages.length)throw new Error("Fighter equipment packages are unavailable.");
    if(requested&&!classPool.includes(requested))throw new Error(`Fighter Fighting Style "${requested}" is unavailable.`);
    const compatible=requested?packages.filter(pkg=>(pkg.styles||[]).includes(requested)):packages;
    if(!compatible.length)throw new Error(`No Fighter equipment package supports the fixed Fighting Style "${requested}".`);
    return pick(compatible);
  }catch(error){
    console.error("[fighter-selections] equipment resolution failed",error);
    throw error;
  }
}

export function resolveFighterFightingStyles(equipment,data,fighter,cls,selections={}){
  try{
    const classPool=cls?.styleChoices||[],packagePool=(equipment?.styles||[]).filter(id=>classPool.includes(id));
    if(!classPool.length||!packagePool.length)throw new Error(`${cls?.name||"Fighter"} verified Fighting Style pool is unavailable.`);
    const requestedPrimary=selections.fightingStyle||null,requestedAdditional=selections.additionalFightingStyle||null;
    if(requestedPrimary&&!packagePool.includes(requestedPrimary))throw new Error(`Fighter Fighting Style "${requestedPrimary}" is incompatible with the resolved equipment package.`);
    if(requestedAdditional&&!classPool.includes(requestedAdditional))throw new Error(`Additional Fighter Fighting Style "${requestedAdditional}" is unavailable.`);
    if(requestedAdditional&&!fighter?.additionalFightingStyle)throw new Error("Additional Fighter Fighting Style is unavailable at this level and subclass.");

    const primaryChoices=requestedAdditional&&!requestedPrimary?packagePool.filter(id=>id!==requestedAdditional):packagePool;
    if(!primaryChoices.length)throw new Error("Fighter has no legal primary Fighting Style after applying the fixed additional style.");
    const firstId=requestedPrimary||pick(primaryChoices),ids=[firstId];

    if(fighter?.additionalFightingStyle){
      const additionalChoices=classPool.filter(id=>id!==firstId);
      if(!additionalChoices.length)throw new Error("Fighter has no legal additional Fighting Style choice.");
      if(requestedAdditional&&!additionalChoices.includes(requestedAdditional))throw new Error("Primary and additional Fighter Fighting Styles must be different.");
      ids.push(requestedAdditional||pick(additionalChoices));
    }

    return ids.map(id=>{
      const style=data?.fightingStyles?.[id];
      if(!style)throw new Error(`Missing Fighter Fighting Style data for ${id}.`);
      return{id,...style};
    });
  }catch(error){
    console.error("[fighter-selections] Fighting Style resolution failed",error);
    throw error;
  }
}
