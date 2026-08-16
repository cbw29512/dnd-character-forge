import { EFFECT_TYPES, SOURCE } from "../schema.js";

export function applyHomebrew(character, items) {
  try {
    const next = structuredClone(character);
    for (const item of items) {
      if (item.source !== SOURCE.HOMEBREW) throw new Error(`${item.name} is not marked Homebrew`);
      for (const effect of item.effects || []) {
        if (effect.type === EFFECT_TYPES.ABILITY_ADD) next.abilities[effect.target] += Number(effect.value);
        if (effect.type === EFFECT_TYPES.ABILITY_MAX) next.abilityMaximums[effect.target] = Number(effect.value);
        if (effect.type === EFFECT_TYPES.AC_BONUS) next.homebrewAcBonus += Number(effect.value);
        if (effect.type === EFFECT_TYPES.SKILL_PROFICIENCY && !next.skills.includes(effect.target)) next.skills.push(effect.target);
      }
      next.homebrew.push({ id:item.id, name:item.name });
    }
    return next;
  } catch (error) { console.error("[homebrew] apply failed", error); throw error; }
}
export function createAbilityFeat({ name, ability, amount }) {
  try {
    if (!name.trim()) throw new Error("Homebrew feat needs a name");
    if (![-2,-1,1,2].includes(Number(amount))) throw new Error("Ability change must be -2, -1, +1, or +2");
    return {
      id:`hb-${crypto.randomUUID()}`, source:SOURCE.HOMEBREW, type:"feat", name:name.trim(),
      effects:[{ type:EFFECT_TYPES.ABILITY_ADD, target:ability, value:Number(amount) }]
    };
  } catch (error) { console.error("[homebrew] create feat failed", error); throw error; }
}
