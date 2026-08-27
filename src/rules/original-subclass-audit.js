import { SOURCE } from "../schema.js";
import { entityProvenance, rulesetSource } from "../data/rule-provenance.js";
import { barbarianEntityProvenance, barbarianSubclassProvenance } from "../data/barbarian-provenance.js";
import { bardEntityProvenance } from "../data/bard-provenance.js";
import { monkEntityProvenance } from "../data/monk-provenance.js";
import { sorcererEntityProvenance } from "../data/sorcerer-provenance.js";
import { warlockEntityProvenance } from "../data/warlock-provenance.js";
import { druidEntityProvenance } from "../data/druid-provenance.js";
import { paladinEntityProvenance } from "../data/paladin-provenance.js";
import { rangerEntityProvenance } from "../data/ranger-provenance.js";
import { isForgeOriginalSubclass, originalSubclassFeatureRecordsFor, originalSubclassSource } from "../data/original-subclasses.js";
import { barbarianOriginalFeaturesFor, isBarbarianForgeOriginal } from "../data/barbarian-subclasses.js";
import { isForgeOriginalBackground, originalBackgroundSource } from "../data/original-backgrounds.js";
import { speciesChoiceLabel } from "./species.js";

const RULESET_LABELS=Object.freeze({"2014":"2014 / 5e","2024":"2024 / 5.5e"});
const SRD_LANDING_URL="https://www.dndbeyond.com/srd";

export function buildForgeOriginalAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Forge-compatible rules audit requires a validated character.");
    const originalBackground=isForgeOriginalBackground(character?.background),barbarianOriginal=character?.class?.id==="barbarian"&&isBarbarianForgeOriginal(character?.subclass),originalSubclass=barbarianOriginal||isForgeOriginalSubclass(character?.subclass);
    if(!originalBackground&&!originalSubclass)throw new Error("Forge-compatible audit received no Character Forge Original content.");
    const source=rulesetSource(character.ruleset),classSource=classProvenance(character),homebrewCount=character.homebrew?.length||0;
    const backgroundSource=originalBackground?originalBackgroundSource():entityProvenance(character.ruleset,"background",character.background.id);
    const mechanics=[
      mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),
      mechanic("Background",originalBackground?`${character.background.name} — Forge Original`:character.background.name,backgroundSource),
      mechanic("Class",character.class.name,classSource)
    ];
    if(character.subclass)mechanics.push(mechanic("Subclass",originalSubclass?`${character.subclass.name} — Forge Original`:character.subclass.name,subclassProvenance(character,originalSubclass)));
    mechanics.push(mechanic("Level",String(character.level),classSource));
    const spellSource=spellListProvenance(character);if(spellSource)mechanics.push(mechanic(`${character.class.name} spell list`,"SRD class spell catalog",spellSource));
    const checks=["Character generation completed with zero validation errors.",`${character.class.name} base mechanics remain sourced to ${source.version}.`];
    if(originalBackground)checks.push(`${character.background.name} is explicitly Character Forge Original background content; its skills, tools, equipment, and edition-specific benefits are not represented as official D&D RAW or SRD content.`);
    if(originalSubclass){
      const count=barbarianOriginal?barbarianOriginalFeaturesFor(character.ruleset,character.level,character.subclass.id).length:originalSubclassFeatureRecordsFor(character.ruleset,character.class.id,character.level,character.subclass.id).length;
      checks.push(`${character.subclass.name} is explicitly Character Forge Original subclass content; it is not represented as official D&D RAW or SRD content.`);
      checks.push(`${count} active original subclass feature${count===1?"":"s"} passed the encoded level-gate progression for level ${character.level}.`);
    }
    checks.push("Content integrity passed: SRD mechanics remain sourced and Character Forge Original content is clearly separated from official RAW.");
    if(character.sourceMode===SOURCE.HOMEBREW)checks.push(`Homebrew mode is explicit: ${homebrewCount} structured Homebrew entr${homebrewCount===1?"y":"ies"} applied in addition to compatible content.`);
    return{
      status:"PASS",sourceMode:character.sourceMode,rawIntegrity:false,ruleset:character.ruleset,rulesLabel:RULESET_LABELS[character.ruleset],sourceDocument:source.document,sourceVersion:source.version,sourceUrl:SRD_LANDING_URL,sourcePdfUrl:source.pdfUrl,
      license:"CC BY 4.0 SRD foundation + Character Forge Original game content",
      scope:"SRD base mechanics plus explicitly labeled Character Forge Original content; official non-SRD D&D subclasses are not reproduced, and official non-SRD D&D material is not reproduced unless separately licensed.",mechanics,checks
    };
  }catch(error){console.error("[original-content-audit] build failed",error);throw error;}
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
  }catch(error){console.error("[original-content-audit] class provenance failed",error);throw error;}
}
function subclassProvenance(character,original){
  try{
    const id=character.class.id,ruleset=character.ruleset;if(!character.subclass)return null;
    if(id==="barbarian")return barbarianSubclassProvenance(character);
    if(original)return originalSubclassSource(id);
    if(id==="bard")return bardEntityProvenance(ruleset,"subclass");
    if(id==="monk")return monkEntityProvenance(ruleset,"subclass");
    if(id==="sorcerer")return sorcererEntityProvenance(ruleset,"subclass");
    if(id==="warlock")return warlockEntityProvenance(ruleset,"subclass");
    if(id==="druid")return druidEntityProvenance(ruleset,"subclass");
    if(id==="paladin")return paladinEntityProvenance(ruleset,"subclass");
    if(id==="ranger")return rangerEntityProvenance(ruleset,"subclass");
    return entityProvenance(ruleset,"subclass",character.subclass.id);
  }catch(error){console.error("[original-content-audit] subclass provenance failed",error);throw error;}
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
  }catch(error){console.error("[original-content-audit] spell provenance failed",error);throw error;}
}
function mechanic(label,value,source){try{if(!source?.version||!source?.page)throw new Error(`${label} is missing verified provenance.`);return{label,value,source};}catch(error){console.error("[original-content-audit] mechanic failed",error);throw error;}}
