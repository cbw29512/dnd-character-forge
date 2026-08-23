const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const LEVEL_COLUMNS=[[0,1,2],[3,4,5],[6,7,8,9]];

export function renderPrintPageTwo(m){
  try{
    if(!m.profile.caster||!m.spellPage)return"";
    const s=m.spellPage;
    return `<article class="premium-sheet ps-caster-page theme-${esc(m.theme.id)}"><div class="ps-frame ps-caster-frame"><header class="ps-caster-header"><div><small>${esc(m.theme.label)} spell record</small><h1>${esc(m.identity.name)}</h1><p>${esc(m.identity.className)} ${m.identity.level}${m.identity.subclassName?` · ${esc(m.identity.subclassName)}`:""}</p></div><div class="ps-caster-stats"><span>Spellcasting Ability<b>${esc(s.ability)}</b></span><span>Spell Save DC<b>${s.saveDc}</b></span><span>Spell Attack Bonus<b>${esc(s.attackBonus)}</b></span></div></header><main class="ps-caster-body">${spellSection(s)}${rulesSection(m)}${auditSection(m)}</main><footer class="ps-footer"><span>${esc(s.source)}</span><span class="ps-audit">✓ ${esc(m.audit.status)} · ${esc(m.audit.version)} · RAW integrity · Page 2/2</span></footer></div></article>`;
  }catch(error){
    console.error("[print-page-two] render failed",error);
    throw error;
  }
}

function spellSection(s){
  try{
    const byLevel=groupByLevel(s.entries);
    return `<section class="ps-caster-spells"><div class="ps-section-title"><h2>Spells</h2><span>Prepared marks and slot tracking follow the familiar 5e sheet flow</span></div><p class="ps-spell-key"><b>●</b> Prepared · <b>A</b> Always Prepared · <b>M</b> Mastery · <b>S</b> Signature · <b>B</b> Spellbook</p><div class="ps-spell-level-grid">${LEVEL_COLUMNS.map(levels=>`<div class="ps-spell-level-column">${levels.map(level=>spellLevel(level,byLevel.get(level)||[],slotCountFor(s.slots,level))).join("")}</div>`).join("")}</div></section>`;
  }catch(error){
    console.error("[print-page-two] spell section failed",error);
    throw error;
  }
}
function groupByLevel(entries){const grouped=new Map();for(const entry of entries){const list=grouped.get(entry.level)||[];list.push(entry);grouped.set(entry.level,list);}return grouped;}
function slotCountFor(slotsText,level){const match=String(slotsText||"").match(new RegExp(`(?:^|\\s·\\s)${level}:(\\d+)`));return Number(match?.[1]||0);}
function spellLevel(level,entries,slots){const title=level===0?"Cantrips":`Level ${level}`,slotText=level===0?"At will":`Slots ${slots} · Expended ${slots?"○ ".repeat(slots).trim():"—"}`;return `<section class="ps-spell-level level-${level}"><header><b>${level}</b><span>${title}</span><small>${slotText}</small></header><div>${entries.length?entries.map(spellEntry).join(""):`<span class="ps-spell-empty">—</span>`}</div></section>`;}
function spellEntry(entry){const prepared=entry.tags.includes("P")||entry.tags.includes("A");return `<span class="ps-spell-entry"><i>${prepared?"●":"○"}</i><b>${esc(entry.name)}</b><em>${esc(entry.tags.replace(/P/g,"")||"B")}</em></span>`;}
function rulesSection(m){return `<section class="ps-caster-rules"><div class="ps-section-title"><h2>Sourced Rules Index</h2><span>${m.ruleIndex.length} active rules</span></div><div class="ps-caster-rule-grid">${m.ruleIndex.map(item=>`<span><b>${esc(item.name)}</b><small>${esc(item.source)}</small></span>`).join("")}</div></section>`;}
function auditSection(m){const a=m.audit;return `<section class="ps-caster-audit"><div class="ps-section-title"><h2>Rules Audit</h2><span>${esc(a.rulesLabel)} · ${esc(a.license||"")}</span></div><div class="ps-audit-identity">${a.mechanics.map(item=>`<span><small>${esc(item.label)}</small><b>${esc(item.value)}</b><em>${esc(item.source)}</em></span>`).join("")}</div><ul>${a.checks.map(check=>`<li>${esc(check)}</li>`).join("")}</ul></section>`;}
