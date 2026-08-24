import { DRACONIC_AFFINITIES_2024, DRACONIC_ANCESTRIES_2014 } from "../data/sorcerer-class.js";
import { metamagicOptionsFor } from "../data/sorcerer-metamagic.js";
import { duplicateValues } from "./duplicates.js";
import { pick, sample } from "./random.js";
import { sorcererProgressionFor } from "./sorcerer.js";

export function resolveSorcererSelections({ ruleset, level, subclassId = null, selections = {} } = {}) {
  try {
    const progression = sorcererProgressionFor(ruleset, level, subclassId);
    const metamagic = resolveMetamagic(ruleset, progression.metamagicCount, selections.metamagic || []);
    const draconic = resolveDraconic(ruleset, Number(level), subclassId, selections);
    return Object.freeze({ metamagic, draconic });
  } catch (error) {
    console.error("[sorcerer-selections] selection resolution failed", error);
    throw error;
  }
}

function resolveMetamagic(ruleset, required, selected) {
  try {
    const duplicates = duplicateValues(selected);
    if (duplicates.length) throw new Error(`Duplicate Metamagic choices: ${duplicates.join(", ")}.`);
    if (selected.length > required) throw new Error(`Choose at most ${required} Metamagic options.`);
    const legal = metamagicOptionsFor(ruleset).map(option => option.id);
    const illegal = selected.filter(id => !legal.includes(id));
    if (illegal.length) throw new Error(`Illegal ${ruleset} Metamagic choice: ${illegal.join(", ")}.`);
    const randomized = sample(legal, required - selected.length, selected);
    return Object.freeze({ selected:Object.freeze([...selected]), randomized:Object.freeze(randomized), all:Object.freeze([...selected, ...randomized]) });
  } catch (error) {
    console.error("[sorcerer-selections] Metamagic resolution failed", error);
    throw error;
  }
}

function resolveDraconic(ruleset, level, subclassId, selections) {
  try {
    if (ruleset === "2014") {
      if (selections.elementalAffinity != null) throw new Error("2014 Draconic Bloodline derives its damage type from Dragon Ancestor; elementalAffinity is a 2024-only selection.");
      if (subclassId !== "draconic-bloodline") {
        if (selections.draconicAncestry != null) throw new Error("Dragon Ancestor requires the 2014 Draconic Bloodline.");
        return Object.freeze({ ancestry:null, elementalAffinity:null });
      }
      const choices = DRACONIC_ANCESTRIES_2014;
      const ancestry = selections.draconicAncestry == null ? pick(choices) : choices.find(item => item.id === selections.draconicAncestry);
      if (!ancestry) throw new Error(`Illegal 2014 Draconic ancestry: ${selections.draconicAncestry}.`);
      return Object.freeze({ ancestry, elementalAffinity:level >= 6 ? ancestry.damageType : null });
    }
    if (ruleset !== "2024") throw new Error(`Unsupported Sorcerer ruleset: ${ruleset}.`);
    if (selections.draconicAncestry != null) throw new Error("Dragon Ancestor is a 2014-only Draconic Bloodline selection.");
    if (subclassId !== "draconic-sorcery") {
      if (selections.elementalAffinity != null) throw new Error("Elemental Affinity requires the 2024 Draconic Sorcery subclass.");
      return Object.freeze({ ancestry:null, elementalAffinity:null });
    }
    if (level < 6) {
      if (selections.elementalAffinity != null) throw new Error("Elemental Affinity is unavailable before Sorcerer level 6.");
      return Object.freeze({ ancestry:null, elementalAffinity:null });
    }
    const affinity = selections.elementalAffinity == null ? pick(DRACONIC_AFFINITIES_2024) : selections.elementalAffinity;
    if (!DRACONIC_AFFINITIES_2024.includes(affinity)) throw new Error(`Illegal 2024 Elemental Affinity: ${affinity}.`);
    return Object.freeze({ ancestry:null, elementalAffinity:affinity });
  } catch (error) {
    console.error("[sorcerer-selections] Draconic resolution failed", error);
    throw error;
  }
}
