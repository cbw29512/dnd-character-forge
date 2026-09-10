import { classDecorationArt, classPlaceholderArt } from "./class-art.js";

const graveWardenOathBeacon=new URL("./dossier-portraits/grave-warden--oath-beacon.svg",import.meta.url).href;

// Curated dossier portraits are presentation-only. Each approved entry must be
// keyed by the literary engine's deterministic background--path variant key.
// Assets are added deliberately; an absent variant always falls back safely.
export const CURATED_DOSSIER_PORTRAITS=Object.freeze({
  "grave-warden--oath-beacon":Object.freeze({
    variantKey:"grave-warden--oath-beacon",
    src:graveWardenOathBeacon,
    backgroundSymbol:"unmarked grave",
    pathSymbol:"beacon in smoke",
    status:"approved",
    provenance:"Original Character Forge vector illustration"
  })
});

export function isCuratedDossierPortraitEntry(entry,variantKey){
  try{
    const key=normalizeVariantKey(variantKey);
    return Boolean(
      key&&entry&&
      entry.variantKey===key&&
      typeof entry.src==="string"&&entry.src.length>0&&
      typeof entry.backgroundSymbol==="string"&&entry.backgroundSymbol.length>0&&
      typeof entry.pathSymbol==="string"&&entry.pathSymbol.length>0&&
      entry.status==="approved"&&
      typeof entry.provenance==="string"&&entry.provenance.length>0
    );
  }catch(error){
    console.error("[dossier-portrait-assets] entry validation failed",error);
    return false;
  }
}

export function curatedDossierPortraitFor(variantKey){
  try{
    const key=normalizeVariantKey(variantKey),entry=CURATED_DOSSIER_PORTRAITS[key];
    return isCuratedDossierPortraitEntry(entry,key)?entry:null;
  }catch(error){
    console.error("[dossier-portrait-assets] curated lookup failed",error);
    return null;
  }
}

export function dossierFallbackArt(classId,artDirection={}){
  try{
    const variantKey=normalizeVariantKey(artDirection?.variantKey),entry=curatedDossierPortraitFor(variantKey);
    if(!entry)return classPlaceholderArt(classId);
    const source=escapeAttribute(entry.src),label=escapeAttribute(`Character Forge illustration: ${entry.backgroundSymbol} and ${entry.pathSymbol}`);
    return `<span class="ps-placeholder-illustrated ps-curated-dossier-portrait" data-curated-portrait="${escapeAttribute(variantKey)}"><img class="ps-class-portrait-image" src="${source}" alt="${label}" decoding="sync" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block"></span><span class="ps-placeholder-emblem" aria-hidden="true">${classDecorationArt(String(classId||"").trim().toLowerCase())}</span>`;
  }catch(error){
    console.error("[dossier-portrait-assets] fallback render failed",error);
    return classPlaceholderArt(classId);
  }
}

export function curatedDossierPortraitIds(){
  try{return Object.freeze(Object.keys(CURATED_DOSSIER_PORTRAITS));}
  catch(error){console.error("[dossier-portrait-assets] id listing failed",error);return Object.freeze([]);}
}

function normalizeVariantKey(value){
  try{return String(value||"").trim().toLowerCase();}
  catch(error){console.error("[dossier-portrait-assets] variant normalization failed",error);return"";}
}

function escapeAttribute(value){
  try{return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}
  catch(error){console.error("[dossier-portrait-assets] attribute escaping failed",error);return"";}
}
