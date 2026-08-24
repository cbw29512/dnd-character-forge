const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});

const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({class:"26–28",subclass:"28–29"}),
  "2024":Object.freeze({class:"49–52",subclass:"52"})
});

const FEATURE_PAGES=Object.freeze({
  "2014":Object.freeze({
    "Unarmored Defense":"26","Martial Arts":"26",Ki:"27","Unarmored Movement":"27","Unarmored Movement Improvement":"27","Monastic Tradition":"27","Deflect Missiles":"27","Ability Score Improvement":"27","Slow Fall":"27","Extra Attack":"27",
    "Stunning Strike":"28","Ki-Empowered Strikes":"28",Evasion:"28","Stillness of Mind":"28","Purity of Body":"28","Tongue of the Sun and Moon":"28","Diamond Soul":"28","Timeless Body":"28","Empty Body":"28","Perfect Self":"28",
    "Open Hand Technique":"28","Wholeness of Body":"28",Tranquility:"29","Quivering Palm":"29"
  }),
  "2024":Object.freeze({
    "Martial Arts":"50","Unarmored Defense":"50","Monk's Focus":"50","Unarmored Movement":"51","Uncanny Metabolism":"51","Deflect Attacks":"51","Monk Subclass":"51","Ability Score Improvement":"51","Slow Fall":"51","Extra Attack":"51","Stunning Strike":"51","Empowered Strikes":"51",Evasion:"51","Acrobatic Movement":"51","Heightened Focus":"51",
    "Self-Restoration":"52","Deflect Energy":"52","Disciplined Survivor":"52","Perfect Focus":"52","Superior Defense":"52","Epic Boon":"52","Body and Mind":"52","Open Hand Technique":"52","Wholeness of Body":"52","Fleet Step":"52","Quivering Palm":"52"
  })
});

const FEAT_PAGES=Object.freeze({"2024":Object.freeze({"Boon of Irresistible Offense":"88"})});

function sourceAt(ruleset,page){
  try{
    const source=SOURCES[ruleset];
    if(!source||!page)throw new Error(`Missing Monk SRD provenance for ${ruleset}.`);
    return Object.freeze({...source,page:String(page)});
  }catch(error){console.error("[monk-provenance] source lookup failed",error);throw error;}
}

export function monkEntityProvenance(ruleset,kind){
  try{
    const page=ENTITY_PAGES[ruleset]?.[kind];
    if(!page)throw new Error(`Missing Monk ${kind} provenance for ${ruleset}.`);
    return sourceAt(ruleset,page);
  }catch(error){console.error("[monk-provenance] entity lookup failed",error);throw error;}
}

export function monkReferenceProvenance(character,kind,name){
  try{
    const ruleset=character?.ruleset;
    let page=null;
    if(kind==="feature")page=FEATURE_PAGES[ruleset]?.[name];
    if(kind==="feat")page=FEAT_PAGES[ruleset]?.[name];
    if(!page)throw new Error(`Missing Monk reference provenance: ${ruleset} ${kind}:${name}.`);
    return sourceAt(ruleset,page);
  }catch(error){console.error("[monk-provenance] reference lookup failed",error);throw error;}
}
