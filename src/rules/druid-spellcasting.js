import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { druidCircleSpellIds, druidSpellsFor } from "../data/druid-spells.js";
import { druidPickerLimits, druidProgressionFor, maxDruidSpellLevel } from "./druid.js";

export function druidAlwaysPrepared(character){
  try{
    const ids=[];if(character.ruleset==="2024")ids.push("speak-with-animals");
    if(character.subclass?.id==="circle-land"&&character.druidSelections?.circleLand)ids.push(...druidCircleSpellIds(character.ruleset,character.druidSelections.circleLand,character.level));
    return uniqueStrings(ids);
  }catch(error){console.error("[druid-spellcasting] always-prepared lookup failed",error);throw error;}
}
export function validateDruidSpellSelections(character,selections={}){
  try{
    const progression=druidProgressionFor(character.ruleset,character.level,character.subclass?.id),limits=druidPickerLimits({ruleset:character.ruleset,level:character.level,subclassId:character.subclass?.id,primalOrder:character.druidSelections?.primalOrder}),catalog=druidSpellsFor(character.ruleset,{includeCircle:true}),base=druidSpellsFor(character.ruleset),always=new Set(druidAlwaysPrepared(character)),maxLevel=maxDruidSpellLevel(character.level),cantrips=selections.cantrips||[],prepared=selections.prepared||[];
    for(const [label,values] of [["Druid cantrips",cantrips],["prepared Druid spells",prepared]]){const duplicates=duplicateValues(values);if(duplicates.length)throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}.`);}
    if(cantrips.length>limits.cantrips)throw new Error(`Choose at most ${limits.cantrips} Druid cantrips.`);
    const preparedLimit=character.ruleset==="2014"?Math.max(1,character.level+abilityMod(character.abilities.wis)):progression.prepared;if(prepared.length>preparedLimit)throw new Error(`Choose at most ${preparedLimit} prepared Druid spells.`);
    const baseCantrips=new Set(base.filter(spell=>spell.level===0).map(spell=>spell.id)),normalSpells=new Set(base.filter(spell=>spell.level>0&&spell.level<=maxLevel).map(spell=>spell.id));
    const badCantrips=cantrips.filter(id=>!baseCantrips.has(id)),badPrepared=prepared.filter(id=>!normalSpells.has(id));if(badCantrips.length)throw new Error(`Illegal Druid cantrip selection: ${badCantrips.join(", ")}.`);if(badPrepared.length)throw new Error(`Illegal Druid prepared-spell selection: ${badPrepared.join(", ")}.`);
    const redundantCantrips=cantrips.filter(id=>always.has(id)),redundant=prepared.filter(id=>always.has(id));if(redundantCantrips.length)throw new Error(`${redundantCantrips.join(", ")} is already always prepared and cannot consume a normal Druid cantrip choice.`);if(redundant.length)throw new Error(`${redundant.join(", ")} is already always prepared and cannot consume normal Druid preparation.`);
    for(const id of always)if(!catalog.some(spell=>spell.id===id))throw new Error(`Always-prepared Druid spell ${id} is missing from the verified catalog.`);
    return{valid:true,limits:Object.freeze({...limits,prepared:preparedLimit})};
  }catch(error){console.error("[druid-spellcasting] selection validation failed",error);throw error;}
}
export function buildDruidSpellcasting(character,selections={}){
  try{
    const validation=validateDruidSpellSelections(character,selections),progression=druidProgressionFor(character.ruleset,character.level,character.subclass?.id),base=druidSpellsFor(character.ruleset),catalog=druidSpellsFor(character.ruleset,{includeCircle:true}),alwaysPrepared=druidAlwaysPrepared(character),maxLevel=maxDruidSpellLevel(character.level);
    const cantripPool=base.filter(spell=>spell.level===0&&!alwaysPrepared.includes(spell.id)).map(spell=>spell.id),cantrips=resolveSpellChoices({available:cantripPool,selected:selections.cantrips||[],required:validation.limits.cantrips,label:"Druid cantrips"});
    const normalPool=base.filter(spell=>spell.level>0&&spell.level<=maxLevel&&!alwaysPrepared.includes(spell.id)).map(spell=>spell.id),prepared=resolveSpellChoices({available:normalPool,selected:selections.prepared||[],required:validation.limits.prepared,label:"prepared Druid spells"});
    const names=uniqueStrings([...cantrips.all,...prepared.all,...alwaysPrepared].map(id=>catalog.find(spell=>spell.id===id)?.name||id));
    return{ability:"wis",saveDc:8+character.proficiency+abilityMod(character.abilities.wis),attackBonus:character.proficiency+abilityMod(character.abilities.wis),slots:progression.slots,cantrips,known:{selected:[],randomized:[],all:[]},prepared,alwaysPrepared,all:names};
  }catch(error){console.error("[druid-spellcasting] build failed",error);throw error;}
}
