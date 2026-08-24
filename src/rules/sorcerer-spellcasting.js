import { sorcererSpellsFor } from "../data/sorcerer-spells.js";
import { draconicSpellsForLevel } from "../data/sorcerer-draconic-spells.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { maxSorcererSpellLevel, sorcererProgressionFor } from "./sorcerer.js";

export function sorcererAlwaysPrepared(character) {
  try {
    if (character?.ruleset !== "2024") return Object.freeze([]);
    return draconicSpellsForLevel(character.level, character.subclass?.id);
  } catch (error) {
    console.error("[sorcerer-spellcasting] always-prepared lookup failed", error);
    throw error;
  }
}

export function validateSorcererSpellSelections(character, selections = {}) {
  try {
    if (!character || !["2014","2024"].includes(character.ruleset)) throw new Error("A supported Sorcerer character is required.");
    const progression = sorcererProgressionFor(character.ruleset, character.level, character.subclass?.id);
    const maxLevel = maxSorcererSpellLevel(character.level);
    const catalog = sorcererSpellsFor(character.ruleset);
    const cantrips = selections.cantrips || [], known = selections.known || [], prepared = selections.prepared || [];
    for (const [label, values] of [["Sorcerer cantrips",cantrips],["Sorcerer known spells",known],["Sorcerer prepared spells",prepared]]) {
      const duplicates = duplicateValues(values);if (duplicates.length) throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}.`);
    }
    const cantripPool = new Set(catalog.filter(spell=>spell.level===0).map(spell=>spell.id));
    const leveledPool = new Set(catalog.filter(spell=>spell.level>0&&spell.level<=maxLevel).map(spell=>spell.id));
    if (cantrips.length > progression.cantrips) throw new Error(`Choose at most ${progression.cantrips} Sorcerer cantrips.`);
    const badCantrips = cantrips.filter(id=>!cantripPool.has(id));if (badCantrips.length) throw new Error(`Illegal Sorcerer cantrip selection: ${badCantrips.join(", ")}.`);
    if (character.ruleset === "2014") {
      if (prepared.length) throw new Error("2014 Sorcerer uses spells known, not prepared-spell selections.");
      if (known.length > progression.known) throw new Error(`Choose at most ${progression.known} Sorcerer spells known.`);
      const badKnown = known.filter(id=>!leveledPool.has(id));if (badKnown.length) throw new Error(`Illegal Sorcerer known-spell selection: ${badKnown.join(", ")}.`);
      return Object.freeze({valid:true,maxLevel,requiredLeveled:progression.known,alwaysPrepared:Object.freeze([])});
    }
    if (known.length) throw new Error("2024 Sorcerer uses prepared spells, not spells-known selections.");
    if (prepared.length > progression.prepared) throw new Error(`Choose at most ${progression.prepared} prepared Sorcerer spells.`);
    const badPrepared = prepared.filter(id=>!leveledPool.has(id));if (badPrepared.length) throw new Error(`Illegal Sorcerer prepared-spell selection: ${badPrepared.join(", ")}.`);
    const always = sorcererAlwaysPrepared(character), alwaysIds = new Set(always.map(spell=>spell.id));
    const duplicatesWithAlways = prepared.filter(id=>alwaysIds.has(id));if (duplicatesWithAlways.length) throw new Error(`${duplicatesWithAlways.join(", ")} is already always prepared by Draconic Spells.`);
    return Object.freeze({valid:true,maxLevel,requiredLeveled:progression.prepared,alwaysPrepared:always});
  } catch (error) {
    console.error("[sorcerer-spellcasting] selection validation failed", error);
    throw error;
  }
}

export function buildSorcererSpellcasting(character, selections = {}) {
  try {
    const validation = validateSorcererSpellSelections(character, selections);
    const progression = sorcererProgressionFor(character.ruleset, character.level, character.subclass?.id);
    const catalog = sorcererSpellsFor(character.ruleset), always = validation.alwaysPrepared;
    const namesById = new Map([...catalog,...always.map(item=>({id:item.id,name:item.name}))].map(spell=>[spell.id,spell.name]));
    const cantripPool = catalog.filter(spell=>spell.level===0).map(spell=>spell.id);
    const cantrips = resolveSpellChoices({available:cantripPool,selected:selections.cantrips||[],required:progression.cantrips,label:"Sorcerer cantrips"});
    const blocked = new Set(always.map(spell=>spell.id));
    const leveledPool = catalog.filter(spell=>spell.level>0&&spell.level<=validation.maxLevel&&!blocked.has(spell.id)).map(spell=>spell.id);
    const leveled = resolveSpellChoices({available:leveledPool,selected:character.ruleset==="2014"?(selections.known||[]):(selections.prepared||[]),required:validation.requiredLeveled,label:character.ruleset==="2014"?"Sorcerer spells known":"prepared Sorcerer spells"});
    const allIds = uniqueStrings([...cantrips.all,...leveled.all,...always.map(spell=>spell.id)]), all = allIds.map(id=>namesById.get(id)||id);
    const common = {ability:"cha",saveDc:8+character.proficiency+abilityMod(character.abilities.cha),attackBonus:character.proficiency+abilityMod(character.abilities.cha),slots:progression.slots,cantrips,alwaysPrepared:always.map(spell=>spell.id),all};
    if (character.ruleset === "2014") return Object.freeze({...common,known:leveled,prepared:{selected:[],randomized:[],all:[]}});
    return Object.freeze({...common,known:{selected:[],randomized:[],all:[]},prepared:leveled});
  } catch (error) {
    console.error("[sorcerer-spellcasting] build failed", error);
    throw error;
  }
}
