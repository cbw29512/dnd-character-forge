import { classDecorationArt } from "./class-art.js";
import { classPortraitArt } from "./class-portrait-assets.js";
import { composedDossierArtFor } from "./dossier-art-layers.js";

export function composedDossierPortraitArt(classId,artDirection={}){
  try{
    const ids=artIds(artDirection),composition=composedDossierArtFor(ids.backgroundId,ids.pathId),portrait=classPortraitArt(classId);
    if(!composition||!portrait)return "";
    const backgroundVector=composition.background.vector,pathVector=composition.path.vector;
    if(!backgroundVector||!pathVector)return "";
    const key=escapeAttribute(composition.variantKey),label=escapeAttribute(`Character Forge composed illustration: ${composition.background.symbol} and ${composition.path.symbol}`),emblem=classDecorationArt(normalize(classId));
    const overlay=`<svg class="ps-composed-dossier-overlay" aria-hidden="true" viewBox="0 0 180 220"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${backgroundVector}${pathVector}</g></svg>`;
    return `<span class="ps-placeholder-illustrated ps-composed-dossier-portrait" data-composed-portrait="${key}" role="img" aria-label="${label}">${portrait}${overlay}</span><span class="ps-placeholder-emblem" aria-hidden="true">${emblem}</span>`;
  }catch(error){
    console.error("[dossier-art-layer-renderer] composition render failed",error);
    return "";
  }
}

function artIds(artDirection){
  try{
    const backgroundId=normalize(artDirection?.backgroundId),pathId=normalize(artDirection?.pathId);
    if(backgroundId&&pathId)return{backgroundId,pathId};
    const [background="",path=""]=normalize(artDirection?.variantKey).split("--",2);
    return{backgroundId:background,pathId:path};
  }catch(error){
    console.error("[dossier-art-layer-renderer] art id resolution failed",error);
    return{backgroundId:"",pathId:""};
  }
}
function normalize(value){try{return String(value||"").trim().toLowerCase();}catch(error){console.error("[dossier-art-layer-renderer] normalization failed",error);return"";}}
function escapeAttribute(value){try{return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}catch(error){console.error("[dossier-art-layer-renderer] escaping failed",error);return"";}}
