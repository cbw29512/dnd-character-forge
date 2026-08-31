import { buildPremiumPrintModel } from "../print/model.js";
import { buildWarlockPremiumPrintModel } from "../print/warlock-model.js";
import { buildNarrativeDossier } from "../print/dossier.js";
import { sheetCustomizationClasses } from "../print/customization.js";
import { exportProfileFor } from "../print/profile.js";
import { printLicenseAttribution } from "../print/license-attribution.js";
import { certificationFooterText } from "../rules/certification.js";
import { renderPrintPageOne } from "./print-page-one.js";
import { renderPrintPageTwo } from "./print-page-two.js";
import { renderPrintDossier } from "./print-dossier.js";

export function renderPremiumPrintSheet(character,target){
  try{
    const model=character?.class?.id==="warlock"?buildWarlockPremiumPrintModel(character):buildPremiumPrintModel(character),requestedPacket=character?.presentation?.sheetCustomization?.packetMode,packetMode=requestedPacket==="deluxe"?"deluxe":"table",profile=exportProfileFor(character,packetMode),customization={...model.presentation.customization,packetMode};
    model.profile=profile;
    model.packet={totalPages:profile.maxPages};
    model.presentation={...model.presentation,customization,classes:sheetCustomizationClasses(customization)};
    if(character?.background?.contentKind==="forge-original")model.identity.background=character.background.displayName||`${character.background.name} — Forge Original`;
    model.dossier=profile.dossierPages?buildNarrativeDossier(character,{quickTurn:model.quickTurn}):null;
    // Keep starting-resource data beside the printable model so the sheet shows
    // exactly what the Forge generated, without duplicating rules calculations.
    model.startingMagic=character.startingMagic?{
      mode:character.startingMagic.mode,
      gold:character.startingMagic.gold,
      source:character.startingMagic.source,
      items:(character.startingMagic.items||[]).map(item=>({name:item.name,rarity:item.rarity,attunement:Boolean(item.attunement)}))
    }:null;
    const certification=certificationFooterText(character),attribution=printLicenseAttribution(model);
    const packet=`${renderPrintPageOne(model)}${renderPrintPageTwo(model)}${renderPrintDossier(model)}`
      .replace(/<span class="ps-audit">/g,`<span class="ps-audit">${certification} · `)
      .replace(/<\/footer>/g,`<span class="ps-license">${attribution}</span></footer>`);
    const forgeOriginal=!model.audit.rawIntegrity&&String(model.audit.license||"").includes("Character Forge Original");
    target.innerHTML=forgeOriginal?packet.replace(/ · RAW · /g," · 5E Compatible · ").replace(/RAW integrity/g,"Compatible content"):packet;
    return model;
  }catch(error){
    console.error("[premium-print] render failed",error);
    throw error;
  }
}
