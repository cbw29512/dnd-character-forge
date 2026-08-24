import { DRACONIC_AFFINITIES_2024, DRACONIC_ANCESTRIES_2014 } from "../data/sorcerer-class.js";
import { metamagicOptionsFor } from "../data/sorcerer-metamagic.js";
import { sorcererAlwaysPrepared } from "./sorcerer-spellcasting.js";
import { sorcererProgressionFor } from "./sorcerer.js";

const CORE_KEYS=["cantrips","known","prepared","sorceryPoints","metamagicCount","innateSorcery","sorcerousRestoration","sorcerousRestorationAmount","sorceryIncarnate","epicBoon","arcaneApotheosis","draconicResilience","draconicHpBonus","draconicArmorFormula","dragonAncestor","draconicSpells","elementalAffinity","dragonWings","draconicPresence","dragonCompanion"];

export function validateSorcererCharacter(character) {
  try {
    const errors=[],actual=character.sorcerer;
    if (!actual) return ["Sorcerer progression data is missing."];
    const expected=sorcererProgressionFor(character.ruleset,character.level,character.subclass?.id);
    for(const key of CORE_KEYS)if(actual[key]!==expected[key])errors.push(`Sorcerer ${key} should be ${String(expected[key])}.`);
    if(JSON.stringify(actual.slots)!==JSON.stringify(expected.slots))errors.push("Sorcerer spell-slot progression is incorrect.");
    validateSelections(errors,character,expected);validateSpells(errors,character,expected);validateEdition(errors,character,expected);
    return errors;
  } catch (error) {
    console.error("[sorcerer-validation] validation failed",error);
    throw error;
  }
}

function validateSelections(errors,character,expected) {
  try {
    const state=character.sorcererSelections;
    if(!state){errors.push("Sorcerer selection state is missing.");return;}
    const metamagic=state.metamagic?.all||[],legal=new Set(metamagicOptionsFor(character.ruleset).map(item=>item.id));
    if(metamagic.length!==expected.metamagicCount)errors.push(`Sorcerer should have ${expected.metamagicCount} Metamagic options.`);
    if(new Set(metamagic).size!==metamagic.length)errors.push("Sorcerer Metamagic choices contain duplicates.");
    for(const id of metamagic)if(!legal.has(id))errors.push(`Sorcerer has illegal ${character.ruleset} Metamagic option ${id}.`);
    const draconic=state.draconic||{};
    if(character.ruleset==="2014"){
      if(draconic.elementalAffinity!=null&&character.level<6)errors.push("2014 Elemental Affinity appeared before Sorcerer level 6.");
      if(character.subclass?.id==="draconic-bloodline"){
        const ancestry=DRACONIC_ANCESTRIES_2014.find(item=>item.id===draconic.ancestry?.id);if(!ancestry)errors.push("2014 Draconic Bloodline is missing a legal Dragon Ancestor.");
        if(character.level>=6&&ancestry&&draconic.elementalAffinity!==ancestry.damageType)errors.push("2014 Elemental Affinity does not match Dragon Ancestor damage type.");
      }
    }else if(character.ruleset==="2024"){
      if(draconic.ancestry!=null)errors.push("2024 Draconic Sorcery cannot contain legacy Dragon Ancestor state.");
      const shouldHaveAffinity=character.subclass?.id==="draconic-sorcery"&&character.level>=6;
      if(shouldHaveAffinity&&!DRACONIC_AFFINITIES_2024.includes(draconic.elementalAffinity))errors.push("2024 Draconic Sorcery is missing a legal Elemental Affinity.");
      if(!shouldHaveAffinity&&draconic.elementalAffinity!=null)errors.push("2024 Elemental Affinity appeared before it was legal.");
    }
  } catch (error) { console.error("[sorcerer-validation] selection validation failed",error); throw error; }
}

function validateSpells(errors,character,expected) {
  try {
    const spells=character.spells;if(!spells){errors.push("Sorcerer spellcasting data is missing.");return;}
    if(JSON.stringify(spells.slots)!==JSON.stringify(expected.slots))errors.push("Sorcerer spell slots do not match progression.");
    if((spells.cantrips?.all||[]).length!==expected.cantrips)errors.push(`Sorcerer should have ${expected.cantrips} cantrips.`);
    for(const bucket of [spells.cantrips?.all||[],spells.known?.all||[],spells.prepared?.all||[],spells.alwaysPrepared||[]])if(new Set(bucket).size!==bucket.length)errors.push("Sorcerer spell bucket contains duplicate spell ids.");
    if(character.ruleset==="2014"){
      if((spells.known?.all||[]).length!==expected.known)errors.push(`2014 Sorcerer should know ${expected.known} leveled spells.`);
      if((spells.prepared?.all||[]).length)errors.push("2014 Sorcerer cannot contain prepared class-spell state.");
      if((spells.alwaysPrepared||[]).length)errors.push("2014 Draconic Bloodline cannot contain always-prepared subclass spells.");
    }else{
      if((spells.known?.all||[]).length)errors.push("2024 Sorcerer cannot contain spells-known class state.");
      if((spells.prepared?.all||[]).length!==expected.prepared)errors.push(`2024 Sorcerer should have ${expected.prepared} normally prepared spells.`);
      const always=sorcererAlwaysPrepared(character).map(item=>item.id),actual=spells.alwaysPrepared||[];
      if(actual.length!==always.length)errors.push("2024 Draconic always-prepared spell count is incorrect.");for(const id of always)if(!actual.includes(id))errors.push(`2024 Draconic Sorcery is missing always-prepared spell ${id}.`);
      for(const id of actual)if((spells.prepared?.all||[]).includes(id))errors.push(`2024 Draconic spell ${id} illegally consumes a normal prepared slot.`);
    }
  } catch (error) { console.error("[sorcerer-validation] spell validation failed",error); throw error; }
}

function validateEdition(errors,character,expected) {
  try {
    if(character.ruleset==="2014"){
      for(const name of ["Innate Sorcery","Sorcery Incarnate","Dragon Companion","Arcane Apotheosis","Epic Boon"])if(character.features.includes(name))errors.push(`2014 Sorcerer cannot contain 2024 feature ${name}.`);
      if(character.feats?.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Sorcerer cannot contain a 2024 Epic Boon.");
    }else if(character.ruleset==="2024"){
      for(const name of ["Sorcerous Origin","Dragon Ancestor","Draconic Presence"])if(character.features.includes(name))errors.push(`2024 Sorcerer cannot contain legacy feature ${name}.`);
      const boon=character.feats?.some(feat=>feat.id==="boon-dimensional-travel");if(character.level>=19&&!boon)errors.push("Level 19+ Sorcerer is missing Boon of Dimensional Travel.");if(character.level<19&&boon)errors.push("Boon of Dimensional Travel appeared before Sorcerer level 19.");
      if(expected.arcaneApotheosis&&!character.features.includes("Arcane Apotheosis"))errors.push("Level 20 Sorcerer is missing Arcane Apotheosis.");
    }else errors.push(`Sorcerer is not verified for ruleset ${character.ruleset}.`);
  } catch (error) { console.error("[sorcerer-validation] edition isolation failed",error); throw error; }
}
