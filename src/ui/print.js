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
  try{
    if(!character)throw new Error("Forge a character before exporting a PDF.");
    if(!character.validation?.valid)throw new Error("Only validated characters can be exported.");
    const subclass=character.subclass?.name?` - ${character.subclass.name}`:"";
    document.title=safeTitle(`${character.name} - Level ${character.level} ${character.class.name}${subclass} - Character Forge`);
    renderPremiumPrintSheet(character,root);root.setAttribute("aria-hidden","false");document.body.classList.add("premium-print-active");window.print();
  }catch(error){console.error("[print] PDF export failed",error);throw error;}
  finally{
    try{document.body.classList.remove("premium-print-active");root.innerHTML="";root.setAttribute("aria-hidden","true");document.title=originalTitle;}
    catch(error){console.error("[print] export cleanup failed",error);}
  }
}
