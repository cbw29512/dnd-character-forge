import { renderCharacter as renderBaseCharacter } from "./render.js";
import { buildQuickReference } from "../rules/reference-router.js";
import { characterActiveSpellReferences } from "../rules/spell-reference.js";

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
    ensure2014SpellReference(character,target);
    const list=target.querySelector(".reference-list");
    if(!list)throw new Error("Character sheet reference container was not rendered.");
    list.innerHTML=references.map(item=>`<article class="reference-item"><div class="reference-head"><strong>${escapeHtml(item.name)}</strong><span class="reference-tag">${escapeHtml(item.category)}</span></div><p>${escapeHtml(item.text)}</p><div class="reference-foot"><span class="reference-timing">${escapeHtml(item.timing)}</span>${sourceLabel(item.source)}</div></article>`).join("");
    ensureTopActions(target);
    ensureHomeNavigation();
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
      // The legacy renderer still interpolates these identity labels directly
      // into innerHTML. Escape them here even though saved-character reopening
      // also restores canonical catalog objects; this keeps the render boundary
      // safe if another caller ever supplies a non-canonical character object.
      class:character.class?{...character.class,name:escapeHtml(character.class.name)}:character.class,
      subclass:character.subclass?{...character.subclass,name:escapeHtml(character.subclass.name)}:character.subclass,
      background:character.background?{...character.background,name:escapeHtml(character.background.name),feature:null}:character.background,
      features:[],
      feats:[],
      masteryIds:[],
      speciesTraits:[],
      fightingStyle:preserveLegacyFightingStyles?character.fightingStyle:null,
      fightingStyles:preserveLegacyFightingStyles?character.fightingStyles:[]
    };
  }catch(error){
    console.error("[ui] legacy-safe character build failed",error);
    throw error;
  }
}

function ensure2014SpellReference(character,target){
  try{
    if(character?.ruleset!=="2014")return;
    const refs=characterActiveSpellReferences(character);
    if(!refs.length)return;
    const grid=target.querySelector(".detail-grid");
    if(!grid)throw new Error("Character sheet detail grid was not rendered.");
    if(grid.querySelector('[data-spell-reference-edition="2014"]'))return;
    const card=document.createElement("section");
    card.className="detail-card span-2";
    card.dataset.spellReferenceEdition="2014";
    card.innerHTML=`<h3>Spell Reference</h3><div class="spell-reference-grid">${refs.map(spell=>spellReferenceCard(spell)).join("")}</div>`;
    const spellcasting=[...grid.querySelectorAll(".detail-card")].find(item=>item.querySelector("h3")?.textContent?.trim()==="Spellcasting");
    if(spellcasting)spellcasting.insertAdjacentElement("afterend",card);else grid.appendChild(card);
  }catch(error){
    console.error("[ui] 2014 spell reference render failed",error);
    throw error;
  }
}

function spellReferenceCard(spell){
  try{
    return `<article class="spell-reference-card"><div class="spell-reference-head"><div><strong>${escapeHtml(spell.name)}</strong><span>${spell.level===0?"Cantrip":`Level ${spell.level}`} · ${escapeHtml(spell.school)} · ${escapeHtml(spell.preparation)}</span></div><span>${escapeHtml(spell.castingTime)}</span></div><div class="spell-reference-meta"><span>${escapeHtml(spell.range)}</span><span>${escapeHtml(spell.duration)}</span><span>${escapeHtml(spell.components)}</span><span>${escapeHtml(spell.resolution)}</span></div>${spell.currentEffect?`<b>${escapeHtml(spell.currentEffect)}</b>`:""}<p>${escapeHtml(spell.effect)}</p>${spell.upcast?`<p class="spell-upcast"><strong>Higher slot:</strong> ${escapeHtml(spell.upcast)}</p>`:""}<div class="spell-reference-foot"><div>${spell.ritual?`<em>Ritual</em>`:""}${spell.concentration?`<em>Concentration</em>`:""}</div><small>${escapeHtml(spell.source)} · p.${spell.srdPage}</small></div></article>`;
  }catch(error){
    console.error("[ui] 2014 spell reference card failed",error);
    throw error;
  }
}

/*
 * The landing state keeps Forge inside the launch card so the primary action
 * is visible immediately. After the first successful render, the same button
 * moves into a persistent top action bar above the workspace.
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
      workspace.parentNode.insertBefore(bar,workspace);
    }

    const buttons=bar.querySelector(".forge-action-buttons");
    if(!buttons)throw new Error("Forge action button container is missing.");

    let backButton=buttons.querySelector(".forge-action-back");
    if(!backButton){
      backButton=document.createElement("button");
      backButton.type="button";
      backButton.className="action-button forge-action-back";
      backButton.textContent="← Back to Forge Setup";
      backButton.setAttribute("aria-label","Back to Character Forge setup");
      backButton.addEventListener("click",goToForgeSetup);
      buttons.prepend(backButton);
    }

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

function ensureHomeNavigation(){
  try{
    const brand=document.querySelector(".brand");
    if(!brand||brand.dataset.forgeHomeBound==="true")return;
    brand.dataset.forgeHomeBound="true";
    brand.addEventListener("click",event=>{
      event.preventDefault();
      goToForgeSetup();
    });
  }catch(error){console.error("[ui] home navigation failed",error);throw error;}
}

function goToForgeSetup(){
  try{
    document.querySelector('[data-tab="forge"]')?.click();
    const panel=document.querySelector(".forge-panel");
    panel?.scrollIntoView({behavior:"smooth",block:"start"});
    window.setTimeout(()=>document.getElementById("ruleset")?.focus({preventScroll:true}),0);
  }catch(error){console.error("[ui] return to Forge setup failed",error);throw error;}
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
