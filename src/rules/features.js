export function fighterFeatures(ruleset,level,subclass){
  try{const features=[];if(ruleset==="2014"){features.push("Fighting Style","Second Wind");if(level>=2)features.push("Action Surge");if(level>=3&&subclass==="champion")features.push("Improved Critical");if(level>=4)features.push("Ability Score Improvement");if(level>=5)features.push("Extra Attack");return features;}features.push("Fighting Style","Second Wind","Weapon Mastery");if(level>=2)features.push("Action Surge","Tactical Mind");if(level>=3&&subclass==="champion")features.push("Improved Critical","Remarkable Athlete");if(level>=4)features.push("Ability Score Improvement");if(level>=5)features.push("Extra Attack","Tactical Shift");return features;}
  catch(error){console.error("[features] fighter feature resolution failed",error);throw error;}
}
export function wizardFeatures(ruleset,level,subclass){
  try{const features=["Spellcasting","Arcane Recovery"];if(ruleset==="2014"){if(level>=2&&subclass==="school-evocation")features.push("Evocation Savant","Sculpt Spells");if(level>=4)features.push("Ability Score Improvement");return features;}features.push("Ritual Adept");if(level>=2)features.push("Scholar");if(level>=3&&subclass==="evoker")features.push("Evocation Savant","Potent Cantrip");if(level>=4)features.push("Ability Score Improvement");if(level>=5)features.push("Memorize Spell");return features;}
  catch(error){console.error("[features] wizard feature resolution failed",error);throw error;}
}
export function clericFeatures(ruleset,level,subclass,divineOrder){
  try{
    const features=["Spellcasting"];
    if(ruleset==="2014"){
      if(subclass==="life-domain")features.push("Divine Domain: Life Domain","Bonus Proficiency: Heavy Armor","Disciple of Life");
      if(level>=2)features.push("Channel Divinity (1/rest)","Turn Undead","Channel Divinity: Preserve Life");
      if(level>=4)features.push("Ability Score Improvement");if(level>=5)features.push("Destroy Undead (CR 1/2)");return features;
    }
    features.push(`Divine Order: ${divineOrder==="thaumaturge"?"Thaumaturge":"Protector"}`);
    if(level>=2)features.push("Channel Divinity (2 uses)","Divine Spark","Turn Undead");
    if(level>=3&&subclass==="life-domain")features.push("Life Domain","Disciple of Life","Preserve Life");
    if(level>=4)features.push("Ability Score Improvement");if(level>=5)features.push("Sear Undead");return features;
  }catch(error){console.error("[features] cleric feature resolution failed",error);throw error;}
}
export function applyClassAsi(scores,level,primary){
  try{if(level<4)return scores;const next={...scores},target=primary.find(ability=>next[ability]<20)||primary[0];next[target]=Math.min(20,next[target]+2);return next;}
  catch(error){console.error("[features] class ASI failed",error);throw error;}
}
export const applyFighterAsi=(scores,level)=>applyClassAsi(scores,level,[scores.str>=scores.dex?"str":"dex"]);
