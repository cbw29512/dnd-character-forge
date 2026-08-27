import { pick } from "./random.js";
import { resolveMagicInitiate, validateMagicInitiate } from "./magic-initiate.js";
import { isForgeOriginalBackground } from "../data/original-backgrounds.js";

export function resolveBackgroundDetails(ruleset,background,selections={}){
  try{
    if(!background)throw new Error("Background resolution requires a background.");
    if(ruleset==="2014"){
      const tools=[...(background.tools||[]),...(background.tool?[background.tool]:[])];
      return Object.freeze({choices:Object.freeze({}),toolProficiencies:Object.freeze(tools),equipment:Object.freeze([...(background.equipment||[])]),magicInitiate:null});
    }
    if(ruleset!=="2024")throw new Error(`Unsupported background ruleset: ${ruleset}.`);
    const choices={},tools=[];
    if(background.tool)tools.push(background.tool);
    if(background.toolChoices?.length){
      const tool=selectValue(background.toolChoices,selections.gamingSet,`${background.name} Gaming Set`);
      choices.gamingSet=tool;tools.push(tool);
    }
    const magicInitiate=resolveMagicInitiate(background,selections);
    if(magicInitiate){
      choices.spellcastingAbility=magicInitiate.spellcastingAbility;
      choices.cantrip1=magicInitiate.cantrips[0];
      choices.cantrip2=magicInitiate.cantrips[1];
      choices.level1Spell=magicInitiate.level1Spell;
    }
    const equipment=(background.equipment||[]).map(item=>item==="Gaming Set"?(choices.gamingSet||item):item);
    return Object.freeze({choices:Object.freeze(choices),toolProficiencies:Object.freeze(tools),equipment:Object.freeze(equipment),magicInitiate});
  }catch(error){console.error("[background] resolution failed",error);throw error;}
}

export function validateBackgroundDetails(character){
  try{
    const errors=[],background=character?.background;if(!background)return["Character background is missing."];
    for(const skill of background.skills||[])if(!character.skills.includes(skill))errors.push(`${background.name} background skill ${skill} is missing.`);
    if(isForgeOriginalBackground(background)){
      if(!String(background.displayName||"").includes("Forge Original"))errors.push(`${background.name} is missing its Forge Original display label.`);
      if(background.randomEligible!==false)errors.push(`${background.name} must remain excluded from default SRD-only Random generation.`);
    }
    if(character.ruleset==="2014"){
      const expectedTools=[...(background.tools||[]),...(background.tool?[background.tool]:[])];
      for(const tool of expectedTools)if(!(character.toolProficiencies||[]).includes(tool))errors.push(`${background.name} tool proficiency ${tool} is missing.`);
      if(isForgeOriginalBackground(background)&&(!background.feature||!background.reference))errors.push(`${background.name} is missing its original 2014 background feature reference.`);
      return errors;
    }
    if(character.ruleset!=="2024")return[...errors,`Background validation does not support ruleset ${character.ruleset}.`];
    const tools=character.toolProficiencies||[];
    if(!character.feats.some(feat=>feat.id===background.feat))errors.push(`${background.name} background feat is missing.`);
    if(background.tool&&!tools.includes(background.tool))errors.push(`${background.name} tool proficiency is missing.`);
    if(background.toolChoices?.length){const selected=character.backgroundChoices?.gamingSet;if(!background.toolChoices.includes(selected))errors.push(`${background.name} Gaming Set proficiency is invalid.`);if(!tools.includes(selected))errors.push(`${background.name} Gaming Set proficiency is missing from tool proficiencies.`);}
    errors.push(...validateMagicInitiate(character));
    return errors;
  }catch(error){console.error("[background] validation failed",error);throw error;}
}

function selectValue(values,requested,label){
  try{if(!requested)return pick(values);if(!values.includes(requested))throw new Error(`${label} "${requested}" is unavailable.`);return requested;}
  catch(error){console.error(`[background] ${label} selection failed`,error);throw error;}
}
