const OPTIONS=Object.freeze({
  packetMode:new Set(["deluxe","table"]),
  style:new Set(["ornate","classic","minimal"]),
  paper:new Set(["ivory","parchment","white"]),
  ornament:new Set(["rich","balanced","minimal"]),
  frame:new Set(["class","filigree","clean"]),
  printMode:new Set(["premium","ink-saver"]),
  portraitFilter:new Set(["natural","painted","grayscale"])
});

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
      packetMode:enumValue(source.packetMode,OPTIONS.packetMode,DEFAULT_SHEET_CUSTOMIZATION.packetMode),
      style:enumValue(source.style,OPTIONS.style,DEFAULT_SHEET_CUSTOMIZATION.style),
      paper:enumValue(source.paper,OPTIONS.paper,DEFAULT_SHEET_CUSTOMIZATION.paper),
      ornament:enumValue(source.ornament,OPTIONS.ornament,DEFAULT_SHEET_CUSTOMIZATION.ornament),
      frame:enumValue(source.frame,OPTIONS.frame,DEFAULT_SHEET_CUSTOMIZATION.frame),
      printMode:enumValue(source.printMode,OPTIONS.printMode,DEFAULT_SHEET_CUSTOMIZATION.printMode),
      portraitVisible:source.portraitVisible!==false,
      portraitX:clampNumber(source.portraitX,0,100,DEFAULT_SHEET_CUSTOMIZATION.portraitX),
      portraitY:clampNumber(source.portraitY,0,100,DEFAULT_SHEET_CUSTOMIZATION.portraitY),
      portraitZoom:clampNumber(source.portraitZoom,100,165,DEFAULT_SHEET_CUSTOMIZATION.portraitZoom),
      portraitFilter:enumValue(source.portraitFilter,OPTIONS.portraitFilter,DEFAULT_SHEET_CUSTOMIZATION.portraitFilter)
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

function enumValue(value,allowed,fallback){return allowed.has(value)?value:fallback;}
function clampNumber(value,min,max,fallback){const numeric=Number(value);return Number.isFinite(numeric)?Math.min(max,Math.max(min,numeric)):fallback;}
