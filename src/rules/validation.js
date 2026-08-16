import { ABILITIES, SOURCE } from "../schema.js";
import { duplicateValues } from "./duplicates.js";

export function validateCharacter(character, mode) {
  try {
    const errors = [];
    if (mode === SOURCE.RAW && character.homebrew.length) errors.push("RAW characters cannot contain Homebrew content.");
    if (character.level < 1 || character.level > 5) errors.push("Launch slice currently validates levels 1-5 only.");
    for (const ability of ABILITIES) {
      const max = character.abilityMaximums[ability] ?? 20;
      if (character.abilities[ability] > max) errors.push(`${ability.toUpperCase()} exceeds its maximum.`);
      if (character.abilities[ability] < 1) errors.push(`${ability.toUpperCase()} is below 1.`);
    }
    checkDuplicates(errors, "skill proficiencies", character.skills);
    checkDuplicates(errors, "saving throw proficiencies", character.saves);
    checkDuplicates(errors, "languages", character.languages);
    checkDuplicates(errors, "feats", character.feats, item=>item.id);
    checkDuplicates(errors, "feat names", character.feats, item=>item.name);
    checkDuplicates(errors, "Homebrew entries", character.homebrew, item=>item.id);
    checkDuplicates(errors, "Homebrew names", character.homebrew, item=>item.name);
    checkDuplicates(errors, "weapon masteries", character.masteryIds);
    checkDuplicates(errors, "attack entries", character.attacks, item=>item.name);
    checkDuplicates(errors, "features", character.features);
    if (character.class.id === "fighter" && character.skills.length < 2) errors.push("Fighter is missing skill proficiencies.");
    if (character.level < 3 && character.subclass) errors.push("Fighter subclass cannot be active before level 3.");
    if (!Number.isInteger(character.ac) || character.ac < 1) errors.push("Armor Class failed calculation.");
    if (!Number.isInteger(character.hp) || character.hp < 1) errors.push("Hit Points failed calculation.");
    return { valid: errors.length === 0, errors };
  } catch (error) { console.error("[validation] character validation failed", error); throw error; }
}

function checkDuplicates(errors, label, values, keyFn = value=>value) {
  try {
    const duplicates = duplicateValues(values || [], keyFn);
    if (duplicates.length) errors.push(`Duplicate ${label} detected: ${duplicates.join(", ")}.`);
  } catch (error) { console.error(`[validation] duplicate check failed for ${label}`, error); throw error; }
}
