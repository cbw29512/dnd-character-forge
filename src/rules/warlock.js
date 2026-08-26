import { warlockProgressionFor } from "../data/warlock-class.js";

/**
 * Build the mechanical feature summary used by the character sheet/audit.
 * The progression table remains the source of truth for edition-specific
 * levels; this function only translates those milestones into displayable
 * feature records.
 */
export function warlockFeatures(ruleset, level, subclassId = null) {
  try {
    const progression = warlockProgressionFor(ruleset, level);
    const features = [
      { id: "pact-magic", name: "Pact Magic", level: 1 },
      { id: "eldritch-invocations", name: "Eldritch Invocations", level: ruleset === "2024" ? 1 : 2 },
    ];

    if (ruleset === "2014") {
      features.push({ id: "otherworldly-patron", name: "Otherworldly Patron", level: 1, subclassId });
      if (level >= 3) features.push({ id: "pact-boon", name: "Pact Boon", level: 3 });
      if (level >= 11) features.push({ id: "mystic-arcanum-6", name: "Mystic Arcanum (6th Level)", level: 11 });
      if (level >= 13) features.push({ id: "mystic-arcanum-7", name: "Mystic Arcanum (7th Level)", level: 13 });
      if (level >= 15) features.push({ id: "mystic-arcanum-8", name: "Mystic Arcanum (8th Level)", level: 15 });
      if (level >= 17) features.push({ id: "mystic-arcanum-9", name: "Mystic Arcanum (9th Level)", level: 17 });
      if (level >= 20) features.push({ id: "eldritch-master", name: "Eldritch Master", level: 20 });
    } else {
      if (level >= 2) features.push({ id: "magical-cunning", name: "Magical Cunning", level: 2 });
      if (level >= 3) features.push({ id: "pact-boon-invocations", name: "Pact Boon Invocations", level: 1 });
      if (level >= 3) features.push({ id: "contact-patron", name: "Contact Patron", level: 9 });
      if (level >= 11) features.push({ id: "mystic-arcanum-6", name: "Mystic Arcanum (6th Level)", level: 11 });
      if (level >= 13) features.push({ id: "mystic-arcanum-7", name: "Mystic Arcanum (7th Level)", level: 13 });
      if (level >= 15) features.push({ id: "mystic-arcanum-8", name: "Mystic Arcanum (8th Level)", level: 15 });
      if (level >= 17) features.push({ id: "mystic-arcanum-9", name: "Mystic Arcanum (9th Level)", level: 17 });
      if (level >= 19) features.push({ id: "epic-boon", name: "Epic Boon", level: 19 });
      if (level >= 20) features.push({ id: "eldritch-master", name: "Eldritch Master", level: 20 });
      features.push({ id: "fiend-patron", name: "Fiend Patron", level: 3, subclassId });
    }

    return Object.freeze(features.map(feature => Object.freeze({ ...feature })));
  } catch (error) {
    console.error("[warlock] feature resolution failed", error);
    throw error;
  }
}

export { warlockProgressionFor };
