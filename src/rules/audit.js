import { SOURCE } from "../schema.js";
import { entityProvenance, referenceProvenance, rulesetSource } from "../data/rule-provenance.js";

const RULESET_LABELS=Object.freeze({"2014":"2014 / 5e","2024":"2024 / 5.5e"});
const LICENSE="CC BY 4.0";
const SRD_LANDING_URL="https://www.dndbeyond.com/srd";

export function buildRulesAudit(character,validation){
  try{
    if(!character)throw new Error("Rules audit requires a generated character.");
    if(!validation?.valid)throw new Error("Rules audit can only be attached after validation passes.");
    const source=rulesetSource(character.ruleset),rulesLabel=RULESET_LABELS[character.ruleset];
    if(!rulesLabel)throw new Error(`Unsupported ruleset for audit: ${character.ruleset}.`);
    const homebrewCount=character.homebrew?.length||0,rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const classSource=entityProvenance(character.ruleset,"class",character.class.id);
    const mechanics=[
      mechanic("Species",character.species?.name||"Unknown",entityProvenance(character.ruleset,"species",character.species.id)),
      mechanic("Background",character.background?.name||"Unknown",entityProvenance(character.ruleset,"background",character.background.id)),
      mechanic("Class",character.class?.name||"Unknown",classSource),
      mechanic("Level",String(character.level),classSource)
    ];
    if(character.subclass)mechanics.splice(3,0,mechanic("Subclass",character.subclass.name,entityProvenance(character.ruleset,"subclass",character.subclass.id)));
    if(character.spells)mechanics.push(mechanic("Spellcasting",`${character.class.name} rules; legal selections validated and remaining choices filled by Forge`,referenceProvenance(character,"feature","Spellcasting")));
    const checks=[
      "Character generation completed with zero validation errors.",
      "Derived Armor Class, Hit Points, initiative, saves, skills, attacks, and spell math were recalculated from encoded mechanics.",
      "Duplicate proficiencies, features, attacks, languages, feats, masteries, and spell selections were rejected by validation.",
      "Displayed rule-facing identity and play-reference mechanics carry verified SRD source locators.",
      character.sourceMode===SOURCE.RAW
        ?"RAW integrity passed: no Homebrew mechanics are present in this character."
        :`Homebrew mode is explicit: ${homebrewCount} structured Homebrew entr${homebrewCount===1?"y":"ies"} applied on top of RAW.`
    ];
    return{
      status:"PASS",sourceMode:character.sourceMode,rawIntegrity,ruleset:character.ruleset,rulesLabel,
      sourceDocument:source.document,sourceVersion:source.version,sourceUrl:SRD_LANDING_URL,sourcePdfUrl:source.pdfUrl,license:LICENSE,
      scope:"Character Forge verified SRD coverage only; unsupported content is unavailable instead of guessed.",mechanics,checks
    };
  }catch(error){console.error("[audit] rules audit failed",error);throw error;}
}

function mechanic(label,value,source){
  try{if(!source?.version||!source?.page)throw new Error(`Audit mechanic ${label} is missing verified provenance.`);return{label,value,source};}
  catch(error){console.error(`[audit] mechanic provenance failed for ${label}`,error);throw error;}
}
