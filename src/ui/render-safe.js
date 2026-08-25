import { renderCharacter as renderBaseCharacter } from "./render.js";
import { buildQuickReference } from "../rules/reference-router.js";

/**
 * Render the character sheet using the class-aware quick-reference router.
 *
 * The legacy screen renderer still owns the visual sheet, so this adapter
 * deliberately keeps that renderer intact while preventing its older core
 * reference path from rejecting class-specific features. The routed
 * references are rendered back into the same Play Reference card.
 */
export function renderCharacter(character,target){
  try{
    const references=buildQuickReference(character);
    const safeCharacter={
      ...character,
      // Class/subclass features are supplied by the class-aware router.
      features:[],
      // Feat references are also supplied by the routed result.
      feats:[],
      // Weapon mastery references are supplied by the routed result.
      masteryIds:[],
      // Species/background references are supplied by the routed result.
      speciesTraits:[],
      background:{...character.background,feature:null}
    };
    renderBaseCharacter(safeCharacter,target);
    const list=target.querySelector(".reference-list");
    if(!list)throw new Error("Character sheet reference container was not rendered.");
    list.innerHTML=references.map(item=>`<article class="reference-item"><div class="reference-head"><strong>${escapeHtml(item.name)}</strong><span class="reference-tag">${escapeHtml(item.category)}</span></div><p>${escapeHtml(item.text)}</p><div class="reference-foot"><span class="reference-timing">${escapeHtml(item.timing)}</span>${sourceLabel(item.source)}</div></article>`).join("");
  }catch(error){
    console.error("[ui] routed character render failed",error);
    throw error;
  }
}

function escapeHtml(value){
  try{
    return String(value??"").replace(/[&<>\'\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  }catch(error){console.error("[ui] reference escape failed",error);throw error;}
}

function sourceLabel(source){
  try{
    if(!source?.version||!source?.page)throw new Error("Routed rule is missing provenance.");
    return `<small class="reference-source">${escapeHtml(source.version)} · p.${escapeHtml(source.page)}</small>`;
  }catch(error){console.error("[ui] routed source label failed",error);throw error;}
}
