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
    const safeCharacter=legacySafeCharacter(character);
    renderBaseCharacter(safeCharacter,target);
    const list=target.querySelector(".reference-list");
    if(!list)throw new Error("Character sheet reference container was not rendered.");
    list.innerHTML=references.map(item=>`<article class="reference-item"><div class="reference-head"><strong>${escapeHtml(item.name)}</strong><span class="reference-tag">${escapeHtml(item.category)}</span></div><p>${escapeHtml(item.text)}</p><div class="reference-foot"><span class="reference-timing">${escapeHtml(item.timing)}</span>${sourceLabel(item.source)}</div></article>`).join("");
    ensureTopActions(target);
  }catch(error){
    console.error("[ui] routed character render failed",error);
    throw error;
  }
}

export function legacySafeCharacter(character){
  try{
    // Class-aware routing owns every Paladin/Ranger style reference, including
    // Blessed Warrior and Druidic Warrior. Fighter style state is the one
    // legacy dependency we intentionally preserve because its visible resource
    // summary still reads those fields before routed references are restored.
    const preserveLegacyFightingStyles=character?.class?.id==="fighter";
    return{
      ...character,
      features:[],
      feats:[],
      masteryIds:[],
      speciesTraits:[],
      background:{...character.background,feature:null},
      fightingStyle:preserveLegacyFightingStyles?character.fightingStyle:null,
      fightingStyles:preserveLegacyFightingStyles?character.fightingStyles:[]
    };
  }catch(error){
    console.error("[ui] legacy-safe character build failed",error);
    throw error;
  }
}

/*
 * The Forge is intentionally a one-direction cascade, but its primary
 * actions stay at the top. This lets a first-time visitor leave everything
 * Random and immediately Forge, then Reforge or Print without scrolling.
 */
function ensureTopActions(target){
  try{
    const workspace=document.querySelector(".forge-workspace"),forgeButton=document.getElementById("forgeButton");
    if(!workspace||!forgeButton)throw new Error("Forge action anchors are missing.");

    let bar=document.querySelector(".forge-action-bar");
    if(!bar){
      bar=document.createElement("section");
      bar.className="forge-action-bar";
      bar.setAttribute("aria-label","Character Forge actions");
      bar.innerHTML=`<div class="forge-action-copy"><span class="section-kicker">READY TO PLAY?</span><strong>Forge, reforge, or print</strong><small>Leave everything Random for a complete legal character, or set only the choices you care about.</small></div><div class="forge-action-buttons"></div>`;
      const hero=document.querySelector(".hero-copy");
      (hero||workspace.parentNode).parentNode?.insertBefore?.(bar,hero||workspace);
      if(!bar.parentNode)workspace.parentNode.insertBefore(bar,workspace);
    }

    const buttons=bar.querySelector(".forge-action-buttons");
    if(!buttons)throw new Error("Forge action button container is missing.");
    if(forgeButton.parentElement!==buttons)buttons.appendChild(forgeButton);
    forgeButton.classList.add("forge-action-primary");
    forgeButton.setAttribute("aria-label",`${characterLabel(target)?"Reforge":"Forge"} character`);
    forgeButton.querySelector(".button-arrow")?.replaceChildren(document.createTextNode("→"));
    const label=forgeButton.childNodes[1];
    if(label)label.nodeValue=` ${characterLabel(target)?"Reforge Character":"Forge Character"} `;

    let printButton=buttons.querySelector(".forge-action-print");
    if(!printButton){
      printButton=document.createElement("button");
      printButton.type="button";
      printButton.className="action-button forge-action-print";
      printButton.textContent="Print / Export PDF";
      buttons.appendChild(printButton);
      printButton.addEventListener("click",()=>{
        try{
          const source=target.querySelector('[data-action="print"]');
          if(!source)throw new Error("Generate a character before printing.");
          source.click();
        }catch(error){console.error("[ui] top print failed",error);throw error;}
      });
    }
    printButton.disabled=!target.querySelector('[data-action="print"]');
  }catch(error){
    console.error("[ui] top Forge actions failed",error);
    throw error;
  }
}

function characterLabel(target){
  try{return Boolean(target.querySelector(".character-sheet"));}
  catch(error){console.error("[ui] character action state failed",error);throw error;}
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
