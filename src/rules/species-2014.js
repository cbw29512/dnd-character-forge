import { ABILITIES, SKILLS } from "../schema.js";
import { WIZARD_SPELLS_2014 } from "../data/wizard-spells.js";
import { SPECIES_2014, LANGUAGES_2014, DWARF_TOOLS_2014, DRAGONBORN_ANCESTRIES_2014 } from "../data/species-2014.js";
import { SPECIES_REFERENCE_2014 } from "../data/species-reference-2014.js";
import { REFERENCE_2014 } from "../data/quick-reference.js";
import { pick } from "./random.js";

Object.assign(REFERENCE_2014.species,SPECIES_REFERENCE_2014);

const ALL_SKILLS=Object.freeze(Object.keys(SKILLS));
const HIGH_ELF_CANTRIPS=Object.freeze(WIZARD_SPELLS_2014.filter(spell=>spell.level===0));

export function resolve2014Species(species,{level=1,skills=[],selections={}}={}){
  try{
    if(!species?.id||!SPECIES_2014.some(item=>item.id===species.id))throw new Error("2014 race resolution requires a verified SRD 5.1 race.");
    const choices={},addedSkills=[],toolProficiencies=[],languages=[...(species.fixedLanguages||[])],abilityAdds={...(species.abilityAdds||{})};
    if(species.subrace){choices.subrace=species.subrace;choices.subraceName=species.subraceName;}
    switch(species.id){
      case "dwarf":{
        const tool=selectRecord(DWARF_TOOLS_2014,selections.tool,"Dwarf tool proficiency");choices.tool=tool.id;choices.toolName=tool.name;toolProficiencies.push(tool.name);break;
      }
      case "elf":{
        if(!skills.includes("perception"))addedSkills.push("perception");
        const cantrip=selectRecord(HIGH_ELF_CANTRIPS,selections.cantrip,"High Elf Wizard cantrip");choices.cantrip=cantrip.id;choices.cantripName=cantrip.name;
        const language=selectLanguage(selections.extraLanguage,languages,"High Elf extra language");choices.extraLanguage=language;languages.push(language);break;
      }
      case "human":{
        const language=selectLanguage(selections.extraLanguage,languages,"Human extra language");choices.extraLanguage=language;languages.push(language);break;
      }
      case "dragonborn":{
        const ancestry=selectRecord(DRAGONBORN_ANCESTRIES_2014,selections.ancestry,"Dragonborn ancestry");choices.ancestry=ancestry.id;choices.ancestryName=ancestry.name;choices.damageType=ancestry.damageType;choices.breathArea=ancestry.area;choices.breathSave=ancestry.save;break;
      }
      case "gnome":toolProficiencies.push("Tinker's Tools");break;
      case "half-elf":{
        const first=selectValue(ABILITIES.filter(ability=>ability!=="cha"),selections.ability1,"Half-Elf first +1 ability");
        const second=selectValue(ABILITIES.filter(ability=>ability!=="cha"&&ability!==first),selections.ability2,"Half-Elf second +1 ability");
        choices.ability1=first;choices.ability2=second;abilityAdds[first]=(abilityAdds[first]||0)+1;abilityAdds[second]=(abilityAdds[second]||0)+1;
        const firstSkill=selectAvailable(ALL_SKILLS,selections.skill1,skills,"Half-Elf first Skill Versatility proficiency");
        const secondSkill=selectAvailable(ALL_SKILLS,selections.skill2,[...skills,firstSkill],"Half-Elf second Skill Versatility proficiency");choices.skill1=firstSkill;choices.skill2=secondSkill;addedSkills.push(firstSkill,secondSkill);
        const language=selectLanguage(selections.extraLanguage,languages,"Half-Elf extra language");choices.extraLanguage=language;languages.push(language);break;
      }
      case "half-orc":if(!skills.includes("intimidation"))addedSkills.push("intimidation");break;
      default:break;
    }
    return Object.freeze({size:species.size,speed:species.speed,choices:Object.freeze(choices),abilityAdds:Object.freeze(abilityAdds),addedSkills:Object.freeze(addedSkills),toolProficiencies:Object.freeze(toolProficiencies),languages:Object.freeze(languages),activeTraits:Object.freeze([...(species.traits||[])])});
  }catch(error){console.error("[species-2014] race resolution failed",error);throw error;}
}

export function validate2014Species(character){
  try{
    if(character?.ruleset!=="2014")return[];const errors=[],species=SPECIES_2014.find(item=>item.id===character.species?.id),choices=character.speciesChoices||{};if(!species)return["2014 race is outside the verified SRD 5.1 catalog."];
    const monkSpeed=character.class?.id==="monk"&&!character.equipment?.armor&&!character.equipment?.shield?(character.monk?.unarmoredMovementBonus||0):0,expectedSpeed=species.speed+(character.barbarian?.speedBonus||0)+monkSpeed;
    if(character.size!==species.size)errors.push(`${species.name} size should be ${species.size}.`);if(character.speed!==expectedSpeed)errors.push(`${species.name} final speed should be ${expectedSpeed} ft after legal class modifiers.`);
    if(species.subrace&&(choices.subrace!==species.subrace||choices.subraceName!==species.subraceName))errors.push(`${species.name} subrace identity is invalid.`);
    if(species.id==="dwarf"&&!DWARF_TOOLS_2014.some(tool=>tool.id===choices.tool&&tool.name===choices.toolName&&(character.toolProficiencies||[]).includes(tool.name)))errors.push("Hill Dwarf tool proficiency choice is invalid.");
    if(species.id==="elf"){
      if(!HIGH_ELF_CANTRIPS.some(spell=>spell.id===choices.cantrip&&spell.name===choices.cantripName))errors.push("High Elf cantrip choice is invalid.");if(!character.skills.includes("perception"))errors.push("High Elf is missing Keen Senses Perception proficiency.");if(!validExtraLanguage(choices.extraLanguage,species.fixedLanguages,character.languages))errors.push("High Elf extra language is invalid.");
    }
    if(species.id==="human"&&!validExtraLanguage(choices.extraLanguage,species.fixedLanguages,character.languages))errors.push("Human extra language is invalid.");
    if(species.id==="dragonborn"&&!DRAGONBORN_ANCESTRIES_2014.some(item=>item.id===choices.ancestry&&item.name===choices.ancestryName&&item.damageType===choices.damageType&&item.area===choices.breathArea&&item.save===choices.breathSave))errors.push("Dragonborn ancestry is invalid.");
    if(species.id==="gnome"&&!(character.toolProficiencies||[]).includes("Tinker's Tools"))errors.push("Rock Gnome is missing Tinker's Tools proficiency.");
    if(species.id==="half-elf"){
      if(!ABILITIES.includes(choices.ability1)||!ABILITIES.includes(choices.ability2)||choices.ability1==="cha"||choices.ability2==="cha"||choices.ability1===choices.ability2)errors.push("Half-Elf flexible ability increases are invalid.");
      if(!ALL_SKILLS.includes(choices.skill1)||!ALL_SKILLS.includes(choices.skill2)||choices.skill1===choices.skill2||!character.skills.includes(choices.skill1)||!character.skills.includes(choices.skill2))errors.push("Half-Elf Skill Versatility choices are invalid.");if(!validExtraLanguage(choices.extraLanguage,species.fixedLanguages,character.languages))errors.push("Half-Elf extra language is invalid.");
    }
    if(species.id==="half-orc"&&!character.skills.includes("intimidation"))errors.push("Half-Orc is missing Menacing Intimidation proficiency.");
    const expectedAdds={...(species.abilityAdds||{})};if(species.id==="half-elf"&&choices.ability1&&choices.ability2&&choices.ability1!==choices.ability2){expectedAdds[choices.ability1]=(expectedAdds[choices.ability1]||0)+1;expectedAdds[choices.ability2]=(expectedAdds[choices.ability2]||0)+1;}if(!sameRecord(expectedAdds,character.speciesAbilityAdds||{}))errors.push(`${species.name} racial ability increases are incorrect.`);
    for(const language of species.fixedLanguages||[])if(!character.languages.includes(language))errors.push(`${species.name} is missing racial language ${language}.`);
    if(species.id==="elf"&&(character.speciesMagic?.ability!=="int"||character.speciesMagic?.cantrips?.[0]!==choices.cantripName))errors.push("High Elf race magic is incorrect.");
    if(species.id==="tiefling"){const expected=speciesMagic2014(character);if(JSON.stringify(character.speciesMagic)!==JSON.stringify(expected))errors.push("Tiefling Infernal Legacy magic is incorrect.");}
    return errors;
  }catch(error){console.error("[species-2014] race validation failed",error);throw error;}
}

export function speciesMagic2014(character){
  try{
    if(character?.ruleset!=="2014")return null;if(character.species?.id==="elf")return Object.freeze({ability:"int",cantrips:Object.freeze([character.speciesChoices.cantripName]),spells:Object.freeze([])});
    if(character.species?.id==="tiefling")return Object.freeze({ability:"cha",cantrips:Object.freeze(["Thaumaturgy"]),spells:Object.freeze([character.level>=3?"Hellish Rebuke (2nd-level)":null,character.level>=5?"Darkness":null].filter(Boolean))});return null;
  }catch(error){console.error("[species-2014] race magic failed",error);throw error;}
}

export function dragonbornBreath2014(character){
  try{if(character?.ruleset!=="2014"||character.species?.id!=="dragonborn")return null;const dice=character.level>=16?5:character.level>=11?4:character.level>=6?3:2;return Object.freeze({dice:`${dice}d6`,damageType:character.speciesChoices.damageType,area:character.speciesChoices.breathArea,save:character.speciesChoices.breathSave,dc:8+Math.floor((character.abilities.con-10)/2)+character.proficiency,recharge:"Short or Long Rest"});}catch(error){console.error("[species-2014] breath weapon failed",error);throw error;}
}

function selectRecord(records,requested,label){try{if(!requested)return pick(records);const record=records.find(item=>item.id===requested);if(!record)throw new Error(`${label} "${requested}" is unavailable.`);return record;}catch(error){console.error(`[species-2014] ${label} failed`,error);throw error;}}
function selectValue(values,requested,label){try{if(!requested)return pick(values);if(!values.includes(requested))throw new Error(`${label} "${requested}" is unavailable.`);return requested;}catch(error){console.error(`[species-2014] ${label} failed`,error);throw error;}}
function selectAvailable(values,requested,excluded,label){try{const available=values.filter(value=>!excluded.includes(value));if(requested){if(!available.includes(requested))throw new Error(`${label} "${requested}" is unavailable for this character.`);return requested;}return pick(available);}catch(error){console.error(`[species-2014] ${label} failed`,error);throw error;}}
function selectLanguage(requested,excluded,label){try{return selectAvailable(LANGUAGES_2014,requested,excluded,label);}catch(error){console.error(`[species-2014] ${label} failed`,error);throw error;}}
function validExtraLanguage(language,fixed,all){return Boolean(language&&LANGUAGES_2014.includes(language)&&!fixed.includes(language)&&all.includes(language));}
function sameRecord(left,right){try{const a=Object.keys(left).sort(),b=Object.keys(right).sort();return a.length===b.length&&a.every((key,index)=>key===b[index]&&left[key]===right[key]);}catch(error){console.error("[species-2014] ability record comparison failed",error);throw error;}}
