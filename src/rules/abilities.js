import { ABILITIES } from "../schema.js";
import { roll4d6DropLowest } from "./random.js";

const STANDARD = [15, 14, 13, 12, 10, 8];
const FIGHTER_ORDER = ["str", "dex", "con", "wis", "cha", "int"];

export function generateBaseAbilities(method = "standard") {
  try {
    const values = method === "rolled"
      ? Array.from({ length: 6 }, roll4d6DropLowest).sort((a,b)=>b-a)
      : [...STANDARD];
    const scores = Object.fromEntries(ABILITIES.map(a => [a, 8]));
    FIGHTER_ORDER.forEach((ability, index) => { scores[ability] = values[index]; });
    return scores;
  } catch (error) { console.error("[abilities] generation failed", error); throw error; }
}
export function apply2014Species(scores, species) {
  try {
    const next = { ...scores };
    Object.entries(species.abilityAdds || {}).forEach(([ability, value]) => { next[ability] += value; });
    return next;
  } catch (error) { console.error("[abilities] 2014 species failed", error); throw error; }
}
export function apply2024Background(scores, background, classPrimary) {
  try {
    const next = { ...scores };
    const eligible = background.abilities;
    const primary = classPrimary.find(a => eligible.includes(a)) || eligible[0];
    const secondary = eligible.find(a => a !== primary) || eligible[1];
    next[primary] = Math.min(20, next[primary] + 2);
    next[secondary] = Math.min(20, next[secondary] + 1);
    return next;
  } catch (error) { console.error("[abilities] 2024 background failed", error); throw error; }
}
