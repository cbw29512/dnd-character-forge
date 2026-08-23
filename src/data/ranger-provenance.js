const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});
const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({class:"35–37",subclass:"37–38",spells:"109"}),
  "2024":Object.freeze({class:"57–60",subclass:"61",spells:"60"})
});
const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({
    "Favored Enemy":"35","Natural Explorer":"35–36","Fighting Style":"36","Spellcasting":"36","Primeval Awareness":"37","Ability Score Improvement":"37","Extra Attack":"37","Land's Stride":"37","Hide in Plain Sight":"37","Vanish":"37","Feral Senses":"37","Foe Slayer":"37","Hunter's Prey":"37–38","Colossus Slayer":"38","Giant Killer":"38","Horde Breaker":"38","Defensive Tactics":"38","Escape the Horde":"38","Multiattack Defense":"38","Steel Will":"38","Multiattack":"38","Volley":"38","Whirlwind Attack":"38","Superior Hunter's Defense":"38","Evasion":"38","Stand Against the Tide":"38","Uncanny Dodge":"38"
  }),
  "2024":Object.freeze({
    "Spellcasting":"57–58","Favored Enemy":"58","Weapon Mastery — Ranger":"58","Deft Explorer":"58","Fighting Style":"58–59","Ability Score Improvement":"59","Extra Attack":"59","Roving":"59","Expertise":"59","Tireless":"59","Relentless Hunter":"59","Nature's Veil":"59","Precise Hunter":"59","Feral Senses":"59–60","Epic Boon":"60","Foe Slayer":"60","Hunter's Lore":"61","Hunter's Prey":"61","Colossus Slayer":"61","Horde Breaker":"61","Defensive Tactics":"61","Escape the Horde":"61","Multiattack Defense":"61","Superior Hunter's Prey":"61","Superior Hunter's Defense":"61"
  })
});
const STYLE_PAGES=Object.freeze({
  "2014":Object.freeze({Archery:"36",Defense:"36",Dueling:"36","Two-Weapon Fighting":"36"}),
  "2024":Object.freeze({Archery:"87–88",Defense:"88","Great Weapon Fighting":"88","Two-Weapon Fighting":"88","Druidic Warrior":"59"})
});
const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Dimensional Travel":"88"})});

function sourceAt(ruleset,page){
  try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing Ranger SRD provenance for ${ruleset}.`);return Object.freeze({...source,page:String(page)});}
  catch(error){console.error("[ranger-provenance] source lookup failed",error);throw error;}
}
export function rangerEntityProvenance(ruleset,kind){
  try{const page=ENTITY_PAGES[ruleset]?.[kind];if(!page)throw new Error(`Missing Ranger ${kind} provenance for ${ruleset}.`);return sourceAt(ruleset,page);}
  catch(error){console.error("[ranger-provenance] entity lookup failed",error);throw error;}
}
export function rangerReferenceProvenance(character,kind,name){
  try{
    const ruleset=character?.ruleset;let page=null;
    if(kind==="feature")page=FEATURE_PAGES[ruleset]?.[name];
    if(kind==="style")page=STYLE_PAGES[ruleset]?.[name];
    if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];
    if(kind==="spells")page=ENTITY_PAGES[ruleset]?.spells;
    if(!page)throw new Error(`Missing Ranger reference provenance: ${ruleset} ${kind}:${name}.`);
    return sourceAt(ruleset,page);
  }catch(error){console.error("[ranger-provenance] reference lookup failed",error);throw error;}
}
