import { buildPremiumPrintModel } from "../print/model.js";
import { buildWarlockPremiumPrintModel } from "../print/warlock-model.js";
import { buildNarrativeDossier } from "../print/dossier.js";
import { exportProfileFor } from "../print/profile.js";
import { renderPrintPageOne } from "./print-page-one.js";
import { renderPrintPageTwo } from "./print-page-two.js";
import { renderPrintDossier } from "./print-dossier.js";

export function renderPremiumPrintSheet(character,target){
  try{
    const model=character?.class?.id==="warlock"?buildWarlockPremiumPrintModel(character):buildPremiumPrintModel(character),requestedPacket=character?.presentation?.sheetCustomization?.packetMode,packetMode=requestedPacket==="deluxe"?"deluxe":"table",profile=exportProfileFor(character,packetMode);
    model.profile=profile;
    model.packet={totalPages:profile.maxPages};
    model.dossier=profile.dossierPages?buildNarrativeDossier(character,{quickTurn:model.quickTurn}):null;
    // Keep starting-resource data beside the printable model so the sheet shows
    // exactly what the Forge generated, without duplicating rules calculations.
    model.startingMagic=character.startingMagic?{
      mode:character.startingMagic.mode,
      gold:character.startingMagic.gold,
      source:character.startingMagic.source,
      items:(character.startingMagic.items||[]).map(item=>({name:item.name,rarity:item.rarity,attunement:Boolean(item.attunement)}))
    }:null;
    target.innerHTML=`${renderPrintPageOne(model)}${renderPrintPageTwo(model)}${renderPrintDossier(model)}`;
    return model;
  }catch(error){
    console.error("[premium-print] render failed",error);
    throw error;
  }
}
