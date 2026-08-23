import { clericSpellsFor } from "../data/cleric-spells.js";
import { abilityMod } from "./math.js";
import { resolveSpellChoices } from "./spells.js";
import { pick } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";

const CANTRIPS={1:3,2:3,3:3,4:4,5:4,6:4,7:4,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5};
const PREPARED_2024={1:4,2:5,3:6,4:7,5:9,6:10,7:11,8:12,9:14,10:15,11:16,12:16,13:17,14:17,15:18,16:18,17:19,18:20,19:21,20:22};
const SLOTS={1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}};
const LIFE_2014=[[1,["bless","cure-wounds"]],[3,["lesser-restoration","spiritual-weapon"]],[5,["beacon-of-hope","revivify"]],[7,["death-ward","guardian-of-faith"]],[9,["mass-cure-wounds","raise-dead"]]];
const LIFE_2024=[[3,["aid","bless","cure-wounds","lesser-restoration"]],[5,["mass-healing-word","revivify"]],[7,["aura-of-life","death-ward"]],[9,["greater-restoration","mass-cure-wounds"]]];
const BLESSED_STRIKES=["divine-strike","potent-spellcasting"];

export function lifeDomainAlwaysPrepared(ruleset,level){
  try{return uniqueStrings((ruleset==="2014"?LIFE_2014:LIFE_2024).filter(([minimum])=>level>=minimum).flatMap(([,ids])=>ids));}
  catch(error){console.error("[cleric] Life Domain spell lookup failed",error);throw error;}
}
export function resolveDivineOrder(ruleset,selections={},spellSelections={},level=1){
  try{
    if(ruleset!=="2024")return null;
    const fixed=selections.divineOrder;if(fixed&&!['protector','thaumaturge'].includes(fixed))throw new Error(`Divine Order "${fixed}" is unavailable.`);
    const cantrips=spellSelections.cantrips||selections.cantrips||[],ceiling=baseCantrips(level);
    if(fixed==="protector"&&cantrips.length>ceiling)throw new Error("Protector cannot support the extra Thaumaturge cantrip selection.");
    if(fixed)return fixed;
    if(cantrips.length>ceiling)return "thaumaturge";
    return pick(["protector","thaumaturge"]);
  }catch(error){console.error("[cleric] Divine Order resolution failed",error);throw error;}
}
export function resolveBlessedStrikes(ruleset,level,selections={}){
  try{
    const fixed=selections.blessedStrikes;
    if(ruleset!=="2024"||Number(level)<7){if(fixed)throw new Error("Blessed Strikes is unavailable before Cleric level 7.");return null;}
    if(fixed&&!BLESSED_STRIKES.includes(fixed))throw new Error(`Blessed Strikes option "${fixed}" is unavailable.`);
    return fixed||pick(BLESSED_STRIKES);
  }catch(error){console.error("[cleric] Blessed Strikes resolution failed",error);throw error;}
}
export function validateClericClassSelections({ruleset,level,selections={},spellSelections={}}){
  try{resolveDivineOrder(ruleset,selections,spellSelections,level);resolveBlessedStrikes(ruleset,level,selections);return{valid:true};}
  catch(error){console.error("[cleric] class selection validation failed",error);throw error;}
}
export function clericProgressionFor(rulesetOrLevel,maybeLevel){
  try{
    const ruleset=maybeLevel===undefined?"2024":rulesetOrLevel,value=Number(maybeLevel===undefined?rulesetOrLevel:maybeLevel);
    if(!["2014","2024"].includes(ruleset)||!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Cleric level ${value}.`);
    if(ruleset==="2014")return Object.freeze({cantrips:CANTRIPS[value],prepared:null,slots:Object.freeze({...SLOTS[value]}),channelDivinityUses:value<2?0:value<6?1:value<18?2:3,divineSparkDice:0,destroyUndeadCr:destroyUndeadCr(value),divineInterventionThreshold:value<10?null:value>=20?"automatic":value});
    return Object.freeze({cantrips:CANTRIPS[value],prepared:PREPARED_2024[value],slots:Object.freeze({...SLOTS[value]}),channelDivinityUses:value<2?0:value<6?2:value<18?3:4,divineSparkDice:value<2?0:value<7?1:value<13?2:value<18?3:4,destroyUndeadCr:null,divineInterventionThreshold:null});
  }catch(error){console.error("[cleric] progression lookup failed",error);throw error;}
}
export function clericPickerLimits({ruleset,level,divineOrder=null}){
  try{const value=Number(level),base=CANTRIPS[value];return{cantrips:ruleset==="2024"?base+(divineOrder==="protector"?0:1):base,prepared:ruleset==="2024"?PREPARED_2024[value]:null};}
  catch(error){console.error("[cleric] picker limits failed",error);throw error;}
}
export function validateClericSelections({ruleset,level,selections={},divineOrder=null}){
  try{
    const value=Number(level),spells=clericSpellsFor(ruleset),limits=clericPickerLimits({ruleset,level:value,divineOrder}),maxLevel=maxSpellLevel(value);
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
    validateClericSelections({ruleset:character.ruleset,level:character.level,selections,divineOrder:character.divineOrder});
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
const baseCantrips=level=>CANTRIPS[Number(level)]||3;
const maxSpellLevel=level=>Math.min(9,Math.ceil(Number(level)/2));
function destroyUndeadCr(level){try{const value=Number(level);if(value<5)return null;if(value<8)return"1/2";if(value<11)return"1";if(value<14)return"2";if(value<17)return"3";return"4";}catch(error){console.error("[cleric] Destroy Undead lookup failed",error);throw error;}}
