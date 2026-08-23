import { ABILITIES, SKILLS } from "../schema.js";
import { abilityMod } from "../rules/math.js";
import { buildQuickReference } from "../rules/reference.js";
import { speciesChoiceLabel } from "../rules/species.js";
import { wizardSpellsFor } from "../data/wizard-spells.js";
import { clericSpellsFor } from "../data/cleric-spells.js";
import { selectPrintTheme } from "./theme.js";
import { buildQuickTurn } from "./quick-turn.js";

const fmt=value=>value>=0?`+${value}`:`${value}`;
export function buildPremiumPrintModel(character){
  try{
    if(!character?.validation?.valid)throw new Error("Premium print requires a validated character.");
    const references=buildQuickReference(character),theme=selectPrintTheme(character),species=speciesChoiceLabel(character),feat=chooseFeat(character,references);
    return{
      theme,
      identity:{name:character.name,level:character.level,className:character.class.name,subclassName:character.subclass?.name||null,species,background:character.background.name,size:character.size},
      stats:{ac:character.ac,hp:character.hp,initiative:fmt(character.initiative),initiativeAdvantage:Boolean(character.initiativeAdvantage),speed:`${character.speed} ft`,proficiency:fmt(character.proficiency),passivePerception:character.passivePerception,hitDice:`${character.level}d${character.class.hitDie}`},
      abilities:ABILITIES.map(id=>({id,name:abilityName(id),score:character.abilities[id],modifier:fmt(abilityMod(character.abilities[id])),save:fmt(character.saveBonuses[id]),proficient:character.saves.includes(id)})),
      skills:Object.entries(SKILLS).map(([id,ability])=>({id,name:skillName(id),ability:ability.toUpperCase(),bonus:fmt(character.skillBonuses[id]),proficient:character.skills.includes(id),expertise:character.expertise.includes(id)})),
      attacks:(character.attacks||[]).slice(0,4).map(attack=>({name:attack.name,toHit:fmt(attack.attackBonus),damage:`${attack.damage}${fmt(attack.damageBonus)} ${attack.type}`})),
      feat,
      features:chooseFeatures(references,feat?.name),
      proficiencies:{saves:character.saves.map(abilityName),tools:[...(character.toolProficiencies||[])],languages:[...(character.languages||[])],masteries:[...(character.masteryIds||[])]},
      equipment:equipmentLines(character.inventory||[]),
      spellcasting:spellcastingModel(character),
      quickTurn:buildQuickTurn(character),
      audit:{status:character.audit?.status||"PASS",sourceMode:character.sourceMode,version:character.audit?.sourceVersion||character.ruleset,rulesLabel:character.audit?.rulesLabel||`${character.ruleset} rules`,rawIntegrity:Boolean(character.audit?.rawIntegrity),checks:(character.audit?.checks||[]).slice(0,2)},
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
function spellcastingModel(character){
  try{
    if(!character.spells)return null;const catalog=spellCatalog(character),names=ids=>(ids||[]).map(id=>catalog.get(id)||id),slots=Object.entries(character.spells.slots||{}).map(([level,count])=>`${level}:${count}`).join(" · ");
    return{ability:abilityName(character.spells.ability),saveDc:character.spells.saveDc,attackBonus:fmt(character.spells.attackBonus),slots,cantrips:names(character.spells.cantrips?.all),prepared:names(character.spells.prepared?.all),alwaysPrepared:names(character.spells.alwaysPrepared),spellbookCount:character.spells.spellbook?.all?.length||0};
  }catch(error){console.error("[print-model] spellcasting failed",error);throw error;}
}
function spellCatalog(character){
  try{const source=character.class.id==="cleric"?clericSpellsFor(character.ruleset):character.class.id==="wizard"?wizardSpellsFor(character.ruleset):[];return new Map(source.map(spell=>[spell.id,spell.name]));}
  catch(error){console.error("[print-model] spell catalog failed",error);throw error;}
}
function equipmentLines(items){return items.slice(0,12).map(item=>`${item.quantity>1?`${item.quantity} × `:""}${item.name}`);}
function shorten(value,max){const text=String(value||"").replace(/\s+/g," ").trim();return text.length<=max?text:`${text.slice(0,max-1).trimEnd()}…`;}
function abilityName(id){return({str:"Strength",dex:"Dexterity",con:"Constitution",int:"Intelligence",wis:"Wisdom",cha:"Charisma"})[id]||String(id||"");}
function skillName(id){return String(id).replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}
