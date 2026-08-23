const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function renderRangerSpellSupport(model){
  try{
    if(model?.identity?.classId!=="ranger"||!model.rangerSupport)return"";const r=model.rangerSupport,is2014=r.ruleset==="2014",cards=is2014?legacyCards(r):modernCards(r);
    return `<section class="ps-ranger-spell-support"><header><div><small>Trailbound field reference</small><h3>Hunter &amp; Exploration Guide</h3></div><span>${esc(r.ruleset)} Ranger · level ${esc(model.identity.level)}</span></header><div class="ps-ranger-support-grid">${cards.join("")}</div><p>${esc(is2014?"Known spells remain fixed until a Ranger level allows a replacement. Use this panel for favored enemies, terrain, and the Hunter choices that define the current field plan.":"Hunter's Mark is the center of the revised Ranger loop. Track free casts and marked-target benefits here while the spell-level tracker above handles prepared magic and slots.")}</p></section>`;
  }catch(error){console.error("[print-ranger-spell-support] render failed",error);throw error;}
}
function legacyCards(r){return[
  card("Favored Enemy",`${r.favoredEnemies.length} type${r.favoredEnemies.length===1?"":"s"}`,`${r.favoredEnemies.join(", ")||"—"}${r.favoredEnemyLanguages.length?` · Languages: ${r.favoredEnemyLanguages.join(", ")}`:""}`),
  card("Natural Explorer",`${r.terrains.length} terrain${r.terrains.length===1?"":"s"}`,r.terrains.join(", ")||"—"),
  card("Hunter Plan",r.huntersPrey||"Hunter's Prey",[r.defensiveTactics,r.multiattack,r.superiorDefense].filter(Boolean).join(" · ")||"Subclass choices appear as they unlock."),
  card("Ranger Magic",`${r.knownCount} spells known`,`Wisdom spellcasting. Known spells are printed above with K markers and can be replaced only when gaining a Ranger level.`)
];}
function modernCards(r){return[
  card("Hunter's Mark",`${r.hunterMarkFreeCasts} free casts · ${r.hunterMarkDie}`,"Always prepared. Free castings return after a Long Rest; spell-slot castings remain available."),
  card("Deft Explorer",`${r.expertiseCount} Expertise`,`Two Ranger languages are added at level 2; Expertise scales to three Ranger choices at level 9.`),
  card("Hunter Plan",r.huntersPrey||"Hunter's Prey",`${r.defensiveTactics?`${r.defensiveTactics} · `:""}Hunter's Lore keys defenses off the currently marked target.`),
  card("Mobility",r.speedBonus?`+${r.speedBonus} ft Roving`:"Base Speed",`${r.speedBonus?"Climb and Swim match Speed. ":""}${r.natureVeilUses?`Nature's Veil ${r.natureVeilUses}/Long Rest.`:r.tirelessUses?`Tireless ${r.tirelessUses}/Long Rest.`:"Ranger mobility features appear as they unlock."}`)
];}
function card(title,kicker,text){return `<article><strong>${esc(title)}</strong><b>${esc(kicker)}</b><span>${esc(text)}</span></article>`;}
