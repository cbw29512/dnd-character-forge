const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function renderPaladinSpellSupport(model){
  try{
    if(model?.identity?.classId!=="paladin"||!model.classUtility)return"";
    const utility=model.classUtility,is2014=model.ruleset==="2014",stats=Object.fromEntries((utility.stats||[]).map(item=>[item.label,item]));
    const lay=stats["Lay On Hands"],channel=stats.Channel,aura=stats.Aura,always=model.spellcasting?.alwaysPrepared?.length||0;
    const cards=is2014?[
      card("Divine Smite","On a melee weapon hit","Spend a spell slot for +2d8 Radiant at level 1, +1d8 per slot level above 1; +1d8 against a Fiend or Undead."),
      card("Lay On Hands",`${lay?.value||0} HP pool · Action`,`Restore HP by spending points from the pool. Spend 5 points to neutralize one poison or cure one disease.`),
      card("Aura of Protection",`${aura?.value||"—"} saves · ${aura?.unit||"inactive"}`,"You and friendly creatures in the aura add your Charisma modifier to saving throws while you are conscious."),
      card("Sacred Oath",`${always} always prepared`,`Oath of Devotion spells stay prepared without counting against your normal Paladin preparation limit.`)
    ]:[
      card("Paladin's Smite","Divine Smite always prepared","After a melee weapon or Unarmed Strike hit, Divine Smite uses its Bonus Action trigger. One slot-free cast returns after a Long Rest."),
      card("Lay On Hands",`${lay?.value||0} HP pool · Bonus Action`,`Touch a creature and spend points to restore HP. Spend 5 points to remove the Poisoned condition.`),
      card("Channel Divinity",`${channel?.value||0} uses`,`Sacred Weapon and Abjure Foes spend this resource. Regain one use after a Short Rest and all uses after a Long Rest.`),
      card("Aura & Oath",`${aura?.value||"—"} saves · ${aura?.unit||"inactive"}`,`${always} spells are always prepared from Oath of Devotion and Paladin class features; they do not consume normal prepared choices.`)
    ];
    return `<section class="ps-paladin-spell-support"><header><div><small>Oathbound field reference</small><h3>Oath &amp; Smite Reference</h3></div><span>${esc(model.ruleset)} Paladin · level ${esc(model.identity.level)}</span></header><div class="ps-paladin-support-grid">${cards.join("")}</div><p>${esc(is2014?"Keep the familiar spell-level tracker above for slots and preparation; this panel puts the Paladin's most-used class decisions in the otherwise-unused half-caster space.":"Track spell slots above, then use this panel for the Paladin resources that most often change a turn: smite timing, healing, Channel Divinity, and the saving-throw aura.")}</p></section>`;
  }catch(error){console.error("[print-paladin-spell-support] render failed",error);throw error;}
}

function card(title,kicker,text){return `<article><strong>${esc(title)}</strong><b>${esc(kicker)}</b><span>${esc(text)}</span></article>`;}
