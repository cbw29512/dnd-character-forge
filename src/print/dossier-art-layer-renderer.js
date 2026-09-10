import { classDecorationArt } from "./class-art.js";
import { composedDossierArtFor } from "./dossier-art-layers.js";

export function composedDossierPortraitArt(classId,artDirection={}){
  try{
    const ids=artIds(artDirection),composition=composedDossierArtFor(ids.backgroundId,ids.pathId);
    if(!composition)return "";
    const classKey=normalize(classId),crest=classDecorationArt(classKey);
    if(!crest)return "";
    const key=escapeAttribute(composition.variantKey);
    const label=escapeAttribute(`Character Forge composed vignette: ${composition.background.symbol}, ${classKey} identity, and ${composition.path.symbol}`);
    return `<span class="ps-placeholder-illustrated ps-composed-dossier-portrait" data-composed-portrait="${key}" role="img" aria-label="${label}"><span class="ps-composed-art-field" aria-hidden="true"><svg class="ps-composed-background-art" viewBox="0 0 180 220" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${composition.background.vector}</g></svg><span class="ps-composed-class-crest">${crest}</span><svg class="ps-composed-path-art" viewBox="0 0 180 220" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${composition.path.vector}</g></svg></span></span><span class="ps-placeholder-emblem" aria-hidden="true">${crest}</span>`;
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
function normalize(value){
  try{return String(value||"").trim().toLowerCase();}
  catch(error){console.error("[dossier-art-layer-renderer] normalization failed",error);return"";}
}
function escapeAttribute(value){
  try{return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}
  catch(error){console.error("[dossier-art-layer-renderer] escaping failed",error);return"";}
}
