function stable(value) {
  try {
    if (Array.isArray(value)) return value.map(stable).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));
    return value;
  } catch (error) { console.error("[fingerprint] stable failed", error); throw error; }
}

export function pregenFingerprintPayload(character) {
  try {
    const styles=character.fightingStyles?.length?character.fightingStyles:(character.fightingStyle?[character.fightingStyle]:[]);
    return {
      ruleset:character.ruleset,
      sourceMode:character.sourceMode,
      level:character.level,
      species:character.species?.id,
      size:character.size||null,
      speciesChoices:character.speciesChoices||null,
      class:character.class?.id,
      subclass:character.subclass?.id ?? null,
      classChoices:{divineOrder:character.divineOrder||null,blessedStrikes:character.blessedStrikes||null},
      background:character.background?.id,
      backgroundChoices:character.backgroundChoices||null,
      toolProficiencies:[...(character.toolProficiencies||[])].sort(),
      magicInitiate:character.magicInitiate||null,
      abilities:character.abilities,
      abilityMaximums:character.abilityMaximums||null,
      epicBoonAbility:character.epicBoonAbility||null,
      skills:[...(character.skills||[])].sort(),
      expertise:[...(character.expertise||[])].sort(),
      saves:[...(character.saves||[])].sort(),
      languages:[...(character.languages||[])].sort(),
      feats:(character.feats||[]).map(item=>item.id||item.name).sort(),
      fightingStyles:styles.map(item=>item.id||item.name).sort(),
      masteryIds:[...(character.masteryIds||[])].sort(),
      inventory:(character.inventory||[]).map(item=>({name:item.name,quantity:item.quantity})),
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
