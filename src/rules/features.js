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
export function applyFighterAsi(scores, level) {
  try {
    if (level < 4) return scores;
    const next = { ...scores };
    const target = next.str >= next.dex ? "str" : "dex";
    next[target] = Math.min(20, next[target] + 2);
    return next;
  } catch (error) { console.error("[features] ASI failed", error); throw error; }
}
