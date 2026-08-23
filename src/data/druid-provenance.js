const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({class:"19–21",subclass:"21–22",spells:"107–108"}),
  "2024":Object.freeze({class:"41–44",subclass:"46",spells:"44–45"})
});
const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({Druidic:"19",Spellcasting:"19–20","Wild Shape":"20–21","Wild Shape Improvement":"20","Ability Score Improvement":"21","Bonus Cantrip":"21","Natural Recovery":"21","Circle Spells":"21–22","Land's Stride":"22","Nature's Ward":"22","Nature's Sanctuary":"22","Timeless Body":"21","Beast Spells":"21",Archdruid:"21"}),
  "2024":Object.freeze({Spellcasting:"41–42",Druidic:"42","Primal Order":"42","Primal Order: Magician":"42","Primal Order: Warden":"42","Wild Shape":"42–43","Wild Companion":"43","Ability Score Improvement":"43","Wild Resurgence":"43","Elemental Fury":"43","Elemental Fury: Potent Spellcasting":"43","Elemental Fury: Primal Strike":"43","Improved Elemental Fury":"43","Beast Spells":"43","Epic Boon":"43",Archdruid:"43","Circle Spells":"46","Land's Aid":"46","Circle Land: Arid":"46","Circle Land: Polar":"46","Circle Land: Temperate":"46","Circle Land: Tropical":"46","Natural Recovery":"46","Nature's Ward":"46","Nature's Sanctuary":"46"})
});
const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Dimensional Travel":"88"})});

function sourceAt(ruleset,page){try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing Druid SRD provenance for ${ruleset}.`);return Object.freeze({...source,page:String(page)});}catch(error){console.error("[druid-provenance] source lookup failed",error);throw error;}}
export function druidEntityProvenance(ruleset,kind){try{const page=ENTITY_PAGES[ruleset]?.[kind];if(!page)throw new Error(`Missing Druid ${kind} provenance for ${ruleset}.`);return sourceAt(ruleset,page);}catch(error){console.error("[druid-provenance] entity lookup failed",error);throw error;}}
export function druidReferenceProvenance(character,kind,name){
  try{
    const ruleset=character?.ruleset;let page=null;if(kind==="feature")page=FEATURE_PAGES[ruleset]?.[name];if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];if(kind==="spells")page=ENTITY_PAGES[ruleset]?.spells;if(!page)throw new Error(`Missing Druid reference provenance: ${ruleset} ${kind}:${name}.`);return sourceAt(ruleset,page);
  }catch(error){console.error("[druid-provenance] reference lookup failed",error);throw error;}
}
