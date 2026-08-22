import { RANDOM, SOURCE } from "./schema.js";

export function createInitialState() {
  try {
    return {
      sourceMode: SOURCE.RAW,
      ruleset: "2024",
      constraints: { level:RANDOM, species:RANDOM, class:RANDOM, subclass:RANDOM, background:RANDOM, name:"" },
      spellSelections: { cantrips:[], spellbook:[], prepared:[] },
      advancementSelections: { 4:RANDOM, 6:RANDOM, 8:RANDOM, 10:RANDOM, 12:RANDOM, 14:RANDOM, 16:RANDOM, 19:RANDOM },
      homebrew: [],
      currentCharacter: null,
      activeTab: "forge"
    };
  } catch (error) {
    console.error("[state] Failed to create RAW-only initial state", error);
    throw error;
  }
}
