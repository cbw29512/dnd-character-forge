const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({class:"8–9",subclass:"9–10"}),
  "2024":Object.freeze({class:"28–30",subclass:"30"})
});
const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({
    Rage:"8", "Unarmored Defense":"8", "Reckless Attack":"9", "Danger Sense":"9", "Ability Score Improvement":"9", "Extra Attack":"9", "Fast Movement":"9", "Feral Instinct":"9", "Brutal Critical":"9", "Relentless Rage":"9", "Persistent Rage":"9", "Indomitable Might":"9", "Primal Champion":"9", Frenzy:"9", "Mindless Rage":"10", "Intimidating Presence":"10", Retaliation:"10"
  }),
  "2024":Object.freeze({
    Rage:"28–29", "Unarmored Defense":"29", "Weapon Mastery — Barbarian":"29", "Danger Sense":"29", "Reckless Attack":"29", "Primal Knowledge":"29", "Ability Score Improvement":"87", "Extra Attack":"29", "Fast Movement":"29", "Feral Instinct":"29", "Instinctive Pounce":"29", "Brutal Strike":"29–30", "Relentless Rage":"30", "Improved Brutal Strike":"30", "Persistent Rage":"30", "Indomitable Might":"30", "Epic Boon":"30", "Primal Champion":"30", Frenzy:"30", "Mindless Rage":"30", Retaliation:"30", "Intimidating Presence":"30"
  })
});
const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Irresistible Offense":"88"})});
const MASTERY_PAGES=Object.freeze({"2024":Object.freeze({Cleave:"90"})});

function sourceAt(ruleset,page){
  try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing Barbarian SRD provenance for ${ruleset}.`);return Object.freeze({...source,page:String(page)});}
  catch(error){console.error("[barbarian-provenance] source lookup failed",error);throw error;}
}
export function barbarianEntityProvenance(ruleset,kind){
  try{const page=ENTITY_PAGES[ruleset]?.[kind];if(!page)throw new Error(`Missing Barbarian ${kind} provenance for ${ruleset}.`);return sourceAt(ruleset,page);}
  catch(error){console.error("[barbarian-provenance] entity lookup failed",error);throw error;}
}
export function barbarianReferenceProvenance(character,kind,name){
  try{
    const ruleset=character?.ruleset;let page=null;
    if(kind==="feature")page=FEATURE_PAGES[ruleset]?.[name];
    if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];
    if(kind==="mastery")page=MASTERY_PAGES[ruleset]?.[name.includes("—")?name.split("—").pop().trim():name];
    if(!page)throw new Error(`Missing Barbarian reference provenance: ${ruleset} ${kind}:${name}.`);
    return sourceAt(ruleset,page);
  }catch(error){console.error("[barbarian-provenance] reference lookup failed",error);throw error;}
}
