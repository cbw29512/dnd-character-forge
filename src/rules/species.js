import { SKILLS } from "../schema.js";
import { WIZARD_SPELLS_2024 } from "../data/wizard-spells.js";
import { DRAGONBORN_ANCESTRIES, ELF_LINEAGES, GNOME_LINEAGES, GOLIATH_ANCESTRIES, TIEFLING_LEGACIES } from "../data/species-2024.js";
import { pick } from "./random.js";

const SPELL_ABILITIES=Object.freeze(["int","wis","cha"]);
const KEEN_SENSES=Object.freeze(["insight","perception","survival"]);
const ALL_SKILLS=Object.freeze(Object.keys(SKILLS));
const WIZARD_CANTRIPS=Object.freeze(WIZARD_SPELLS_2024.filter(spell=>spell.level===0));

export function resolve2024Species(species,{level,skills=[]}={}){
  try{
    if(!species?.id)throw new Error("2024 species resolution requires a species.");
    const choices={},addedSkills=[],activeTraits=species.traits.filter(trait=>traitIsActive(species.id,trait,level));
    let size=species.size.includes("or")?pick(["Small","Medium"]):species.size;
    switch(species.id){
      case "dragonborn":{
        const ancestry=pick(DRAGONBORN_ANCESTRIES);choices.ancestry=ancestry.id;choices.ancestryName=ancestry.name;choices.damageType=ancestry.damageType;break;
      }
      case "elf":{
        const lineage=pick(Object.values(ELF_LINEAGES));choices.lineage=lineage.id;choices.lineageName=lineage.name;choices.spellcastingAbility=pick(SPELL_ABILITIES);
        choices.keenSense=pickAvailable(KEEN_SENSES,skills);if(!skills.includes(choices.keenSense))addedSkills.push(choices.keenSense);
        if(lineage.replaceableWizardCantrip){const cantrip=pick(WIZARD_CANTRIPS);choices.cantrip=cantrip.id;choices.cantripName=cantrip.name;}break;
      }
      case "gnome":{
        const lineage=pick(Object.values(GNOME_LINEAGES));choices.lineage=lineage.id;choices.lineageName=lineage.name;choices.spellcastingAbility=pick(SPELL_ABILITIES);break;
      }
      case "goliath":{
        const ancestry=pick(Object.values(GOLIATH_ANCESTRIES));choices.giantAncestry=ancestry.id;choices.giantAncestryName=ancestry.name;break;
      }
      case "human":{
        choices.skill=pickAvailable(ALL_SKILLS,skills);if(!skills.includes(choices.skill))addedSkills.push(choices.skill);break;
      }
      case "tiefling":{
        const legacy=pick(Object.values(TIEFLING_LEGACIES));choices.legacy=legacy.id;choices.legacyName=legacy.name;choices.spellcastingAbility=pick(SPELL_ABILITIES);break;
      }
      default: break;
    }
    return Object.freeze({size,choices:Object.freeze(choices),addedSkills:Object.freeze(addedSkills),activeTraits:Object.freeze(activeTraits)});
  }catch(error){console.error("[species] 2024 species resolution failed",error);throw error;}
}

export function speciesSpeed(character){
  try{if(character?.ruleset==="2024"&&character.species?.id==="elf"&&character.speciesChoices?.lineage==="wood")return 35;return character.species.speed;}
  catch(error){console.error("[species] speed resolution failed",error);throw error;}
}

export function speciesHpBonus(character){
  try{return character?.ruleset==="2024"&&character.species?.id==="dwarf"?character.level:0;}
  catch(error){console.error("[species] HP bonus resolution failed",error);throw error;}
}

export function speciesDarkvision(character){
  try{
    if(character?.ruleset!=="2024")return null;
    if(character.species.id==="dwarf"||character.species.id==="orc")return 120;
    if(character.species.id==="elf"&&character.speciesChoices?.lineage==="drow")return 120;
    if(["dragonborn","elf","gnome","tiefling"].includes(character.species.id))return 60;
    return null;
  }catch(error){console.error("[species] Darkvision resolution failed",error);throw error;}
}

export function dragonbornBreath(character){
  try{
    if(character?.ruleset!=="2024"||character.species?.id!=="dragonborn")return null;
    const dice=character.level>=17?4:character.level>=11?3:character.level>=5?2:1;
    return Object.freeze({dice:`${dice}d10`,damageType:character.speciesChoices.damageType,uses:character.proficiency,dc:8+Math.floor((character.abilities.con-10)/2)+character.proficiency});
  }catch(error){console.error("[species] Dragonborn breath resolution failed",error);throw error;}
}

export function speciesMagic(character){
  try{
    if(character?.ruleset!=="2024")return null;
    const choices=character.speciesChoices||{},level=character.level;
    if(character.species.id==="elf"){
      const lineage=ELF_LINEAGES[choices.lineage];if(!lineage)return null;
      const cantrip=lineage.replaceableWizardCantrip?choices.cantripName:lineage.cantrip;
      return magic(choices.spellcastingAbility,[cantrip],[level>=3?lineage.level3:null,level>=5?lineage.level5:null]);
    }
    if(character.species.id==="gnome"){
      const lineage=GNOME_LINEAGES[choices.lineage];if(!lineage)return null;
      return magic(choices.spellcastingAbility,lineage.cantrips||[],lineage.alwaysPrepared||[]);
    }
    if(character.species.id==="tiefling"){
      const legacy=TIEFLING_LEGACIES[choices.legacy];if(!legacy)return null;
      return magic(choices.spellcastingAbility,[legacy.cantrip,"Thaumaturgy"],[level>=3?legacy.level3:null,level>=5?legacy.level5:null]);
    }
    return null;
  }catch(error){console.error("[species] species magic resolution failed",error);throw error;}
}

export function speciesChoiceLabel(character){
  try{
    const choices=character?.speciesChoices||{};
    if(character?.species?.id==="dragonborn")return `${character.species.name} — ${choices.ancestryName}`;
    if(["elf","gnome"].includes(character?.species?.id))return `${character.species.name} — ${choices.lineageName}`;
    if(character?.species?.id==="goliath")return `${character.species.name} — ${choices.giantAncestryName}`;
    if(character?.species?.id==="tiefling")return `${character.species.name} — ${choices.legacyName}`;
    return character?.species?.name||"Unknown";
  }catch(error){console.error("[species] choice label failed",error);throw error;}
}

export function validate2024Species(character){
  try{
    if(character?.ruleset!=="2024")return[];
    const errors=[],choices=character.speciesChoices||{},id=character.species.id;
    if(id==="dragonborn"&&!DRAGONBORN_ANCESTRIES.some(item=>item.id===choices.ancestry&&item.damageType===choices.damageType))errors.push("Dragonborn ancestry is invalid.");
    if(id==="elf"){
      if(!ELF_LINEAGES[choices.lineage])errors.push("Elf lineage is invalid.");
      if(!SPELL_ABILITIES.includes(choices.spellcastingAbility))errors.push("Elf lineage spellcasting ability is invalid.");
      if(!KEEN_SENSES.includes(choices.keenSense)||!character.skills.includes(choices.keenSense))errors.push("Elf Keen Senses proficiency is invalid.");
      if(choices.lineage==="high"&&!WIZARD_CANTRIPS.some(spell=>spell.id===choices.cantrip&&spell.name===choices.cantripName))errors.push("High Elf cantrip choice is invalid.");
    }
    if(id==="gnome"&&(!GNOME_LINEAGES[choices.lineage]||!SPELL_ABILITIES.includes(choices.spellcastingAbility)))errors.push("Gnome lineage choice is invalid.");
    if(id==="goliath"&&!GOLIATH_ANCESTRIES[choices.giantAncestry])errors.push("Goliath Giant Ancestry is invalid.");
    if(id==="human"&&(!ALL_SKILLS.includes(choices.skill)||!character.skills.includes(choices.skill)))errors.push("Human Skillful proficiency is invalid.");
    if(id==="tiefling"&&(!TIEFLING_LEGACIES[choices.legacy]||!SPELL_ABILITIES.includes(choices.spellcastingAbility)))errors.push("Tiefling Fiendish Legacy is invalid.");
    return errors;
  }catch(error){console.error("[species] species validation failed",error);throw error;}
}

function traitIsActive(speciesId,trait,level){
  try{if((speciesId==="dragonborn"&&trait==="Draconic Flight")||(speciesId==="goliath"&&trait==="Large Form"))return Number(level)>=5;return true;}
  catch(error){console.error("[species] active trait resolution failed",error);throw error;}
}
function pickAvailable(values,excluded){try{const available=values.filter(value=>!excluded.includes(value));return pick(available.length?available:values);}catch(error){console.error("[species] available choice failed",error);throw error;}}
function magic(ability,cantrips,spells){try{return Object.freeze({ability,cantrips:Object.freeze(cantrips.filter(Boolean)),spells:Object.freeze(spells.filter(Boolean))});}catch(error){console.error("[species] magic state failed",error);throw error;}}
