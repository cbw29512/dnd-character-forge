import { classDecorationArt } from "./class-art.js";
import { composedDossierArtFor } from "./dossier-art-layers.js";

export function composedDossierPortraitArt(classId,artDirection={}){
  try{
    const ids=artIds(artDirection),composition=composedDossierArtFor(ids.backgroundId,ids.pathId);
    if(!composition)return "";
    const classKey=normalize(classId),crest=classDecorationArt(classKey),crestBody=svgBody(crest);
    if(!crestBody)return "";
    const key=escapeAttribute(composition.variantKey);
    const label=escapeAttribute(`Character Forge composed vignette: ${composition.background.symbol}, ${classKey} identity, and ${composition.path.symbol}`);
    const scene=`<svg class="ps-placeholder-illustrated ps-composed-dossier-portrait ps-composed-scene" data-composed-portrait="${key}" role="img" aria-label="${label}" viewBox="0 0 180 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"><rect width="180" height="220" fill="#243b2d"/><circle cx="46" cy="154" r="43" fill="#45604a" opacity=".42"/><circle cx="135" cy="72" r="48" fill="#314c3b" opacity=".58"/><g class="ps-composed-background-art" fill="none" stroke="#dce8c7" stroke-linecap="round" stroke-linejoin="round">${composition.background.vector}</g><g class="ps-composed-class-crest" color="#ffe7a6" opacity=".9" transform="translate(10 8) scale(.89 .92)">${crestBody}</g><g class="ps-composed-path-art" fill="none" stroke="#ffe39a" stroke-linecap="round" stroke-linejoin="round">${composition.path.vector}</g><rect x="4" y="4" width="172" height="212" rx="2" fill="none" stroke="#f0d99b" stroke-width="1.8" opacity=".72"/></svg>`;
    return `${scene}<span class="ps-placeholder-emblem" aria-hidden="true">${crest}</span>`;
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

function svgBody(svg){
  try{
    const value=String(svg||""),start=value.indexOf(">"),end=value.lastIndexOf("</svg>");
    if(!value.startsWith("<svg")||start<0||end<=start)throw new Error("class crest SVG is malformed");
    return value.slice(start+1,end);
  }catch(error){console.error("[dossier-art-layer-renderer] crest extraction failed",error);return"";}
}
function normalize(value){
  try{return String(value||"").trim().toLowerCase();}
  catch(error){console.error("[dossier-art-layer-renderer] normalization failed",error);return"";}
}
function escapeAttribute(value){
  try{return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}
  catch(error){console.error("[dossier-art-layer-renderer] escaping failed",error);return"";}
}
