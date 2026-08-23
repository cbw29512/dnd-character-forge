import { classPlaceholderArt } from "../print/class-art.js";

export function sheetArticleOpen(model,extraClass=""){
  try{
    const classes=["premium-sheet",extraClass,`theme-${safeToken(model.theme.id)}`,model.presentation?.classes||""].filter(Boolean).join(" ");
    const style=String(model.presentation?.style||"").replace(/["<>]/g,"");
    return `<article class="${classes}" style="${style}">`;
  }catch(error){console.error("[print-decoration] article open failed",error);throw error;}
}

export function classWatermark(model){
  try{return `<div class="ps-class-watermark" aria-hidden="true">${classPlaceholderArt(model.identity.classId)}</div><div class="ps-theme-ribbon" aria-hidden="true"><span>${escapeHtml(model.theme.label)}</span><small>${escapeHtml(model.theme.motif)}</small></div>`;}
  catch(error){console.error("[print-decoration] watermark failed",error);throw error;}
}

export function portraitImageStyle(model){
  try{return `object-position:var(--portrait-x) var(--portrait-y);transform:scale(var(--portrait-zoom));transform-origin:var(--portrait-x) var(--portrait-y)`;}
  catch(error){console.error("[print-decoration] portrait style failed",error);return"";}
}

function safeToken(value){return String(value||"parchment").replace(/[^a-z0-9_-]/gi,"");}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}
