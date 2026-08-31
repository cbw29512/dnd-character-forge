import { pick } from "./random.js";

export function resolveFighterEquipment(cls,selections={}){
  try{
    const packages=cls?.equipmentPackages||[],classPool=cls?.styleChoices||[],requestedStyle=selections.fightingStyle||null,requestedPackage=selections.equipmentPackage||null;
    if(!packages.length)throw new Error("Fighter equipment packages are unavailable.");
    if(requestedStyle&&!classPool.includes(requestedStyle))throw new Error(`Fighter Fighting Style "${requestedStyle}" is unavailable.`);
    if(requestedPackage){const fixed=packages.find(pkg=>pkg.id===requestedPackage);if(!fixed)throw new Error(`Fighter starting-equipment package "${requestedPackage}" is unavailable.`);return fixed;}
    const ready=packages.filter(pkg=>!pkg.startingGoldOnly),compatible=requestedStyle?ready.filter(pkg=>(pkg.styles||[]).includes(requestedStyle)):ready;
    return pick(compatible.length?compatible:ready.length?ready:packages);
  }catch(error){
    console.error("[fighter-selections] equipment resolution failed",error);
    throw error;
  }
}

export function resolveFighterFightingStyles(equipment,data,fighter,cls,selections={}){
  try{
    const classPool=cls?.styleChoices||[];
    if(!classPool.length)throw new Error(`${cls?.name||"Fighter"} verified Fighting Style pool is unavailable.`);
    const requestedPrimary=selections.fightingStyle||null,requestedAdditional=selections.additionalFightingStyle||null;
    if(requestedPrimary&&!classPool.includes(requestedPrimary))throw new Error(`Fighter Fighting Style "${requestedPrimary}" is unavailable.`);
    if(requestedAdditional&&!classPool.includes(requestedAdditional))throw new Error(`Additional Fighter Fighting Style "${requestedAdditional}" is unavailable.`);
    if(requestedAdditional&&!fighter?.additionalFightingStyle)throw new Error("Additional Fighter Fighting Style is unavailable at this level and subclass.");

    const primaryChoices=requestedAdditional&&!requestedPrimary?classPool.filter(id=>id!==requestedAdditional):classPool;
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
