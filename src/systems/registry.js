const registry=new Map();

export function registerSystem(system){
  try{
    validateSystem(system);
    if(registry.has(system.id))throw new Error(`System already registered: ${system.id}`);
    registry.set(system.id,Object.freeze({...system,editions:Object.freeze([...system.editions]),capabilities:Object.freeze({...system.capabilities})}));
    return registry.get(system.id);
  }catch(error){console.error("[systems] registration failed",error);throw error;}
}

export function systemFor(id){
  try{const system=registry.get(id);if(!system)throw new Error(`Unsupported game system: ${id}`);return system;}
  catch(error){console.error("[systems] lookup failed",error);throw error;}
}

export function registeredSystems(){return Object.freeze([...registry.values()]);}

export function clearSystemRegistryForTests(){registry.clear();}

function validateSystem(system){
  if(!system||typeof system!=="object")throw new Error("System registration requires an object.");
  for(const field of ["id","name","characterLabel","licenseLabel"])if(typeof system[field]!=="string"||!system[field].trim())throw new Error(`System registration is missing ${field}.`);
  if(!Array.isArray(system.editions)||!system.editions.length)throw new Error(`${system.id} must declare at least one edition.`);
  const editionIds=new Set();
  for(const edition of system.editions){if(!edition||typeof edition.id!=="string"||typeof edition.label!=="string")throw new Error(`${system.id} has an invalid edition record.`);if(editionIds.has(edition.id))throw new Error(`${system.id} has duplicate edition ${edition.id}.`);editionIds.add(edition.id);}
  if(!system.capabilities||typeof system.capabilities!=="object")throw new Error(`${system.id} must declare capabilities.`);
}
