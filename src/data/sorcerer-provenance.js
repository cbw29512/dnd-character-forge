const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({class:"42–44",subclass:"44–45",spells:"109–110"}),
  "2024":Object.freeze({class:"64–67",subclass:"69–70",spells:"67–69"})
});
const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({Spellcasting:"43","Sorcerous Origin":"43","Font of Magic":"43",Metamagic:"44","Ability Score Improvement":"44","Sorcerous Restoration":"44","Dragon Ancestor":"44","Draconic Resilience":"45","Elemental Affinity":"45","Dragon Wings":"45","Draconic Presence":"45"}),
  "2024":Object.freeze({Spellcasting:"64–65","Innate Sorcery":"65–66","Font of Magic":"66",Metamagic:"66–67","Sorcerer Subclass":"66","Ability Score Improvement":"66","Sorcerous Restoration":"66","Sorcery Incarnate":"66","Epic Boon":"66","Arcane Apotheosis":"66","Draconic Resilience":"69","Draconic Spells":"70","Elemental Affinity":"70","Dragon Wings":"70","Dragon Companion":"70"})
});
const METAMAGIC_PAGES=Object.freeze({
  "2014":Object.freeze({"Careful Spell":"44","Distant Spell":"44","Empowered Spell":"44","Extended Spell":"44","Heightened Spell":"44","Quickened Spell":"44","Subtle Spell":"44","Twinned Spell":"44"}),
  "2024":Object.freeze({"Careful Spell":"66–67","Distant Spell":"67","Empowered Spell":"67","Extended Spell":"67","Heightened Spell":"67","Quickened Spell":"67","Seeking Spell":"67","Subtle Spell":"67","Transmuted Spell":"67","Twinned Spell":"67"})
});
const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Dimensional Travel":"88"})});
function sourceAt(ruleset,page){try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing Sorcerer SRD provenance for ${ruleset}.`);return Object.freeze({...source,page:String(page)});}catch(error){console.error("[sorcerer-provenance] source lookup failed",error);throw error;}}
export function sorcererEntityProvenance(ruleset,kind){try{const page=ENTITY_PAGES[ruleset]?.[kind];if(!page)throw new Error(`Missing Sorcerer ${kind} provenance for ${ruleset}.`);return sourceAt(ruleset,page);}catch(error){console.error("[sorcerer-provenance] entity lookup failed",error);throw error;}}
export function sorcererReferenceProvenance(character,kind,name){
  try{
    const ruleset=character?.ruleset;let page=null;if(kind==="feature")page=FEATURE_PAGES[ruleset]?.[name];if(kind==="metamagic")page=METAMAGIC_PAGES[ruleset]?.[name];if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];if(kind==="spells")page=ENTITY_PAGES[ruleset]?.spells;
    if(!page)throw new Error(`Missing Sorcerer reference provenance: ${ruleset} ${kind}:${name}.`);return sourceAt(ruleset,page);
  }catch(error){console.error("[sorcerer-provenance] reference lookup failed",error);throw error;}
}
