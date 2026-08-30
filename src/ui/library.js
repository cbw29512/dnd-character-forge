import { loadPregens, removePregen } from "../library/local-library.js";
import { verifyPregenEntry } from "../library/pregen-integrity.js";

const escapeHtml=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
let callbacks={};

export function bindPregenLibrary(options={}){
  try{
    callbacks=options;
    ["pregenSearch","pregenRuleset"].forEach(id=>document.getElementById(id)?.addEventListener("input",renderPregenLibrary));
    document.getElementById("pregenGrid")?.addEventListener("click",async event=>{
      try{
        const view=event.target.closest("[data-view-pregen]"),remove=event.target.closest("[data-remove-pregen]");
        if(view){
          const entry=loadPregens().find(item=>item.id===view.dataset.viewPregen);
          if(!entry)throw new Error("Saved pregen was not found.");
          if(entry.sourceMode!=="RAW")throw new Error("This production Forge opens RAW saved characters only.");
          const verified=await verifyPregenEntry(entry);
          await callbacks.onView?.(verified);
          return;
        }
        if(remove){removePregen(remove.dataset.removePregen);renderPregenLibrary();callbacks.showToast?.("Pregen removed.");}
      }catch(error){console.error("[library-ui] action failed",error);callbacks.showToast?.(error.message,true);}
    });
    renderPregenLibrary();
  }catch(error){console.error("[library-ui] bind failed",error);throw error;}
}

export function renderPregenLibrary(){
  try{
    const search=document.getElementById("pregenSearch")?.value.trim().toLowerCase()||"",ruleset=document.getElementById("pregenRuleset")?.value||"all";
    const items=loadPregens().filter(item=>{
      if(item.sourceMode!=="RAW")return false;
      const haystack=`${item.name} ${item.className} ${item.speciesName} ${item.backgroundName}`.toLowerCase();
      return(!search||haystack.includes(search))&&(ruleset==="all"||item.ruleset===ruleset);
    });
    const grid=document.getElementById("pregenGrid"),count=document.getElementById("pregenCount");
    if(count)count.textContent=`${items.length} saved`;
    if(!grid)return;
    grid.innerHTML=items.length?items.map(card).join(""):`<div class="library-empty"><span>✦</span><h3>No matching pregens yet</h3><p>Forge a RAW character, then choose <strong>Save to Pregens</strong>. Exact mechanical duplicates are blocked automatically.</p></div>`;
  }catch(error){console.error("[library-ui] render failed",error);throw error;}
}

function card(item){
  try{
    const fingerprint=typeof item.fingerprint==="string"&&item.fingerprint?item.fingerprint.slice(0,8):"unverified",id=escapeHtml(item.id);
    return `<article class="library-card"><div class="library-card-top"><span class="library-badge raw">✓ RAW</span><span class="library-level">Level ${item.level}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.speciesName)} ${escapeHtml(item.className)} · ${escapeHtml(item.backgroundName)}</p><div class="library-meta"><span>${escapeHtml(item.ruleset)}</span><span>Fingerprint ${escapeHtml(fingerprint)}</span></div><div class="library-actions"><button class="library-open" type="button" data-view-pregen="${id}">Open character</button><button class="library-remove" type="button" data-remove-pregen="${id}">Remove</button></div></article>`;
  }catch(error){console.error("[library-ui] card failed",error);throw error;}
}