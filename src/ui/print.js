function safeTitle(value){
  try{return String(value||"Character").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();}
  catch(error){console.error("[print] title sanitization failed",error);throw error;}
}

export function exportCharacterPdf(character){
  try{
    if(!character)throw new Error("Forge a character before exporting a PDF.");
    if(!character.validation?.valid)throw new Error("Only validated characters can be exported.");
    const originalTitle=document.title;
    const subclass=character.subclass?.name?` - ${character.subclass.name}`:"";
    document.title=safeTitle(`${character.name} - Level ${character.level} ${character.class.name}${subclass} - Character Forge`);
    const restore=()=>{try{document.title=originalTitle;window.removeEventListener("afterprint",restore);}catch(error){console.error("[print] title restore failed",error);}};
    window.addEventListener("afterprint",restore,{once:true});
    window.print();
    window.setTimeout(()=>{if(document.title!==originalTitle)restore();},1000);
  }catch(error){console.error("[print] PDF export failed",error);throw error;}
}
