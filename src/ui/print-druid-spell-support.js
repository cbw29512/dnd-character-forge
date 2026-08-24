const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function renderDruidSpellSupport(model){
  try{
    if(model?.identity?.classId!=="druid"||!model.druidSupport)return"";
    const d=model.druidSupport,is2014=d.ruleset==="2014",forms=d.forms||[],uses=d.wildShapeUses==="∞"?"Unlimited":`${d.wildShapeUses} use${d.wildShapeUses===1?"":"s"}`,movement=`${d.allowSwim?"Swim ✓":"Swim —"} · ${d.allowFly?"Fly ✓":"Fly —"}`;
    const cards=forms.map(form=>formCard(form,is2014)).join("");
    const subtitle=is2014?"Field forms · examples, not exhaustive":"Known Wild Shape forms";
    const rule=is2014?`Wild Shape: ${uses}; max CR ${d.maxCr}; up to ${d.durationHours} hr. These are table-ready examples only—2014 RAW still allows another eligible Beast the Druid has seen.`:`Wild Shape: ${uses}; max CR ${d.maxCr}; up to ${d.durationHours} hr; ${d.wildShapeTempHp} Temp HP. You retain your own Hit Points in 2024 Wild Shape.`;
    return `<section class="ps-druid-spell-support"><header><div><small>Primal field ledger</small><h3>${esc(subtitle)}</h3></div><span>${esc(movement)}</span></header><div class="ps-druid-form-grid">${cards}</div><p>${esc(rule)}</p></section>`;
  }catch(error){console.error("[print-druid-spell-support] render failed",error);throw error;}
}

function formCard(form,is2014){
  const speed=compactSpeed(form.speeds),action=form.actions?.[0];
  const actionText=action?`${action.name} ${action.toHit>=0?`+${action.toHit}`:action.toHit} · ${action.damage}`:"—";
  const hp=is2014?` · HP ${form.hp}`:"";
  return `<article><strong>${esc(form.name)}</strong><b>CR ${esc(form.cr)} · AC ${esc(form.ac)}${esc(hp)}</b><span>${esc(speed)} · ${esc(actionText)}</span></article>`;
}
function compactSpeed(speeds={}){const parts=[];if(speeds.walk)parts.push(`${speeds.walk} ft`);if(speeds.swim)parts.push(`Swim ${speeds.swim}`);if(speeds.fly)parts.push(`Fly ${speeds.fly}`);if(speeds.climb)parts.push(`Climb ${speeds.climb}`);return parts.join(" / ")||"Speed —";}
