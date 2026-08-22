import { fullCasterCantrips, fullCasterSlots, validatedCasterLevel } from "./full-caster.js";

const PREPARED_2024=Object.freeze({1:4,2:5,3:6,4:7,5:9,6:10,7:11,8:12,9:14,10:15,11:16,12:16,13:17,14:17,15:18,16:18,17:19,18:20,19:21,20:22});
const CHANNEL_2014=Object.freeze({1:0,2:1,3:1,4:1,5:1,6:2,7:2,8:2,9:2,10:2,11:2,12:2,13:2,14:2,15:2,16:2,17:2,18:3,19:3,20:3});
const CHANNEL_2024=Object.freeze({1:0,2:2,3:2,4:2,5:2,6:3,7:3,8:3,9:3,10:3,11:3,12:3,13:3,14:3,15:3,16:3,17:3,18:4,19:4,20:4});
const FEATURES_2014=Object.freeze({1:["Spellcasting","Divine Domain"],2:["Channel Divinity","Divine Domain feature"],4:["Ability Score Improvement"],5:["Destroy Undead (CR 1/2)"],6:["Channel Divinity","Divine Domain feature"],8:["Ability Score Improvement","Destroy Undead (CR 1)","Divine Domain feature"],10:["Divine Intervention"],11:["Destroy Undead (CR 2)"],12:["Ability Score Improvement"],14:["Destroy Undead (CR 3)"],16:["Ability Score Improvement"],17:["Destroy Undead (CR 4)","Divine Domain feature"],18:["Channel Divinity"],19:["Ability Score Improvement"],20:["Divine Intervention improvement"]});
const FEATURES_2024=Object.freeze({1:["Spellcasting","Divine Order"],2:["Channel Divinity"],3:["Cleric Subclass"],4:["Ability Score Improvement"],5:["Sear Undead"],6:["Subclass feature"],7:["Blessed Strikes"],8:["Ability Score Improvement"],10:["Divine Intervention"],12:["Ability Score Improvement"],14:["Improved Blessed Strikes"],16:["Ability Score Improvement"],17:["Subclass feature"],19:["Epic Boon"],20:["Greater Divine Intervention"]});

export function clericProgression(ruleset,level){
  try{
    const numeric=validatedCasterLevel(level);if(!["2014","2024"].includes(ruleset))throw new Error(`Unsupported Cleric ruleset: ${ruleset}`);
    return{level:numeric,cantrips:fullCasterCantrips(numeric),prepared:ruleset==="2024"?PREPARED_2024[numeric]:null,channelDivinity:(ruleset==="2014"?CHANNEL_2014:CHANNEL_2024)[numeric],slots:fullCasterSlots(numeric),features:[...((ruleset==="2014"?FEATURES_2014:FEATURES_2024)[numeric]||[])]};
  }catch(error){console.error("[cleric-progression] lookup failed",error);throw error;}
}

export function clericFeaturesThrough(ruleset,level){
  try{const numeric=validatedCasterLevel(level),features=[];for(let current=1;current<=numeric;current++)features.push(...clericProgression(ruleset,current).features);return[...new Set(features)];}
  catch(error){console.error("[cleric-progression] feature accumulation failed",error);throw error;}
}

export const CLERIC_PREPARED_2024=PREPARED_2024;
