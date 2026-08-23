import { ABILITIES, SKILLS } from "../schema.js";
import { abilityMod } from "../rules/math.js";
import { buildQuickReference } from "../rules/reference.js";
import { CUNNING_STRIKE_OPTIONS_2024, rogueCunningStrikeDc } from "../rules/rogue.js";
import { speciesChoiceLabel } from "../rules/species.js";
import { wizardSpellsFor } from "../data/wizard-spells.js";
import { clericSpellsFor } from "../data/cleric-spells.js";
import { selectPrintTheme } from "./theme.js";
import { buildQuickTurn } from "./quick-turn.js";

const REFERENCE_PAGE_SIZE=5,SPELL_PAGE_SIZE=22;
const fmt=value=>value>=0?`+${value}`:`${value}`;
export function buildPremiumPrintModel(character){
  try{
    if(!character?.validation?.valid)throw new Error("Premium print requires a validated character.");
    const references=buildQuickReference(character),theme=selectPrintTheme(character),species=speciesChoiceLabel(character),feat=chooseFeat(character,references),appendix=appendixModel(character,references);
    return{
      theme,
      portraitDataUrl:safePortrait(character.presentation?.portraitDataUrl),
      identity:{name:character.name,level:character.level,className:character.class.name,subclassName:character.subclass?.name||null,species,background:character.background.name,size:character.size},
      stats:{ac:character.ac,hp:character.hp,initiative:fmt(character.initiative),initiativeAdvantage:Boolean(character.initiativeAdvantage),speed:`${character.speed} ft`,proficiency:fmt(character.proficiency),passivePerception:character.passivePerception,hitDice:`${character.level}d${character.class.hitDie}`},
      abilities:ABILITIES.map(id=>({id,name:abilityName(id),score:character.abilities[id],modifier:fmt(abilityMod(character.abilities[id])),save:fmt(character.saveBonuses[id]),proficient:character.saves.includes(id)})),
      skills:Object.entries(SKILLS).map(([id,ability])=>({id,name:skillName(id),ability:ability.toUpperCase(),bonus:fmt(character.skillBonuses[id]),proficient:character.skills.includes(id),expertise:character.expertise.includes(id)})),
      attacks:(character.attacks||[]).slice(0,4).map(attack=>({name:attack.name,toHit:fmt(attack.attackBonus),damage:`${attack.damage}${fmt(attack.damageBonus)} ${attack.type}`})),
      feat,
      features:chooseFeatures(references,feat?.name),
      rogueResources:roguePrintModel(character),
      proficiencies:{saves:character.saves.map(abilityName),tools:[...(character.toolProficiencies||[])],languages:[...(character.languages||[])],masteries:[...(character.masteryIds||[])]},
      equipment:equipmentLines(character.inventory||[]),
      spellcasting:spellcastingModel(character),
      quickTurn:buildQuickTurn(character),
      audit:{status:character.audit?.status||"PASS",sourceMode:character.sourceMode,version:character.audit?.sourceVersion||character.ruleset,rulesLabel:character.audit?.rulesLabel||`${character.ruleset} rules`,rawIntegrity:Boolean(character.audit?.rawIntegrity),checks:(character.audit?.checks||[]).slice(0,2)},
      appendix,
      packet:{totalPages:1+appendix.referencePages.length+appendix.spellPages.length+1},
      motto:theme.motto
    };
  }catch(error){console.error("[print-model] build failed",error);throw error;}
}
function chooseFeat(character,references){
  try{const feat=character.feats?.[0];if(!feat)return null;const ref=references.find(item=>item.name===feat.name);return{name:feat.name,text:shorten(ref?.text||"Applied to this character.",250),source:ref?.source?`${ref.source.version} · p.${ref.source.page}`:null};}
  catch(error){console.error("[print-model] feat selection failed",error);throw error;}
}
function chooseFeatures(references,featName){
  try{return references.filter(item=>item.name!==featName&&!item.id?.startsWith("mastery:")).sort((a,b)=>featurePriority(a)-featurePriority(b)).slice(0,9).map(item=>({name:item.name,text:shorten(item.text,205),timing:item.timing,source:`${item.source.version} · p.${item.source.page}`}));}
  catch(error){console.error("[print-model] feature selection failed",error);throw error;}
}
function featurePriority(item){if(item.id?.startsWith("feature:"))return 0;if(item.id?.startsWith("species:"))return 1;if(item.id?.startsWith("style:"))return 2;return 3;}
function appendixModel(character,references){
  try{
    const fullReferences=references.map(item=>({id:item.id,name:item.name,category:item.category,timing:item.timing,text:item.text,source:`${item.source.version} · p.${item.source.page}`}));
    return{referencePages:chunk(fullReferences,REFERENCE_PAGE_SIZE),spellPages:spellAppendixPages(character),audit:auditAppendix(character)};
  }catch(error){console.error("[print-model] appendix build failed",error);throw error;}
}
function spellAppendixPages(character){
  try{
    if(!character.spells)return[];const catalog=spellCatalogRecords(character),byId=new Map(catalog.map(spell=>[spell.id,spell])),cantrips=new Set(character.spells.cantrips?.all||[]),prepared=new Set(character.spells.prepared?.all||[]),always=new Set(character.spells.alwaysPrepared||[]),mastery=new Set(Object.values(character.spells.spellMastery||{}).filter(Boolean)),signature=new Set(character.spells.signatureSpells||[]),spellbook=new Set(character.spells.spellbook?.all||[]),ids=character.class.id==="wizard"?[...cantrips,...spellbook]:[...cantrips,...always,...prepared],unique=[...new Set(ids)];
    const entries=unique.map(id=>{const spell=byId.get(id);if(!spell)throw new Error(`Premium spell appendix is missing catalog record ${id}.`);const tags=[];if(cantrips.has(id))tags.push("Cantrip");else{if(always.has(id))tags.push("Always Prepared");if(prepared.has(id))tags.push("Prepared");if(mastery.has(id))tags.push("Spell Mastery");if(signature.has(id))tags.push("Signature Spell");if(character.class.id==="wizard"&&!tags.length)tags.push("Spellbook");}return{id,name:spell.name,level:spell.level,levelLabel:spell.level===0?"Cantrip":`Level ${spell.level}`,tags};}).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
    const sourceVersion=character.audit?.sourceVersion||character.ruleset,source=character.ruleset==="2014"&&character.class.id==="cleric"?`${sourceVersion} · Cleric spell list pp.106–107`:`${sourceVersion} · validated ${character.class.name} spell catalog`;return chunk(entries,SPELL_PAGE_SIZE).map((page,index)=>({index:index+1,total:Math.ceil(entries.length/SPELL_PAGE_SIZE),source,entries:page,slots:Object.entries(character.spells.slots||{}).map(([level,count])=>`${level}:${count}`).join(" · "),ability:abilityName(character.spells.ability),saveDc:character.spells.saveDc,attackBonus:fmt(character.spells.attackBonus)}));
  }catch(error){console.error("[print-model] spell appendix failed",error);throw error;}
}
function auditAppendix(character){
  try{const audit=character.audit;if(!audit)throw new Error("Premium rules packet requires Rules Audit data.");return{status:audit.status,sourceMode:audit.sourceMode,rawIntegrity:Boolean(audit.rawIntegrity),rulesLabel:audit.rulesLabel,sourceDocument:audit.sourceDocument,sourceVersion:audit.sourceVersion,sourceUrl:audit.sourceUrl,sourcePdfUrl:audit.sourcePdfUrl,license:audit.license,scope:audit.scope,mechanics:(audit.mechanics||[]).map(item=>({label:item.label,value:item.value,source:`${item.source.version} · p.${item.source.page}`})),checks:[...(audit.checks||[])]};}
  catch(error){console.error("[print-model] audit appendix failed",error);throw error;}
}
function roguePrintModel(character){
  try{
    if(character.class?.id!=="rogue")return null;const rogue=character.rogue;if(!rogue)throw new Error("Premium Rogue print requires Rogue progression state.");
    const is2024=character.ruleset==="2024",options=is2024?rogue.cunningStrikeOptions.map(id=>CUNNING_STRIKE_OPTIONS_2024.find(option=>option.id===id)).filter(Boolean).map(option=>({name:option.name,cost:`${option.cost}d6`,save:option.save?option.save.toUpperCase():null,effect:shorten(option.effect,105),requires:option.requires||null})):[];
    return{
      ruleset:character.ruleset,
      sneakAttack:`${rogue.sneakAttackDice}d6`,
      expertise:rogue.expertiseCount,
      masteries:rogue.masteryCount,
      cunningStrikeDc:is2024&&character.level>=5?rogueCunningStrikeDc(character):null,
      effectsPerSneak:is2024?(rogue.maxCunningStrikeEffects||0):0,
      reliableTalent:Boolean(rogue.reliableTalent),
      blindsense:rogue.blindsenseRange?`${rogue.blindsenseRange} ft`:null,
      thiefReflexes:Boolean(rogue.thiefReflexes),
      options,
      scrollWarning:is2024&&character.subclass?.id==="thief"&&character.level>=13?"Spell Scrolls use Intelligence. Above level 1: Intelligence (Arcana) DC 10 + spell level; a failed check disintegrates the scroll.":null
    };
  }catch(error){console.error("[print-model] Rogue resources failed",error);throw error;}
}
function spellcastingModel(character){
  try{
    if(!character.spells)return null;const catalog=spellCatalog(character),names=ids=>(ids||[]).map(id=>catalog.get(id)||id),slots=Object.entries(character.spells.slots||{}).map(([level,count])=>`${level}:${count}`).join(" · ");
    return{ability:abilityName(character.spells.ability),saveDc:character.spells.saveDc,attackBonus:fmt(character.spells.attackBonus),slots,cantrips:names(character.spells.cantrips?.all),prepared:names(character.spells.prepared?.all),alwaysPrepared:names(character.spells.alwaysPrepared),spellbookCount:character.spells.spellbook?.all?.length||0};
  }catch(error){console.error("[print-model] spellcasting failed",error);throw error;}
}
function spellCatalog(character){try{return new Map(spellCatalogRecords(character).map(spell=>[spell.id,spell.name]));}catch(error){console.error("[print-model] spell catalog failed",error);throw error;}}
function spellCatalogRecords(character){
  try{return character.class.id==="cleric"?clericSpellsFor(character.ruleset):character.class.id==="wizard"?wizardSpellsFor(character.ruleset):[];}
  catch(error){console.error("[print-model] spell catalog records failed",error);throw error;}
}
function safePortrait(value){const portrait=String(value||"");return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(portrait)?portrait:null;}
function equipmentLines(items){return items.slice(0,12).map(item=>`${item.quantity>1?`${item.quantity} × `:""}${item.name}`);}
function chunk(values,size){const pages=[];for(let i=0;i<values.length;i+=size)pages.push(values.slice(i,i+size));return pages;}
function shorten(value,max){const text=String(value||"").replace(/\s+/g," ").trim();return text.length<=max?text:`${text.slice(0,max-1).trimEnd()}…`;}
function abilityName(id){return({str:"Strength",dex:"Dexterity",con:"Constitution",int:"Intelligence",wis:"Wisdom",cha:"Charisma"})[id]||String(id||"");}
function skillName(id){return String(id).replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}
