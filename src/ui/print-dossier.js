import { classPlaceholderArt } from "../print/class-art.js";
import { classWatermark, portraitImageStyle, sheetArticleOpen } from "./print-decoration.js";

const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function renderPrintDossier(m){
  try{
    if(!m.dossier||m.presentation?.customization?.packetMode!=="deluxe")return"";
    const d=m.dossier,page=m.packet.totalPages;
    return `${sheetArticleOpen(m,"ps-dossier-page")}<div class="ps-frame ps-dossier-frame">${classWatermark(m)}${header(m,d)}<main class="ps-dossier-body"><div class="ps-dossier-main">${story(d)}${panel("Roleplay Notes",roleplay(d),"ps-dossier-roleplay")}${panel("Combat Notes",list(d.combatNotes),"ps-dossier-combat")}</div><aside class="ps-dossier-side">${panel("Personality",personality(d),"ps-dossier-personality")}${panel("Appearance & Bearing",list(d.appearance),"ps-dossier-appearance")}${panel("Allies, Leads & Hooks",list(d.hooks),"ps-dossier-hooks")}</aside></main><footer class="ps-footer"><span>${esc(d.disclaimer)}</span><span class="ps-audit">✓ ${esc(m.audit.status)} · ${esc(m.audit.version)} · Narrative flavor · Page ${page}/${page}</span></footer></div></article>`;
  }catch(error){console.error("[print-dossier] render failed",error);throw error;}
}

function header(m,d){return `<header class="ps-dossier-header">${portrait(m,d)}<section class="ps-dossier-title"><small>Deluxe Character Dossier</small><h1>${esc(m.identity.name)}</h1><p>${esc(d.subtitle)}</p><blockquote>“${esc(d.roleplay.quote)}”</blockquote></section><section class="ps-dossier-seal"><span>${esc(m.theme.label)}</span><small>${esc(m.identity.background)}</small><b>${esc(m.identity.className)} ${m.identity.level}</b></section></header>`;}
function portrait(m,d){
  if(m.portraitDataUrl)return `<section class="ps-dossier-portrait"><div class="ps-dossier-portrait-art has-image"><img src="${esc(m.portraitDataUrl)}" alt="" style="${portraitImageStyle(m)}"></div></section>`;
  const art=d.artDirection||{},variant=art.variantKey||m.identity.classId,background=art.backgroundSymbol||m.identity.background,path=art.pathSymbol||m.identity.subclassName||m.identity.className;
  return `<section class="ps-dossier-portrait"><div class="ps-dossier-portrait-art ps-narrative-fallback class-${esc(m.identity.classId)}" data-portrait-variant="${esc(variant)}">${classPlaceholderArt(m.identity.classId)}<span class="ps-narrative-motif ps-narrative-origin">${esc(background)}</span><span class="ps-narrative-motif ps-narrative-path">${esc(path)}</span></div></section>`;
}
function story(d){return `<section class="ps-dossier-story"><h2>Backstory</h2>${d.storyTitle?`<p class="ps-dossier-story-title">${esc(d.storyTitle)}</p>`:""}<div class="ps-dossier-story-copy">${d.backstory.map(text=>`<p>${esc(text)}</p>`).join("")}</div>${chronicle()}</section>`;}
function chronicle(){return `<section class="ps-dossier-chronicle" aria-label="Campaign Chronicle"><header><h3>Campaign Chronicle</h3><small>Milestones · Allies · Debts · Revelations · Session Notes</small></header><div class="ps-dossier-chronicle-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div></section>`;}
function personality(d){const p=d.personality;return `<dl class="ps-dossier-traits"><div><dt>Trait</dt><dd>${esc(p.trait)}</dd></div><div><dt>Ideal</dt><dd>${esc(p.ideal)}</dd></div><div><dt>Bond</dt><dd>${esc(p.bond)}</dd></div><div><dt>Flaw</dt><dd>${esc(p.flaw)}</dd></div><div><dt>Fear</dt><dd>${esc(p.fear)}</dd></div><div><dt>Secret</dt><dd>${esc(p.secret)}</dd></div></dl><p class="ps-dossier-tags"><b>Mannerisms:</b> ${esc(p.mannerisms.join(" · "))}</p><p class="ps-dossier-tags"><b>Likes:</b> ${esc(p.likes.join(" · "))}</p><p class="ps-dossier-tags"><b>Dislikes:</b> ${esc(p.dislikes.join(" · "))}</p>`;}
function roleplay(d){return `<blockquote>“${esc(d.roleplay.quote)}”</blockquote><p>${esc(d.roleplay.guidance)}</p>`;}
function list(values){return `<ul>${values.map(value=>`<li>${esc(value)}</li>`).join("")}</ul>`;}
function panel(title,content,className=""){return `<section class="ps-dossier-panel ${className}"><h2>${esc(title)}</h2><div>${content}</div></section>`;}
