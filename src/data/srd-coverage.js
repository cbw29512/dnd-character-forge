// This manifest is the release target, not the currently exposed generator pool.
// Keep it separate from raw-2014.js/raw-2024.js so incomplete mechanics can never
// become selectable merely because their names appear in the completion checklist.

export const SRD_COVERAGE = Object.freeze({
  "2014": Object.freeze({
    document: "SRD 5.1",
    races: Object.freeze([
      "dwarf-hill",
      "elf-high",
      "halfling-lightfoot",
      "human",
      "dragonborn",
      "gnome-rock",
      "half-elf",
      "half-orc",
      "tiefling"
    ]),
    backgrounds: Object.freeze(["acolyte"]),
    classes: Object.freeze([
      "barbarian",
      "bard",
      "cleric",
      "druid",
      "fighter",
      "monk",
      "paladin",
      "ranger",
      "rogue",
      "sorcerer",
      "warlock",
      "wizard"
    ]),
    subclasses: Object.freeze([
      "path-berserker",
      "college-lore",
      "life-domain",
      "circle-land",
      "champion",
      "open-hand",
      "oath-devotion",
      "hunter",
      "thief",
      "draconic-bloodline",
      "fiend-patron",
      "school-evocation"
    ]),
    feats: Object.freeze(["grappler"]),
    levels: Object.freeze({ min: 1, max: 20 })
  }),

  "2024": Object.freeze({
    document: "SRD 5.2.1",
    species: Object.freeze([
      "dragonborn",
      "dwarf",
      "elf",
      "gnome",
      "goliath",
      "halfling",
      "human",
      "orc",
      "tiefling"
    ]),
    backgrounds: Object.freeze(["acolyte", "criminal", "sage", "soldier"]),
    classes: Object.freeze([
      "barbarian",
      "bard",
      "cleric",
      "druid",
      "fighter",
      "monk",
      "paladin",
      "ranger",
      "rogue",
      "sorcerer",
      "warlock",
      "wizard"
    ]),
    subclasses: Object.freeze([
      "path-berserker",
      "college-lore",
      "life-domain",
      "circle-land",
      "champion",
      "open-hand",
      "oath-devotion",
      "hunter",
      "thief",
      "draconic-sorcery",
      "fiend-patron",
      "evoker"
    ]),
    feats: Object.freeze([
      "alert",
      "magic-initiate",
      "savage-attacker",
      "skilled",
      "ability-score-improvement",
      "grappler",
      "archery",
      "defense",
      "great-weapon-fighting",
      "two-weapon-fighting",
      "boon-combat-prowess",
      "boon-dimensional-travel",
      "boon-fate",
      "boon-irresistible-offense",
      "boon-night-spirit",
      "boon-spell-recall",
      "boon-truesight"
    ]),
    levels: Object.freeze({ min: 1, max: 20 })
  })
});

export function coverageIds(ruleset, category) {
  try {
    const edition = SRD_COVERAGE[ruleset];
    if (!edition) throw new Error(`Unknown SRD ruleset: ${ruleset}`);
    const values = edition[category];
    if (!Array.isArray(values)) throw new Error(`Unknown SRD coverage category: ${category}`);
    return [...values];
  } catch (error) {
    console.error("[srd-coverage] failed to resolve coverage IDs", error);
    throw error;
  }
}
