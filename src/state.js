import { RANDOM, SOURCE } from "./schema.js";

export function createInitialState() {
  try {
    return {
      sourceMode: SOURCE.RAW,
      ruleset: "2024",
      constraints: { level:RANDOM, species:RANDOM, class:RANDOM, subclass:RANDOM, background:RANDOM, name:"" },
      spellSelections: { cantrips:[], spellbook:[], prepared:[] },
      homebrew: [],
      currentCharacter: null,
      activeTab: "forge"
    };
  } catch (error) {
    console.error("[state] Failed to create initial state", error);
    throw error;
  }
}
