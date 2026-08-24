const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({class:"11–13",subclass:"13–14",spells:"105–106"}),
  "2024":Object.freeze({class:"31–33",subclass:"35",spells:"33–35"})
});
const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({Spellcasting:"11–12","Bardic Inspiration":"12","Jack of All Trades":"12","Song of Rest":"12","Bard College":"12",Expertise:"13","Ability Score Improvement":"13","Font of Inspiration":"13",Countercharm:"13","Magical Secrets":"13","Superior Inspiration":"13","Bonus Proficiencies":"13","Cutting Words":"13","Additional Magical Secrets":"13","Peerless Skill":"14"}),
  "2024":Object.freeze({"Bardic Inspiration":"31–32",Spellcasting:"32",Expertise:"32","Jack of All Trades":"32","Bard Subclass":"32","Ability Score Improvement":"32","Font of Inspiration":"32",Countercharm:"33","Magical Secrets":"33","Superior Inspiration":"33","Epic Boon":"33","Words of Creation":"33","Bonus Proficiencies":"35","Cutting Words":"35","Magical Discoveries":"35","Peerless Skill":"35"})
});
const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Spell Recall":"88"})});
function sourceAt(ruleset,page){try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing Bard SRD provenance for ${ruleset}.`);return Object.freeze({...source,page:String(page)});}catch(error){console.error("[bard-provenance] source lookup failed",error);throw error;}}
export function bardEntityProvenance(ruleset,kind){try{const page=ENTITY_PAGES[ruleset]?.[kind];if(!page)throw new Error(`Missing Bard ${kind} provenance for ${ruleset}.`);return sourceAt(ruleset,page);}catch(error){console.error("[bard-provenance] entity lookup failed",error);throw error;}}
export function bardReferenceProvenance(character,kind,name){try{const ruleset=character?.ruleset;let page=null;if(kind==="feature")page=FEATURE_PAGES[ruleset]?.[name];if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];if(kind==="spells")page=ENTITY_PAGES[ruleset]?.spells;if(!page)throw new Error(`Missing Bard reference provenance: ${ruleset} ${kind}:${name}.`);return sourceAt(ruleset,page);}catch(error){console.error("[bard-provenance] reference lookup failed",error);throw error;}}
