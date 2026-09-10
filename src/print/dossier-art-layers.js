const PROVENANCE="Original Character Forge vector layer";

export const DOSSIER_BACKGROUND_LAYERS=Object.freeze({
  "grave-warden":makeLayer("grave-warden","background","unmarked grave"),
  "deep-sailor":makeLayer("deep-sailor","background","salt-stained chart")
});

export const DOSSIER_PATH_LAYERS=Object.freeze({
  "oath-beacon":makeLayer("oath-beacon","path","beacon in smoke"),
  "tempest-scout":makeLayer("tempest-scout","path","storm road")
});

export function isApprovedDossierArtLayer(entry,id,role){
  try{
    const key=normalize(id);
    return Boolean(key&&entry&&entry.id===key&&entry.role===role&&entry.status==="approved"&&typeof entry.symbol==="string"&&entry.symbol.length>0&&typeof entry.provenance==="string"&&entry.provenance.length>0);
  }catch(error){
    console.error("[dossier-art-layers] layer validation failed",error);
    return false;
  }
}

export function composedDossierArtFor(backgroundId,pathId){
  try{
    const backgroundKey=normalize(backgroundId),pathKey=normalize(pathId);
    const background=DOSSIER_BACKGROUND_LAYERS[backgroundKey],path=DOSSIER_PATH_LAYERS[pathKey];
    if(!isApprovedDossierArtLayer(background,backgroundKey,"background"))return null;
    if(!isApprovedDossierArtLayer(path,pathKey,"path"))return null;
    return Object.freeze({background,path,variantKey:`${backgroundKey}--${pathKey}`});
  }catch(error){
    console.error("[dossier-art-layers] composition lookup failed",error);
    return null;
  }
}

function makeLayer(id,role,symbol){return Object.freeze({id,role,symbol,status:"approved",provenance:PROVENANCE});}
function normalize(value){
  try{return String(value||"").trim().toLowerCase();}
  catch(error){console.error("[dossier-art-layers] normalization failed",error);return"";}
}
