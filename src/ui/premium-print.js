import { buildPremiumPrintModel } from "../print/model.js";
import { renderPrintPageOne } from "./print-page-one.js";
import { renderPrintPageTwo } from "./print-page-two.js";

export function renderPremiumPrintSheet(character,target){
  try{
    const model=buildPremiumPrintModel(character);
    target.innerHTML=`${renderPrintPageOne(model)}${renderPrintPageTwo(model)}`;
    return model;
  }catch(error){console.error("[premium-print] render failed",error);throw error;}
}
