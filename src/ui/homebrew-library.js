import { createAbilityFeat } from "../rules/homebrew.js";
import { loadHomebrew, removeHomebrew, saveHomebrew } from "../library/local-library.js";

const escapeHtml = value => String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function bindHomebrewLibrary(showToast) {
  try {
    document.getElementById("libraryHbSave")?.addEventListener("click",async()=>{
      try {
        const item = createAbilityFeat({ name:document.getElementById("libraryHbName").value, ability:document.getElementById("libraryHbAbility").value, amount:document.getElementById("libraryHbAmount").value });
        const entry = await saveHomebrew(item,document.getElementById("libraryHbRuleset").value);
        document.getElementById("libraryHbName").value = "";
        renderHomebrewLibrary();
        showToast(`${entry.name} saved to My Homebrew.`);
      } catch (error) { console.error("[homebrew-library] save failed", error); showToast(error.message,true); }
    });
    document.getElementById("homebrewGrid")?.addEventListener("click",event=>{
      try {
        const button = event.target.closest("[data-remove-homebrew]");
        if (!button) return;
        removeHomebrew(button.dataset.removeHomebrew);
        renderHomebrewLibrary();
      } catch (error) { console.error("[homebrew-library] remove failed", error); showToast(error.message,true); }
    });
    renderHomebrewLibrary();
  } catch (error) { console.error("[homebrew-library] bind failed", error); throw error; }
}

export function renderHomebrewLibrary() {
  try {
    const items = loadHomebrew();
    const count = document.getElementById("homebrewCount");
    const grid = document.getElementById("homebrewGrid");
    if (count) count.textContent = `${items.length} saved`;
    if (!grid) return;
    grid.innerHTML = items.length ? items.map(card).join("") : `<div class="library-empty"><span>HB</span><h3>No Homebrew saved yet</h3><p>Create a structured effect above. Duplicate names and duplicate mechanics are both blocked.</p></div>`;
  } catch (error) { console.error("[homebrew-library] render failed", error); throw error; }
}

function card(entry) {
  try {
    const effect = entry.item.effects?.[0];
    const summary = effect ? `${String(effect.target).toUpperCase()} ${Number(effect.value)>=0?"+":""}${effect.value}` : "Structured Homebrew";
    return `<article class="library-card"><div class="library-card-top"><span class="library-badge hb">HB</span><span class="library-level">v${entry.version}</span></div><h3>${escapeHtml(entry.name)}</h3><p>${escapeHtml(entry.type)} · ${escapeHtml(summary)}</p><div class="library-meta"><span>${escapeHtml(entry.ruleset)}</span><span>Fingerprint ${entry.fingerprint.slice(0,8)}</span></div><button class="library-remove" type="button" data-remove-homebrew="${entry.id}">Remove</button></article>`;
  } catch (error) { console.error("[homebrew-library] card failed", error); throw error; }
}
