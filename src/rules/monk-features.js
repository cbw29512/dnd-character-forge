import { monkProgressionFor } from "./monk.js";

export function monkFeatures(ruleset,level,subclassId=null){
  try{
    const p=monkProgressionFor(ruleset,level,subclassId),features=["Unarmored Defense","Martial Arts"];
    if(level>=2){features.push(ruleset==="2014"?"Ki":"Monk's Focus","Unarmored Movement");if(p.uncannyMetabolism)features.push("Uncanny Metabolism");}
    if(level>=3){features.push(ruleset==="2014"?"Monastic Tradition":"Monk Subclass",p.deflectAttacks?"Deflect Attacks":"Deflect Missiles");if(p.openHandTechnique)features.push("Open Hand Technique");}
    if(level>=4)features.push("Ability Score Improvement","Slow Fall");
    if(level>=5)features.push("Extra Attack","Stunning Strike");
    if(level>=6){features.push(ruleset==="2014"?"Ki-Empowered Strikes":"Empowered Strikes");if(p.wholenessOfBody)features.push("Wholeness of Body");}
    if(level>=7){features.push("Evasion");if(p.stillnessOfMind)features.push("Stillness of Mind");}
    if(level>=9)features.push("Unarmored Movement Improvement");
    if(p.heightenedFocus)features.push("Heightened Focus");
    if(p.selfRestoration)features.push("Self-Restoration");
    if(p.purityOfBody)features.push("Purity of Body");
    if(p.tranquility)features.push("Tranquility");
    if(p.fleetStep)features.push("Fleet Step");
    if(p.deflectEnergy)features.push("Deflect Energy");
    if(p.tongueOfSunAndMoon)features.push("Tongue of the Sun and Moon");
    if(p.allSaveProficiency)features.push(ruleset==="2014"?"Diamond Soul":"Disciplined Survivor");
    if(p.timelessBody)features.push("Timeless Body");
    if(p.perfectFocus)features.push("Perfect Focus");
    if(p.quiveringPalm)features.push("Quivering Palm");
    if(p.emptyBody)features.push("Empty Body");
    if(p.superiorDefense)features.push("Superior Defense");
    if(p.epicBoon)features.push("Epic Boon");
    if(ruleset==="2014"&&level>=20)features.push("Perfect Self");
    if(p.bodyAndMind)features.push("Body and Mind");
    return features;
  }catch(error){console.error("[monk-features] feature resolution failed",error);throw error;}
}
