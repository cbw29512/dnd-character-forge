const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const ENTITY_PAGES=Object.freeze({"2014":Object.freeze({class:"46–48",subclass:"50–51",invocations:"48–50",spells:"110–111"}),"2024":Object.freeze({class:"70–72",subclass:"76",invocations:"72–74",spells:"74–76"})});
const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({"Otherworldly Patron":"46","Pact Magic":"46–47","Eldritch Invocations":"47–50","Pact Boon":"47–48","Ability Score Improvement":"48","Mystic Arcanum":"48","Eldritch Master":"48","Dark One's Blessing":"50","Dark One's Own Luck":"50–51","Fiendish Resilience":"51","Hurl Through Hell":"51"}),
  "2024":Object.freeze({"Eldritch Invocations":"70, 72–74","Pact Magic":"70–72","Magical Cunning":"72","Warlock Subclass":"72","Ability Score Improvement":"72","Contact Patron":"72","Mystic Arcanum":"72","Epic Boon":"72","Eldritch Master":"72","Dark One's Blessing":"76","Fiend Spells":"76","Dark One's Own Luck":"76","Fiendish Resilience":"76","Hurl Through Hell":"76"})
});
const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Fate":"88"})});
function sourceAt(ruleset,page){try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing Warlock SRD provenance for ${ruleset}.`);return Object.freeze({...source,page:String(page)});}catch(error){console.error("[warlock-provenance] source lookup failed",error);throw error;}}
export function warlockEntityProvenance(ruleset,kind){try{const page=ENTITY_PAGES[ruleset]?.[kind];if(!page)throw new Error(`Missing Warlock ${kind} provenance for ${ruleset}.`);return sourceAt(ruleset,page);}catch(error){console.error("[warlock-provenance] entity lookup failed",error);throw error;}}
export function warlockReferenceProvenance(character,kind,name){
  try{const ruleset=character?.ruleset;let page=null;if(kind==="feature"){const key=name.startsWith("Pact Boon:")?"Pact Boon":name;page=FEATURE_PAGES[ruleset]?.[key];}if(kind==="invocation")page=ENTITY_PAGES[ruleset]?.invocations;if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];if(kind==="spells")page=ENTITY_PAGES[ruleset]?.spells;if(!page)throw new Error(`Missing Warlock reference provenance: ${ruleset} ${kind}:${name}.`);return sourceAt(ruleset,page);}catch(error){console.error("[warlock-provenance] reference lookup failed",error);throw error;}
}