const PROVENANCE="Original Character Forge vector layer";

export const DOSSIER_BACKGROUND_LAYERS=Object.freeze({
  "grave-warden":makeLayer("grave-warden","background","unmarked grave",`
    <circle opacity=".18" cx="42" cy="48" r="27"/>
    <path opacity=".5" stroke-width="2.4" d="M11 57c24-16 45-17 66-3 13 9 26 12 40 9"/>
    <path opacity=".72" stroke-width="3.4" d="M16 189h103M26 189v-39h25v39m9 0v-55h29v55m9 0v-31h20v31"/>
    <path opacity=".46" stroke-width="2.1" d="M29 150h19m17-16h19m18 24h13M18 199c28-8 59-8 101 0"/>
    <path opacity=".34" stroke-width="2" d="M133 28c-8 15-7 31 4 47m-4-24 17-11m-14 26 19 5"/>`),
  "deep-sailor":makeLayer("deep-sailor","background","salt-stained chart",`
    <circle opacity=".36" stroke-width="2.8" cx="43" cy="154" r="30"/>
    <circle opacity=".18" stroke-width="1.4" cx="43" cy="154" r="22"/>
    <path opacity=".62" stroke-width="3" d="m43 128 7 26-7 26-7-26 7-26Zm-26 26h52M24 135l38 38m0-38-38 38"/>
    <path opacity=".72" stroke-width="3.1" d="M7 187c14-10 28-10 42 0s28 10 42 0 28-10 42 0 28 10 40 1M7 199c14-10 28-10 42 0s28 10 42 0 28-10 42 0 28 10 40 1"/>
    <path opacity=".46" stroke-width="2.2" stroke-dasharray="5 5" d="M18 91c27-22 53-25 79-10 21 12 38 9 54-8"/>
    <path opacity=".3" stroke-width="1.8" d="M20 78 8 67m21 5L18 58m108 13 14-14m-8 25 20-4"/>`)
});

export const DOSSIER_PATH_LAYERS=Object.freeze({
  "oath-beacon":makeLayer("oath-beacon","path","beacon in smoke",`
    <path opacity=".92" stroke-width="4" d="M126 76h26l-4 72h-18l-4-72Zm5 72-10 28h36l-10-28M139 44v22m-27-8 18 11m36-11-18 11"/>
    <path opacity=".58" stroke-width="2.4" d="M115 87c-10 7-12 17-5 29m59-29c10 7 12 17 5 29M102 57l20 9m36 0 20-9"/>
    <circle opacity=".2" stroke-width="2" cx="139" cy="87" r="48"/>`),
  "tempest-scout":makeLayer("tempest-scout","path","storm road",`
    <path opacity=".82" stroke-width="3.5" d="M102 66c14-17 31-18 47-4 13-4 24 3 29 16-4 12-15 18-32 18h-39"/>
    <path opacity=".96" stroke-width="6" d="m137 91-19 34h16l-17 38 39-50h-18l13-22"/>
    <path opacity=".52" stroke-width="2.5" d="M16 111h62m-72 16h86M24 145h61m77-26h15m-22 17h22"/>
    <path opacity=".34" stroke-width="2" d="M84 101c16 4 27 13 34 27M72 145c18 0 32 6 42 18"/>`)
});

export function isApprovedDossierArtLayer(entry,id,role){
  try{
    const key=normalize(id);
    return Boolean(
      key&&entry&&entry.id===key&&entry.role===role&&entry.status==="approved"&&
      typeof entry.symbol==="string"&&entry.symbol.length>0&&
      typeof entry.vector==="string"&&entry.vector.length>80&&entry.vector.includes("<")&&
      typeof entry.provenance==="string"&&entry.provenance.length>0
    );
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

function makeLayer(id,role,symbol,vector){return Object.freeze({id,role,symbol,vector,status:"approved",provenance:PROVENANCE});}
function normalize(value){
  try{return String(value||"").trim().toLowerCase();}
  catch(error){console.error("[dossier-art-layers] normalization failed",error);return"";}
}
