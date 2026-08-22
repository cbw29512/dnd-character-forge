// Edition-isolated Rogue progression. This remains independent from selectable class data
// until the complete Rogue generator, Thief rules, advancement, references, and sheet pass.

const SNEAK=[1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10];
const P2014=Object.freeze({
  1:["Expertise","Sneak Attack","Thieves' Cant"],2:["Cunning Action"],3:["Roguish Archetype"],4:["Ability Score Improvement"],5:["Uncanny Dodge"],6:["Expertise"],7:["Evasion"],8:["Ability Score Improvement"],9:["Archetype Feature"],10:["Ability Score Improvement"],11:["Reliable Talent"],12:["Ability Score Improvement"],13:["Archetype Feature"],14:["Blindsense"],15:["Slippery Mind"],16:["Ability Score Improvement"],17:["Archetype Feature"],18:["Elusive"],19:["Ability Score Improvement"],20:["Stroke of Luck"]
});
const P2024=Object.freeze({
  1:["Expertise","Sneak Attack","Thieves' Cant","Weapon Mastery"],2:["Cunning Action"],3:["Rogue Subclass","Steady Aim"],4:["Ability Score Improvement"],5:["Cunning Strike","Uncanny Dodge"],6:["Expertise"],7:["Evasion","Reliable Talent"],8:["Ability Score Improvement"],9:["Subclass feature"],10:["Ability Score Improvement"],11:["Improved Cunning Strike"],12:["Ability Score Improvement"],13:["Subclass feature"],14:["Devious Strikes"],15:["Slippery Mind"],16:["Ability Score Improvement"],17:["Subclass feature"],18:["Elusive"],19:["Epic Boon"],20:["Stroke of Luck"]
});
const THIEF_2014=Object.freeze([{level:3,name:"Fast Hands"},{level:3,name:"Second-Story Work"},{level:9,name:"Supreme Sneak"},{level:13,name:"Use Magic Device"},{level:17,name:"Thief's Reflexes"}]);
const THIEF_2024=Object.freeze([{level:3,name:"Fast Hands"},{level:3,name:"Second-Story Work"},{level:9,name:"Supreme Sneak"},{level:13,name:"Use Magic Device"},{level:17,name:"Thief's Reflexes"}]);

function tableFor(ruleset){if(ruleset==="2014")return P2014;if(ruleset==="2024")return P2024;throw new Error(`Unsupported Rogue ruleset: ${ruleset}`);}
export function rogueProgression(ruleset,level){
  try{const numeric=Number(level);if(!Number.isInteger(numeric)||numeric<1||numeric>20)throw new Error(`Rogue level must be an integer from 1 to 20: ${level}`);return{level:numeric,sneakAttack:`${SNEAK[numeric-1]}d6`,features:[...tableFor(ruleset)[numeric]]};}
  catch(error){console.error("[rogue] progression lookup failed",error);throw error;}
}
export function rogueFeatures(ruleset,level,subclassId=null){
  try{const numeric=Number(level),table=tableFor(ruleset),features=[];for(let current=1;current<=numeric;current++)features.push(...table[current]);if(subclassId&&subclassId!=="thief")throw new Error(`Unsupported Rogue subclass for ${ruleset}: ${subclassId}`);if(subclassId){const subclass=ruleset==="2014"?THIEF_2014:THIEF_2024;for(const feature of subclass)if(numeric>=feature.level)features.push(feature.name);}const bookkeeping=new Set(["Archetype Feature","Subclass feature","Ability Score Improvement","Epic Boon"]);return[...new Set(features)].filter(name=>!bookkeeping.has(name));}
  catch(error){console.error("[rogue] feature resolution failed",error);throw error;}
}
export function rogueResources(ruleset,level){
  try{const row=rogueProgression(ruleset,level),resources=[{id:"sneak-attack",name:"Sneak Attack",value:row.sneakAttack,detail:"Once per turn when the edition-specific Sneak Attack requirements are met."}];if(ruleset==="2024"&&Number(level)>=5)resources.push({id:"cunning-strike",name:"Cunning Strike",value:`${row.sneakAttack} pool`,detail:"Spend Sneak Attack dice to apply legal Cunning Strike effects."});return resources;}
  catch(error){console.error("[rogue] resource build failed",error);throw error;}
}
export function rogueExpertiseCount(level){try{const numeric=Number(level);if(numeric<1||numeric>20)throw new Error(`Rogue expertise level is invalid: ${level}`);return numeric>=6?4:2;}catch(error){console.error("[rogue] expertise count failed",error);throw error;}}
export function rogueExtraSaveProficiencies(ruleset,level){try{if(Number(level)<15)return[];if(ruleset==="2014")return["wis"];if(ruleset==="2024")return["wis","cha"];throw new Error(`Unsupported Rogue ruleset: ${ruleset}`);}catch(error){console.error("[rogue] extra save lookup failed",error);throw error;}}
export const ROGUE_TABLES=Object.freeze({"2014":P2014,"2024":P2024});
