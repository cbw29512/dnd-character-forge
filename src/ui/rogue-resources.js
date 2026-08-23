import { CUNNING_STRIKE_OPTIONS_2024, rogueCunningStrikeDc } from "../rules/rogue.js";

const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));

export function rogueResourceSummary(character){
  try{
    const rogue=character?.rogue;if(!rogue||character.class?.id!=="rogue")throw new Error("Rogue resource summary requires Rogue progression data.");
    if(character.ruleset==="2014")return legacySummary(character,rogue);
    const options=rogue.cunningStrikeOptions.map(id=>CUNNING_STRIKE_OPTIONS_2024.find(option=>option.id===id)).filter(Boolean),dc=character.level>=5?rogueCunningStrikeDc(character):null,utility=thiefUtility(character);
    return `<div class="rogue-resource-grid">${resource("Sneak Attack",`${rogue.sneakAttackDice}d6`)}${resource("Expertise",`${rogue.expertiseCount} skills`)}${resource("Masteries",rogue.masteryCount)}${resource("Cunning Strike DC",dc??"—")}${resource("Effects / Sneak Attack",rogue.maxCunningStrikeEffects||"—")}${resource("Reliable Talent",rogue.reliableTalent?"Active":"—")}</div>${options.length?`<div class="rogue-strike-list"><strong>Cunning Strike options</strong><div class="skills rogue-strike-options">${options.map(option=>`<article class="rogue-resource"><strong>${esc(option.name)} · ${option.cost}d6${option.save?` · ${option.save.toUpperCase()} save`:""}</strong><p>${esc(option.effect)}${option.requires?` Requires ${esc(option.requires)} on your person.`:""}</p></article>`).join("")}</div></div>`:`<div class="rogue-strike-list muted"><strong>Cunning Strike:</strong> unlocks at Rogue level 5.</div>`}${utility}`;
  }catch(error){console.error("[ui] Rogue resource summary failed",error);throw error;}
}
function legacySummary(character,rogue){
  try{return `<div class="rogue-resource-grid">${resource("Sneak Attack",`${rogue.sneakAttackDice}d6`)}${resource("Expertise",expertiseLabel(character,rogue))}${resource("Reliable Talent",rogue.reliableTalent?"Active":"—")}${resource("Blindsense",rogue.blindsenseRange?`${rogue.blindsenseRange} ft`:"—")}${resource("Wisdom Save",rogue.slipperyMind?"Proficient":"—")}${resource("Thief’s Reflexes",rogue.thiefReflexes?"2 turns · round 1":"—")}</div><div class="rogue-strike-list muted"><strong>2014 Rogue:</strong> no Weapon Mastery, Steady Aim, or Cunning Strike mechanics.</div>`;}catch(error){console.error("[ui] legacy Rogue resource summary failed",error);throw error;}
}
function expertiseLabel(character,rogue){try{const tool=character.expertise?.includes("Thieves' Tools"),skills=rogue.expertiseCount-(tool?1:0);return tool?`${skills} skill${skills===1?"":"s"} + Thieves’ Tools`:`${skills} skill${skills===1?"":"s"}`;}catch(error){console.error("[ui] Rogue Expertise label failed",error);throw error;}}
function thiefUtility(character){
  try{if(character.ruleset!=="2024"||character.subclass?.id!=="thief"||character.level<13)return"";return `<div class="rogue-strike-list"><strong>Use Magic Device · Spell Scrolls:</strong> use Intelligence. Cantrip/level-1 scrolls need no check; higher-level scrolls require Intelligence (Arcana) DC 10 + spell level, and a failed check disintegrates the scroll.</div>`;}
  catch(error){console.error("[ui] Thief utility summary failed",error);throw error;}
}
function resource(name,value){return `<div class="rogue-resource"><span>${esc(name)}</span><strong>${esc(value)}</strong></div>`;}
