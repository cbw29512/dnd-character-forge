import { SKILLS } from "../schema.js";
import { WIZARD_SPELLS_2024 } from "../data/wizard-spells.js";
import { DRAGONBORN_ANCESTRIES, ELF_LINEAGES, GNOME_LINEAGES, GOLIATH_ANCESTRIES, TIEFLING_LEGACIES } from "../data/species-2024.js";
import { dragonbornBreath2014, speciesMagic2014 } from "./species-2014.js";
import { pick } from "./random.js";

const SPELL_ABILITIES=Object.freeze(["int","wis","cha"]);
const KEEN_SENSES=Object.freeze(["insight","perception","survival"]);
const ALL_SKILLS=Object.freeze(Object.keys(SKILLS));
const WIZARD_CANTRIPS=Object.freeze(WIZARD_SPELLS_2024.filter(spell=>spell.level===0));

export function resolve2024Species(species,{level,skills=[],selections={}}={}){
  try{
    if(!species?.id)throw new Error("2024 species resolution requires a species.");
    const choices={},addedSkills=[],activeTraits=species.traits.filter(trait=>traitIsActive(species.id,trait,level));
    const size=species.size.includes("or")?selectValue(["Small","Medium"],selections.size,"species size"):species.size;
    switch(species.id){
      case "dragonborn":{
        const ancestry=selectRecord(DRAGONBORN_ANCESTRIES,selections.ancestry,"Dragonborn ancestry");choices.ancestry=ancestry.id;choices.ancestryName=ancestry.name;choices.damageType=ancestry.damageType;break;
      }
      case "elf":{
        const lineage=selectRecord(Object.values(ELF_LINEAGES),selections.lineage,"Elf lineage");choices.lineage=lineage.id;choices.lineageName=lineage.name;choices.spellcastingAbility=selectValue(SPELL_ABILITIES,selections.spellcastingAbility,"Elf spellcasting ability");
        choices.keenSense=selectAvailable(KEEN_SENSES,selections.keenSense,skills,"Elf Keen Senses");if(!skills.includes(choices.keenSense))addedSkills.push(choices.keenSense);
        if(lineage.replaceableWizardCantrip){const cantrip=selectRecord(WIZARD_CANTRIPS,selections.cantrip,"High Elf cantrip");choices.cantrip=cantrip.id;choices.cantripName=cantrip.name;}break;
      }
      case "gnome":{
        const lineage=selectRecord(Object.values(GNOME_LINEAGES),selections.lineage,"Gnome lineage");choices.lineage=lineage.id;choices.lineageName=lineage.name;choices.spellcastingAbility=selectValue(SPELL_ABILITIES,selections.spellcastingAbility,"Gnome spellcasting ability");break;
      }
      case "goliath":{
        const ancestry=selectRecord(Object.values(GOLIATH_ANCESTRIES),selections.giantAncestry,"Goliath Giant Ancestry");choices.giantAncestry=ancestry.id;choices.giantAncestryName=ancestry.name;break;
      }
      case "human":{
        choices.skill=selectAvailable(ALL_SKILLS,selections.skill,skills,"Human Skillful proficiency");if(!skills.includes(choices.skill))addedSkills.push(choices.skill);break;
      }
      case "tiefling":{
        const legacy=selectRecord(Object.values(TIEFLING_LEGACIES),selections.legacy,"Tiefling Fiendish Legacy");choices.legacy=legacy.id;choices.legacyName=legacy.name;choices.spellcastingAbility=selectValue(SPELL_ABILITIES,selections.spellcastingAbility,"Tiefling spellcasting ability");break;
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
export function speciesHpBonus(character){try{if(character?.species?.id!=="dwarf")return 0;if(character.ruleset==="2024")return character.level;if(character.ruleset==="2014"&&character.speciesChoices?.subrace==="hill")return character.level;return 0;}catch(error){console.error("[species] HP bonus resolution failed",error);throw error;}}
export function speciesDarkvision(character){
  try{
    if(character?.ruleset==="2014")return ["dwarf","elf","gnome","half-elf","half-orc","tiefling"].includes(character.species?.id)?60:null;
    if(character?.ruleset!=="2024")return null;if(character.species.id==="dwarf"||character.species.id==="orc")return 120;if(character.species.id==="elf"&&character.speciesChoices?.lineage==="drow")return 120;if(["dragonborn","elf","gnome","tiefling"].includes(character.species.id))return 60;return null;
  }catch(error){console.error("[species] Darkvision resolution failed",error);throw error;}
}
export function dragonbornBreath(character){
  try{if(character?.ruleset==="2014")return dragonbornBreath2014(character);if(character?.ruleset!=="2024"||character.species?.id!=="dragonborn")return null;const dice=character.level>=17?4:character.level>=11?3:character.level>=5?2:1;return Object.freeze({dice:`${dice}d10`,damageType:character.speciesChoices.damageType,uses:character.proficiency,dc:8+Math.floor((character.abilities.con-10)/2)+character.proficiency});}
  catch(error){console.error("[species] Dragonborn breath resolution failed",error);throw error;}
}
export function speciesMagic(character){
  try{
    if(character?.ruleset==="2014")return speciesMagic2014(character);
    if(character?.ruleset!=="2024")return null;const choices=character.speciesChoices||{},level=character.level;
    if(character.species.id==="elf"){const lineage=ELF_LINEAGES[choices.lineage];if(!lineage)return null;const cantrip=lineage.replaceableWizardCantrip?choices.cantripName:lineage.cantrip;return magic(choices.spellcastingAbility,[cantrip],[level>=3?lineage.level3:null,level>=5?lineage.level5:null]);}
    if(character.species.id==="gnome"){const lineage=GNOME_LINEAGES[choices.lineage];if(!lineage)return null;return magic(choices.spellcastingAbility,lineage.cantrips||[],lineage.alwaysPrepared||[]);}
    if(character.species.id==="tiefling"){const legacy=TIEFLING_LEGACIES[choices.legacy];if(!legacy||!magic)throw new Error("Tiefling legacy data is unavailable.");return magic(choices.spellcastingAbility,[legacy.cantrip,"Thaumaturgy"],[level>=3?legacy.level3:null,level>=5?legacy.level5:null]);}
    return null;
  }catch(error){console.error("[species] species magic resolution failed",error);throw error;}
}
export function speciesChoiceLabel(character){
  try{const choices=character?.speciesChoices||{};if(character?.ruleset==="2014"&&choices.subraceName)return `${character.species.name} — ${choices.subraceName}`;if(character?.species?.id==="dragonborn")return `${character.species.name} — ${choices.ancestryName}`;if(["elf","gnome"].includes(character?.species?.id)&&choices.lineageName)return `${character.species.name} — ${choices.lineageName}`;if(character?.species?.id==="goliath")return `${character.species.name} — ${choices.giantAncestryName}`;if(character?.species?.id==="tiefling"&&choices.legacyName)return `${character.species.name} — ${choices.legacyName}`;return character?.species?.name||"Unknown";}
  catch(error){console.error("[species] choice label failed",error);throw error;}
}
export function validate2024Species(character){
  try{
    if(character?.ruleset!=="2024")return[];const errors=[],choices=character.speciesChoices||{},id=character.species.id;
    if(id==="dragonborn"&&!DRAGONBORN_ANCESTRIES.some(item=>item.id===choices.ancestry&&item.damageType===choices.damageType))errors.push("Dragonborn ancestry is invalid.");
    if(id==="elf"){
      if(!ELF_LINEAGES[choices.lineage])errors.push("Elf lineage is invalid.");if(!SPELL_ABILITIES.includes(choices.spellcastingAbility))errors.push("Elf lineage spellcasting ability is invalid.");if(!KEEN_SENSES.includes(choices.keenSense)||!character.skills.includes(choices.keenSense))errors.push("Elf Keen Senses proficiency is invalid.");if(choices.lineage==="high"&&!WIZARD_CANTRIPS.some(spell=>spell.id===choices.cantrip&&spell.name===choices.cantripName))errors.push("High Elf cantrip choice is invalid.");
    }
    if(id==="gnome"&&(!GNOME_LINEAGES[choices.lineage]||!SPELL_ABILITIES.includes(choices.spellcastingAbility)))errors.push("Gnome lineage choice is invalid.");
    if(id==="goliath"&&!GOLIATH_ANCESTRIES[choices.giantAncestry])errors.push("Goliath Giant Ancestry is invalid.");
    if(id==="human"&&(!ALL_SKILLS.includes(choices.skill)||!character.skills.includes(choices.skill)))errors.push("Human Skillful proficiency is invalid.");
    if(id==="tiefling"&&(!TIEFLING_LEGACIES[choices.legacy]||!SPELL_ABILITIES.includes(choices.spellcastingAbility)))errors.push("Tiefling Fiendish Legacy is invalid.");
    return errors;
  }catch(error){console.error("[species] species validation failed",error);throw error;}
}
function traitIsActive(speciesId,trait,level){try{if((speciesId==="dragonborn"&&trait==="Draconic Flight")||(speciesId==="goliath"&&trait==="Large Form"))return Number(level)>=5;return true;}catch(error){console.error("[species] active trait resolution failed",error);throw error;}}
function selectRecord(records,requested,label){try{if(!requested)return pick(records);const record=records.find(item=>item.id===requested);if(!record)throw new Error(`${label} "${requested}" is unavailable.`);return record;}catch(error){console.error(`[species] ${label} selection failed`,error);throw error;}}
function selectValue(values,requested,label){try{if(!requested)return pick(values);if(!values.includes(requested))throw new Error(`${label} "${requested}" is unavailable.`);return requested;}catch(error){console.error(`[species] ${label} selection failed`,error);throw error;}}
function selectAvailable(values,requested,excluded,label){try{if(requested){if(!values.includes(requested))throw new Error(`${label} "${requested}" is unavailable.`);return requested;}const available=values.filter(value=>!excluded.includes(value));return pick(available.length?available:values);}catch(error){console.error(`[species] ${label} selection failed`,error);throw error;}}
function magic(ability,cantrips,spells){try{return Object.freeze({ability,cantrips:Object.freeze(cantrips.filter(Boolean)),spells:Object.freeze(spells.filter(Boolean))});}catch(error){console.error("[species] magic state failed",error);throw error;}}
