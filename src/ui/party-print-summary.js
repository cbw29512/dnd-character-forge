import { buildPremiumPrintModel } from "../print/model.js";
import { FORGE_BUILD, buildRulesLawyerCertification } from "../rules/certification.js";

const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const roleLabel=value=>String(value||"party").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());

export function buildPartyQuickReference(characters){
  try{
    const members=Array.isArray(characters)?characters:[];
    if(members.length<2||members.length>6)throw new Error("Party quick reference requires 2 through 6 validated characters.");
    if(members.some(character=>!character?.validation?.valid))throw new Error("Party quick reference requires fully validated characters.");
    const rulesets=new Set(members.map(character=>character.ruleset));
    if(rulesets.size!==1)throw new Error("Party quick reference cannot mix rules editions.");
    const levels=new Set(members.map(character=>character.level));
    const rows=members.map(character=>{
      const model=buildPremiumPrintModel(character),certification=buildRulesLawyerCertification(character),attack=model.attacks[0]||null,spell=model.spellcasting||null;
      return Object.freeze({
        name:model.identity.name,
        role:roleLabel(character.partyRole),
        build:[`Level ${model.identity.level}`,model.identity.className,model.identity.subclassName].filter(Boolean).join(" · "),
        origin:`${model.identity.species} · ${model.identity.background}`,
        ac:model.stats.ac,
        hp:model.stats.hp,
        initiative:model.stats.initiative,
        speed:model.stats.speed,
        passivePerception:model.stats.passivePerception,
        attack:attack?`${attack.name} ${attack.toHit} · ${attack.damage}`:"No weapon attack",
        spell:spell?`Spell DC ${spell.saveDc} · Spell attack ${spell.attackBonus}`:null,
        rawCertified:Boolean(certification.rawCertified)
      });
    });
    return Object.freeze({
      ruleset:members[0].ruleset,
      levelLabel:levels.size===1?`Level ${members[0].level}`:"Mixed levels",
      size:members.length,
      certifiedCount:rows.filter(row=>row.rawCertified).length,
      buildId:FORGE_BUILD.id,
      rows:Object.freeze(rows)
    });
  }catch(error){console.error("[party-print-summary] model failed",error);throw error;}
}

export function renderPartyQuickReference(characters){
  try{
    const model=buildPartyQuickReference(characters),certified=model.certifiedCount===model.size;
    const cards=model.rows.map((row,index)=>`<article class="party-summary-card"><header><div><small>${esc(row.role)} · #${index+1}</small><h2>${esc(row.name)}</h2></div><span>${row.rawCertified?"✓ RAW":"✓ Audited"}</span></header><p class="party-summary-build">${esc(row.build)}</p><p class="party-summary-origin">${esc(row.origin)}</p><div class="party-summary-stats"><span><b>${esc(row.ac)}</b><small>AC</small></span><span><b>${esc(row.hp)}</b><small>HP</small></span><span><b>${esc(row.initiative)}</b><small>INIT</small></span><span><b>${esc(row.speed)}</b><small>SPEED</small></span><span><b>${esc(row.passivePerception)}</b><small>PASSIVE PERCEPTION</small></span></div><div class="party-summary-offense"><strong>${esc(row.attack)}</strong>${row.spell?`<span>${esc(row.spell)}</span>`:""}</div></article>`).join("");
    return `<article class="party-print-summary" aria-label="DM Party Quick Reference"><header class="party-summary-header"><div><p>CHARACTER FORGE · DM QUICK REFERENCE</p><h1>Party Quick Reference</h1><span>${esc(model.levelLabel)} · ${esc(model.ruleset)} rules · ${model.size} characters</span></div><aside><b>${certified?`${model.size}/${model.size} RULES LAWYER CERTIFIED`:`${model.certifiedCount}/${model.size} RAW CERTIFIED`}</b><small>${esc(model.buildId)}</small></aside></header><section class="party-summary-note">Use this page for initiative, defenses, passive Perception, movement, and each character’s primary offense. Full validated player sheets follow.</section><main class="party-summary-grid party-size-${model.size}">${cards}</main><footer><span>Generated from the same validated Party Forge characters printed in this packet.</span><b>Character Forge · ${esc(model.ruleset)}</b></footer></article>`;
  }catch(error){console.error("[party-print-summary] render failed",error);throw error;}
}
