import { loadPregens, removePregen } from "../library/local-library.js";

const escapeHtml = value => String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function bindPregenLibrary() {
  try {
    ["pregenSearch","pregenRuleset","pregenSource"].forEach(id=>document.getElementById(id)?.addEventListener("input",renderPregenLibrary));
    document.getElementById("pregenGrid")?.addEventListener("click",event=>{
      try {
        const button = event.target.closest("[data-remove-pregen]");
        if (!button) return;
        removePregen(button.dataset.removePregen);
        renderPregenLibrary();
      } catch (error) { console.error("[library-ui] remove failed", error); }
    });
    renderPregenLibrary();
  } catch (error) { console.error("[library-ui] bind failed", error); throw error; }
}

export function renderPregenLibrary() {
  try {
    const search = document.getElementById("pregenSearch")?.value.trim().toLowerCase()||"";
    const ruleset = document.getElementById("pregenRuleset")?.value||"all";
    const source = document.getElementById("pregenSource")?.value||"all";
    const items = loadPregens().filter(item=>{
      const haystack = `${item.name} ${item.className} ${item.speciesName} ${item.backgroundName}`.toLowerCase();
      return (!search||haystack.includes(search)) && (ruleset==="all"||item.ruleset===ruleset) && (source==="all"||item.sourceMode===source);
    });
    const grid = document.getElementById("pregenGrid");
    const count = document.getElementById("pregenCount");
    if (count) count.textContent = `${items.length} saved`;
    if (!grid) return;
    grid.innerHTML = items.length ? items.map(card).join("") : `<div class="library-empty"><span>✦</span><h3>No matching pregens yet</h3><p>Forge a character, then choose <strong>Save to Pregens</strong>. Exact mechanical duplicates are blocked automatically.</p></div>`;
  } catch (error) { console.error("[library-ui] render failed", error); throw error; }
}

function card(item) {
  try {
    const raw = item.sourceMode === "RAW";
    return `<article class="library-card">
      <div class="library-card-top"><span class="library-badge ${raw?"raw":"hb"}">${raw?"✓ RAW":"HB"}</span><span class="library-level">Level ${item.level}</span></div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.speciesName)} ${escapeHtml(item.className)} · ${escapeHtml(item.backgroundName)}</p>
      <div class="library-meta"><span>${escapeHtml(item.ruleset)}</span><span>Fingerprint ${item.fingerprint.slice(0,8)}</span></div>
      <button class="library-remove" type="button" data-remove-pregen="${item.id}">Remove</button>
    </article>`;
  } catch (error) { console.error("[library-ui] card failed", error); throw error; }
}
