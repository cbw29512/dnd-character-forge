const PROVENANCE="Original Character Forge vector layer";

export const DOSSIER_BACKGROUND_LAYERS=Object.freeze({
  "grave-warden":makeLayer("grave-warden","background","unmarked grave",`<path opacity=".9" stroke-width="4" d="M18 190h72M28 190v-35h22v35m7 0v-49h24v49M31 155h16m14-14h16"/><path opacity=".55" stroke-width="2" d="M15 198c23-7 48-6 77 0"/>`),
  "deep-sailor":makeLayer("deep-sailor","background","salt-stained chart",`<path opacity=".88" stroke-width="3" d="M18 183c13-9 25-9 38 0s25 9 38 0M18 194c13-9 25-9 38 0s25 9 38 0"/><circle opacity=".72" stroke-width="3" cx="50" cy="157" r="20"/><path opacity=".72" stroke-width="3" d="m50 143 5 14-5 14-5-14 5-14Z"/>`)
});

export const DOSSIER_PATH_LAYERS=Object.freeze({
  "oath-beacon":makeLayer("oath-beacon","path","beacon in smoke",`<path opacity=".9" stroke-width="4" d="M132 69h24l-4 42h-16l-4-42Zm4 42-8 25h32l-8-25M144 48v15m-18-4 10 8m26-8-10 8"/>`),
  "tempest-scout":makeLayer("tempest-scout","path","storm road",`<path opacity=".9" stroke-width="4" d="M120 70c12-14 25-13 37-2 11-3 20 2 24 12-2 9-10 14-22 14h-34"/><path opacity=".92" stroke-width="5" d="m148 91-12 22h12l-9 23 25-31h-13l8-14"/>`)
});

export function isApprovedDossierArtLayer(entry,id,role){
  try{
    const key=normalize(id);
    return Boolean(
      key&&entry&&entry.id===key&&entry.role===role&&entry.status==="approved"&&
      typeof entry.symbol==="string"&&entry.symbol.length>0&&
      typeof entry.vector==="string"&&entry.vector.length>20&&entry.vector.includes("<")&&
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
