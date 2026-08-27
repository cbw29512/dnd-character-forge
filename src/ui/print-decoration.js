import { classPlaceholderArt } from "../print/class-art.js";

export function sheetArticleOpen(model,extraClass=""){
  try{
    const classes=["premium-sheet",extraClass,`theme-${safeToken(model.theme.id)}`,`class-${safeToken(model.identity?.classId)}`,model.presentation?.classes||""].filter(Boolean).join(" ");
    const presentation=String(model.presentation?.style||"").replace(/["<>]/g,"");
    const separator=presentation&&!presentation.endsWith(";")?";":"";
    return `<article class="${classes}" data-print-class="${escapeHtml(model.identity?.classId||"adventurer")}" style="${presentation}${separator}${classPaletteVariables(model.theme)}">`;
  }catch(error){console.error("[print-decoration] article open failed",error);throw error;}
}

export function classWatermark(model){
  try{
    const art=classPlaceholderArt(model.identity.classId),className=model.theme.className||model.identity.className,label=model.theme.label||"Character Forge",rail=model.theme.rail||model.theme.visualIdentity||"",glyph=model.theme.glyph||"◆",motif=String(model.theme.motif||"").replace(/-/g," ");
    return `<div class="ps-class-watermark" aria-hidden="true">${art}</div><div class="ps-class-ornaments" aria-hidden="true"><i class="ps-ornament ps-ornament-tl">${art}</i><i class="ps-ornament ps-ornament-tr">${art}</i><i class="ps-ornament ps-ornament-bl">${art}</i><i class="ps-ornament ps-ornament-br">${art}</i></div><div class="ps-class-signature" aria-hidden="true"><span class="ps-signature-rail ps-signature-left">${escapeHtml(glyph)} · ${escapeHtml(rail)} · ${escapeHtml(glyph)}</span><span class="ps-signature-rail ps-signature-right">${escapeHtml(glyph)} · ${escapeHtml(rail)} · ${escapeHtml(glyph)}</span><span class="ps-signature-seal"><b>${escapeHtml(glyph)}</b><em>${escapeHtml(className)}</em><b>${escapeHtml(glyph)}</b></span></div><div class="ps-theme-ribbon" aria-hidden="true"><span>${escapeHtml(className)}</span><small>${escapeHtml(label)} · ${escapeHtml(motif)}</small></div>`;
  }catch(error){console.error("[print-decoration] watermark failed",error);throw error;}
}

export function classIdentityKicker(model){
  try{const className=model.theme.className||model.identity.className,glyph=model.theme.glyph||"◆",label=model.theme.label||"Character Forge";return `<div class="ps-identity-kicker"><b>${escapeHtml(glyph)} ${escapeHtml(className)}</b><span>${escapeHtml(label)}</span></div>`;}
  catch(error){console.error("[print-decoration] identity kicker failed",error);throw error;}
}

export function portraitImageStyle(model){
  try{return `object-position:var(--portrait-x) var(--portrait-y);transform:scale(var(--portrait-zoom));transform-origin:var(--portrait-x) var(--portrait-y)`;}
  catch(error){console.error("[print-decoration] portrait style failed",error);return"";}
}

function classPaletteVariables(theme){
  try{const p=theme?.palette;if(!p)return"";return `--class-primary:${cssValue(p.primary)};--class-dark:${cssValue(p.dark)};--class-accent:${cssValue(p.accent)};--class-frame:${cssValue(p.frame)};--class-glow:${cssValue(p.glow)};`;}
  catch(error){console.error("[print-decoration] class palette variables failed",error);return"";}
}
function cssValue(value){const text=String(value||"").trim();return /^#[0-9a-f]{3,8}$/i.test(text)||/^rgba?\([0-9.,%\s]+\)$/i.test(text)?text:"transparent";}
function safeToken(value){return String(value||"parchment").replace(/[^a-z0-9_-]/gi,"");}
function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));}
