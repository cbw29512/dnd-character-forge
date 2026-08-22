import { wizardSpellsFor } from "../data/wizard-spells.js";
import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { pick } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { maxFullCasterSpellLevel } from "./full-caster.js";
import { wizardProgression } from "./wizard-progression.js";

export function wizardPickerLimits({ruleset,level,subclassId}){
  try{
    const character={ruleset,level:Number(level),subclass:subclassId?{id:subclassId}:null},row=wizardProgression(ruleset,level);
    return {cantrips:row.cantrips,spellbook:acquisitionSlots(character).length,prepared:row.prepared};
  }catch(error){console.error("[wizard] picker limits failed",error);throw error;}
}
export function validateWizardSelections({ruleset,level,subclassId,selections={}}){
  try{
    const character={ruleset,level:Number(level),subclass:subclassId?{id:subclassId}:null},limits=wizardPickerLimits({ruleset,level,subclassId});
    const cantrips=selections.cantrips||[],book=selections.spellbook||[],prepared=selections.prepared||[];
    if(cantrips.length>limits.cantrips)throw new Error(`Choose at most ${limits.cantrips} cantrips.`);
    if(limits.prepared!==null&&prepared.length>limits.prepared)throw new Error(`Choose at most ${limits.prepared} prepared spells.`);
    for(const [label,values] of [["cantrips",cantrips],["spellbook spells",book],["prepared spells",prepared]]){
      const duplicates=duplicateValues(values);if(duplicates.length)throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}`);
    }
    validateMandatoryBook(character,wizardSpellsFor(ruleset),selections);
    return {valid:true,limits};
  }catch(error){console.error("[wizard] selection validation failed",error);throw error;}
}
export function buildWizardSpellcasting(character,selections={}){
  try{
    const row=wizardProgression(character.ruleset,character.level),spells=wizardSpellsFor(character.ruleset),cantripPool=spells.filter(spell=>spell.level===0).map(spell=>spell.id);
    const cantrips=resolveSpellChoices({available:cantripPool,selected:selections.cantrips||[],required:row.cantrips,label:"cantrips"});
    const spellbook=buildSpellbook(character,spells,selections);
    const preparedCount=character.ruleset==="2024"?row.prepared:Math.max(1,character.level+abilityMod(character.abilities.int));
    const prepared=resolveSpellChoices({available:spellbook.all,selected:selections.prepared||[],required:Math.min(preparedCount,spellbook.all.length),label:"prepared spells"});
    return {ability:"int",saveDc:8+character.proficiency+abilityMod(character.abilities.int),attackBonus:character.proficiency+abilityMod(character.abilities.int),slots:row.slots,cantrips,spellbook,prepared,all:uniqueStrings([...cantrips.all,...prepared.all].map(id=>spells.find(spell=>spell.id===id)?.name||id))};
  }catch(error){console.error("[wizard] spellcasting build failed",error);throw error;}
}
function validateMandatoryBook(character,spells,selections){
  try{
    const levelSpells=spells.filter(spell=>spell.level>0&&spell.level<=maxFullCasterSpellLevel(character.level)),byId=new Map(levelSpells.map(spell=>[spell.id,spell]));
    const mandatory=uniqueStrings([...(selections.spellbook||[]),...(selections.prepared||[])]),illegal=mandatory.filter(id=>!byId.has(id)),slots=acquisitionSlots(character),assignments=new Map(),free=slots.map((slot,index)=>({...slot,index}));
    if(illegal.length)throw new Error(`Illegal Wizard spell selection: ${illegal.join(", ")}`);
    if(mandatory.length>slots.length)throw new Error(`Too many unique spellbook requirements: ${mandatory.length} of ${slots.length}.`);
    const ordered=mandatory.map(id=>byId.get(id)).sort((a,b)=>(a.school==="Evocation")-(b.school==="Evocation")||b.level-a.level);
    for(const spell of ordered)assignMandatory(spell,free,assignments);
    return {slots,assignments,levelSpells};
  }catch(error){console.error("[wizard] mandatory book validation failed",error);throw error;}
}
function buildSpellbook(character,spells,selections){
  try{
    const {slots,assignments,levelSpells}=validateMandatoryBook(character,spells,selections),free=slots.map((slot,index)=>({...slot,index}));
    const fillOrder=free.filter(slot=>!assignments.has(slot.index)).sort((a,b)=>(b.school?1:0)-(a.school?1:0)||a.maxLevel-b.maxLevel||a.characterLevel-b.characterLevel);
    for(const slot of fillOrder){const used=new Set(assignments.values()),pool=levelSpells.filter(spell=>spell.level<=slot.maxLevel&&(!slot.school||spell.school===slot.school)&&!used.has(spell.id));if(!pool.length)throw new Error(`No legal spell remains for ${slot.label}`);assignments.set(slot.index,pick(pool).id);}
    const all=slots.map((slot,index)=>assignments.get(index));return {selected:[...(selections.spellbook||[])],randomized:all.filter(id=>!(selections.spellbook||[]).includes(id)),all,acquisition:slots.map((slot,index)=>({label:slot.label,spellId:assignments.get(index)}))};
  }catch(error){console.error("[wizard] spellbook build failed",error);throw error;}
}
function assignMandatory(spell,free,assignments){
  try{const eligible=free.filter(slot=>!assignments.has(slot.index)&&spell.level<=slot.maxLevel&&(!slot.school||spell.school===slot.school));if(!eligible.length)throw new Error(`${spell.name} cannot be acquired legally by this Wizard level/subclass.`);const extra=spell.school==="Evocation"?eligible.filter(slot=>slot.school==="Evocation"):[],choices=(extra.length?extra:eligible).sort((a,b)=>a.maxLevel-b.maxLevel||b.characterLevel-a.characterLevel);assignments.set(choices[0].index,spell.id);}
  catch(error){console.error("[wizard] mandatory spell assignment failed",error);throw error;}
}
function acquisitionSlots(character){
  try{
    const slots=Array.from({length:6},()=>({characterLevel:1,maxLevel:1,school:null,label:"Level 1 apprenticeship"}));
    for(let level=2;level<=character.level;level++)for(let i=0;i<2;i++)slots.push({characterLevel:level,maxLevel:maxFullCasterSpellLevel(level),school:null,label:`Wizard level ${level}`});
    if(character.ruleset==="2024"&&character.subclass?.id==="evoker"&&character.level>=3){
      slots.push({characterLevel:3,maxLevel:2,school:"Evocation",label:"Evocation Savant"},{characterLevel:3,maxLevel:2,school:"Evocation",label:"Evocation Savant"});
      for(let level=5;level<=character.level&&level<=17;level+=2)slots.push({characterLevel:level,maxLevel:maxFullCasterSpellLevel(level),school:"Evocation",label:"Evocation Savant — new slot level"});
    }
    return slots;
  }catch(error){console.error("[wizard] acquisition slots failed",error);throw error;}
}
