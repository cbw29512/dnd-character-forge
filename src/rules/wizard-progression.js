import { fullCasterCantrips, fullCasterSlots, validatedCasterLevel } from "./full-caster.js";

const PREPARED_2024=Object.freeze({1:4,2:5,3:6,4:7,5:9,6:10,7:11,8:12,9:14,10:15,11:16,12:16,13:17,14:18,15:19,16:21,17:22,18:23,19:24,20:25});
const FEATURES_2014=Object.freeze({1:["Spellcasting","Arcane Recovery"],2:["Arcane Tradition"],4:["Ability Score Improvement"],6:["Arcane Tradition feature"],8:["Ability Score Improvement"],10:["Arcane Tradition feature"],12:["Ability Score Improvement"],14:["Arcane Tradition feature"],16:["Ability Score Improvement"],18:["Spell Mastery"],19:["Ability Score Improvement"],20:["Signature Spells"]});
const FEATURES_2024=Object.freeze({1:["Spellcasting","Ritual Adept","Arcane Recovery"],2:["Scholar"],3:["Wizard Subclass"],4:["Ability Score Improvement"],5:["Memorize Spell"],6:["Subclass feature"],8:["Ability Score Improvement"],10:["Subclass feature"],12:["Ability Score Improvement"],14:["Subclass feature"],16:["Ability Score Improvement"],18:["Spell Mastery"],19:["Epic Boon"],20:["Signature Spells"]});

export function wizardProgression(ruleset,level){
  try{
    const numeric=validatedCasterLevel(level);if(!["2014","2024"].includes(ruleset))throw new Error(`Unsupported Wizard ruleset: ${ruleset}`);
    return{level:numeric,cantrips:fullCasterCantrips(numeric),prepared:ruleset==="2024"?PREPARED_2024[numeric]:null,slots:fullCasterSlots(numeric),features:[...((ruleset==="2014"?FEATURES_2014:FEATURES_2024)[numeric]||[])]};
  }catch(error){console.error("[wizard-progression] lookup failed",error);throw error;}
}

export function wizardFeaturesThrough(ruleset,level){
  try{const numeric=validatedCasterLevel(level),features=[];for(let current=1;current<=numeric;current++)features.push(...wizardProgression(ruleset,current).features);return[...new Set(features)];}
  catch(error){console.error("[wizard-progression] feature accumulation failed",error);throw error;}
}

export const WIZARD_PREPARED_2024=PREPARED_2024;
