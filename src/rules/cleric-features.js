import { clericFeaturesThrough, clericProgression } from "./cleric-progression.js";

const LIFE_2014=Object.freeze([{level:1,names:["Divine Domain: Life Domain","Bonus Proficiency: Heavy Armor","Disciple of Life"]},{level:2,names:["Channel Divinity: Preserve Life"]},{level:6,names:["Blessed Healer"]},{level:8,names:["Divine Strike"]},{level:17,names:["Supreme Healing"]}]);
const LIFE_2024=Object.freeze([{level:3,names:["Life Domain","Disciple of Life","Preserve Life"]},{level:6,names:["Blessed Healer"]},{level:17,names:["Supreme Healing"]}]);
const BOOKKEEPING=new Set(["Divine Domain","Divine Domain feature","Cleric Subclass","Subclass feature","Channel Divinity"]);

export function clericFeatures(ruleset,level,subclassId=null,divineOrder=null){
  try{
    if(ruleset==="2014"&&subclassId&&subclassId!=="life-domain")throw new Error(`Unsupported 2014 Cleric subclass: ${subclassId}`);
    if(ruleset==="2024"&&subclassId&&subclassId!=="life-domain")throw new Error(`Unsupported 2024 Cleric subclass: ${subclassId}`);
    const row=clericProgression(ruleset,level),features=clericFeaturesThrough(ruleset,level).filter(name=>!BOOKKEEPING.has(name));
    if(ruleset==="2014"&&row.channelDivinity)features.push(`Channel Divinity (${row.channelDivinity}/rest)`,"Turn Undead");
    if(ruleset==="2024"){
      features.push(`Divine Order: ${divineOrder==="thaumaturge"?"Thaumaturge":"Protector"}`);
      if(row.channelDivinity)features.push(`Channel Divinity (${row.channelDivinity} uses)`,"Divine Spark","Turn Undead");
    }
    if(subclassId){for(const entry of ruleset==="2014"?LIFE_2014:LIFE_2024)if(Number(level)>=entry.level)features.push(...entry.names);}
    return[...new Set(features)];
  }catch(error){console.error("[cleric-features] resolution failed",error);throw error;}
}
