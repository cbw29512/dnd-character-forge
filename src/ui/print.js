function safeTitle(value){
  try{return String(value||"Character").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();}
  catch(error){console.error("[print] title sanitization failed",error);throw error;}
}

export function exportCharacterPdf(character){
  const originalTitle=document.title;
  try{
    if(!character)throw new Error("Forge a character before exporting a PDF.");
    if(!character.validation?.valid)throw new Error("Only validated characters can be exported.");
    const subclass=character.subclass?.name?` - ${character.subclass.name}`:"";
    document.title=safeTitle(`${character.name} - Level ${character.level} ${character.class.name}${subclass} - Character Forge`);
    window.print();
  }catch(error){console.error("[print] PDF export failed",error);throw error;}
  finally{
    try{document.title=originalTitle;}
    catch(error){console.error("[print] title restore failed",error);}
  }
}
