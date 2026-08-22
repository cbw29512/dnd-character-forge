import { wizardFeaturesThrough } from "./wizard-progression.js";

const EVOKER_2014=Object.freeze([{level:2,names:["Evocation Savant","Sculpt Spells"]},{level:6,names:["Potent Cantrip"]},{level:10,names:["Empowered Evocation"]},{level:14,names:["Overchannel"]}]);
const EVOKER_2024=Object.freeze([{level:3,names:["Evocation Savant","Potent Cantrip"]},{level:6,names:["Sculpt Spells"]},{level:10,names:["Empowered Evocation"]},{level:14,names:["Overchannel"]}]);
const BOOKKEEPING=new Set(["Arcane Tradition","Arcane Tradition feature","Wizard Subclass","Subclass feature"]);

export function wizardFeatures(ruleset,level,subclassId=null){
  try{
    if(ruleset==="2014"&&subclassId&&subclassId!=="school-evocation")throw new Error(`Unsupported 2014 Wizard subclass: ${subclassId}`);
    if(ruleset==="2024"&&subclassId&&subclassId!=="evoker")throw new Error(`Unsupported 2024 Wizard subclass: ${subclassId}`);
    const features=wizardFeaturesThrough(ruleset,level).filter(name=>!BOOKKEEPING.has(name));
    if(subclassId){for(const entry of ruleset==="2014"?EVOKER_2014:EVOKER_2024)if(Number(level)>=entry.level)features.push(...entry.names);}
    return[...new Set(features)];
  }catch(error){console.error("[wizard-features] resolution failed",error);throw error;}
}
