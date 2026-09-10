const CLASS_LAYOUTS=Object.freeze({
  barbarian:Object.freeze(["resource-heavy","equipment-light"]),
  bard:Object.freeze(["feature-heavy","spell-heavy"]),
  cleric:Object.freeze(["feature-heavy","spell-heavy"]),
  druid:Object.freeze(["resource-heavy","spell-heavy"]),
  fighter:Object.freeze(["feature-heavy","equipment-light"]),
  monk:Object.freeze(["resource-heavy","feature-heavy"]),
  paladin:Object.freeze(["feature-heavy","spell-heavy"]),
  ranger:Object.freeze(["resource-heavy","spell-heavy"]),
  rogue:Object.freeze(["skill-heavy","feature-heavy","equipment-light"]),
  sorcerer:Object.freeze(["resource-heavy","spell-heavy"]),
  warlock:Object.freeze(["feature-heavy","spell-heavy"]),
  wizard:Object.freeze(["spell-heavy","equipment-light"])
});

export function printLayoutProfile(classId){
  try{
    const id=String(classId||"").trim().toLowerCase();
    return CLASS_LAYOUTS[id]||Object.freeze(["balanced"]);
  }catch(error){console.error("[print-layout] profile lookup failed",error);throw error;}
}

export function printLayoutClasses(classId){
  try{return printLayoutProfile(classId).map(value=>`layout-${value}`).join(" ");}
  catch(error){console.error("[print-layout] class build failed",error);throw error;}
}
