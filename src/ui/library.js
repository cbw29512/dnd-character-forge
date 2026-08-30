import { loadPregens, removePregen } from "../library/local-library.js";
import { exportPregenBackupJson, importPregenBackupJson } from "../library/pregen-backup.js";
import { verifyPregenEntry } from "../library/pregen-integrity.js";

const escapeHtml=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
let callbacks={};

function ensureBackupControls(){
  try{
    if(document.getElementById("exportPregenBackup"))return;
    const toolbar=document.querySelector('[data-view="pregens"] .library-toolbar');
    if(!toolbar)throw new Error("Pregen library toolbar is missing.");
    const actions=document.createElement("div");
    actions.className="library-backup-actions";
    actions.innerHTML='<div><strong>Library backup</strong><small>Move your verified RAW pregens between browsers without relying on local storage alone.</small></div><div class="library-backup-buttons"><button id="exportPregenBackup" class="library-backup-button" type="button">Export backup</button><button id="importPregenBackup" class="library-backup-button" type="button">Import backup</button><input id="pregenBackupFile" type="file" accept="application/json,.json" hidden></div>';
    toolbar.appendChild(actions);
  }catch(error){console.error("[library-ui] backup controls failed",error);throw error;}
}

export function bindPregenLibrary(options={}){
  try{
    callbacks=options;
    ensureBackupControls();
    ["pregenSearch","pregenRuleset"].forEach(id=>document.getElementById(id)?.addEventListener("input",renderPregenLibrary));
    document.getElementById("exportPregenBackup")?.addEventListener("click",exportBackup);
    document.getElementById("importPregenBackup")?.addEventListener("click",()=>document.getElementById("pregenBackupFile")?.click());
    document.getElementById("pregenBackupFile")?.addEventListener("change",importBackup);
    document.getElementById("pregenGrid")?.addEventListener("click",async event=>{
      try{
        const view=event.target.closest("[data-view-pregen]"),remove=event.target.closest("[data-remove-pregen]");
        if(view){
          const entry=loadPregens().find(item=>item.id===view.dataset.viewPregen);
          if(!entry)throw new Error("Saved pregen was not found.");
          if(entry.sourceMode!=="RAW"&&entry.character?.sourceMode!=="RAW")throw new Error("This production Forge opens RAW saved characters only.");
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

async function exportBackup(){
  try{
    const json=await exportPregenBackupJson();
    const blob=new Blob([json],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;
    link.download=`character-forge-pregens-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    const count=loadPregens().length;
    callbacks.showToast?.(`${count} pregen${count===1?"":"s"} exported to a verified backup.`);
  }catch(error){console.error("[library-ui] backup export failed",error);callbacks.showToast?.(error.message,true);}
}

async function importBackup(event){
  const input=event.currentTarget;
  try{
    const file=input.files?.[0];
    if(!file)return;
    const result=await importPregenBackupJson(await file.text());
    renderPregenLibrary();
    callbacks.showToast?.(`${result.added} pregen${result.added===1?"":"s"} restored${result.skipped?` · ${result.skipped} duplicate${result.skipped===1?"":"s"} skipped`:""}.`);
  }catch(error){console.error("[library-ui] backup import failed",error);callbacks.showToast?.(error.message,true);}
  finally{if(input)input.value="";}
}

export function renderPregenLibrary(){
  try{
    const search=document.getElementById("pregenSearch")?.value.trim().toLowerCase()||"",ruleset=document.getElementById("pregenRuleset")?.value||"all";
    const items=loadPregens().filter(item=>{
      if(item.sourceMode!=="RAW"&&item.character?.sourceMode!=="RAW")return false;
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
