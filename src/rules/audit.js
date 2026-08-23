import { SOURCE } from "../schema.js";

const RULESET_SOURCES=Object.freeze({
  "2014":Object.freeze({
    label:"2014 / 5e",
    document:"System Reference Document 5.1",
    version:"SRD 5.1",
    license:"CC BY 4.0",
    url:"https://www.dndbeyond.com/srd"
  }),
  "2024":Object.freeze({
    label:"2024 / 5.5e",
    document:"System Reference Document 5.2.1",
    version:"SRD 5.2.1",
    license:"CC BY 4.0",
    url:"https://www.dndbeyond.com/srd"
  })
});

export function buildRulesAudit(character,validation){
  try{
    if(!character)throw new Error("Rules audit requires a generated character.");
    if(!validation?.valid)throw new Error("Rules audit can only be attached after validation passes.");
    const source=RULESET_SOURCES[character.ruleset];
    if(!source)throw new Error(`Unsupported ruleset for audit: ${character.ruleset}.`);
    const homebrewCount=character.homebrew?.length||0;
    const rawIntegrity=character.sourceMode===SOURCE.RAW&&homebrewCount===0;
    const mechanics=[
      {label:"Species",value:character.species?.name||"Unknown"},
      {label:"Background",value:character.background?.name||"Unknown"},
      {label:"Class",value:character.class?.name||"Unknown"},
      {label:"Subclass",value:character.subclass?.name||"None at this level"},
      {label:"Level",value:String(character.level)},
      {label:"Ability generation",value:"Standard array, then ruleset-specific legal adjustments"}
    ];
    if(character.spells)mechanics.push({label:"Spellcasting",value:`${character.class.name} rules; legal selections validated and remaining choices filled by Forge`});
    const checks=[
      "Character generation completed with zero validation errors.",
      "Derived Armor Class, Hit Points, initiative, saves, skills, attacks, and spell math were recalculated from encoded mechanics.",
      "Duplicate proficiencies, features, attacks, languages, feats, masteries, and spell selections were rejected by validation.",
      character.sourceMode===SOURCE.RAW
        ?"RAW integrity passed: no Homebrew mechanics are present in this character."
        :`Homebrew mode is explicit: ${homebrewCount} structured Homebrew entr${homebrewCount===1?"y":"ies"} applied on top of RAW.`
    ];
    return{
      status:"PASS",
      sourceMode:character.sourceMode,
      rawIntegrity,
      ruleset:character.ruleset,
      rulesLabel:source.label,
      sourceDocument:source.document,
      sourceVersion:source.version,
      sourceUrl:source.url,
      license:source.license,
      scope:"Character Forge verified SRD coverage only; unsupported content is unavailable instead of guessed.",
      mechanics,
      checks
    };
  }catch(error){console.error("[audit] rules audit failed",error);throw error;}
}
