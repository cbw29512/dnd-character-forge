import { classWatermark, sheetArticleOpen } from "./print-decoration.js";
import { renderPaladinSpellSupport } from "./print-paladin-spell-support.js";
import { renderRangerSpellSupport } from "./print-ranger-spell-support.js";
import { renderDruidSpellSupport } from "./print-druid-spell-support.js";
import { renderWarlockSpellSupport } from "./print-warlock-spell-support.js";

const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const SPELL_LEVELS=[0,1,2,3,4,5,6,7,8,9];
const FALLBACK_LEVEL_COLUMNS=[[0,1],[2,3,4],[5,6,7,8,9]];

export function renderPrintPageTwo(m){
  try{
    if(!m.profile.caster||!m.spellPage)return"";
    const s=m.spellPage,contentLabel=m.audit.rawIntegrity?"RAW integrity":m.audit.sourceMode==="RAW"?"Compatible content":"Custom content";
    return `${sheetArticleOpen(m,"ps-caster-page")}<div class="ps-frame ps-caster-frame">${classWatermark(m)}<header class="ps-caster-header"><div><small>${esc(m.theme.label)} spell record</small><h1>${esc(m.identity.name)}</h1><p>${esc(m.identity.className)} ${m.identity.level}${m.identity.subclassName?` · ${esc(m.identity.subclassName)}`:""}</p></div><div class="ps-caster-stats"><span>Spellcasting Ability<b>${esc(s.ability)}</b></span><span>Spell Save DC<b>${s.saveDc}</b></span><span>Spell Attack Bonus<b>${esc(s.attackBonus)}</b></span></div></header><main class="ps-caster-body">${spellSection(m,s)}${rulesSection(m)}</main><footer class="ps-footer"><span class="ps-motto">${esc(m.motto)}</span><span class="ps-audit">✓ ${esc(m.audit.status)} · ${contentLabel} · Page 2/${m.packet.totalPages}</span></footer></div></article>`;
  }catch(error){console.error("[print-page-two] render failed",error);throw error;}
}
function spellSection(m,s){
  try{
    const byLevel=groupByLevel(s.entries),levelColumns=balancedLevelColumns(byLevel),warlockKey=m.identity.classId==="warlock"?" · T Tome · R Ritual · I Invocation · X Arcanum":"";
    return `<section class="ps-caster-spells"><div class="ps-section-title"><h2>Spells</h2><span>Prepared, known, and slot tracking follow the familiar 5e sheet flow</span></div><p class="ps-spell-key"><b>●</b> Prepared · <b>K</b> Known · <b>A</b> Always Prepared · <b>M</b> Mastery · <b>S</b> Signature · <b>B</b> Spellbook${warlockKey}</p><div class="ps-spell-level-grid">${levelColumns.map(levels=>`<div class="ps-spell-level-column">${levels.map(level=>spellLevel(level,byLevel.get(level)||[],slotCountFor(s.slots,level))).join("")}</div>`).join("")}</div>${renderPaladinSpellSupport(m)}${renderRangerSpellSupport(m)}${renderDruidSpellSupport(m)}${renderWarlockSpellSupport(m)}</section>`;
  }catch(error){console.error("[print-page-two] spell section failed",error);throw error;}
}
function groupByLevel(entries){
  try{
    const grouped=new Map();
    for(const entry of entries){
      const level=Number(entry.level);
      if(!Number.isInteger(level)||level<0||level>9)throw new Error(`Unsupported printed spell level: ${entry.level}.`);
      const list=grouped.get(level)||[];list.push(entry);grouped.set(level,list);
    }
    return grouped;
  }catch(error){console.error("[print-page-two] could not group spells by level",error);throw error;}
}
function balancedLevelColumns(byLevel){try{let best=null;for(let first=1;first<=SPELL_LEVELS.length-2;first++){for(let second=first+1;second<=SPELL_LEVELS.length-1;second++){const columns=[SPELL_LEVELS.slice(0,first),SPELL_LEVELS.slice(first,second),SPELL_LEVELS.slice(second)],loads=columns.map(levels=>levels.reduce((total,level)=>total+2+Math.max(1,(byLevel.get(level)||[]).length),0)),maxLoad=Math.max(...loads),minLoad=Math.min(...loads),score=(maxLoad*100)+(maxLoad-minLoad);if(!best||score<best.score)best={columns,score};}}return best?.columns||FALLBACK_LEVEL_COLUMNS;}catch(error){console.error("[print-page-two] could not balance spell-level columns; using safe fallback",error);return FALLBACK_LEVEL_COLUMNS;}}
function slotCountFor(slotsText,level){const match=String(slotsText||"").match(new RegExp(`(?:^|\\s·\\s)${level}:(\\d+)`));return Number(match?.[1]||0);}
function spellLevel(level,entries,slots){const title=level===0?"Cantrips":`Level ${level}`,slotText=level===0?"At will":`Slots ${slots} · Expended ${slots?"○ ".repeat(slots).trim():"—"}`;return `<section class="ps-spell-level level-${level}"><header><b>${level}</b><span>${title}</span><small>${slotText}</small></header><div>${entries.length?entries.map(spellEntry).join(""):`<span class="ps-spell-empty">—</span>`}</div></section>`;}
function spellEntry(entry){const prepared=entry.tags.includes("P")||entry.tags.includes("A");return `<span class="ps-spell-entry"><i>${prepared?"●":"○"}</i><b>${esc(entry.name)}</b><em>${esc(entry.tags.replace(/P/g,"")||"B")}</em></span>`;}
function rulesSection(m){return `<section class="ps-caster-rules"><div class="ps-section-title"><h2>Active Rules</h2><span>${m.ruleIndex.length} active features</span></div><div class="ps-caster-rule-grid">${m.ruleIndex.map(item=>`<span><b>${esc(item.name)}</b></span>`).join("")}</div></section>`;}
