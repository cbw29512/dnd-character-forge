export function druidFeatures(ruleset,level,subclassId=null,selections={}){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid Druid level: ${level}.`);
    if(ruleset==="2014"){
      const features=["Druidic","Spellcasting"];
      if(value>=2){features.push("Wild Shape");if(subclassId==="circle-land")features.push("Bonus Cantrip","Natural Recovery","Circle Spells");}
      if(value>=4)features.push("Wild Shape Improvement");if(value>=4)features.push("Ability Score Improvement");
      if(value>=6&&subclassId==="circle-land")features.push("Land's Stride");
      if(value>=8)features.push("Wild Shape Improvement");if(value>=8)features.push("Ability Score Improvement");
      if(value>=10&&subclassId==="circle-land")features.push("Nature's Ward");
      if(value>=12)features.push("Ability Score Improvement");
      if(value>=14&&subclassId==="circle-land")features.push("Nature's Sanctuary");
      if(value>=16)features.push("Ability Score Improvement");
      if(value>=18)features.push("Timeless Body","Beast Spells");
      if(value>=19)features.push("Ability Score Improvement");
      if(value>=20)features.push("Archdruid");
      return features;
    }
    if(ruleset!=="2024")throw new Error(`Unsupported Druid ruleset: ${ruleset}.`);
    const features=["Spellcasting","Druidic","Primal Order",`Primal Order: ${pretty(selections.primalOrder)}`];
    if(value>=2)features.push("Wild Shape","Wild Companion");
    if(value>=3&&subclassId==="circle-land")features.push("Circle Spells","Land's Aid",`Circle Land: ${pretty(selections.circleLand)}`);
    if(value>=4)features.push("Ability Score Improvement");
    if(value>=5)features.push("Wild Resurgence");
    if(value>=6&&subclassId==="circle-land")features.push("Natural Recovery");
    if(value>=7)features.push("Elemental Fury",`Elemental Fury: ${pretty(selections.elementalFury)}`);
    if(value>=8)features.push("Ability Score Improvement");
    if(value>=10&&subclassId==="circle-land")features.push("Nature's Ward");
    if(value>=12)features.push("Ability Score Improvement");
    if(value>=14&&subclassId==="circle-land")features.push("Nature's Sanctuary");
    if(value>=15)features.push("Improved Elemental Fury");
    if(value>=16)features.push("Ability Score Improvement");
    if(value>=18)features.push("Beast Spells");
    if(value>=19)features.push("Epic Boon");
    if(value>=20)features.push("Archdruid");
    return features;
  }catch(error){console.error("[druid-features] feature resolution failed",error);throw error;}
}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());}
