export function barbarianFeatures(ruleset,level,subclassId=null){
  try{
    const value=Number(level),features=["Rage","Unarmored Defense"];
    if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid Barbarian level: ${level}.`);
    if(ruleset==="2014"){
      if(value>=2)features.push("Reckless Attack","Danger Sense");
      if(value>=3&&subclassId==="berserker")features.push("Frenzy");
      if(value>=4)features.push("Ability Score Improvement");
      if(value>=5)features.push("Extra Attack","Fast Movement");
      if(value>=6&&subclassId==="berserker")features.push("Mindless Rage");
      if(value>=7)features.push("Feral Instinct");
      if(value>=9)features.push("Brutal Critical");
      if(value>=10&&subclassId==="berserker")features.push("Intimidating Presence");
      if(value>=11)features.push("Relentless Rage");
      if(value>=14&&subclassId==="berserker")features.push("Retaliation");
      if(value>=15)features.push("Persistent Rage");
      if(value>=18)features.push("Indomitable Might");
      if(value>=20)features.push("Primal Champion");
      return features;
    }
    if(ruleset!=="2024")throw new Error(`Unsupported Barbarian ruleset: ${ruleset}.`);
    features.push("Weapon Mastery — Barbarian");
    if(value>=2)features.push("Danger Sense","Reckless Attack");
    if(value>=3){features.push("Primal Knowledge");if(subclassId==="berserker")features.push("Frenzy");}
    if(value>=4)features.push("Ability Score Improvement");
    if(value>=5)features.push("Extra Attack","Fast Movement");
    if(value>=6&&subclassId==="berserker")features.push("Mindless Rage");
    if(value>=7)features.push("Feral Instinct","Instinctive Pounce");
    if(value>=9)features.push("Brutal Strike");
    if(value>=10&&subclassId==="berserker")features.push("Retaliation");
    if(value>=11)features.push("Relentless Rage");
    if(value>=13)features.push("Improved Brutal Strike");
    if(value>=14&&subclassId==="berserker")features.push("Intimidating Presence");
    if(value>=15)features.push("Persistent Rage");
    if(value>=18)features.push("Indomitable Might");
    if(value>=19)features.push("Epic Boon");
    if(value>=20)features.push("Primal Champion");
    return features;
  }catch(error){console.error("[barbarian-features] feature resolution failed",error);throw error;}
}
