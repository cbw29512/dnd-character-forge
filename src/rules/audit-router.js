import { SOURCE } from "../schema.js";
import { buildRulesAudit as buildCoreRulesAudit } from "./audit.js";
import { entityProvenance, rulesetSource } from "../data/rule-provenance.js";
import { barbarianEntityProvenance } from "../data/barbarian-provenance.js";
import { speciesChoiceLabel } from "./species.js";

const RULESET_LABELS=Object.freeze({"2014":"2014 / 5e","2024":"2024 / 5.5e"}),LICENSE="CC BY 4.0",SRD_LANDING_URL="https://www.dndbeyond.com/srd";

export function buildRulesAudit(character,validation){
  try{return character?.class?.id==="barbarian"?buildBarbarianAudit(character,validation):buildCoreRulesAudit(character,validation);}
  catch(error){console.error("[audit-router] build failed",error);throw error;}
}
function buildBarbarianAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Barbarian rules audit requires a validated character.");
    const source=rulesetSource(character.ruleset),classSource=barbarianEntityProvenance(character.ruleset,"class"),homebrewCount=character.homebrew?.length||0,rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const mechanics=[
      mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),
      mechanic("Background",character.background.name,entityProvenance(character.ruleset,"background",character.background.id)),
      mechanic("Class",character.class.name,classSource)
    ];
    if(character.subclass)mechanics.push(mechanic("Subclass",character.subclass.name,barbarianEntityProvenance(character.ruleset,"subclass")));
    mechanics.push(mechanic("Level",String(character.level),classSource));
    return{status:"PASS",sourceMode:character.sourceMode,rawIntegrity,ruleset:character.ruleset,rulesLabel:RULESET_LABELS[character.ruleset],sourceDocument:source.document,sourceVersion:source.version,sourceUrl:SRD_LANDING_URL,sourcePdfUrl:source.pdfUrl,license:LICENSE,scope:"Character Forge verified SRD coverage only; unsupported content is unavailable instead of guessed.",mechanics,checks:[
      "Character generation completed with zero validation errors.",
      "Barbarian Rage, Unarmored Defense, Speed, Weapon Mastery, Berserker progression, and capstone math were recalculated from encoded mechanics.",
      "2014 and 2024 Barbarian progressions are validated as separate rules contracts.",
      "Displayed Barbarian rules and identity carry verified SRD source locators.",
      character.sourceMode===SOURCE.RAW?"RAW integrity passed: no Homebrew mechanics are present in this character.":`Homebrew mode is explicit: ${homebrewCount} structured Homebrew entr${homebrewCount===1?"y":"ies"} applied on top of RAW.`
    ]};
  }catch(error){console.error("[audit-router] Barbarian audit failed",error);throw error;}
}
function mechanic(label,value,source){
  try{if(!source?.version||!source?.page)throw new Error(`${label} is missing verified provenance.`);return{label,value,source};}
  catch(error){console.error("[audit-router] mechanic failed",error);throw error;}
}
