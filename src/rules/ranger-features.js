import { HUNTER_DEFENSE_2014, HUNTER_DEFENSE_2024, HUNTER_MULTIATTACK_2014, HUNTER_PREY_2014, HUNTER_PREY_2024, HUNTER_SUPERIOR_DEFENSE_2014 } from "./ranger.js";

export function rangerFeatures(ruleset,level,subclassId=null,selections={}){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid Ranger level: ${level}.`);
    if(ruleset==="2014"){
      const features=["Favored Enemy","Natural Explorer"];
      if(value>=2)features.push("Fighting Style","Spellcasting");
      if(value>=3){features.push("Primeval Awareness");if(subclassId==="hunter")features.push("Hunter's Prey",choiceName(HUNTER_PREY_2014,selections.huntersPrey,"Hunter's Prey"));}
      if(value>=4)features.push("Ability Score Improvement");
      if(value>=5)features.push("Extra Attack");
      if(value>=7&&subclassId==="hunter")features.push("Defensive Tactics",choiceName(HUNTER_DEFENSE_2014,selections.defensiveTactics,"Defensive Tactics"));
      if(value>=8)features.push("Land's Stride");
      if(value>=10)features.push("Hide in Plain Sight");
      if(value>=11&&subclassId==="hunter")features.push("Multiattack",choiceName(HUNTER_MULTIATTACK_2014,selections.multiattack,"Multiattack"));
      if(value>=14)features.push("Vanish");
      if(value>=15&&subclassId==="hunter")features.push("Superior Hunter's Defense",choiceName(HUNTER_SUPERIOR_DEFENSE_2014,selections.superiorDefense,"Superior Hunter's Defense"));
      if(value>=18)features.push("Feral Senses");
      if(value>=20)features.push("Foe Slayer");
      return features;
    }
    if(ruleset!=="2024")throw new Error(`Unsupported Ranger ruleset: ${ruleset}.`);
    const features=["Spellcasting","Favored Enemy","Weapon Mastery — Ranger"];
    if(value>=2)features.push("Deft Explorer","Fighting Style");
    if(value>=3&&subclassId==="hunter")features.push("Hunter's Lore","Hunter's Prey",choiceName(HUNTER_PREY_2024,selections.huntersPrey,"Hunter's Prey"));
    if(value>=4)features.push("Ability Score Improvement");
    if(value>=5)features.push("Extra Attack");
    if(value>=6)features.push("Roving");
    if(value>=7&&subclassId==="hunter")features.push("Defensive Tactics",choiceName(HUNTER_DEFENSE_2024,selections.defensiveTactics,"Defensive Tactics"));
    if(value>=9)features.push("Expertise");
    if(value>=10)features.push("Tireless");
    if(value>=11&&subclassId==="hunter")features.push("Superior Hunter's Prey");
    if(value>=13)features.push("Relentless Hunter");
    if(value>=14)features.push("Nature's Veil");
    if(value>=15&&subclassId==="hunter")features.push("Superior Hunter's Defense");
    if(value>=17)features.push("Precise Hunter");
    if(value>=18)features.push("Feral Senses");
    if(value>=19)features.push("Epic Boon");
    if(value>=20)features.push("Foe Slayer");
    return features;
  }catch(error){console.error("[ranger-features] feature resolution failed",error);throw error;}
}

function choiceName(map,id,label){try{const name=map[id];if(!name)throw new Error(`${label} selection is missing or unsupported: ${id}.`);return name;}catch(error){console.error(`[ranger-features] ${label} name failed`,error);throw error;}}
