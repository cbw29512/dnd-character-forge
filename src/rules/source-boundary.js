import { ORIGIN_FEATS_2024 } from "../data/origin-feats-2024.js";

const SRD_ORIGIN_FEAT_IDS_2024=new Set(ORIGIN_FEATS_2024.map(feat=>feat.id));

export function sourceBoundaryErrors(character){
  try{
    if(character?.ruleset!=="2024")return[];
    const errors=[];
    for(const feat of character.feats||[]){
      const id=String(feat?.id||"");
      if(id==="tough"){
        errors.push("Tough is not published in Character Forge's SRD 5.2.1 Origin-feat catalog.");
        continue;
      }
      if(feat?.category==="Origin"&&!SRD_ORIGIN_FEAT_IDS_2024.has(id))errors.push(`Unsupported SRD 5.2.1 Origin feat: ${id||"unknown"}.`);
    }
    return errors;
  }catch(error){console.error("[source-boundary] validation failed",error);throw error;}
}

export function assertSourceBoundary(character){
  try{
    const errors=sourceBoundaryErrors(character);
    if(errors.length)throw new Error(errors.join(" "));
  }catch(error){console.error("[source-boundary] character blocked",error);throw error;}
}
