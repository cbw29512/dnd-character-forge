import { bardSpellsFor } from "./bard-spells.js";
import { clericSpellsFor } from "./cleric-spells.js";
import { druidSpellsFor } from "./druid-spells.js";
import { paladinSpellsFor } from "./paladin-spells.js";
import { rangerSpellsFor } from "./ranger-spells.js";
import { wizardSpellsFor } from "./wizard-spells.js";

const WARLOCK_ONLY_2014=Object.freeze([
  Object.freeze({id:"eldritch-blast",name:"Eldritch Blast",level:0,school:null,sourceList:"Warlock"}),
  Object.freeze({id:"hellish-rebuke",name:"Hellish Rebuke",level:1,school:null,sourceList:"Warlock"})
]);

function mergeLists(lists){
  try{
    const byId=new Map();
    for(const [sourceList,spells] of lists)for(const spell of spells){const current=byId.get(spell.id),record=Object.freeze({...spell,sourceList:current?.sourceList?`${current.sourceList}/${sourceList}`:sourceList});if(!current)byId.set(spell.id,record);else if(current.level!==spell.level)throw new Error(`Conflicting spell level for ${spell.name}: ${current.level} vs ${spell.level}.`);else byId.set(spell.id,record);}
    return Object.freeze([...byId.values()].sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name)));
  }catch(error){console.error("[bard-secrets] list merge failed",error);throw error;}
}

const ALL_CLASS_2014=mergeLists([
  ["Bard",bardSpellsFor("2014")],["Cleric",clericSpellsFor("2014")],["Druid",druidSpellsFor("2014")],["Paladin",paladinSpellsFor("2014")],["Ranger",rangerSpellsFor("2014")],["Wizard/Sorcerer",wizardSpellsFor("2014")],["Warlock",WARLOCK_ONLY_2014]
]);
const FOUR_LIST_2024=mergeLists([
  ["Bard",bardSpellsFor("2024")],["Cleric",clericSpellsFor("2024")],["Druid",druidSpellsFor("2024")],["Wizard",wizardSpellsFor("2024")]
]);
const LORE_2024=mergeLists([["Cleric",clericSpellsFor("2024")],["Druid",druidSpellsFor("2024")],["Wizard",wizardSpellsFor("2024")]]);

export const BARD_MAGICAL_SECRETS_2014=ALL_CLASS_2014;
export const BARD_MAGICAL_SECRETS_2024=FOUR_LIST_2024;
export const BARD_LORE_DISCOVERIES_2024=LORE_2024;
export const BARD_WARLOCK_ONLY_SECRETS_2014=WARLOCK_ONLY_2014;
export function bardMagicalSecretsPool(ruleset,{loreDiscovery=false}={}){try{if(ruleset==="2014")return ALL_CLASS_2014;if(ruleset==="2024")return loreDiscovery?LORE_2024:FOUR_LIST_2024;throw new Error(`Unsupported Bard Magical Secrets ruleset: ${ruleset}.`);}catch(error){console.error("[bard-secrets] pool lookup failed",error);throw error;}}
