import { sample } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";

export function resolveBardInstruments(cls,selections={}){
  try{
    const count=Number(cls.instrumentCount||0),allowed=[...(cls.instrumentChoices||[])],selected=[...(selections.instruments||[])];validateDistinct(selected,"Bard instruments");if(selected.length>count)throw new Error(`Choose at most ${count} Bard instrument proficiencies.`);const bad=selected.filter(item=>!allowed.includes(item));if(bad.length)throw new Error(`Illegal Bard instrument proficiency: ${bad.join(", ")}.`);return uniqueStrings([...selected,...sample(allowed,count-selected.length,selected)]);
  }catch(error){console.error("[bard-selections] instrument resolution failed",error);throw error;}
}

export function resolveLoreBonusSkills(cls,currentSkills,count,selections={}){
  try{
    const required=Number(count||0),selected=[...(selections.loreBonusSkills||[])];if(!required){if(selected.length)throw new Error("College of Lore bonus skills are unavailable at this level.");return[];}validateDistinct(selected,"College of Lore bonus skills");if(selected.length>required)throw new Error(`Choose at most ${required} College of Lore bonus skills.`);const legal=[...(cls.skillChoices||[])].filter(skill=>!currentSkills.includes(skill)),bad=selected.filter(skill=>!legal.includes(skill));if(bad.length)throw new Error(`Illegal College of Lore bonus skill: ${bad.join(", ")}.`);return uniqueStrings([...selected,...sample(legal,required-selected.length,selected)]);
  }catch(error){console.error("[bard-selections] Lore skill resolution failed",error);throw error;}
}

export function resolveBardExpertise({ruleset,level,preLoreSkills,allSkills,count,selections={}}){
  try{
    const required=Number(count||0),selected=[...(selections.expertise||[])];validateDistinct(selected,"Bard Expertise");if(selected.length>required)throw new Error(`Choose at most ${required} Bard Expertise skills.`);const allSet=new Set(allSkills),bad=selected.filter(skill=>!allSet.has(skill));if(bad.length)throw new Error(`Bard Expertise requires a Bard skill proficiency: ${bad.join(", ")}.`);if(!required)return[];
    if(ruleset!=="2024")return uniqueStrings([...selected,...sample(allSkills,required-selected.length,selected)]);
    const earlyTarget=Math.min(2,required),preSet=new Set(preLoreSkills),lateOnly=selected.filter(skill=>!preSet.has(skill)),lateCapacity=Number(level)>=9?Math.max(0,required-earlyTarget):0;if(lateOnly.length>lateCapacity)throw new Error(`This level-${level} Bard has ${lateOnly.length} Expertise choice(s) that were unavailable when the early Expertise selections were made.`);
    const result=[...selected],earlySelected=result.filter(skill=>preSet.has(skill)).length,earlyNeeded=Math.max(0,earlyTarget-earlySelected);if(earlyNeeded)result.push(...sample(preLoreSkills,earlyNeeded,result));const remaining=required-result.length;if(remaining)result.push(...sample(allSkills,remaining,result));return uniqueStrings(result);
  }catch(error){console.error("[bard-selections] Expertise resolution failed",error);throw error;}
}

function validateDistinct(values,label){const duplicates=duplicateValues(values);if(duplicates.length)throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}.`);}
