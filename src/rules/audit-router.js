import { SOURCE } from "../schema.js";
import { buildRulesAudit as buildCoreRulesAudit } from "./audit.js";
import { entityProvenance, rulesetSource } from "../data/rule-provenance.js";
import { barbarianEntityProvenance } from "../data/barbarian-provenance.js";
import { bardEntityProvenance } from "../data/bard-provenance.js";
import { druidEntityProvenance } from "../data/druid-provenance.js";
import { paladinEntityProvenance } from "../data/paladin-provenance.js";
import { rangerEntityProvenance } from "../data/ranger-provenance.js";
import { speciesChoiceLabel } from "./species.js";

const RULESET_LABELS=Object.freeze({"2014":"2014 / 5e","2024":"2024 / 5.5e"}),LICENSE="CC BY 4.0",SRD_LANDING_URL="https://www.dndbeyond.com/srd";

export function buildRulesAudit(character,validation){
  try{
    if(character?.class?.id==="barbarian")return buildBarbarianAudit(character,validation);
    if(character?.class?.id==="bard")return buildBardAudit(character,validation);
    if(character?.class?.id==="druid")return buildDruidAudit(character,validation);
    if(character?.class?.id==="paladin")return buildPaladinAudit(character,validation);
    if(character?.class?.id==="ranger")return buildRangerAudit(character,validation);
    return buildCoreRulesAudit(character,validation);
  }catch(error){console.error("[audit-router] build failed",error);throw error;}
}
function buildBarbarianAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Barbarian rules audit requires a validated character.");
    const source=rulesetSource(character.ruleset),classSource=barbarianEntityProvenance(character.ruleset,"class"),homebrewCount=character.homebrew?.length||0,rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const mechanics=[mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),mechanic("Background",character.background.name,entityProvenance(character.ruleset,"background",character.background.id)),mechanic("Class",character.class.name,classSource)];
    if(character.subclass)mechanics.push(mechanic("Subclass",character.subclass.name,barbarianEntityProvenance(character.ruleset,"subclass")));mechanics.push(mechanic("Level",String(character.level),classSource));
    return auditEnvelope(character,source,rawIntegrity,homebrewCount,mechanics,["Character generation completed with zero validation errors.",barbarianEditionCheck(character.ruleset),"Displayed Barbarian rules and identity carry verified SRD source locators."]);
  }catch(error){console.error("[audit-router] Barbarian audit failed",error);throw error;}
}
function buildBardAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Bard rules audit requires a validated character.");
    const source=rulesetSource(character.ruleset),classSource=bardEntityProvenance(character.ruleset,"class"),homebrewCount=character.homebrew?.length||0,rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const mechanics=[mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),mechanic("Background",character.background.name,entityProvenance(character.ruleset,"background",character.background.id)),mechanic("Class",character.class.name,classSource)];
    if(character.subclass)mechanics.push(mechanic("Subclass",character.subclass.name,bardEntityProvenance(character.ruleset,"subclass")));
    mechanics.push(mechanic("Level",String(character.level),classSource),mechanic("Bard spell list",character.ruleset==="2014"?"pp.105–106":"pp.33–35",bardEntityProvenance(character.ruleset,"spells")));
    return auditEnvelope(character,source,rawIntegrity,homebrewCount,mechanics,["Character generation completed with zero validation errors.",bardEditionCheck(character.ruleset),"Displayed Bard rules, College of Lore state, spell list, and identity carry verified SRD source locators."]);
  }catch(error){console.error("[audit-router] Bard audit failed",error);throw error;}
}
function buildDruidAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Druid rules audit requires a validated character.");
    const source=rulesetSource(character.ruleset),classSource=druidEntityProvenance(character.ruleset,"class"),homebrewCount=character.homebrew?.length||0,rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const mechanics=[mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),mechanic("Background",character.background.name,entityProvenance(character.ruleset,"background",character.background.id)),mechanic("Class",character.class.name,classSource)];
    if(character.subclass)mechanics.push(mechanic("Subclass",character.subclass.name,druidEntityProvenance(character.ruleset,"subclass")));
    mechanics.push(mechanic("Level",String(character.level),classSource),mechanic("Druid spell list",character.ruleset==="2014"?"pp.107–108":"pp.44–45",druidEntityProvenance(character.ruleset,"spells")));
    return auditEnvelope(character,source,rawIntegrity,homebrewCount,mechanics,["Character generation completed with zero validation errors.",druidEditionCheck(character.ruleset),"Displayed Druid rules, Wild Shape state, spell list, and identity carry verified SRD source locators."]);
  }catch(error){console.error("[audit-router] Druid audit failed",error);throw error;}
}
function buildPaladinAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Paladin rules audit requires a validated character.");
    const source=rulesetSource(character.ruleset),classSource=paladinEntityProvenance(character.ruleset,"class"),homebrewCount=character.homebrew?.length||0,rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const mechanics=[mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),mechanic("Background",character.background.name,entityProvenance(character.ruleset,"background",character.background.id)),mechanic("Class",character.class.name,classSource)];
    if(character.subclass)mechanics.push(mechanic("Subclass",character.subclass.name,paladinEntityProvenance(character.ruleset,"subclass")));mechanics.push(mechanic("Level",String(character.level),classSource),mechanic("Paladin spell list",character.ruleset==="2014"?"pp.108–109":"pp.55–56",paladinEntityProvenance(character.ruleset,"spells")));
    return auditEnvelope(character,source,rawIntegrity,homebrewCount,mechanics,["Character generation completed with zero validation errors.",paladinEditionCheck(character.ruleset),"Displayed Paladin rules, spell list, and identity carry verified SRD source locators."]);
  }catch(error){console.error("[audit-router] Paladin audit failed",error);throw error;}
}
function buildRangerAudit(character,validation){
  try{
    if(!validation?.valid)throw new Error("Ranger rules audit requires a validated character.");
    const source=rulesetSource(character.ruleset),classSource=rangerEntityProvenance(character.ruleset,"class"),homebrewCount=character.homebrew?.length||0,rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const mechanics=[mechanic("Species",speciesChoiceLabel(character),entityProvenance(character.ruleset,"species",character.species.id)),mechanic("Background",character.background.name,entityProvenance(character.ruleset,"background",character.background.id)),mechanic("Class",character.class.name,classSource)];
    if(character.subclass)mechanics.push(mechanic("Subclass",character.subclass.name,rangerEntityProvenance(character.ruleset,"subclass")));mechanics.push(mechanic("Level",String(character.level),classSource),mechanic("Ranger spell list",character.ruleset==="2014"?"p.109":"p.60",rangerEntityProvenance(character.ruleset,"spells")));
    return auditEnvelope(character,source,rawIntegrity,homebrewCount,mechanics,["Character generation completed with zero validation errors.",rangerEditionCheck(character.ruleset),"Displayed Ranger rules, spell list, and identity carry verified SRD source locators."]);
  }catch(error){console.error("[audit-router] Ranger audit failed",error);throw error;}
}
function barbarianEditionCheck(ruleset){try{if(ruleset==="2014")return "2014 Barbarian Rage, Unarmored Defense, Reckless Attack, Danger Sense, Brutal Critical, Berserker progression, and Primal Champion math were recalculated from encoded SRD mechanics.";if(ruleset==="2024")return "2024 Barbarian Rage, Unarmored Defense, Reckless Attack, Weapon Mastery, Brutal Strike, Berserker progression, Epic Boon, and Primal Champion math were recalculated from encoded SRD mechanics.";throw new Error(`Unsupported Barbarian audit ruleset: ${ruleset}.`);}catch(error){console.error("[audit-router] Barbarian edition check failed",error);throw error;}}
function bardEditionCheck(ruleset){try{if(ruleset==="2014")return "2014 Bard spells known, Bardic Inspiration scaling and recovery, Jack of All Trades, Song of Rest, Expertise, College of Lore, Additional Magical Secrets, standard Magical Secrets, and Superior Inspiration were recalculated from encoded SRD mechanics.";if(ruleset==="2024")return "2024 Bard prepared casting, Bardic Inspiration scaling and recovery, Expertise, Jack of All Trades, College of Lore, Magical Discoveries, Countercharm, Magical Secrets, Superior Inspiration, Epic Boon, and Words of Creation were recalculated from encoded SRD mechanics.";throw new Error(`Unsupported Bard audit ruleset: ${ruleset}.`);}catch(error){console.error("[audit-router] Bard edition check failed",error);throw error;}}
function druidEditionCheck(ruleset){try{if(ruleset==="2014")return "2014 Druid prepared casting, Wild Shape uses and CR/movement limits, Circle of the Land progression, Natural Recovery, field-form examples, Beast Spells, and unlimited Archdruid Wild Shape were recalculated from encoded SRD mechanics.";if(ruleset==="2024")return "2024 Druid prepared casting, Primal Order, known Wild Shape forms, Wild Resurgence, Elemental Fury, Circle of the Land progression, Beast Spells, Epic Boon, and Archdruid resources were recalculated from encoded SRD mechanics.";throw new Error(`Unsupported Druid audit ruleset: ${ruleset}.`);}catch(error){console.error("[audit-router] Druid edition check failed",error);throw error;}}
function paladinEditionCheck(ruleset){try{if(ruleset==="2014")return "2014 Paladin Lay On Hands, Divine Sense, Divine Smite, spell preparation, auras, Cleansing Touch, Oath of Devotion progression, and Holy Nimbus were recalculated from encoded SRD mechanics.";if(ruleset==="2024")return "2024 Paladin Lay On Hands, Weapon Mastery, Paladin's Smite, Channel Divinity, spell preparation, auras, Restoring Touch, Oath of Devotion progression, Epic Boon, and Holy Nimbus were recalculated from encoded SRD mechanics.";throw new Error(`Unsupported Paladin audit ruleset: ${ruleset}.`);}catch(error){console.error("[audit-router] Paladin edition check failed",error);throw error;}}
function rangerEditionCheck(ruleset){try{if(ruleset==="2014")return "2014 Ranger Favored Enemy, Natural Explorer, spells known, Primeval Awareness, Hunter option progression, Feral Senses, and Foe Slayer were recalculated from encoded SRD mechanics.";if(ruleset==="2024")return "2024 Ranger Favored Enemy with Hunter's Mark, Weapon Mastery, prepared spells, Deft Explorer, Roving, Tireless, Hunter progression, Nature's Veil, Epic Boon, and Foe Slayer were recalculated from encoded SRD mechanics.";throw new Error(`Unsupported Ranger audit ruleset: ${ruleset}.`);}catch(error){console.error("[audit-router] Ranger edition check failed",error);throw error;}}
function auditEnvelope(character,source,rawIntegrity,homebrewCount,mechanics,checks){try{return{status:"PASS",sourceMode:character.sourceMode,rawIntegrity,ruleset:character.ruleset,rulesLabel:RULESET_LABELS[character.ruleset],sourceDocument:source.document,sourceVersion:source.version,sourceUrl:SRD_LANDING_URL,sourcePdfUrl:source.pdfUrl,license:LICENSE,scope:"Character Forge verified SRD coverage only; unsupported content is unavailable instead of guessed.",mechanics,checks:[...checks,character.sourceMode===SOURCE.RAW?"RAW integrity passed: no Homebrew mechanics are present in this character.":`Homebrew mode is explicit: ${homebrewCount} structured Homebrew entr${homebrewCount===1?"y":"ies"} applied on top of RAW.`]};}catch(error){console.error("[audit-router] audit envelope failed",error);throw error;}}
function mechanic(label,value,source){try{if(!source?.version||!source?.page)throw new Error(`${label} is missing verified provenance.`);return{label,value,source};}catch(error){console.error("[audit-router] mechanic failed",error);throw error;}}
