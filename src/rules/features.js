export function fighterFeatures(ruleset,level,subclass){
  try{
    const features=[];
    if(ruleset==="2014"){
      features.push("Fighting Style","Second Wind");
      if(level>=2)features.push("Action Surge");
      if(level>=3&&subclass==="champion")features.push(level>=15?"Superior Critical":"Improved Critical");
      if(level>=4)features.push("Ability Score Improvement");
      if(level>=5)features.push("Extra Attack");
      if(level>=7&&subclass==="champion")features.push("Remarkable Athlete");
      if(level>=9)features.push("Indomitable");
      if(level>=10&&subclass==="champion")features.push("Additional Fighting Style");
      if(level>=18&&subclass==="champion")features.push("Survivor");
      return features;
    }
    features.push("Fighting Style","Second Wind","Weapon Mastery");
    if(level>=2)features.push("Action Surge","Tactical Mind");
    if(level>=3&&subclass==="champion")features.push(level>=15?"Superior Critical":"Improved Critical","Remarkable Athlete");
    if(level>=4)features.push("Ability Score Improvement");
    if(level>=5)features.push(level>=20?"Three Extra Attacks":level>=11?"Two Extra Attacks":"Extra Attack","Tactical Shift");
    if(level>=7&&subclass==="champion")features.push("Additional Fighting Style");
    if(level>=9)features.push("Indomitable","Tactical Master");
    if(level>=10&&subclass==="champion")features.push("Heroic Warrior");
    if(level>=13)features.push("Studied Attacks");
    if(level>=18&&subclass==="champion")features.push("Survivor");
    if(level>=19)features.push("Epic Boon");
    return features;
  }catch(error){console.error("[features] fighter feature resolution failed",error);throw error;}
}
export function wizardFeatures(ruleset,level,subclass){
  try{
    const features=["Spellcasting","Arcane Recovery"];
    if(ruleset==="2014"){if(level>=2&&subclass==="school-evocation")features.push("Evocation Savant","Sculpt Spells");if(level>=4)features.push("Ability Score Improvement");return features;}
    features.push("Ritual Adept");
    if(level>=2)features.push("Scholar");
    if(level>=3&&subclass==="evoker")features.push("Evocation Savant","Potent Cantrip");
    if(level>=4)features.push("Ability Score Improvement");
    if(level>=5)features.push("Memorize Spell");
    if(level>=6&&subclass==="evoker")features.push("Sculpt Spells");
    if(level>=10&&subclass==="evoker")features.push("Empowered Evocation");
    if(level>=14&&subclass==="evoker")features.push("Overchannel");
    if(level>=18)features.push("Spell Mastery");
    if(level>=19)features.push("Epic Boon");
    if(level>=20)features.push("Signature Spells");
    return features;
  }catch(error){console.error("[features] wizard feature resolution failed",error);throw error;}
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
export function applyClassAsi(scores,level,priority,asiLevels=[4]){
  try{
    const next={...scores},order=[...new Set(priority)].filter(ability=>Object.hasOwn(next,ability)),count=asiLevels.filter(requiredLevel=>level>=requiredLevel).length;
    for(let i=0;i<count;i++)applyLegalAsi(next,order);
    return next;
  }catch(error){console.error("[features] class ASI progression failed",error);throw error;}
}
function applyLegalAsi(scores,priority){
  try{
    const eligible=priority.filter(ability=>scores[ability]<20),first=eligible[0];
    if(!first)return;
    if(scores[first]<=18){scores[first]+=2;return;}
    scores[first]+=1;
    const second=eligible.find(ability=>ability!==first&&scores[ability]<20);
    if(second)scores[second]+=1;
  }catch(error){console.error("[features] legal ASI allocation failed",error);throw error;}
}
export function applyEpicBoonAbility(scores,maximums,priority,feat){
  try{
    const nextScores={...scores},nextMaximums={...maximums};
    if(!feat?.abilityAdd||!feat?.abilityMaximum)return{scores:nextScores,maximums:nextMaximums,ability:null};
    const legalPriority=feat.abilityChoices?.length?priority.filter(ability=>feat.abilityChoices.includes(ability)):priority;
    const target=legalPriority.find(ability=>nextScores[ability]<feat.abilityMaximum)||legalPriority[0];
    if(!target)throw new Error(`${feat.name||"Epic Boon"} has no legal ability target.`);
    nextMaximums[target]=feat.abilityMaximum;
    nextScores[target]=Math.min(feat.abilityMaximum,nextScores[target]+feat.abilityAdd);
    return{scores:nextScores,maximums:nextMaximums,ability:target};
  }catch(error){console.error("[features] Epic Boon ability progression failed",error);throw error;}
}
export const applyFighterAsi=(scores,level)=>applyClassAsi(scores,level,[scores.str>=scores.dex?"str":"dex","con","dex","str","wis","cha","int"],[4,6,8,12,14,16]);
