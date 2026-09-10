import { classDecorationArt } from "./class-art.js";
import { classPortraitArt } from "./class-portrait-assets.js";
import { composedDossierArtFor } from "./dossier-art-layers.js";

const BACKGROUND_VECTOR=Object.freeze({
  "grave-warden":`<path opacity=".9" stroke-width="4" d="M18 190h72M28 190v-35h22v35m7 0v-49h24v49M31 155h16m14-14h16"/><path opacity=".55" stroke-width="2" d="M15 198c23-7 48-6 77 0"/>`,
  "deep-sailor":`<path opacity=".88" stroke-width="3" d="M18 183c13-9 25-9 38 0s25 9 38 0M18 194c13-9 25-9 38 0s25 9 38 0"/><circle opacity=".72" stroke-width="3" cx="50" cy="157" r="20"/><path opacity=".72" stroke-width="3" d="m50 143 5 14-5 14-5-14 5-14Z"/>`
});

const PATH_VECTOR=Object.freeze({
  "oath-beacon":`<path opacity=".9" stroke-width="4" d="M132 69h24l-4 42h-16l-4-42Zm4 42-8 25h32l-8-25M144 48v15m-18-4 10 8m26-8-10 8"/>`,
  "tempest-scout":`<path opacity=".9" stroke-width="4" d="M120 70c12-14 25-13 37-2 11-3 20 2 24 12-2 9-10 14-22 14h-34"/><path opacity=".92" stroke-width="5" d="m148 91-12 22h12l-9 23 25-31h-13l8-14"/>`
});

export function composedDossierPortraitArt(classId,artDirection={}){
  try{
    const ids=artIds(artDirection),composition=composedDossierArtFor(ids.backgroundId,ids.pathId),portrait=classPortraitArt(classId);
    if(!composition||!portrait)return "";
    const backgroundVector=BACKGROUND_VECTOR[composition.background.id],pathVector=PATH_VECTOR[composition.path.id];
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
  const backgroundId=normalize(artDirection?.backgroundId),pathId=normalize(artDirection?.pathId);
  if(backgroundId&&pathId)return{backgroundId,pathId};
  const [background="",path=""]=normalize(artDirection?.variantKey).split("--",2);
  return{backgroundId:background,pathId:path};
}
function normalize(value){try{return String(value||"").trim().toLowerCase();}catch(error){console.error("[dossier-art-layer-renderer] normalization failed",error);return"";}}
function escapeAttribute(value){try{return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}catch(error){console.error("[dossier-art-layer-renderer] escaping failed",error);return"";}}
