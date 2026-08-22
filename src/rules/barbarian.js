// Barbarian progression tables are edition-isolated and derived from the matching SRD rules.
// This module is deliberately independent from selectable class data until the complete
// Barbarian generation/reference slice passes its release tests.

const PROGRESSION_2014 = Object.freeze({
  1:{rages:2,rageDamage:2,features:["Rage","Unarmored Defense"]},
  2:{rages:2,rageDamage:2,features:["Reckless Attack","Danger Sense"]},
  3:{rages:3,rageDamage:2,features:["Primal Path"]},
  4:{rages:3,rageDamage:2,features:["Ability Score Improvement"]},
  5:{rages:3,rageDamage:2,features:["Extra Attack","Fast Movement"]},
  6:{rages:4,rageDamage:2,features:["Path Feature"]},
  7:{rages:4,rageDamage:2,features:["Feral Instinct"]},
  8:{rages:4,rageDamage:2,features:["Ability Score Improvement"]},
  9:{rages:4,rageDamage:3,features:["Brutal Critical (1 die)"]},
  10:{rages:4,rageDamage:3,features:["Path Feature"]},
  11:{rages:4,rageDamage:3,features:["Relentless Rage"]},
  12:{rages:5,rageDamage:3,features:["Ability Score Improvement"]},
  13:{rages:5,rageDamage:3,features:["Brutal Critical (2 dice)"]},
  14:{rages:5,rageDamage:3,features:["Path Feature"]},
  15:{rages:5,rageDamage:3,features:["Persistent Rage"]},
  16:{rages:5,rageDamage:4,features:["Ability Score Improvement"]},
  17:{rages:6,rageDamage:4,features:["Brutal Critical (3 dice)"]},
  18:{rages:6,rageDamage:4,features:["Indomitable Might"]},
  19:{rages:6,rageDamage:4,features:["Ability Score Improvement"]},
  20:{rages:"Unlimited",rageDamage:4,features:["Primal Champion"]}
});

const PROGRESSION_2024 = Object.freeze({
  1:{rages:2,rageDamage:2,masteries:2,features:["Rage","Unarmored Defense","Weapon Mastery"]},
  2:{rages:2,rageDamage:2,masteries:2,features:["Danger Sense","Reckless Attack"]},
  3:{rages:3,rageDamage:2,masteries:2,features:["Barbarian Subclass","Primal Knowledge"]},
  4:{rages:3,rageDamage:2,masteries:3,features:["Ability Score Improvement"]},
  5:{rages:3,rageDamage:2,masteries:3,features:["Extra Attack","Fast Movement"]},
  6:{rages:4,rageDamage:2,masteries:3,features:["Subclass feature"]},
  7:{rages:4,rageDamage:2,masteries:3,features:["Feral Instinct","Instinctive Pounce"]},
  8:{rages:4,rageDamage:2,masteries:3,features:["Ability Score Improvement"]},
  9:{rages:4,rageDamage:3,masteries:3,features:["Brutal Strike"]},
  10:{rages:4,rageDamage:3,masteries:4,features:["Subclass feature"]},
  11:{rages:4,rageDamage:3,masteries:4,features:["Relentless Rage"]},
  12:{rages:5,rageDamage:3,masteries:4,features:["Ability Score Improvement"]},
  13:{rages:5,rageDamage:3,masteries:4,features:["Improved Brutal Strike"]},
  14:{rages:5,rageDamage:3,masteries:4,features:["Subclass feature"]},
  15:{rages:5,rageDamage:3,masteries:4,features:["Persistent Rage"]},
  16:{rages:5,rageDamage:4,masteries:4,features:["Ability Score Improvement"]},
  17:{rages:6,rageDamage:4,masteries:4,features:["Improved Brutal Strike"]},
  18:{rages:6,rageDamage:4,masteries:4,features:["Indomitable Might"]},
  19:{rages:6,rageDamage:4,masteries:4,features:["Epic Boon"]},
  20:{rages:6,rageDamage:4,masteries:4,features:["Primal Champion"]}
});

const BERSERKER_2014 = Object.freeze([
  Object.freeze({level:3,name:"Frenzy"}),
  Object.freeze({level:6,name:"Mindless Rage"}),
  Object.freeze({level:10,name:"Intimidating Presence"}),
  Object.freeze({level:14,name:"Retaliation"})
]);

const BERSERKER_2024 = Object.freeze([
  Object.freeze({level:3,name:"Frenzy"}),
  Object.freeze({level:6,name:"Mindless Rage"}),
  Object.freeze({level:10,name:"Retaliation"}),
  Object.freeze({level:14,name:"Intimidating Presence"})
]);

function tableFor(ruleset){
  try{
    if(ruleset==="2014")return PROGRESSION_2014;
    if(ruleset==="2024")return PROGRESSION_2024;
    throw new Error(`Unsupported Barbarian ruleset: ${ruleset}`);
  }catch(error){console.error("[barbarian] failed to resolve progression table",error);throw error;}
}

export function barbarianProgression(ruleset,level){
  try{
    const numeric=Number(level);
    if(!Number.isInteger(numeric)||numeric<1||numeric>20)throw new Error(`Barbarian level must be an integer from 1 to 20: ${level}`);
    const row=tableFor(ruleset)[numeric];
    if(!row)throw new Error(`Missing Barbarian progression for ${ruleset} level ${numeric}`);
    return structuredClone(row);
  }catch(error){console.error("[barbarian] failed to resolve level progression",error);throw error;}
}

export function barbarianFeatures(ruleset,level,subclassId){
  try{
    const numeric=Number(level),table=tableFor(ruleset),features=[];
    for(let current=1;current<=numeric;current++)features.push(...table[current].features);
    const subclassFeatures=ruleset==="2014"?BERSERKER_2014:BERSERKER_2024;
    const expectedSubclass=ruleset==="2014"?"path-berserker":"path-berserker";
    if(subclassId&&subclassId!==expectedSubclass)throw new Error(`Unsupported Barbarian subclass for ${ruleset}: ${subclassId}`);
    if(subclassId)for(const feature of subclassFeatures)if(numeric>=feature.level)features.push(feature.name);
    return [...new Set(features)];
  }catch(error){console.error("[barbarian] failed to resolve features",error);throw error;}
}

export function barbarianResources(ruleset,level){
  try{
    const row=barbarianProgression(ruleset,level),resources=[
      {id:"rage-uses",name:"Rages",value:String(row.rages),detail:ruleset==="2024"?"Regain one expended use on a Short Rest; regain all on a Long Rest.":"Regain expended uses on a Long Rest."},
      {id:"rage-damage",name:"Rage Damage",value:`+${row.rageDamage}`,detail:"Applies only when the edition-specific Rage requirements are met."}
    ];
    if(ruleset==="2024")resources.push({id:"weapon-masteries",name:"Weapon Masteries",value:String(row.masteries),detail:"Number of weapon mastery choices at this Barbarian level."});
    return resources;
  }catch(error){console.error("[barbarian] failed to build resources",error);throw error;}
}

export const BARBARIAN_TABLES=Object.freeze({"2014":PROGRESSION_2014,"2024":PROGRESSION_2024});
