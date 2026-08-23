export function paladinFeatures(ruleset,level,subclassId=null){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid Paladin level: ${level}.`);
    if(ruleset==="2014"){
      const features=["Divine Sense","Lay on Hands"];
      if(value>=2)features.push("Fighting Style","Spellcasting","Divine Smite");
      if(value>=3){features.push("Divine Health","Sacred Oath");if(subclassId==="oath-devotion")features.push("Oath of Devotion Spells","Sacred Weapon","Turn the Unholy");}
      if(value>=4)features.push("Ability Score Improvement");
      if(value>=5)features.push("Extra Attack");
      if(value>=6)features.push("Aura of Protection");
      if(value>=7&&subclassId==="oath-devotion")features.push("Aura of Devotion");
      if(value>=10)features.push("Aura of Courage");
      if(value>=11)features.push("Improved Divine Smite");
      if(value>=14)features.push("Cleansing Touch");
      if(value>=15&&subclassId==="oath-devotion")features.push("Purity of Spirit");
      if(value>=18)features.push("Aura Improvements");
      if(value>=20&&subclassId==="oath-devotion")features.push("Holy Nimbus");
      return features;
    }
    if(ruleset!=="2024")throw new Error(`Unsupported Paladin ruleset: ${ruleset}.`);
    const features=["Lay On Hands","Spellcasting","Weapon Mastery — Paladin"];
    if(value>=2)features.push("Fighting Style","Paladin’s Smite");
    if(value>=3){features.push("Channel Divinity","Divine Sense");if(subclassId==="oath-devotion")features.push("Oath of Devotion Spells","Sacred Weapon");}
    if(value>=4)features.push("Ability Score Improvement");
    if(value>=5)features.push("Extra Attack","Faithful Steed");
    if(value>=6)features.push("Aura of Protection");
    if(value>=7&&subclassId==="oath-devotion")features.push("Aura of Devotion");
    if(value>=9)features.push("Abjure Foes");
    if(value>=10)features.push("Aura of Courage");
    if(value>=11)features.push("Radiant Strikes");
    if(value>=14)features.push("Restoring Touch");
    if(value>=15&&subclassId==="oath-devotion")features.push("Smite of Protection");
    if(value>=18)features.push("Aura Expansion");
    if(value>=19)features.push("Epic Boon");
    if(value>=20&&subclassId==="oath-devotion")features.push("Holy Nimbus");
    return features;
  }catch(error){console.error("[paladin-features] feature resolution failed",error);throw error;}
}
