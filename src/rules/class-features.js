import { barbarianFeatures } from "./barbarian.js";
import { rogueFeatures } from "./rogue.js";
import { fighterFeatures } from "./fighter.js";
import { monkFeatures } from "./monk.js";
import { wizardFeatures } from "./wizard-features.js";
import { clericFeatures } from "./cleric-features.js";

const RESOLVERS = Object.freeze({
  barbarian: ({ ruleset, level, subclassId }) => barbarianFeatures(ruleset, level, subclassId),
  rogue: ({ ruleset, level, subclassId }) => rogueFeatures(ruleset, level, subclassId),
  fighter: ({ ruleset, level, subclassId }) => fighterFeatures(ruleset, level, subclassId),
  monk: ({ ruleset, level, subclassId }) => monkFeatures(ruleset, level, subclassId),
  wizard: ({ ruleset, level, subclassId }) => wizardFeatures(ruleset, level, subclassId),
  cleric: ({ ruleset, level, subclassId, divineOrder }) => clericFeatures(ruleset, level, subclassId, divineOrder)
});

export function resolveClassFeatures({ ruleset, classId, level, subclassId = null, divineOrder = null }) {
  try {
    const resolver = RESOLVERS[classId];
    if (!resolver) throw new Error(`Class feature resolver is not implemented for ${classId}.`);
    const features = resolver({ ruleset, level, subclassId, divineOrder });
    if (!Array.isArray(features)) throw new Error(`Class feature resolver returned invalid data for ${classId}.`);
    return features;
  } catch (error) {
    console.error("[class-features] feature resolution failed", error);
    throw error;
  }
}

export function supportedFeatureClasses() {
  try { return Object.keys(RESOLVERS); }
  catch(error){console.error("[class-features] supported class lookup failed",error);throw error;}
}
