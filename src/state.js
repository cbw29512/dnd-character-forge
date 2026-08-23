import { RANDOM, SOURCE } from "./schema.js";
import { createDefaultSheetCustomization } from "./print/customization.js";

export function createInitialState() {
  try {
    return {
      sourceMode: SOURCE.RAW,
      ruleset: "2024",
      constraints: { level:RANDOM, species:RANDOM, class:RANDOM, subclass:RANDOM, background:RANDOM, name:"" },
      speciesSelections: {},
      backgroundSelections: {},
      classSelections: {},
      spellSelections: { cantrips:[], spellbook:[], prepared:[], masteryLevel1:null, masteryLevel2:null, signatureSpells:[] },
      portraitDataUrl: null,
      sheetCustomization: createDefaultSheetCustomization(),
      homebrew: [],
      currentCharacter: null,
      activeTab: "forge"
    };
  } catch (error) {
    console.error("[state] Failed to create initial state", error);
    throw error;
  }
}
