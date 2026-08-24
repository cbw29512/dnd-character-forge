export function bardFeatures(ruleset,level,subclassId=null){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid Bard level: ${level}.`);const lore=subclassId==="college-lore";
    if(ruleset==="2014"){
      const features=["Spellcasting","Bardic Inspiration"];
      if(value>=2)features.push("Jack of All Trades","Song of Rest");
      if(value>=3){features.push("Bard College","Expertise");if(lore)features.push("Bonus Proficiencies","Cutting Words");}
      if(value>=4)features.push("Ability Score Improvement");
      if(value>=5)features.push("Font of Inspiration");
      if(value>=6){features.push("Countercharm");if(lore)features.push("Additional Magical Secrets");}
      if(value>=10)features.push("Magical Secrets");
      if(value>=14&&lore)features.push("Peerless Skill");
      if(value>=20)features.push("Superior Inspiration");
      return features;
    }
    if(ruleset!=="2024")throw new Error(`Unsupported Bard ruleset: ${ruleset}.`);
    const features=["Bardic Inspiration","Spellcasting"];
    if(value>=2)features.push("Expertise","Jack of All Trades");
    if(value>=3){features.push("Bard Subclass");if(lore)features.push("Bonus Proficiencies","Cutting Words");}
    if(value>=4)features.push("Ability Score Improvement");
    if(value>=5)features.push("Font of Inspiration");
    if(value>=6&&lore)features.push("Magical Discoveries");
    if(value>=7)features.push("Countercharm");
    if(value>=9&&!features.includes("Expertise"))features.push("Expertise");
    if(value>=10)features.push("Magical Secrets");
    if(value>=14&&lore)features.push("Peerless Skill");
    if(value>=18)features.push("Superior Inspiration");
    if(value>=19)features.push("Epic Boon");
    if(value>=20)features.push("Words of Creation");
    return features;
  }catch(error){console.error("[bard-features] feature resolution failed",error);throw error;}
}
