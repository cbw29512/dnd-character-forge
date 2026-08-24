const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const PAGES=Object.freeze({
  "2014":Object.freeze({class:"11–13",subclass:"13",spells:"105–106"}),
  "2024":Object.freeze({class:"31–33",subclass:"35",spells:"33–35"})
});
export function bardEntityProvenance(ruleset,kind){
  try{const source=SOURCES[ruleset],page=PAGES[ruleset]?.[kind];if(!source||!page)throw new Error(`Missing Bard provenance: ${ruleset} ${kind}.`);return Object.freeze({...source,page});}
  catch(error){console.error("[bard-provenance] entity lookup failed",error);throw error;}
}
