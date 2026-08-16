import { clericSpellsFor } from "../data/cleric-spells.js";
import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { pick } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";

const CANTRIPS={1:3,2:3,3:3,4:4,5:4};
const PREPARED_2024={1:4,2:5,3:6,4:7,5:9};
const SLOTS={1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2}};
const LIFE_2014=[[1,["bless","cure-wounds"]],[3,["lesser-restoration","spiritual-weapon"]],[5,["beacon-of-hope","revivify"]]];
const LIFE_2024=[[3,["aid","bless","cure-wounds","lesser-restoration"]],[5,["mass-healing-word","revivify"]]];

export function lifeDomainAlwaysPrepared(ruleset,level){
  try{return uniqueStrings((ruleset==="2014"?LIFE_2014:LIFE_2024).filter(([minimum])=>level>=minimum).flatMap(([,ids])=>ids));}
  catch(error){console.error("[cleric] Life Domain spell lookup failed",error);throw error;}
}
export function resolveDivineOrder(ruleset,selections={}){
  try{
    if(ruleset!=="2024")return null;
    if((selections.cantrips||[]).length>3)return "thaumaturge";
    return pick(["protector","thaumaturge"]);
  }catch(error){console.error("[cleric] Divine Order resolution failed",error);throw error;}
}
export function clericPickerLimits({ruleset,level}){
  try{const value=Number(level);return{cantrips:ruleset==="2024"?CANTRIPS[value]+1:CANTRIPS[value],prepared:ruleset==="2024"?PREPARED_2024[value]:null};}
  catch(error){console.error("[cleric] picker limits failed",error);throw error;}
}
export function validateClericSelections({ruleset,level,selections={}}){
  try{
    const value=Number(level),spells=clericSpellsFor(ruleset),limits=clericPickerLimits({ruleset,level:value}),maxLevel=maxSpellLevel(value);
    const cantrips=selections.cantrips||[],prepared=selections.prepared||[],always=new Set(lifeDomainAlwaysPrepared(ruleset,value));
    for(const [label,values] of [["cantrips",cantrips],["prepared spells",prepared]]){const duplicates=duplicateValues(values);if(duplicates.length)throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}`);}
    if(cantrips.length>limits.cantrips)throw new Error(`Choose at most ${limits.cantrips} Cleric cantrips.`);
    if(limits.prepared!==null&&prepared.length>limits.prepared)throw new Error(`Choose at most ${limits.prepared} prepared Cleric spells.`);
    const cantripIds=new Set(spells.filter(spell=>spell.level===0).map(spell=>spell.id)),spellIds=new Set(spells.filter(spell=>spell.level>0&&spell.level<=maxLevel).map(spell=>spell.id));
    const badCantrips=cantrips.filter(id=>!cantripIds.has(id)),badPrepared=prepared.filter(id=>!spellIds.has(id));
    if(badCantrips.length)throw new Error(`Illegal Cleric cantrip selection: ${badCantrips.join(", ")}`);
    if(badPrepared.length)throw new Error(`Illegal Cleric prepared-spell selection: ${badPrepared.join(", ")}`);
    const redundant=prepared.filter(id=>always.has(id));if(redundant.length)throw new Error(`${redundant.join(", ")} is already always prepared by Life Domain.`);
    return{valid:true,limits};
  }catch(error){console.error("[cleric] selection validation failed",error);throw error;}
}
export function buildClericSpellcasting(character,selections={}){
  try{
    validateClericSelections({ruleset:character.ruleset,level:character.level,selections});
    const spells=clericSpellsFor(character.ruleset),cantripPool=spells.filter(spell=>spell.level===0).map(spell=>spell.id),alwaysPrepared=lifeDomainAlwaysPrepared(character.ruleset,character.level);
    const cantripCount=CANTRIPS[character.level]+(character.ruleset==="2024"&&character.divineOrder==="thaumaturge"?1:0);
    const cantrips=resolveSpellChoices({available:cantripPool,selected:selections.cantrips||[],required:cantripCount,label:"Cleric cantrips"});
    const preparedCount=character.ruleset==="2024"?PREPARED_2024[character.level]:Math.max(1,character.level+abilityMod(character.abilities.wis));
    const normalPool=spells.filter(spell=>spell.level>0&&spell.level<=maxSpellLevel(character.level)&&!alwaysPrepared.includes(spell.id)).map(spell=>spell.id);
    const prepared=resolveSpellChoices({available:normalPool,selected:selections.prepared||[],required:preparedCount,label:"prepared Cleric spells"});
    const names=uniqueStrings([...cantrips.all,...prepared.all,...alwaysPrepared].map(id=>spells.find(spell=>spell.id===id)?.name||id));
    return{ability:"wis",saveDc:8+character.proficiency+abilityMod(character.abilities.wis),attackBonus:character.proficiency+abilityMod(character.abilities.wis),slots:SLOTS[character.level],cantrips,prepared,alwaysPrepared,all:names};
  }catch(error){console.error("[cleric] spellcasting build failed",error);throw error;}
}
const maxSpellLevel=level=>Math.min(3,Math.ceil(level/2));
