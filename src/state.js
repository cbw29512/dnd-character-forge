import "./product-info.js";
import { RANDOM, SOURCE } from "./schema.js";
import { createDefaultSheetCustomization } from "./print/customization.js";

export const MAGIC_MODES=Object.freeze({RANDOM_MAGIC:"random",NO_MAGIC:"none",LOW_MAGIC:"low",NORMAL_MAGIC:"normal",HIGH_MAGIC:"high"});

export function createInitialState() {
  try {
    return {
      sourceMode: SOURCE.RAW,
      ruleset: "2024",
      magicMode: MAGIC_MODES.RANDOM_MAGIC,
      // Every user-controlled generation field starts as RANDOM. Explicit values
      // remain here across Forge/Reforge until the user changes or clears them.
      constraints: { level:RANDOM, species:RANDOM, class:RANDOM, subclass:RANDOM, background:RANDOM, name:"" },
      // These nested choice maps are the same persistent-lock contract for
      // class/species/background/spell choices that are revealed conditionally.
      speciesSelections: {},
      backgroundSelections: {},
      classSelections: {},
      spellSelections: { cantrips:[], known:[], spellbook:[], prepared:[], magicalSecrets:[], loreDiscoveries:[], arcanum6:[], arcanum7:[], arcanum8:[], arcanum9:[], masteryLevel1:null, masteryLevel2:null, signatureSpells:[] },
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