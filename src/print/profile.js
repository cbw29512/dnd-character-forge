import { printSourceLabel } from "./source-label.js";

const CASTER_CLASSES=Object.freeze(new Set(["wizard","cleric","druid","sorcerer","warlock","bard"]));
const HALF_CASTER_CLASSES=Object.freeze(new Set(["paladin","ranger"]));

export function exportProfileFor(character,packetMode="table"){
  try{
    const classId=character?.class?.id;if(!classId)throw new Error("Export profile requires a class id.");
    const caster=Boolean(character.spells)||CASTER_CLASSES.has(classId)||HALF_CASTER_CLASSES.has(classId),mode=packetMode==="deluxe"?"deluxe":"table",tablePages=caster?2:1,dossierPages=mode==="deluxe"?1:0,id=mode==="table"?(caster?"caster-two-page":"martial-one-page"):(caster?"caster-deluxe-three-page":"martial-deluxe-two-page");
    return Object.freeze({id,maxPages:tablePages+dossierPages,tablePages,dossierPages,caster,packetMode:mode});
  }catch(error){console.error("[print-profile] profile resolution failed",error);throw error;}
}

export function compactRuleIndex(references,maxEntries){
  try{
    const ordered=[...references].sort((a,b)=>priority(a)-priority(b)||a.name.localeCompare(b.name));
    return ordered.slice(0,maxEntries).map(item=>Object.freeze({id:item.id,name:item.name,source:printSourceLabel(item.source),category:item.category||"Rule"}));
  }catch(error){console.error("[print-profile] rule index failed",error);throw error;}
}

export function compactFeatureCards(references,featName,maxCards=9){
  try{
    return references.filter(item=>item.name!==featName&&!item.id?.startsWith("mastery:")).sort((a,b)=>priority(a)-priority(b)||originalContentPriority(a)-originalContentPriority(b)).slice(0,maxCards).map(item=>Object.freeze({name:item.name,text:shorten(item.text,170),timing:item.timing,source:printSourceLabel(item.source)}));
  }catch(error){console.error("[print-profile] feature cards failed",error);throw error;}
}

function priority(item){if(item.id?.startsWith("feature:"))return 0;if(item.id?.startsWith("mastery:"))return 1;if(item.id?.startsWith("species:"))return 2;if(item.id?.startsWith("feat:"))return 3;if(item.id?.startsWith("style:"))return 4;return 5;}
function originalContentPriority(item){return item?.source?.version==="Character Forge Original"?-1:0;}
function shorten(value,max){const text=String(value||"").replace(/\s+/g," ").trim();return text.length<=max?text:`${text.slice(0,max-1).trimEnd()}…`;}
