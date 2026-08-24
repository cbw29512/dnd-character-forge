import { abilityMod } from "./math.js";

export function sorcererArmorClass(character, fallbackAc) {
  try {
    if (!character || character.class?.id !== "sorcerer") throw new Error("Sorcerer character is required for Draconic AC calculation.");
    if (character.equipment?.armor || !character.sorcerer?.draconicResilience) return fallbackAc;
    const dex = abilityMod(character.abilities.dex);
    if (character.ruleset === "2014") return 13 + dex;
    if (character.ruleset === "2024") return 10 + dex + abilityMod(character.abilities.cha);
    throw new Error(`Unsupported Sorcerer ruleset: ${character.ruleset}.`);
  } catch (error) {
    console.error("[sorcerer-combat] armor class calculation failed", error);
    throw error;
  }
}

export function sorcererDraconicHpBonus(character) {
  try {
    if (!character || character.class?.id !== "sorcerer") return 0;
    const progression = character.sorcerer;
    if (!progression?.draconicResilience) return 0;
    if (!["2014","2024"].includes(character.ruleset)) throw new Error(`Unsupported Sorcerer ruleset: ${character.ruleset}.`);
    const bonus = Number(progression.draconicHpBonus || 0);
    if (!Number.isInteger(bonus) || bonus < 0 || bonus > character.level) throw new Error(`Invalid Draconic Resilience HP bonus: ${progression.draconicHpBonus}.`);
    return bonus;
  } catch (error) {
    console.error("[sorcerer-combat] Draconic HP calculation failed", error);
    throw error;
  }
}
