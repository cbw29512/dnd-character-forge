import { pick, sample } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { legalDruidForms } from "../data/druid-forms.js";

const SLOTS={1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}};
const CANTRIPS_2014={1:2,2:2,3:2,4:3,5:3,6:3,7:3,8:3,9:3,10:4,11:4,12:4,13:4,14:4,15:4,16:4,17:4,18:4,19:4,20:4};
const CANTRIPS_2024={1:2,2:2,3:2,4:3,5:3,6:3,7:3,8:3,9:3,10:4,11:4,12:4,13:4,14:4,15:4,16:4,17:4,18:4,19:4,20:4};
const PREPARED_2024={1:4,2:5,3:6,4:7,5:9,6:10,7:11,8:12,9:14,10:15,11:16,12:16,13:17,14:17,15:18,16:18,17:19,18:20,19:21,20:22};
export const LAND_2014=Object.freeze(["arctic","coast","desert","forest","grassland","mountain","swamp","underdark"]);
export const LAND_2024=Object.freeze(["arid","polar","temperate","tropical"]);
export const PRIMAL_ORDERS_2024=Object.freeze(["magician","warden"]);
export const ELEMENTAL_FURY_2024=Object.freeze(["potent-spellcasting","primal-strike"]);

export function druidProgressionFor(ruleset,level,subclassId=null){
  try{
    const value=Number(level);if(!["2014","2024"].includes(ruleset)||!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Druid level ${level}.`);
    const circle=subclassId==="circle-land";
    if(ruleset==="2014")return Object.freeze({cantrips:CANTRIPS_2014[value]+(circle&&value>=2?1:0),prepared:null,slots:Object.freeze({...SLOTS[value]}),wildShapeUses:value<2?0:2,unlimitedWildShape:value>=20,wildShapeTempHp:null,knownFormCount:null,maxCr:maxCr(value),allowSwim:value>=4,allowFly:value>=8,durationHours:value<2?0:Math.floor(value/2),naturalRecovery:circle&&value>=2?Math.ceil(value/2):0,landsStride:circle&&value>=6,naturesWard:circle&&value>=10,naturesSanctuary:circle&&value>=14,timelessBody:value>=18,beastSpells:value>=18,archdruid:value>=20});
    return Object.freeze({cantrips:CANTRIPS_2024[value],prepared:PREPARED_2024[value],slots:Object.freeze({...SLOTS[value]}),wildShapeUses:value<2?0:value<6?2:value<17?3:4,unlimitedWildShape:false,wildShapeTempHp:value<2?0:value,knownFormCount:value<2?0:value<4?4:value<8?6:8,maxCr:maxCr(value),allowSwim:value>=2,allowFly:value>=8,durationHours:value<2?0:Math.floor(value/2),wildCompanion:value>=2,wildResurgence:value>=5,elementalFury:value>=7,improvedElementalFury:value>=15,beastSpells:value>=18,epicBoon:value>=19,archdruid:value>=20,evergreenWildShape:value>=20,natureMagician:value>=20,circleLand:circle&&value>=3,landsAidDice:circle&&value>=3?(value>=14?4:value>=10?3:2):0,naturalRecovery:circle&&value>=6?Math.ceil(value/2):0,naturesWard:circle&&value>=10,naturesSanctuary:circle&&value>=14});
  }catch(error){console.error("[druid] progression lookup failed",error);throw error;}
}
export function resolveDruidSelections(ruleset,level,subclassId,selections={}){
  try{
    const value=Number(level),progression=druidProgressionFor(ruleset,value,subclassId),result={primalOrder:null,circleLand:null,elementalFury:null,knownForms:[],fieldForms:[],fieldFormsAreExamples:ruleset==="2014"};
    if(ruleset==="2014"){
      if(subclassId==="circle-land"&&value>=2)result.circleLand=resolveOne(selections.circleLand,LAND_2014,"2014 Circle land");else if(selections.circleLand)throw new Error("2014 Circle land is unavailable without Circle of the Land at level 2+.");
      if(value>=2)result.fieldForms=resolveForms(ruleset,selections.fieldForms||[],Math.min(4,legalFormsForProgression(ruleset,progression).length),progression,"field forms");else if((selections.fieldForms||[]).length)throw new Error("2014 Wild Shape field forms are unavailable before level 2.");
      if(selections.primalOrder||selections.elementalFury||(selections.knownForms||[]).length)throw new Error("2014 Druid cannot contain 2024 Druid selections.");
      return Object.freeze({...result,fieldForms:Object.freeze(result.fieldForms)});
    }
    result.primalOrder=resolveOne(selections.primalOrder,PRIMAL_ORDERS_2024,"Primal Order");
    if(subclassId==="circle-land"&&value>=3)result.circleLand=resolveOne(selections.circleLand,LAND_2024,"2024 Circle land");else if(selections.circleLand)throw new Error("2024 Circle land is unavailable without Circle of the Land at level 3+.");
    if(value>=7)result.elementalFury=resolveOne(selections.elementalFury,ELEMENTAL_FURY_2024,"Elemental Fury");else if(selections.elementalFury)throw new Error("Elemental Fury is unavailable before Druid level 7.");
    if(progression.knownFormCount)result.knownForms=resolveForms(ruleset,selections.knownForms||[],progression.knownFormCount,progression,"known Wild Shape forms");else if((selections.knownForms||[]).length)throw new Error("2024 Wild Shape forms are unavailable before level 2.");
    if((selections.fieldForms||[]).length)throw new Error("2024 Druid uses knownForms, not 2014 fieldForms.");
    return Object.freeze({...result,knownForms:Object.freeze(result.knownForms)});
  }catch(error){console.error("[druid] selection resolution failed",error);throw error;}
}
export function legalFormsForProgression(ruleset,progression){try{return legalDruidForms(ruleset,{maxCr:progression.maxCr,allowSwim:progression.allowSwim,allowFly:progression.allowFly});}catch(error){console.error("[druid] legal form pool failed",error);throw error;}}
export function natureWardResistance(land){try{return({arid:"Fire",polar:"Cold",temperate:"Lightning",tropical:"Poison"})[land]||null;}catch(error){console.error("[druid] Nature's Ward lookup failed",error);throw error;}}
export function druidPickerLimits({ruleset,level,subclassId=null,primalOrder=null}){try{const p=druidProgressionFor(ruleset,level,subclassId),bonus=ruleset==="2024"&&primalOrder==="magician"?1:0;return{cantrips:p.cantrips+bonus,prepared:ruleset==="2024"?p.prepared:null};}catch(error){console.error("[druid] picker-limit lookup failed",error);throw error;}}
export function maxDruidSpellLevel(level){return Math.min(9,Math.ceil(Number(level)/2));}

function maxCr(level){const value=Number(level);if(value<2)return 0;if(value<4)return .25;if(value<8)return .5;return 1;}
function resolveOne(requested,allowed,label){try{if(requested&&!allowed.includes(requested))throw new Error(`${label} "${requested}" is unavailable.`);return requested||pick(allowed);}catch(error){console.error(`[druid] ${label} selection failed`,error);throw error;}}
function resolveForms(ruleset,selected,count,progression,label){
  try{
    const duplicates=duplicateValues(selected);if(duplicates.length)throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}.`);if(selected.length>count)throw new Error(`Choose at most ${count} ${label}.`);
    const pool=legalFormsForProgression(ruleset,progression),ids=new Set(pool.map(item=>item.id)),bad=selected.filter(id=>!ids.has(id));if(bad.length)throw new Error(`Illegal ${label}: ${bad.join(", ")}.`);if(pool.length<count)throw new Error(`Verified ${ruleset} Wild Shape catalog has only ${pool.length} legal forms but ${count} are required.`);
    return uniqueStrings([...selected,...sample(pool.map(item=>item.id),count-selected.length,selected)]).slice(0,count);
  }catch(error){console.error(`[druid] ${label} resolution failed`,error);throw error;}
}
