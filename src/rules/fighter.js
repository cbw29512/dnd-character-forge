export function fighterProgressionFor(ruleset,level,subclassId=null){
  try{
    const numeric=Number(level);
    if(!Number.isInteger(numeric)||numeric<1)throw new Error(`Invalid Fighter level: ${level}.`);
    if(ruleset==="2014")return Object.freeze({
      secondWindUses:1,
      actionSurgeUses:numeric>=2?1:0,
      indomitableUses:0,
      masteryCount:0,
      attacksPerAction:numeric>=5?2:1,
      criticalMinimum:subclassId==="champion"&&numeric>=3?19:20,
      initiativeAdvantage:false
    });
    if(ruleset!=="2024")throw new Error(`Unsupported Fighter ruleset: ${ruleset}.`);
    return Object.freeze({
      secondWindUses:numeric>=10?4:numeric>=4?3:2,
      actionSurgeUses:numeric>=17?2:numeric>=2?1:0,
      indomitableUses:numeric>=17?3:numeric>=13?2:numeric>=9?1:0,
      masteryCount:numeric>=16?6:numeric>=10?5:numeric>=4?4:3,
      attacksPerAction:numeric>=20?4:numeric>=11?3:numeric>=5?2:1,
      criticalMinimum:subclassId==="champion"&&numeric>=15?18:subclassId==="champion"&&numeric>=3?19:20,
      initiativeAdvantage:subclassId==="champion"&&numeric>=3,
      additionalFightingStyle:subclassId==="champion"&&numeric>=7,
      heroicWarrior:subclassId==="champion"&&numeric>=10,
      survivor:subclassId==="champion"&&numeric>=18
    });
  }catch(error){console.error("[fighter] progression resolution failed",error);throw error;}
}
