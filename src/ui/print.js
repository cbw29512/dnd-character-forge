import { renderPremiumPrintSheet } from "./premium-print.js";

function safeTitle(value){
  try{return String(value||"Character").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();}
  catch(error){console.error("[print] title sanitization failed",error);throw error;}
}
function printRoot(){
  try{
    let root=document.getElementById("premiumPrintRoot");
    if(!root){root=document.createElement("div");root.id="premiumPrintRoot";root.className="premium-print-root";root.setAttribute("aria-hidden","true");document.body.appendChild(root);}
    return root;
  }catch(error){console.error("[print] premium root failed",error);throw error;}
}
export function exportCharacterPdf(character){
  const originalTitle=document.title,root=printRoot();
  let cleaned=false,cleanupTimer=null;
  const cleanup=()=>{
    if(cleaned)return;
    cleaned=true;
    if(cleanupTimer)window.clearTimeout(cleanupTimer);
    try{document.body.classList.remove("premium-print-active");root.innerHTML="";root.setAttribute("aria-hidden","true");document.title=originalTitle;}
    catch(error){console.error("[print] export cleanup failed",error);}
  };
  try{
    if(!character)throw new Error("Forge a character before exporting a PDF.");
    if(!character.validation?.valid)throw new Error("Only validated characters can be exported.");
    const subclass=character.subclass?.name?` - ${character.subclass.name}`:"";
    document.title=safeTitle(`${character.name} - Level ${character.level} ${character.class.name}${subclass} - Character Forge`);
    renderPremiumPrintSheet(character,root);
    root.setAttribute("aria-hidden","false");
    document.body.classList.add("premium-print-active");

    // Mobile Safari/Chrome require window.print() to run in the same user-gesture
    // turn as the tap. Awaiting image.decode()/timers here can consume that
    // transient activation and make the Print button appear to do nothing.
    // The premium root is hidden outside print media, so it is safe to keep it
    // mounted until afterprint while the browser finishes preparing the sheet.
    primePrintImages(root);
    void root.offsetHeight;
    window.addEventListener("afterprint",cleanup,{once:true});
    window.print();
    if(!cleaned)cleanupTimer=window.setTimeout(cleanup,30000);
  }catch(error){
    cleanup();
    console.error("[print] PDF export failed",error);
    throw error;
  }
}
function primePrintImages(root){
  try{
    for(const image of root.querySelectorAll("img")){
      if(typeof image.decode==="function")image.decode().catch(()=>{});
    }
  }catch(error){console.warn("[print] image priming failed; continuing with browser print",error);}
}
