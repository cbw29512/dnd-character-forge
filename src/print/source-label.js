export function printSourceLabel(source){
  try{
    if(!source?.version||source.page===undefined||source.page===null)throw new Error("Printable source requires version and page/section provenance.");
    const page=String(source.page).trim();if(!page)throw new Error("Printable source page/section cannot be empty.");
    const locator=/^\d/.test(page)?`p.${page}`:page;return`${source.version} · ${locator}`;
  }catch(error){console.error("[print-source] label formatting failed",error);throw error;}
}
