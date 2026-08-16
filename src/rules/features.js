export function fighterFeatures(ruleset, level, subclass) {
  try {
    const features = [];
    if (ruleset === "2014") {
      features.push("Fighting Style", "Second Wind");
      if (level >= 2) features.push("Action Surge");
      if (level >= 3 && subclass === "champion") features.push("Improved Critical");
      if (level >= 4) features.push("Ability Score Improvement");
      if (level >= 5) features.push("Extra Attack");
      return features;
    }
    features.push("Fighting Style", "Second Wind", "Weapon Mastery");
    if (level >= 2) features.push("Action Surge", "Tactical Mind");
    if (level >= 3 && subclass === "champion") features.push("Improved Critical", "Remarkable Athlete");
    if (level >= 4) features.push("Ability Score Improvement");
    if (level >= 5) features.push("Extra Attack", "Tactical Shift");
    return features;
  } catch (error) { console.error("[features] fighter feature resolution failed", error); throw error; }
}

export function wizardFeatures(ruleset, level, subclass) {
  try {
    const features = ["Spellcasting","Arcane Recovery"];
    if (ruleset === "2014") {
      if (level >= 2 && subclass === "school-evocation") features.push("Evocation Savant","Sculpt Spells");
      if (level >= 4) features.push("Ability Score Improvement");
      return features;
    }
    features.push("Ritual Adept");
    if (level >= 2) features.push("Scholar");
    if (level >= 3 && subclass === "evoker") features.push("Evocation Savant","Potent Cantrip");
    if (level >= 4) features.push("Ability Score Improvement");
    if (level >= 5) features.push("Memorize Spell");
    return features;
  } catch (error) { console.error("[features] wizard feature resolution failed", error); throw error; }
}

export function applyClassAsi(scores, level, primary) {
  try {
    if (level < 4) return scores;
    const next = { ...scores };
    const target = primary.find(ability=>next[ability] < 20) || primary[0];
    next[target] = Math.min(20, next[target] + 2);
    return next;
  } catch (error) { console.error("[features] class ASI failed", error); throw error; }
}
export const applyFighterAsi = (scores, level) => applyClassAsi(scores,level,[scores.str>=scores.dex?"str":"dex"]);
