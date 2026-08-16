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
    checkDuplicates(errors,"skill proficiencies",character.skills);
    checkDuplicates(errors,"expertise entries",character.expertise);
    checkDuplicates(errors,"saving throw proficiencies",character.saves);
    checkDuplicates(errors,"languages",character.languages);
    checkDuplicates(errors,"feats",character.feats,item=>item.id);
    checkDuplicates(errors,"feat names",character.feats,item=>item.name);
    checkDuplicates(errors,"Homebrew entries",character.homebrew,item=>item.id);
    checkDuplicates(errors,"Homebrew names",character.homebrew,item=>item.name);
    checkDuplicates(errors,"weapon masteries",character.masteryIds);
    checkDuplicates(errors,"attack entries",character.attacks,item=>item.name);
    checkDuplicates(errors,"features",character.features);
    if (character.skills.length < character.class.skillCount) errors.push(`${character.class.name} is missing skill proficiencies.`);
    if (character.subclass && character.level < character.class.subclassLevel) errors.push(`${character.class.name} subclass cannot be active before level ${character.class.subclassLevel}.`);
    if (character.expertise.some(skill=>!character.skills.includes(skill))) errors.push("Expertise requires an existing skill proficiency.");
    if (character.class.spellcasting === "wizard") validateWizard(errors,character);
    if (!Number.isInteger(character.ac) || character.ac < 1) errors.push("Armor Class failed calculation.");
    if (!Number.isInteger(character.hp) || character.hp < 1) errors.push("Hit Points failed calculation.");
    return { valid: errors.length === 0, errors };
  } catch (error) { console.error("[validation] character validation failed",error); throw error; }
}

function validateWizard(errors, character) {
  try {
    if (!character.spells) { errors.push("Wizard spellcasting data is missing."); return; }
    checkDuplicates(errors,"Wizard cantrips",character.spells.cantrips.all);
    checkDuplicates(errors,"Wizard spellbook spells",character.spells.spellbook.all);
    checkDuplicates(errors,"prepared Wizard spells",character.spells.prepared.all);
    const book = new Set(character.spells.spellbook.all);
    const outside = character.spells.prepared.all.filter(id=>!book.has(id));
    if (outside.length) errors.push(`Prepared Wizard spells missing from spellbook: ${outside.join(", ")}.`);
    if (!Number.isInteger(character.spells.saveDc) || !Number.isInteger(character.spells.attackBonus)) errors.push("Wizard spellcasting math failed.");
  } catch (error) { console.error("[validation] Wizard validation failed",error); throw error; }
}
function checkDuplicates(errors,label,values,keyFn=value=>value) {
  try {
    const duplicates=duplicateValues(values||[],keyFn);
    if (duplicates.length) errors.push(`Duplicate ${label} detected: ${duplicates.join(", ")}.`);
  } catch (error) { console.error(`[validation] duplicate check failed for ${label}`,error); throw error; }
}
