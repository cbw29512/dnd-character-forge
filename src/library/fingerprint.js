function stable(value) {
  try {
    if (Array.isArray(value)) return value.map(stable).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));
    return value;
  } catch (error) { console.error("[fingerprint] stable failed", error); throw error; }
}

export function pregenFingerprintPayload(character) {
  try {
    return {
      systemId:character.systemId||"dnd",
      ruleset:character.ruleset,
      sourceMode:character.sourceMode,
      level:character.level,
      species:character.species?.id,
      class:character.class?.id,
      subclass:character.subclass?.id ?? null,
      background:character.background?.id,
      abilities:character.abilities,
      abilityMaximums:character.abilityMaximums,
      skills:[...(character.skills||[])].sort(),
      expertise:[...(character.expertise||[])].sort(),
      saves:[...(character.saves||[])].sort(),
      languages:[...(character.languages||[])].sort(),
      tools:[...(character.tools||[])].sort(),
      feats:(character.feats||[]).map(item=>item.id||item.name).sort(),
      fightingStyles:(character.fightingStyles||[]).map(item=>item.id||item.name).sort(),
      equipment:{
        id:character.equipment?.id||null,
        armor:character.equipment?.armor||null,
        weapons:[...(character.equipment?.weapons||[])].sort(),
        shield:Boolean(character.equipment?.shield),
        focus:character.equipment?.focus||null
      },
      classResources:(character.classResources||[]).map(item=>({id:item.id||item.name,value:item.value})),
      advancementChoices:(character.advancementChoices||[]).map(item=>({level:item.level,type:item.type,id:item.id||null,increases:item.increases||null})),
      masteryIds:[...(character.masteryIds||[])].sort(),
      attacks:(character.attacks||[]).map(item=>({id:item.id||item.name,damage:item.damage,ability:item.ability,type:item.type,attackBonus:item.attackBonus,damageBonus:item.damageBonus})),
      inventory:(character.inventory||[]).map(item=>({name:item.name,quantity:item.quantity})),
      features:[...(character.features||[])].sort(),
      homebrew:(character.homebrew||[]).map(item=>({id:item.id||item.name,version:item.version||1,effects:item.effects||[]})),
      spells:character.spells||null
    };
  } catch (error) { console.error("[fingerprint] pregen payload failed", error); throw error; }
}

export function homebrewFingerprintPayload(item, ruleset) {
  try {
    return {
      ruleset,
      type:item.type,
      source:item.source,
      effects:item.effects||[],
      prerequisites:item.prerequisites||[],
      progression:item.progression||null
    };
  } catch (error) { console.error("[fingerprint] homebrew payload failed", error); throw error; }
}

export async function fingerprint(payload) {
  try {
    const canonical = JSON.stringify(stable(payload));
    const bytes = new TextEncoder().encode(canonical);
    const digest = await crypto.subtle.digest("SHA-256",bytes);
    return [...new Uint8Array(digest)].map(value=>value.toString(16).padStart(2,"0")).join("");
  } catch (error) { console.error("[fingerprint] hash failed", error); throw error; }
}
