import { buildRulesAudit as buildSrdRulesAudit } from "./audit-srd-router.js";
import { buildForgeOriginalAudit } from "./original-subclass-audit.js";
import { isForgeOriginalSubclass } from "../data/original-subclasses.js";
import { isBarbarianForgeOriginal } from "../data/barbarian-subclasses.js";
import { isForgeOriginalBackground } from "../data/original-backgrounds.js";
import { isForgeOriginalFeat } from "../data/feat-library.js";

export function buildRulesAudit(character,validation){
  try{
    const compatible=isForgeOriginalBackground(character?.background)||isForgeOriginalSubclass(character?.subclass)||isBarbarianForgeOriginal(character?.subclass)||(character?.feats||[]).some(isForgeOriginalFeat);
    return compatible?buildForgeOriginalAudit(character,validation):buildSrdRulesAudit(character,validation);
  }catch(error){console.error("[audit-router] source dispatch failed",error);throw error;}
}
