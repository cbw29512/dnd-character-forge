import { ABILITIES, SKILLS } from "../schema.js";
import { bardMagicalSecretsPool } from "../data/bard-magical-secrets.js";
import { warlockSpellsFor } from "../data/warlock-spells.js";
import { abilityMod } from "../rules/math.js";
import { buildQuickReference } from "../rules/reference-router.js";
import { speciesChoiceLabel } from "../rules/species.js";
import { normalizeSheetCustomization, sheetCustomizationClasses, sheetCustomizationStyle } from "./customization.js";
import { compactFeatureCards, compactRuleIndex, exportProfileFor } from "./profile.js";
import { selectPrintTheme } from "./theme.js";
import { buildWarlockUtility } from "./warlock-utility.js";

const fmt=value=>value>=0?`+${value}`:`${value}`;

export function buildWarlockPremiumPrintModel(character){
  try{
    if(character?.class?.id!=="warlock")throw new Error("Warlock print model requires a Warlock character.");
    if(!character.validation?.valid)throw new Error("Warlock premium print requires a validated character.");
    const references=buildQuickReference(character),profile=exportProfileFor(character),theme=selectPrintTheme(character),customization=normalizeSheetCustomization(character.presentation?.sheetCustomization),feat=chooseFeat(character,references),catalog=spellCatalog(character);
    const model={
      profile,theme,
      presentation:{customization,classes:sheetCustomizationClasses(customization),style:sheetCustomizationStyle(customization)},
      portraitDataUrl:customization.portraitVisible?safePortrait(character.presentation?.portraitDataUrl):null,
      identity:{name:character.name,level:character.level,classId:character.class.id,className:character.class.name,subclassName:character.subclass?.name||null,species:speciesChoiceLabel(character),background:character.background.name,size:character.size},
      stats:{ac:character.ac,hp:character.hp,initiative:fmt(character.initiative),initiativeAdvantage:Boolean(character.initiativeAdvantage),speed:`${character.speed} ft`,proficiency:fmt(character.proficiency),passivePerception:character.passivePerception,hitDice:`${character.level}d${character.class.hitDie}`},
      abilities:ABILITIES.map(id=>({id,name:abilityName(id),score:character.abilities[id],modifier:fmt(abilityMod(character.abilities[id])),save:fmt(character.saveBonuses[id]),proficient:character.saves.includes(id)})),
      skills:Object.entries(SKILLS).map(([id,ability])=>({id,name:skillName(id),ability:ability.toUpperCase(),bonus:fmt(character.skillBonuses[id]),proficient:character.skills.includes(id),expertise:character.expertise.includes(id)})),
      attacks:(character.attacks||[]).slice(0,4).map(attack=>({name:attack.name,toHit:fmt(attack.attackBonus),damage:`${attack.damage}${fmt(attack.damageBonus)} ${attack.type}`})),
      feat,
      features:compactFeatureCards(references,feat?.name,7),
      ruleIndex:compactRuleIndex(references,48),
      rogueResources:null,druidSupport:null,rangerSupport:null,
      classUtility:buildWarlockUtility(character),
      proficiencies:{saves:character.saves.map(abilityName),tools:[...(character.toolProficiencies||[])],languages:[...(character.languages||[])],masteries:[]},
      equipment:equipmentLines(character.inventory||[]),
      spellcasting:spellcastingModel(character,catalog),
      spellPage:spellPageModel(character,catalog),
      quickTurn:warlockQuickTurn(character,catalog),
      audit:auditModel(character),
      packet:{totalPages:profile.maxPages},
      motto:theme.motto
    };
    if(model.packet.totalPages!==2)throw new Error("Warlock print profile must be exactly two pages.");
    return model;
  }catch(error){console.error("[warlock-print-model] build failed",error);throw error;}
}

function spellPageModel(character,catalog){
  try{
    const byId=new Map(catalog.map(spell=>[spell.id,spell])),cantrips=new Set(character.spells.cantrips?.all||[]),known=new Set(character.spells.known?.all||[]),prepared=new Set(character.spells.prepared?.all||[]),always=new Set(character.spells.alwaysPrepared||[]),tomeCantrips=new Set(character.spells.tome?.cantrips||[]),tomeRituals=new Set(character.spells.tome?.rituals||[]),invocation=new Set(character.spells.invocationSpells||[]),arcanum=new Set(Object.values(character.spells.mysticArcanum||{}));
    const ids=[...cantrips,...known,...prepared,...always,...tomeCantrips,...tomeRituals,...invocation,...arcanum];
    const entries=[...new Set(ids)].map(id=>{
      const spell=byId.get(id);if(!spell)throw new Error(`Missing Warlock print spell ${id}.`);
      const tags=[];
      if(cantrips.has(id))tags.push("C");
      if(known.has(id))tags.push("K");
      if(prepared.has(id))tags.push("P");
      if(always.has(id))tags.push("A");
      if(tomeCantrips.has(id))tags.push("T");
      if(tomeRituals.has(id))tags.push("R");
      if(invocation.has(id))tags.push("I");
      if(arcanum.has(id))tags.push("X");
      return{id,name:spell.name,level:spell.level,tags:tags.join("")||"K"};
    }).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
    return{entries,source:`${character.audit.sourceVersion} · Warlock spell list pp.${character.ruleset==="2014"?"110–111":"74–76"} · Pact and invocation magic shown separately`,slots:Object.entries(character.spells.slots||{}).map(([level,count])=>`${level}:${count}`).join(" · "),ability:abilityName(character.spells.ability),saveDc:character.spells.saveDc,attackBonus:fmt(character.spells.attackBonus),warlock:{pactSlotLevel:character.spells.pactMagic.slotLevel,pactSlotCount:character.spells.pactMagic.slotCount,invocations:[...(character.warlockSelections?.invocations?.all||[])],tomeCantrips:[...tomeCantrips],tomeRituals:[...tomeRituals],invocationSpells:[...invocation],mysticArcanum:{...(character.spells.mysticArcanum||{})},familiarForm:character.warlockSelections?.familiarForm||null}};
  }catch(error){console.error("[warlock-print-model] spell page failed",error);throw error;}
}

function spellcastingModel(character,catalog){
  try{
    const names=new Map(catalog.map(spell=>[spell.id,spell.name])),map=ids=>(ids||[]).map(id=>names.get(id)||id),slots=Object.entries(character.spells.slots||{}).map(([level,count])=>`${level}:${count}`).join(" · ");
    const prepared=character.ruleset==="2014"?[]:map(character.spells.prepared?.all);
    return{ability:abilityName(character.spells.ability),saveDc:character.spells.saveDc,attackBonus:fmt(character.spells.attackBonus),slots,cantrips:map([...(character.spells.cantrips?.all||[]),...(character.spells.tome?.cantrips||[])]),known:map(character.spells.known?.all),prepared,alwaysPrepared:map([...(character.spells.alwaysPrepared||[]),...(character.spells.invocationSpells||[])]),spellbookCount:0};
  }catch(error){console.error("[warlock-print-model] spellcasting summary failed",error);throw error;}
}

function spellCatalog(character){
  try{
    const map=new Map();
    for(const spell of [...bardMagicalSecretsPool(character.ruleset),...warlockSpellsFor(character.ruleset,{subclassId:character.subclass?.id,includeFiend:true})])if(spell?.id&&!map.has(spell.id))map.set(spell.id,spell);
    return[...map.values()];
  }catch(error){console.error("[warlock-print-model] spell catalog failed",error);throw error;}
}

function equipmentLines(items){
  try{
    const normalized=items.map((item,index)=>{
      if(typeof item==="string"){
        const name=item.trim();
        if(!name)throw new Error(`Warlock inventory item ${index+1} is blank.`);
        return{name,quantity:1};
      }
      if(!item||typeof item!=="object"||typeof item.name!=="string"||!item.name.trim())throw new Error(`Warlock inventory item ${index+1} has no printable name.`);
      const quantity=Number(item.quantity??1);
      if(!Number.isInteger(quantity)||quantity<1)throw new Error(`Warlock inventory item ${item.name} has invalid quantity ${String(item.quantity)}.`);
      return{name:item.name.trim(),quantity};
    });
    const grouped=new Map();
    for(const item of normalized){
      const key=item.name.toLocaleLowerCase("en-US"),existing=grouped.get(key);
      if(existing)existing.quantity+=item.quantity;
      else grouped.set(key,{...item});
    }
    return[...grouped.values()].map(item=>item.quantity===1?item.name:`${item.quantity} × ${item.name}`);
  }catch(error){console.error("[warlock-print-model] equipment normalization failed",error);throw error;}
}
function chooseFeat(character,references){
  try{const feat=character.feats?.[0];if(!feat)return null;const ref=references.find(item=>item.name===feat.name);return{name:feat.name,text:shorten(ref?.text||"Applied to this character.",190),source:ref?.source?`${ref.source.version} · p.${ref.source.page}`:null};}
  catch(error){console.error("[warlock-print-model] feat selection failed",error);throw error;}
}
function auditModel(character){
  try{const a=character.audit;if(!a)throw new Error("Warlock premium export requires Rules Audit data.");return{status:a.status,sourceMode:a.sourceMode,version:a.sourceVersion,rulesLabel:a.rulesLabel,rawIntegrity:Boolean(a.rawIntegrity),license:a.license,scope:a.scope,mechanics:(a.mechanics||[]).map(item=>({label:item.label,value:item.value,source:`${item.source.version} · p.${item.source.page}`})),checks:[...(a.checks||[])]};}
  catch(error){console.error("[warlock-print-model] audit failed",error);throw error;}
}
function warlockQuickTurn(character,catalog){
  try{
    const names=new Map(catalog.map(spell=>[spell.id,spell.name])),steps=[`Pact Magic: ${character.spells.pactMagic.slotCount} level-${character.spells.pactMagic.slotLevel} slot${character.spells.pactMagic.slotCount===1?"":"s"}; all return after a Short or Long Rest.`];
    if(character.spells.cantrips.all.includes("eldritch-blast"))steps.push("Eldritch Blast is available at will; apply any listed invocation that modifies its attacks or damage.");
    else steps.push("Use an at-will cantrip or weapon when spending a Pact Magic slot is unnecessary.");
    if(character.warlockSelections?.familiarForm)steps.push(`Pact familiar: ${character.warlockSelections.familiarForm}. Check its invocation-enabled actions before ending your turn.`);
    const arcanum=Object.entries(character.spells.mysticArcanum||{});if(arcanum.length)steps.push(`Mystic Arcanum: ${arcanum.map(([level,id])=>`L${level} ${names.get(id)||id}`).join(" · ")}; each is once per Long Rest.`);
    steps.push("Track Concentration and reaction/trigger invocations before passing the turn.");return steps;
  }catch(error){console.error("[warlock-print-model] quick turn failed",error);throw error;}
}
function safePortrait(value){try{if(!value)return null;if(typeof value!=="string"||!/^data:image\/(?:jpeg|png|webp);base64,/i.test(value))throw new Error("Unsupported portrait data URL in Warlock print model.");return value;}catch(error){console.error("[warlock-print-model] portrait validation failed",error);throw error;}}
function shorten(value,max){const text=String(value||"").replace(/\s+/g," ").trim();return text.length<=max?text:`${text.slice(0,max-1).trimEnd()}…`;}
function abilityName(id){return({str:"Strength",dex:"Dexterity",con:"Constitution",int:"Intelligence",wis:"Wisdom",cha:"Charisma"})[id]||String(id).toUpperCase();}
function skillName(id){return String(id||"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/\b\w/g,char=>char.toUpperCase());}
