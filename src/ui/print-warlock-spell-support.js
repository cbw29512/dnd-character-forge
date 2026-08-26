const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function renderWarlockSpellSupport(model){
  try{
    if(model?.identity?.classId!=="warlock")return"";
    const w=model.spellPage?.warlock;if(!w)throw new Error("Warlock spell support requires Warlock spell-page state.");
    const arcanum=Object.entries(w.mysticArcanum||{}).map(([level,id])=>`<span><small>Level ${esc(level)}</small><b>${esc(spellName(model,id))}</b><em>1 / Long Rest</em></span>`).join("");
    const tome=w.tomeCantrips.length||w.tomeRituals.length?`<div class="ps-warlock-sub"><strong>Book of Shadows</strong><p>${w.tomeCantrips.length?`${w.tomeCantrips.length} Tome cantrips (T). `:""}${w.tomeRituals.length?`${w.tomeRituals.length} Tome rituals (R).`:""}</p></div>`:"";
    const familiar=w.familiarForm?`<div class="ps-warlock-sub"><strong>Pact Familiar</strong><p>${esc(w.familiarForm)} · Find Familiar is supplied by Pact of the Chain.</p></div>`:"";
    return `<section class="ps-warlock-support"><div class="ps-section-title"><h2>Pact Resources</h2><span>Pact Magic returns on a Short or Long Rest</span></div><div class="ps-warlock-pact"><span><small>Pact Slots</small><b>${esc(w.pactSlotCount)}</b><em>Level ${esc(w.pactSlotLevel)}</em></span><span><small>Invocations</small><b>${esc(w.invocations.length)}</b><em>active</em></span><span><small>Mystic Arcanum</small><b>${esc(Object.keys(w.mysticArcanum||{}).length)}</b><em>special casts</em></span></div>${arcanum?`<div class="ps-warlock-arcanum">${arcanum}</div>`:""}<div class="ps-warlock-extras">${tome}${familiar}</div><p class="ps-warlock-key"><b>T</b> Tome cantrip · <b>R</b> Tome ritual · <b>I</b> Invocation spell · <b>X</b> Mystic Arcanum</p></section>`;
  }catch(error){console.error("[print-warlock-support] render failed",error);throw error;}
}
function spellName(model,id){return model.spellPage?.entries?.find(item=>item.id===id)?.name||id;}
