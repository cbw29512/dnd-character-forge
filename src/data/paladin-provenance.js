const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({class:"30–32",subclass:"32–33",spells:"108–109"}),
  "2024":Object.freeze({class:"53–55",subclass:"56–57",spells:"55–56"})
});
const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({
    "Divine Sense":"30","Lay on Hands":"31","Fighting Style":"31","Spellcasting":"31","Divine Smite":"31–32","Divine Health":"32","Sacred Oath":"32","Ability Score Improvement":"32","Extra Attack":"32","Aura of Protection":"32","Aura of Courage":"32","Improved Divine Smite":"32","Cleansing Touch":"32","Aura Improvements":"32","Oath of Devotion Spells":"33","Sacred Weapon":"33","Turn the Unholy":"33","Aura of Devotion":"33","Purity of Spirit":"33","Holy Nimbus":"33"
  }),
  "2024":Object.freeze({
    "Lay On Hands":"53–54","Spellcasting":"54","Weapon Mastery — Paladin":"54","Fighting Style":"54","Paladin’s Smite":"54","Channel Divinity":"54–55","Divine Sense":"55","Ability Score Improvement":"55","Extra Attack":"55","Faithful Steed":"55","Aura of Protection":"55","Oath of Devotion Spells":"56","Sacred Weapon":"56","Aura of Devotion":"56–57","Abjure Foes":"55","Aura of Courage":"55","Radiant Strikes":"55","Restoring Touch":"55","Smite of Protection":"57","Aura Expansion":"55","Epic Boon":"55","Holy Nimbus":"57"
  })
});
const STYLE_PAGES=Object.freeze({
  "2014":Object.freeze({Defense:"31",Dueling:"31","Great Weapon Fighting":"31",Protection:"31"}),
  "2024":Object.freeze({Archery:"87–88",Defense:"88","Great Weapon Fighting":"88","Two-Weapon Fighting":"88","Blessed Warrior":"54"})
});
const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Truesight":"88"})});

function sourceAt(ruleset,page){
  try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing Paladin SRD provenance for ${ruleset}.`);return Object.freeze({...source,page:String(page)});}
  catch(error){console.error("[paladin-provenance] source lookup failed",error);throw error;}
}
export function paladinEntityProvenance(ruleset,kind){
  try{const page=ENTITY_PAGES[ruleset]?.[kind];if(!page)throw new Error(`Missing Paladin ${kind} provenance for ${ruleset}.`);return sourceAt(ruleset,page);}
  catch(error){console.error("[paladin-provenance] entity lookup failed",error);throw error;}
}
export function paladinReferenceProvenance(character,kind,name){
  try{
    const ruleset=character?.ruleset;let page=null;
    if(kind==="feature")page=FEATURE_PAGES[ruleset]?.[name];
    if(kind==="style")page=STYLE_PAGES[ruleset]?.[name];
    if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];
    if(kind==="spells")page=ENTITY_PAGES[ruleset]?.spells;
    if(!page)throw new Error(`Missing Paladin reference provenance: ${ruleset} ${kind}:${name}.`);
    return sourceAt(ruleset,page);
  }catch(error){console.error("[paladin-provenance] reference lookup failed",error);throw error;}
}
