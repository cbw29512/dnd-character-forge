export const PRODUCT_INFO=Object.freeze({
  name:"Character Forge",
  version:"0.9.0-audit.1",
  channel:"audit"
});

export function renderProductInfo(){
  try{
    if(typeof document==="undefined")return;
    const footer=document.querySelector(".site-footer");
    if(!footer)return;
    let node=document.getElementById("productBuildInfo");
    if(!node){
      node=document.createElement("p");
      node.id="productBuildInfo";
      node.className="product-build-info";
      footer.append(node);
    }
    node.textContent=`${PRODUCT_INFO.name} v${PRODUCT_INFO.version} · ${PRODUCT_INFO.channel} build`;
    document.documentElement.dataset.appVersion=PRODUCT_INFO.version;
    document.documentElement.dataset.buildChannel=PRODUCT_INFO.channel;
  }catch(error){console.error("[product-info] render failed",error);throw error;}
}

function bootProductInfo(){
  try{
    if(typeof document==="undefined")return;
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",renderProductInfo,{once:true});
    else renderProductInfo();
  }catch(error){console.error("[product-info] boot failed",error);throw error;}
}

bootProductInfo();
