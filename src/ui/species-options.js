import { ABILITIES, SKILLS } from "../schema.js";
import { DRAGONBORN_ANCESTRIES, ELF_LINEAGES, GNOME_LINEAGES, GOLIATH_ANCESTRIES, TIEFLING_LEGACIES } from "../data/species-2024.js";
import { DRAGONBORN_ANCESTRIES_2014, DWARF_TOOLS_2014, LANGUAGES_2014 } from "../data/species-2014.js";
import { WIZARD_SPELLS_2014, WIZARD_SPELLS_2024 } from "../data/wizard-spells.js";

const SPELL_ABILITIES=[{id:"int",name:"Intelligence"},{id:"wis",name:"Wisdom"},{id:"cha",name:"Charisma"}];
const KEEN_SENSES=[{id:"insight",name:"Insight"},{id:"perception",name:"Perception"},{id:"survival",name:"Survival"}];
const SIZES=[{id:"Small",name:"Small"},{id:"Medium",name:"Medium"}];
const SKILL_OPTIONS=Object.keys(SKILLS).map(id=>({id,name:pretty(id)}));
const ABILITY_OPTIONS=ABILITIES.map(id=>({id,name:abilityName(id)}));
const LANGUAGE_OPTIONS=LANGUAGES_2014.map(name=>({id:name,name}));
const WIZARD_CANTRIPS=WIZARD_SPELLS_2024.filter(spell=>spell.level===0).map(spell=>({id:spell.id,name:spell.name}));
const WIZARD_CANTRIPS_2014=WIZARD_SPELLS_2014.filter(spell=>spell.level===0).map(spell=>({id:spell.id,name:spell.name}));

export function bindSpeciesOptions(state){
  try{
    const panel=document.getElementById("speciesChoicePanel");
    if(!panel)throw new Error("Species options panel is missing.");
    panel.addEventListener("change",event=>{
      try{
        const select=event.target.closest("[data-species-choice]");if(!select)return;
        const key=select.dataset.speciesChoice,value=select.value;
        if(value==="random")delete state.speciesSelections[key];else state.speciesSelections[key]=value;
        if(state.ruleset==="2024"&&key==="lineage"&&value!=="high")delete state.speciesSelections.cantrip;
        if(state.ruleset==="2014"&&key==="ability1"&&state.speciesSelections.ability2===value)delete state.speciesSelections.ability2;
        if(state.ruleset==="2014"&&key==="skill1"&&state.speciesSelections.skill2===value)delete state.speciesSelections.skill2;
        renderSpeciesOptions(state);
      }catch(error){console.error("[species-ui] change failed",error);throw error;}
    });
    renderSpeciesOptions(state);
  }catch(error){console.error("[species-ui] bind failed",error);throw error;}
}

export function resetSpeciesOptions(state){
  try{state.speciesSelections={};renderSpeciesOptions(state);}
  catch(error){console.error("[species-ui] reset failed",error);throw error;}
}

export function renderSpeciesOptions(state){
  try{
    const panel=document.getElementById("speciesChoicePanel"),fieldsNode=document.getElementById("speciesChoiceFields"),summary=document.getElementById("speciesChoiceSummary");
    if(!panel||!fieldsNode||!summary)throw new Error("Species option UI is incomplete.");
    const speciesId=state.constraints.species,fields=fieldsFor(state.ruleset,speciesId,state.speciesSelections||{});
    panel.hidden=fields.length===0;
    fieldsNode.innerHTML=fields.map(field=>fieldHtml(field,state.speciesSelections||{})).join("");
    summary.textContent=fields.length?summaryText(fields,state.speciesSelections||{}):"";
  }catch(error){console.error("[species-ui] render failed",error);throw error;}
}

function fieldsFor(ruleset,speciesId,selections){
  try{
    if(!speciesId||speciesId==="random")return[];
    if(ruleset==="2014")return fields2014(speciesId,selections);
    if(speciesId==="dragonborn")return[{key:"ancestry",label:"Draconic ancestry",options:DRAGONBORN_ANCESTRIES}];
    if(speciesId==="elf"){
      const fields=[{key:"lineage",label:"Elven lineage",options:Object.values(ELF_LINEAGES)},{key:"spellcastingAbility",label:"Lineage spell ability",options:SPELL_ABILITIES},{key:"keenSense",label:"Keen Senses skill",options:KEEN_SENSES}];
      if(selections.lineage==="high")fields.push({key:"cantrip",label:"High Elf Wizard cantrip",options:WIZARD_CANTRIPS});
      return fields;
    }
    if(speciesId==="gnome")return[{key:"lineage",label:"Gnomish lineage",options:Object.values(GNOME_LINEAGES)},{key:"spellcastingAbility",label:"Lineage spell ability",options:SPELL_ABILITIES}];
    if(speciesId==="goliath")return[{key:"giantAncestry",label:"Giant ancestry",options:Object.values(GOLIATH_ANCESTRIES)}];
    if(speciesId==="human")return[{key:"size",label:"Size",options:SIZES},{key:"skill",label:"Skillful proficiency",options:SKILL_OPTIONS}];
    if(speciesId==="tiefling")return[{key:"size",label:"Size",options:SIZES},{key:"legacy",label:"Fiendish legacy",options:Object.values(TIEFLING_LEGACIES)},{key:"spellcastingAbility",label:"Legacy spell ability",options:SPELL_ABILITIES}];
    return[];
  }catch(error){console.error("[species-ui] field definition failed",error);throw error;}
}
function fields2014(speciesId,selections){
  try{
    if(speciesId==="dwarf")return[{key:"tool",label:"Hill Dwarf tool proficiency",options:DWARF_TOOLS_2014}];
    if(speciesId==="elf")return[{key:"cantrip",label:"High Elf Wizard cantrip",options:WIZARD_CANTRIPS_2014},{key:"extraLanguage",label:"High Elf extra language",options:languageOptions(["Common","Elvish"])}];
    if(speciesId==="human")return[{key:"extraLanguage",label:"Human extra language",options:languageOptions(["Common"])}];
    if(speciesId==="dragonborn")return[{key:"ancestry",label:"Draconic ancestry",options:DRAGONBORN_ANCESTRIES_2014}];
    if(speciesId==="half-elf")return[
      {key:"ability1",label:"First +1 ability",options:ABILITY_OPTIONS.filter(option=>option.id!=="cha")},
      {key:"ability2",label:"Second +1 ability",options:ABILITY_OPTIONS.filter(option=>option.id!=="cha"&&option.id!==selections.ability1)},
      {key:"skill1",label:"First Skill Versatility proficiency",options:SKILL_OPTIONS},
      {key:"skill2",label:"Second Skill Versatility proficiency",options:SKILL_OPTIONS.filter(option=>option.id!==selections.skill1)},
      {key:"extraLanguage",label:"Half-Elf extra language",options:languageOptions(["Common","Elvish"])}
    ];
    return[];
  }catch(error){console.error("[species-ui] 2014 field definition failed",error);throw error;}
}
function languageOptions(excluded){return LANGUAGE_OPTIONS.filter(option=>!excluded.includes(option.id));}
function fieldHtml(field,selections){
  try{const value=selections[field.key]||"random",options=[`<option value="random">Random</option>`,...field.options.map(option=>`<option value="${escapeHtml(option.id)}"${value===option.id?" selected":""}>${escapeHtml(option.name)}</option>`)].join("");return `<label class="species-choice-field">${escapeHtml(field.label)}<select data-species-choice="${escapeHtml(field.key)}">${options}</select></label>`;}
  catch(error){console.error(`[species-ui] ${field.key} field failed`,error);throw error;}
}
function summaryText(fields,selections){try{const fixed=fields.filter(field=>selections[field.key]).length;return fixed?`${fixed} species option${fixed===1?"":"s"} fixed · every other species choice stays Random`:`All species choices Random`;}catch(error){console.error("[species-ui] summary failed",error);throw error;}}
function abilityName(id){return({str:"Strength",dex:"Dexterity",con:"Constitution",int:"Intelligence",wis:"Wisdom",cha:"Charisma"})[id]||id;}
function pretty(value){try{return String(value).replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}catch(error){console.error("[species-ui] label failed",error);throw error;}}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}
