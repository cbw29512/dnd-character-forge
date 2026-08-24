import { RANDOM, SOURCE } from "./schema.js";
import { createDefaultSheetCustomization } from "./print/customization.js";

export const MAGIC_MODES=Object.freeze({NO_MAGIC:"none",LOW_MAGIC:"low",NORMAL_MAGIC:"normal",HIGH_MAGIC:"high"});

export function createInitialState() {
  try {
    return {
      sourceMode: SOURCE.RAW,
      ruleset: "2024",
      magicMode: MAGIC_MODES.NORMAL_MAGIC,
      constraints: { level:RANDOM, species:RANDOM, class:RANDOM, subclass:RANDOM, background:RANDOM, name:"" },
      speciesSelections: {},
      backgroundSelections: {},
      classSelections: {},
      spellSelections: { cantrips:[], known:[], spellbook:[], prepared:[], magicalSecrets:[], loreDiscoveries:[], masteryLevel1:null, masteryLevel2:null, signatureSpells:[] },
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
