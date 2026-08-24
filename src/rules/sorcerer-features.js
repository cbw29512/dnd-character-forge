export function sorcererFeatures(ruleset,level,subclassId=null) {
  try {
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid Sorcerer level: ${level}.`);
    if(ruleset==="2014") {
      const draconic=subclassId==="draconic-bloodline",features=["Spellcasting","Sorcerous Origin"];
      if(draconic)features.push("Dragon Ancestor","Draconic Resilience");
      if(value>=2)features.push("Font of Magic");
      if(value>=3)features.push("Metamagic");
      if(value>=4)features.push("Ability Score Improvement");
      if(draconic&&value>=6)features.push("Elemental Affinity");
      if(draconic&&value>=14)features.push("Dragon Wings");
      if(draconic&&value>=18)features.push("Draconic Presence");
      if(value>=20)features.push("Sorcerous Restoration");
      return features;
    }
    if(ruleset!=="2024")throw new Error(`Unsupported Sorcerer ruleset: ${ruleset}.`);
    const draconic=subclassId==="draconic-sorcery",features=["Spellcasting","Innate Sorcery"];
    if(value>=2)features.push("Font of Magic","Metamagic");
    if(value>=3){features.push("Sorcerer Subclass");if(draconic)features.push("Draconic Resilience","Draconic Spells");}
    if(value>=4)features.push("Ability Score Improvement");
    if(value>=5)features.push("Sorcerous Restoration");
    if(draconic&&value>=6)features.push("Elemental Affinity");
    if(value>=7)features.push("Sorcery Incarnate");
    if(draconic&&value>=14)features.push("Dragon Wings");
    if(draconic&&value>=18)features.push("Dragon Companion");
    if(value>=19)features.push("Epic Boon");
    if(value>=20)features.push("Arcane Apotheosis");
    return features;
  } catch (error) {
    console.error("[sorcerer-features] feature resolution failed",error);
    throw error;
  }
}
