import { CHAIN_FAMILIARS_2014, CHAIN_FAMILIARS_2024, PACT_BOONS_2014 } from "../data/warlock-class.js";
import { warlockInvocationById, warlockInvocationsFor } from "../data/warlock-invocations.js";
import { pick } from "./random.js";
import { warlockProgressionFor } from "./warlock.js";

export function resolveWarlockSelections({ruleset,level,subclassId=null,selections={}}){
  try{
    const progression=warlockProgressionFor(ruleset,level,subclassId),fixed=[...(selections.eldritchInvocations||[])];
    if(new Set(fixed).size!==fixed.length)throw new Error("Duplicate Eldritch Invocation choice.");
    if(fixed.length>progression.invocations)throw new Error(`Choose at most ${progression.invocations} Eldritch Invocations at Warlock level ${level}.`);
    const pactBoon=ruleset==="2014"?resolveLegacyPactBoon(level,selections.pactBoon,fixed):null,required=ruleset==="2024"?dependencyClosure(ruleset,fixed):fixed;
    if(required.length>progression.invocations)throw new Error("Fixed Eldritch Invocation choices and their prerequisites exceed the available invocation count.");
    validateFixed(ruleset,level,required,pactBoon);
    const all=[...required],catalog=warlockInvocationsFor(ruleset);
    while(all.length<progression.invocations){
      const legal=catalog.filter(option=>!all.includes(option.id)&&option.minLevel<=Number(level)&&legacyPactLegal(ruleset,option,pactBoon)&&revisedDependencyLegal(ruleset,option,all));
      if(!legal.length)throw new Error(`No verified legal Eldritch Invocation can fill choice ${all.length+1} of ${progression.invocations}.`);
      all.push(pick(legal).id);
    }
    const chain=ruleset==="2014"?pactBoon?.id==="chain":all.includes("pact-of-the-chain"),familiarForm=chain?pick(ruleset==="2014"?CHAIN_FAMILIARS_2014:CHAIN_FAMILIARS_2024):null;
    const bonusSkills=ruleset==="2014"&&all.includes("beguiling-influence")?Object.freeze(["deception","persuasion"]):Object.freeze([]);
    return Object.freeze({pactBoon,familiarForm,bonusSkills,invocations:Object.freeze({selected:Object.freeze([...fixed]),randomized:Object.freeze(all.filter(id=>!fixed.includes(id))),all:Object.freeze(all)})});
  }catch(error){console.error("[warlock-selections] resolution failed",error);throw error;}
}
function resolveLegacyPactBoon(level,requested,fixed){try{if(Number(level)<3){if(requested)throw new Error("2014 Pact Boon is unavailable before Warlock level 3.");return null;}const requiredPacts=[...new Set(fixed.map(id=>warlockInvocationById("2014",id).pact).filter(Boolean))];if(requiredPacts.length>1)throw new Error(`Fixed invocations require incompatible Pact Boons: ${requiredPacts.join(", ")}.`);if(requested){const boon=PACT_BOONS_2014.find(item=>item.id===requested);if(!boon)throw new Error(`Unknown 2014 Pact Boon: ${requested}.`);if(requiredPacts.length&&requiredPacts[0]!==boon.id)throw new Error(`Fixed invocation requires Pact of the ${pretty(requiredPacts[0])}.`);return boon;}const pool=requiredPacts.length?PACT_BOONS_2014.filter(item=>item.id===requiredPacts[0]):PACT_BOONS_2014;return pick(pool);}catch(error){console.error("[warlock-selections] legacy Pact Boon failed",error);throw error;}}
function dependencyClosure(ruleset,ids){try{const out=[];const add=id=>{const option=warlockInvocationById(ruleset,id);if(option.requiresInvocation)add(option.requiresInvocation);if(!out.includes(id))out.push(id);};for(const id of ids)add(id);return out;}catch(error){console.error("[warlock-selections] invocation dependency closure failed",error);throw error;}}
function validateFixed(ruleset,level,ids,pactBoon){try{for(const id of ids){const option=warlockInvocationById(ruleset,id);if(option.minLevel>Number(level))throw new Error(`${option.name} requires Warlock level ${option.minLevel}.`);if(!legacyPactLegal(ruleset,option,pactBoon))throw new Error(`${option.name} requires ${pactBoon?`a different Pact Boon`:`a Pact Boon not yet available`}.`);}}catch(error){console.error("[warlock-selections] fixed invocation validation failed",error);throw error;}}
function legacyPactLegal(ruleset,option,pactBoon){return ruleset!=="2014"||!option.pact||option.pact===pactBoon?.id;}
function revisedDependencyLegal(ruleset,option,ids){return ruleset!=="2024"||!option.requiresInvocation||ids.includes(option.requiresInvocation);}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());}
