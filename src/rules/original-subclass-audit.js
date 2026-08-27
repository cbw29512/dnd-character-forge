import { SOURCE } from "../schema.js";
import { entityProvenance, rulesetSource } from "../data/rule-provenance.js";
import { barbarianEntityProvenance } from "../data/barbarian-provenance.js";
import { bardEntityProvenance } from "../data/bard-provenance.js";
import { monkEntityProvenance } from "../data/monk-provenance.js";
import { sorcererEntityProvenance } from "../data/sorcerer-provenance.js";
import { warlockEntityProvenance } from "../data/warlock-provenance.js";
import { druidEntityProvenance } from "../data/druid-provenance.js";
import { paladinEntityProvenance } from "../data/paladin-provenance.js";
import { rangerEntityProvenance } from "../data/ranger-provenance.js";
import { originalSubclassFeatureRecordsFor, originalSubclassSource } from "../data/original-subclasses.js";
import { speciesChoiceLabel } from "./species.js";

const RULESET_LABELS=Object.freeze({"2014":"2014 / 5e","2024":"2024 / 5.5e"});
const SRD_LANDING_URL="https://www.dndbeyond.com/srd";

export function buildForgeOriginalAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Forge-original rules audit requires a validated character.");
    if(character?.subclass?.contentKind!=="forge-original")throw new Error("Forge-original audit received a non-original subclass.");
    const source=rulesetSource(character.ruleset),classSource=classProvenance(character),subclassSource=originalSubclassSource(character.class.id),homebrewCount=character.homebrew?.length||0,records=originalSubclassFeatureRecordsFor(character.ruleset,character.class.id,character.level,character.subclass.id);
    const mechanics=[
      mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),
      mechanic("Background",character.background.name,entityProvenance(character.ruleset,"background",character.background.id)),
      mechanic("Class",character.class.name,classSource),
      mechanic("Subclass",`${character.subclass.name} — Forge Original`,subclassSource),
      mechanic("Level",String(character.level),classSource)
    ];
    const spellSource=spellListProvenance(character);if(spellSource)mechanics.push(mechanic(`${character.class.name} spell list`,"SRD class spell catalog",spellSource));
    return{
      status:"PASS",sourceMode:character.sourceMode,rawIntegrity:false,ruleset:character.ruleset,rulesLabel:RULESET_LABELS[character.ruleset],sourceDocument:source.document,sourceVersion:source.version,sourceUrl:SRD_LANDING_URL,sourcePdfUrl:source.pdfUrl,
      license:"CC BY 4.0 SRD foundation + Character Forge Original game content",
      scope:"SRD class mechanics plus explicitly labeled Character Forge Original subclass content; official non-SRD D&D subclasses are not reproduced.",
      mechanics,
      checks:[
        "Character generation completed with zero validation errors.",
        `${character.class.name} base mechanics remain sourced to ${source.version}; ${character.subclass.name} is explicitly Character Forge Original game content.`,
        `${records.length} active original subclass feature${records.length===1?"":"s"} passed the encoded level-gate progression for level ${character.level}.`,
        "Content integrity passed: SRD mechanics remain sourced and the selected Forge Original subclass is clearly separated from official RAW.",
        ...(character.sourceMode===SOURCE.HOMEBREW?[`Homebrew mode is explicit: ${homebrewCount} structured Homebrew entr${homebrewCount===1?"y":"ies"} applied in addition to the Forge Original subclass.`]:[])
      ]
    };
  }catch(error){console.error("[original-subclass-audit] build failed",error);throw error;}
}
function classProvenance(character){
  try{
    const id=character.class.id,ruleset=character.ruleset;
    if(id==="barbarian")return barbarianEntityProvenance(ruleset,"class");
    if(id==="bard")return bardEntityProvenance(ruleset,"class");
    if(id==="monk")return monkEntityProvenance(ruleset,"class");
    if(id==="sorcerer")return sorcererEntityProvenance(ruleset,"class");
    if(id==="warlock")return warlockEntityProvenance(ruleset,"class");
    if(id==="druid")return druidEntityProvenance(ruleset,"class");
    if(id==="paladin")return paladinEntityProvenance(ruleset,"class");
    if(id==="ranger")return rangerEntityProvenance(ruleset,"class");
    return entityProvenance(ruleset,"class",id);
  }catch(error){console.error("[original-subclass-audit] class provenance failed",error);throw error;}
}
function spellListProvenance(character){
  try{
    if(!character.spells)return null;
    const id=character.class.id,ruleset=character.ruleset;
    if(id==="bard")return bardEntityProvenance(ruleset,"spells");
    if(id==="sorcerer")return sorcererEntityProvenance(ruleset,"spells");
    if(id==="warlock")return warlockEntityProvenance(ruleset,"spells");
    if(id==="druid")return druidEntityProvenance(ruleset,"spells");
    if(id==="paladin")return paladinEntityProvenance(ruleset,"spells");
    if(id==="ranger")return rangerEntityProvenance(ruleset,"spells");
    return null;
  }catch(error){console.error("[original-subclass-audit] spell provenance failed",error);throw error;}
}
function mechanic(label,value,source){try{if(!source?.version||!source?.page)throw new Error(`${label} is missing verified provenance.`);return{label,value,source};}catch(error){console.error("[original-subclass-audit] mechanic failed",error);throw error;}}