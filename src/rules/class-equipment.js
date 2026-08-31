import { pick } from "./random.js";

export function resolveClassEquipment(cls,selections={}){
  try{
    const packages=cls?.equipmentPackages||[];if(!packages.length)throw new Error(`${cls?.name||"Class"} starting-equipment packages are unavailable.`);
    const requested=selections.equipmentPackage||null;if(requested){const fixed=packages.find(pkg=>pkg.id===requested);if(!fixed)throw new Error(`${cls.name} starting-equipment package "${requested}" is unavailable.`);return fixed;}
    const ready=packages.filter(pkg=>!pkg.startingGoldOnly);return pick(ready.length?ready:packages);
  }catch(error){console.error("[class-equipment] equipment resolution failed",error);throw error;}
}
