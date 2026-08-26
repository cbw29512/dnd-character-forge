export function warlockFeatures(ruleset,level,subclassId=null,selections={}){
  try{
    const value=Number(level);if(!["2014","2024"].includes(ruleset))throw new Error(`Unsupported Warlock ruleset: ${ruleset}.`);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Warlock level ${level}.`);
    const features=[];
    if(ruleset==="2014"){
      features.push("Otherworldly Patron","Pact Magic");if(value>=2)features.push("Eldritch Invocations");if(value>=3)features.push(`Pact Boon: ${selections.pactBoon?.name||"Pact Boon"}`);if(value>=4)features.push("Ability Score Improvement");if(value>=11)features.push("Mystic Arcanum");if(value>=20)features.push("Eldritch Master");
      if(subclassId==="fiend"){features.push("Dark One's Blessing");if(value>=6)features.push("Dark One's Own Luck");if(value>=10)features.push("Fiendish Resilience");if(value>=14)features.push("Hurl Through Hell");}return features;
    }
    features.push("Eldritch Invocations","Pact Magic");if(value>=2)features.push("Magical Cunning");if(value>=3)features.push("Warlock Subclass");if(value>=4)features.push("Ability Score Improvement");if(value>=9)features.push("Contact Patron");if(value>=11)features.push("Mystic Arcanum");if(value>=19)features.push("Epic Boon");if(value>=20)features.push("Eldritch Master");
    if(subclassId==="fiend-patron"){if(value>=3)features.push("Dark One's Blessing","Fiend Spells");if(value>=6)features.push("Dark One's Own Luck");if(value>=10)features.push("Fiendish Resilience");if(value>=14)features.push("Hurl Through Hell");}return features;
  }catch(error){console.error("[warlock-features] feature resolution failed",error);throw error;}
}