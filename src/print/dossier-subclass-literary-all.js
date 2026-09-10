import { literarySubclassFor as literaryOriginalSubclassFor, LITERARY_SUBCLASS_IDS as ORIGINAL_IDS } from "./dossier-subclass-literary.js";
import { SRD_SUBCLASS_LITERARY } from "./dossier-subclass-srd-literary.js";

export function literarySubclassFor(subclass){
  try{
    const id=String(subclass?.id||subclass?.name||"").trim().toLowerCase();
    return SRD_SUBCLASS_LITERARY[id]||literaryOriginalSubclassFor(subclass);
  }catch(error){console.error("[dossier-subclass-literary-all] lookup failed",error);return literaryOriginalSubclassFor(subclass);}
}

export const LITERARY_SUBCLASS_IDS=Object.freeze([...new Set([...ORIGINAL_IDS,...Object.keys(SRD_SUBCLASS_LITERARY)])]);
