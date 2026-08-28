const PRINT_MODES=new Set(["premium","ink-saver"]);

// The printable sheet now has one production-quality presentation preset.
// Players only choose whether that preset prints in full color or black & white.
// Keeping the legacy object shape avoids breaking previously saved characters.
export const DEFAULT_SHEET_CUSTOMIZATION=Object.freeze({
  packetMode:"deluxe",
  style:"ornate",
  paper:"ivory",
  ornament:"rich",
  frame:"class",
  printMode:"premium",
  portraitVisible:true,
  portraitX:50,
  portraitY:32,
  portraitZoom:100,
  portraitFilter:"natural"
});

export function createDefaultSheetCustomization(){
  try{return{...DEFAULT_SHEET_CUSTOMIZATION};}
  catch(error){console.error("[sheet-customization] default creation failed",error);throw error;}
}

export function normalizeSheetCustomization(input={}){
  try{
    const source=input&&typeof input==="object"?input:{};
    return Object.freeze({
      ...DEFAULT_SHEET_CUSTOMIZATION,
      printMode:PRINT_MODES.has(source.printMode)?source.printMode:DEFAULT_SHEET_CUSTOMIZATION.printMode
    });
  }catch(error){console.error("[sheet-customization] normalization failed",error);throw error;}
}

export function sheetCustomizationClasses(input={}){
  try{
    const value=normalizeSheetCustomization(input);
    return [
      `sheet-packet-${value.packetMode}`,
      `sheet-style-${value.style}`,
      `sheet-paper-${value.paper}`,
      `sheet-ornament-${value.ornament}`,
      `sheet-frame-${value.frame}`,
      `sheet-print-${value.printMode}`,
      `portrait-filter-${value.portraitFilter}`
    ].join(" ");
  }catch(error){console.error("[sheet-customization] class build failed",error);throw error;}
}

export function sheetCustomizationStyle(input={}){
  try{
    const value=normalizeSheetCustomization(input);
    return `--portrait-x:${value.portraitX}%;--portrait-y:${value.portraitY}%;--portrait-zoom:${value.portraitZoom/100}`;
  }catch(error){console.error("[sheet-customization] style build failed",error);throw error;}
}
