import { SOURCE } from "../schema.js";
import { buildRulesAudit as buildSrdRulesAudit } from "./audit-srd-router.js";
import { buildForgeOriginalAudit } from "./original-subclass-audit.js";
import { isForgeOriginalSubclass } from "../data/original-subclasses.js";
import { isBarbarianForgeOriginal } from "../data/barbarian-subclasses.js";
import { isForgeOriginalBackground } from "../data/original-backgrounds.js";
import { isForgeOriginalFeat } from "../data/feat-library.js";

const RULESETS=new Set(["2014","2024"]);
const SOURCE_MODES=new Set([SOURCE.RAW,SOURCE.HOMEBREW]);

export function buildRulesAudit(character,validation){
  try{
    if(!RULESETS.has(character?.ruleset))throw new Error(`Rules Audit rejects unsupported ruleset: ${String(character?.ruleset||"unknown")}.`);
    if(!SOURCE_MODES.has(character?.sourceMode))throw new Error(`Rules Audit rejects unsupported source mode: ${String(character?.sourceMode||"unknown")}.`);
    const compatible=isForgeOriginalBackground(character?.background)||isForgeOriginalSubclass(character?.subclass)||isBarbarianForgeOriginal(character?.subclass)||(character?.feats||[]).some(isForgeOriginalFeat);
    if(compatible&&character.sourceMode===SOURCE.RAW)throw new Error("RAW mode cannot include Character Forge Original mechanics. Choose only SRD/RAW options.");
    return compatible?buildForgeOriginalAudit(character,validation):buildSrdRulesAudit(character,validation);
  }catch(error){console.error("[audit-router] source dispatch failed",error);throw error;}
}
