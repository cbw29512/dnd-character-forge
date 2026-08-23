import { CUNNING_STRIKE_OPTIONS_2024, rogueCunningStrikeDc } from "../rules/rogue.js";

const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function rogueResourceSummary(character){
  try{
    const rogue=character?.rogue;if(!rogue||character.class?.id!=="rogue")throw new Error("Rogue resource summary requires Rogue progression data.");
    const options=rogue.cunningStrikeOptions.map(id=>CUNNING_STRIKE_OPTIONS_2024.find(option=>option.id===id)).filter(Boolean),dc=character.level>=5?rogueCunningStrikeDc(character):null;
    return `<div class="rogue-resource-grid">${resource("Sneak Attack",`${rogue.sneakAttackDice}d6`)}${resource("Expertise",`${rogue.expertiseCount} skills`)}${resource("Masteries",rogue.masteryCount)}${resource("Cunning Strike DC",dc??"—")}${resource("Effects / Sneak Attack",rogue.maxCunningStrikeEffects||"—")}${resource("Reliable Talent",rogue.reliableTalent?"Active":"—")}</div>${options.length?`<div class="rogue-strike-list"><strong>Cunning Strike options</strong><div class="rogue-strike-options">${options.map(option=>`<article><b>${esc(option.name)} · ${option.cost}d6${option.save?` · ${option.save.toUpperCase()} save`:""}</b><span>${esc(option.effect)}${option.requires?` Requires ${esc(option.requires)} on your person.`:""}</span></article>`).join("")}</div></div>`:`<div class="rogue-strike-list muted"><strong>Cunning Strike:</strong> unlocks at Rogue level 5.</div>`}`;
  }catch(error){console.error("[ui] Rogue resource summary failed",error);throw error;}
}

function resource(name,value){return `<div class="rogue-resource"><span>${esc(name)}</span><strong>${esc(value)}</strong></div>`;}
