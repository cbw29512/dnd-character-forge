// Data schema is deliberately explicit: RAW data and homebrew effects use the same targets,
// while source metadata lets validation prevent homebrew from leaking into RAW mode.
export const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
export const SKILLS = {
  acrobatics: "dex", animalHandling: "wis", arcana: "int", athletics: "str",
  deception: "cha", history: "int", insight: "wis", intimidation: "cha",
  investigation: "int", medicine: "wis", nature: "int", perception: "wis",
  performance: "cha", persuasion: "cha", religion: "int", sleightOfHand: "dex",
  stealth: "dex", survival: "wis"
};
export const RANDOM = "random";
export const SOURCE = Object.freeze({ RAW: "RAW", HOMEBREW: "HOMEBREW" });
export const EFFECT_TYPES = Object.freeze({
  ABILITY_ADD: "ability_add",
  ABILITY_MAX: "ability_max",
  SKILL_PROFICIENCY: "skill_proficiency",
  AC_BONUS: "ac_bonus"
});
