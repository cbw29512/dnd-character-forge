import { wizardSpellsFor, WIZARD_SPELL_MASTERY_ACTION_IDS_2024 } from "../data/wizard-spells.js";
import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { pick } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";

const CANTRIPS={1:3,2:3,3:3,4:4,5:4,6:4,7:4,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5};
const PREPARED_2024={1:4,2:5,3:6,4:7,5:9,6:10,7:11,8:12,9:14,10:15,11:16,12:16,13:17,14:18,15:19,16:21,17:22,18:23,19:24,20:25};
const SLOTS={
  1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},
  11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}
};
const MASTERY_ACTION_IDS=new Set(WIZARD_SPELL_MASTERY_ACTION_IDS_2024);

export function wizardPickerLimits({ruleset,level,subclassId}){
  try{
    const character={ruleset,level:Number(level),subclass:subclassId?{id:subclassId}:null};
    return {cantrips:CANTRIPS[character.level],spellbook:acquisitionSlots(character).length,prepared:ruleset==="2024"?PREPARED_2024[character.level]:null,spellMastery:ruleset==="2024"&&character.level>=18,signatureSpells:ruleset==="2024"&&character.level>=20?2:0};
  }catch(error){console.error("[wizard] picker limits failed",error);throw error;}
}
export function validateWizardSelections({ruleset,level,subclassId,selections={}}){
  try{
    const character={ruleset,level:Number(level),subclass:subclassId?{id:subclassId}:null},limits=wizardPickerLimits({ruleset,level,subclassId});
    const cantrips=selections.cantrips||[],book=selections.spellbook||[],prepared=selections.prepared||[],signatures=selections.signatureSpells||[];
    if(cantrips.length>limits.cantrips)throw new Error(`Choose at most ${limits.cantrips} cantrips.`);
    if(limits.prepared!==null&&prepared.length>limits.prepared)throw new Error(`Choose at most ${limits.prepared} prepared spells.`);
    if(signatures.length>limits.signatureSpells)throw new Error(`Choose at most ${limits.signatureSpells} Signature Spells.`);
    if(!limits.spellMastery&&(selections.masteryLevel1||selections.masteryLevel2))throw new Error("Spell Mastery choices are unavailable before Wizard level 18.");
    if(!limits.signatureSpells&&signatures.length)throw new Error("Signature Spell choices are unavailable before Wizard level 20.");
    for(const [label,values] of [["cantrips",cantrips],["spellbook spells",book],["prepared spells",prepared],["Signature Spells",signatures]]){const duplicates=duplicateValues(values);if(duplicates.length)throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}`);}
    validateMandatoryBook(character,wizardSpellsFor(ruleset),selections);
    return {valid:true,limits};
  }catch(error){console.error("[wizard] selection validation failed",error);throw error;}
}
export function buildWizardSpellcasting(character,selections={}){
  try{
    const spells=wizardSpellsFor(character.ruleset),cantripPool=spells.filter(spell=>spell.level===0).map(spell=>spell.id);
    const cantrips=resolveSpellChoices({available:cantripPool,selected:selections.cantrips||[],required:CANTRIPS[character.level],label:"cantrips"});
    const spellbook=buildSpellbook(character,spells,selections);
    const preparedCount=character.ruleset==="2024"?PREPARED_2024[character.level]:Math.max(1,character.level+abilityMod(character.abilities.int));
    const prepared=resolveSpellChoices({available:spellbook.all,selected:selections.prepared||[],required:Math.min(preparedCount,spellbook.all.length),label:"prepared spells"});
    const spellMastery=resolveSpellMastery(character,spells,spellbook,selections),signatureSpells=resolveSignatureSpells(character,spells,spellbook,selections),alwaysPrepared=uniqueStrings([...(spellMastery?[spellMastery.level1,spellMastery.level2]:[]),...signatureSpells]);
    return {ability:"int",saveDc:8+character.proficiency+abilityMod(character.abilities.int),attackBonus:character.proficiency+abilityMod(character.abilities.int),slots:SLOTS[character.level],cantrips,spellbook,prepared,alwaysPrepared,spellMastery,signatureSpells,all:uniqueStrings([...cantrips.all,...prepared.all,...alwaysPrepared].map(id=>spells.find(spell=>spell.id===id)?.name||id))};
  }catch(error){console.error("[wizard] spellcasting build failed",error);throw error;}
}
function validateMandatoryBook(character,spells,selections){
  try{
    const levelSpells=spells.filter(spell=>spell.level>0&&spell.level<=maxSpellLevel(character)),byId=new Map(levelSpells.map(spell=>[spell.id,spell]));
    const featureSelections=[selections.masteryLevel1,selections.masteryLevel2,...(selections.signatureSpells||[])].filter(Boolean),mandatory=uniqueStrings([...(selections.spellbook||[]),...(selections.prepared||[]),...featureSelections]),illegal=mandatory.filter(id=>!byId.has(id)),slots=acquisitionSlots(character),assignments=new Map(),free=slots.map((slot,index)=>({...slot,index}));
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
function resolveSpellMastery(character,spells,spellbook,selections){
  try{
    if(character.ruleset!=="2024"||character.level<18)return null;
    const byId=new Map(spells.map(spell=>[spell.id,spell])),book=new Set(spellbook.all),eligible=level=>[...book].filter(id=>byId.get(id)?.level===level&&MASTERY_ACTION_IDS.has(id));
    const level1=resolveFeatureSpell(eligible(1),selections.masteryLevel1,"Spell Mastery level-1 spell"),level2=resolveFeatureSpell(eligible(2),selections.masteryLevel2,"Spell Mastery level-2 spell");
    return Object.freeze({level1,level2,freeCast:true,lowestLevel:true,reset:"Long Rest change"});
  }catch(error){console.error("[wizard] Spell Mastery resolution failed",error);throw error;}
}
function resolveSignatureSpells(character,spells,spellbook,selections){
  try{
    if(character.ruleset!=="2024"||character.level<20)return[];
    const byId=new Map(spells.map(spell=>[spell.id,spell])),available=spellbook.all.filter(id=>byId.get(id)?.level===3);
    return resolveSpellChoices({available,selected:selections.signatureSpells||[],required:2,label:"Signature Spells"}).all;
  }catch(error){console.error("[wizard] Signature Spells resolution failed",error);throw error;}
}
function resolveFeatureSpell(available,selected,label){try{if(!available.length)throw new Error(`No eligible ${label} exists in the spellbook.`);if(selected&&!available.includes(selected))throw new Error(`${selected} is not an eligible ${label}.`);return selected||pick(available);}catch(error){console.error(`[wizard] ${label} resolution failed`,error);throw error;}}
function assignMandatory(spell,free,assignments){
  try{const eligible=free.filter(slot=>!assignments.has(slot.index)&&spell.level<=slot.maxLevel&&(!slot.school||spell.school===slot.school));if(!eligible.length)throw new Error(`${spell.name} cannot be acquired legally by this Wizard level/subclass.`);const extra=spell.school==="Evocation"?eligible.filter(slot=>slot.school==="Evocation"):[],choices=(extra.length?extra:eligible).sort((a,b)=>a.maxLevel-b.maxLevel||b.characterLevel-a.characterLevel);assignments.set(choices[0].index,spell.id);}
  catch(error){console.error("[wizard] mandatory spell assignment failed",error);throw error;}
}
function acquisitionSlots(character){
  try{
    const slots=Array.from({length:6},()=>({characterLevel:1,maxLevel:1,school:null,label:"Level 1 apprenticeship"}));
    for(let level=2;level<=character.level;level++)for(let i=0;i<2;i++)slots.push({characterLevel:level,maxLevel:maxSpellLevel({...character,level}),school:null,label:`Wizard level ${level}`});
    if(character.ruleset==="2024"&&character.subclass?.id==="evoker"&&character.level>=3){
      slots.push({characterLevel:3,maxLevel:2,school:"Evocation",label:"Evocation Savant"},{characterLevel:3,maxLevel:2,school:"Evocation",label:"Evocation Savant"});
      for(const level of [5,7,9,11,13,15,17])if(character.level>=level)slots.push({characterLevel:level,maxLevel:maxSpellLevel({...character,level}),school:"Evocation",label:`Evocation Savant — new slot level ${maxSpellLevel({...character,level})}`});
    }
    return slots;
  }catch(error){console.error("[wizard] acquisition slots failed",error);throw error;}
}
const maxSpellLevel=character=>character.ruleset==="2024"?Math.min(9,Math.ceil(Number(character.level)/2)):Math.min(3,Math.ceil(Number(character.level)/2));
