const SOURCES=Object.freeze({
  "2014":Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf"}),
  "2024":Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",pdfUrl:"https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"})
});

const ENTITY_PAGES=Object.freeze({
  "2014":Object.freeze({species:{human:"5"},background:{acolyte:"61"},class:{fighter:"24",wizard:"52",cleric:"15"},subclass:{champion:"25","school-evocation":"54","life-domain":"17"}}),
  "2024":Object.freeze({species:{human:"86"},background:{criminal:"83",soldier:"83"},class:{fighter:"47",wizard:"77",cleric:"36"},subclass:{champion:"49",evoker:"82","life-domain":"40"}})
});

const REFERENCE_PAGES=Object.freeze({
  "2014":Object.freeze({
    "species:Ability Score Increase":"5","species:Extra Language":"5","background:Shelter of the Faithful":"61",
    "style:Defense":"24","style:Archery":"24","style:Great Weapon Fighting":"24",
    "feature:Second Wind":"24","feature:Action Surge":"25","feature:Improved Critical":"25","feature:Extra Attack":"25",
    "feature:Ability Score Improvement:fighter":"25","feature:Ability Score Improvement:wizard":"53","feature:Ability Score Improvement:cleric":"17",
    "feature:Spellcasting:wizard":"52–53","feature:Arcane Recovery":"53","feature:Evocation Savant":"54","feature:Sculpt Spells":"54",
    "feature:Spellcasting:cleric":"15–16","feature:Divine Domain: Life Domain":"17","feature:Bonus Proficiency: Heavy Armor":"17","feature:Disciple of Life":"17",
    "feature:Channel Divinity (1/rest)":"16","feature:Turn Undead":"16","feature:Channel Divinity: Preserve Life":"17","feature:Preserve Life":"17","feature:Destroy Undead (CR 1/2)":"17","feature:Life Domain":"17"
  }),
  "2024":Object.freeze({
    "species:Resourceful":"86","species:Skillful":"86","species:Versatile":"86",
    "feat:Alert":"87","feat:Savage Attacker":"87","feat:Skilled":"87","feat:Boon of Combat Prowess":"88",
    "style:Archery":"87","style:Defense":"88","style:Great Weapon Fighting":"88","style:Two-Weapon Fighting":"88",
    "feature:Second Wind":"48","feature:Weapon Mastery":"48","feature:Action Surge":"48","feature:Tactical Mind":"48","feature:Ability Score Improvement":"87","feature:Extra Attack":"48","feature:Tactical Shift":"48",
    "feature:Indomitable":"48","feature:Tactical Master":"48","feature:Two Extra Attacks":"48","feature:Studied Attacks":"48","feature:Epic Boon":"48","feature:Three Extra Attacks":"48",
    "feature:Improved Critical":"49","feature:Remarkable Athlete":"49","feature:Additional Fighting Style":"49","feature:Heroic Warrior":"49","feature:Superior Critical":"49","feature:Survivor":"49",
    "feature:Spellcasting:wizard":"77–78","feature:Arcane Recovery":"78","feature:Ritual Adept":"78","feature:Scholar":"78","feature:Evocation Savant":"82","feature:Potent Cantrip":"82","feature:Memorize Spell":"79",
    "feature:Spellcasting:cleric":"36–37","feature:Divine Order: Protector":"37","feature:Divine Order: Thaumaturge":"37","feature:Channel Divinity (2 uses)":"37","feature:Divine Spark":"37","feature:Turn Undead":"37","feature:Sear Undead":"37",
    "feature:Life Domain":"40","feature:Disciple of Life":"40","feature:Preserve Life":"40",
    "mastery:Graze":"90","mastery:Nick":"90","mastery:Push":"90","mastery:Sap":"90","mastery:Slow":"90","mastery:Topple":"90","mastery:Vex":"90"
  })
});

function sourceAt(ruleset,page){
  try{const source=SOURCES[ruleset];if(!source||!page)throw new Error(`Missing verified SRD provenance for ${ruleset} page ${page||"unknown"}.`);return Object.freeze({...source,page:String(page)});}
  catch(error){console.error("[provenance] source lookup failed",error);throw error;}
}

export function entityProvenance(ruleset,kind,id){
  try{const page=ENTITY_PAGES[ruleset]?.[kind]?.[id];if(!page)throw new Error(`Missing entity provenance: ${ruleset} ${kind} ${id}.`);return sourceAt(ruleset,page);}
  catch(error){console.error("[provenance] entity lookup failed",error);throw error;}
}

export function referenceProvenance(character,kind,name){
  try{
    if(!character?.ruleset)throw new Error("Reference provenance requires a character ruleset.");
    const classSpecific=kind==="feature"&&(name==="Spellcasting"||(name==="Ability Score Improvement"&&character.ruleset==="2014"));
    const classSuffix=classSpecific?`:${character.class?.id||"unknown"}`:"";
    const masteryName=kind==="mastery"&&name.includes("—")?name.split("—").pop().trim():name;
    const key=`${kind}:${masteryName}${classSuffix}`;
    const page=REFERENCE_PAGES[character.ruleset]?.[key];
    if(!page)throw new Error(`Missing reference provenance: ${character.ruleset} ${key}.`);
    return sourceAt(character.ruleset,page);
  }catch(error){console.error("[provenance] reference lookup failed",error);throw error;}
}

export function rulesetSource(ruleset){
  try{const source=SOURCES[ruleset];if(!source)throw new Error(`Unsupported provenance ruleset: ${ruleset}.`);return Object.freeze({...source});}
  catch(error){console.error("[provenance] ruleset lookup failed",error);throw error;}
}
