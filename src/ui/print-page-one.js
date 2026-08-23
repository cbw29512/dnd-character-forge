import { classPlaceholderArt } from "../print/class-art.js";

const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function renderPrintPageOne(m){
  try{
    return `<article class="premium-sheet ps-page-one profile-${m.profile.id} theme-${esc(m.theme.id)}"><div class="ps-frame">${header(m)}<main class="ps-body"><div class="ps-main-columns"><div class="ps-column ps-left">${panel("Ability Scores",abilities(m))}${panel("Saving Throws",savingThrows(m),"ps-saving-throws")}${passive(m)}${panel("Proficiencies & Languages",proficiencies(m),"ps-proficiencies")}</div><div class="ps-column ps-center">${panel("Skills",skills(m),"ps-skills")}${panel("Attacks & Spellcasting",attacks(m),"ps-attacks")}${panel("Equipment",list(m.equipment),"ps-equipment")}${panel("Quick Turn",quickTurn(m),"ps-quick")}</div><div class="ps-column ps-right">${m.feat?panel("Feat",feat(m),"ps-feat"):""}${m.rogueResources?panel("Rogue Resources",rogue(m),"ps-rogue"):""}${m.spellcasting?panel("Spellcasting",spells(m),"ps-spells"):""}${panel("Features & Traits",features(m),"ps-features")}</div></div>${m.profile.caster?"":ruleIndex(m)}</main>${footer(m,1)}</div></article>`;
  }catch(error){
    console.error("[print-page-one] render failed",error);
    throw error;
  }
}

function header(m){return `<header class="ps-top">${portrait(m)}${identity(m)}${topStats(m)}</header>`;}
function portrait(m){const art=m.portraitDataUrl?`<div class="ps-portrait-art has-image"><img src="${esc(m.portraitDataUrl)}" alt=""></div>`:`<div class="ps-portrait-art class-placeholder class-${esc(m.identity.classId)}">${classPlaceholderArt(m.identity.classId)}<small>${esc(m.theme.label)}</small></div>`;return `<section class="ps-portrait">${art}<div class="ps-portrait-caption">${esc(m.identity.className)}${m.identity.subclassName?` · ${esc(m.identity.subclassName)}`:""}</div></section>`;}
function identity(m){return `<section class="ps-identity"><small>Character Name</small><h1>${esc(m.identity.name)}</h1><dl><div><dt>Class & Level</dt><dd>${esc(m.identity.className)} ${m.identity.level}${m.identity.subclassName?` · ${esc(m.identity.subclassName)}`:""}</dd></div><div><dt>Race / Species</dt><dd>${esc(m.identity.species)}</dd></div><div><dt>Background</dt><dd>${esc(m.identity.background)}</dd></div><div><dt>Size</dt><dd>${esc(m.identity.size)}</dd></div></dl></section>`;}
function topStats(m){const s=m.stats;return `<section class="ps-top-stats"><div class="ps-badge-row">${badge("Proficiency Bonus",s.proficiency)}${badge("Armor Class",s.ac)}${badge("Initiative",`${s.initiative}${s.initiativeAdvantage?" ADV":""}`)}${badge("Speed",s.speed)}</div><div class="ps-hp-row">${badge("Hit Point Maximum",s.hp,"large")}${tracking("Current Hit Points")}${tracking("Temporary Hit Points")}</div><div class="ps-save-row"><div><span>Hit Dice</span><strong>${esc(s.hitDice)}</strong></div><div class="ps-death"><span>Death Saves</span><small>Success ○ ○ ○ &nbsp; Failure ○ ○ ○</small></div></div></section>`;}
function badge(label,value,size=""){return `<div class="ps-stat ${size}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;}
function tracking(label){return `<div class="ps-track"><span>${esc(label)}</span><b>&nbsp;</b></div>`;}
function abilities(m){return `<div class="ps-abilities">${m.abilities.map(a=>`<div class="ps-ability"><i><span>${a.id.toUpperCase()}</span></i><span>${esc(a.name)}</span><b>${a.score}</b><em>${esc(a.modifier)}</em></div>`).join("")}</div>`;}
function savingThrows(m){return `<div class="ps-save-list">${m.abilities.map(a=>`<div class="ps-save ${a.proficient?"proficient":""}"><span>${a.proficient?"●":"○"} ${esc(a.name)}</span><b>${esc(a.save)}</b></div>`).join("")}</div>`;}
function passive(m){return `<section class="ps-passive"><span>Passive Wisdom (Perception)</span><strong>${m.stats.passivePerception}</strong></section>`;}
function skills(m){return `<div class="ps-skill-list">${m.skills.map(s=>`<div class="ps-skill ${s.proficient?"proficient":""}"><span>${s.expertise?"◆":s.proficient?"●":"○"} ${esc(s.name)} <small>(${s.ability})</small></span><b>${esc(s.bonus)}</b></div>`).join("")}</div>`;}
function attacks(m){if(!m.attacks.length)return `<p class="ps-empty">No attack entries.</p>`;return `<div class="ps-attack-head"><span>Name</span><span>Atk Bonus</span><span>Damage / Type</span></div>${m.attacks.map(a=>`<div class="ps-attack-row"><strong>${esc(a.name)}</strong><b>${esc(a.toHit)}</b><span>${esc(a.damage)}</span></div>`).join("")}`;}
function features(m){return `<div class="ps-feature-list">${m.features.map(f=>`<article><strong>${esc(f.name)}</strong><p>${esc(f.text)}</p><small>${esc(f.timing)} · ${esc(f.source)}</small></article>`).join("")}</div>`;}
function feat(m){return `<h3>${esc(m.feat.name)}</h3><p>${esc(m.feat.text)}</p>${m.feat.source?`<small class="ps-source">${esc(m.feat.source)}</small>`:""}`;}
function rogue(m){
  const r=m.rogueResources;
  if(r.ruleset==="2014")return `<div class="ps-rogue-stats">${rstat("Sneak",r.sneakAttack)}${rstat("Expertise",r.expertise)}${rstat("Reliable",r.reliableTalent?"YES":"—")}${rstat("Blindsense",r.blindsense||"—")}${rstat("Reflexes",r.thiefReflexes?"2 turns R1":"—")}</div>`;
  const options=r.options.length?`<div class="ps-rogue-options compact">${r.options.map(option=>`<article><b>${esc(option.name)} · ${esc(option.cost)}${option.save?` · ${esc(option.save)}`:""}</b><p>${esc(option.effect)}${option.requires?` Requires ${esc(option.requires)}.`:""}</p></article>`).join("")}</div>`:"";
  const warning=r.scrollWarning?`<p class="ps-rogue-warning"><strong>Use Magic Device:</strong> ${esc(r.scrollWarning)}</p>`:"";
  return `<div class="ps-rogue-stats">${rstat("Sneak",r.sneakAttack)}${rstat("Expertise",r.expertise)}${rstat("Masteries",r.masteries)}${rstat("Strike DC",r.cunningStrikeDc??"—")}${rstat("Effects",r.effectsPerSneak||"—")}${rstat("Reliable",r.reliableTalent?"YES":"—")}</div>${options}${warning}`;
}
function rstat(label,value){return `<span><small>${esc(label)}</small><b>${esc(value)}</b></span>`;}
function spells(m){const s=m.spellcasting;return `<div class="ps-spell-stats"><span>Ability <b>${esc(s.ability)}</b></span><span>Save DC <b>${s.saveDc}</b></span><span>Attack <b>${esc(s.attackBonus)}</b></span></div><p><strong>Slots:</strong> ${esc(s.slots||"—")}</p><p><strong>Cantrips:</strong> ${esc(s.cantrips.join(", ")||"None")}</p>${s.alwaysPrepared.length?`<p><strong>Always prepared:</strong> ${esc(s.alwaysPrepared.join(", "))}</p>`:""}<p><strong>Prepared:</strong> ${esc(s.prepared.join(", ")||"None")}</p>`;}
function proficiencies(m){const p=m.proficiencies;return `<p><strong>Saves:</strong> ${esc(p.saves.join(", "))}</p><p><strong>Tools:</strong> ${esc(p.tools.join(", ")||"None")}</p>${p.masteries.length?`<p><strong>Masteries:</strong> ${esc(p.masteries.join(", "))}</p>`:""}<p><strong>Languages:</strong> ${esc(p.languages.join(", "))}</p>`;}
function quickTurn(m){return `<ol class="ps-quick-list">${m.quickTurn.map(step=>`<li>${esc(step)}</li>`).join("")}</ol>`;}
function ruleIndex(m){return `<section class="ps-rule-index"><h2>Rules Index</h2><div>${m.ruleIndex.map(item=>`<span><b>${esc(item.name)}</b><small>${esc(item.source)}</small></span>`).join("")}</div></section>`;}
function list(values){return `<ul class="ps-list">${values.map(value=>`<li>${esc(value)}</li>`).join("")}</ul>`;}
function panel(title,content,className=""){return `<section class="ps-panel ${className}"><h2><span>${esc(title)}</span></h2><div class="ps-panel-body">${content}</div></section>`;}
function footer(m,page){return `<footer class="ps-footer"><span class="ps-motto">${esc(m.motto)}</span><span class="ps-audit">✓ ${esc(m.audit.status)} · ${esc(m.audit.sourceMode)} · ${esc(m.audit.version)}${m.audit.rawIntegrity?" · RAW integrity":""} · Page ${page}/${m.packet.totalPages}</span></footer>`;}
