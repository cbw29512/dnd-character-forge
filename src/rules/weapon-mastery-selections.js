import { sample } from "./random.js";
import { barbarianProgressionFor } from "./barbarian.js";
import { fighterProgressionFor } from "./fighter.js";
import { paladinProgressionFor } from "./paladin.js";
import { rangerProgressionFor } from "./ranger.js";
import { rogueProgressionFor } from "./rogue.js";

const MASTERY_CLASSES=Object.freeze(new Set(["barbarian","fighter","paladin","ranger","rogue"]));

function token(value){
  try{return typeof value==="string"?value.trim().replace(/[^a-z0-9]/gi,"").toLowerCase():"";}
  catch(error){console.error("[weapon-mastery] token normalization failed",error);throw error;}
}

export function weaponMasteryCountFor(ruleset,classId,level,subclassId=null){
  try{
    if(ruleset!=="2024"||!MASTERY_CLASSES.has(classId))return 0;
    if(classId==="barbarian")return barbarianProgressionFor(ruleset,level,subclassId).masteryCount;
    if(classId==="fighter")return fighterProgressionFor(ruleset,level,subclassId).masteryCount;
    if(classId==="paladin")return paladinProgressionFor(ruleset,level,subclassId).masteryCount;
    if(classId==="ranger")return rangerProgressionFor(ruleset,level,subclassId).masteryCount;
    if(classId==="rogue")return rogueProgressionFor(level,subclassId,ruleset).masteryCount;
    return 0;
  }catch(error){console.error("[weapon-mastery] count resolution failed",error);throw error;}
}

export function weaponMasteryPoolFor(cls,data){
  try{
    if(!cls?.id||!data?.weapons)return[];
    const configured=Array.isArray(cls.masteryChoices)&&cls.masteryChoices.length?cls.masteryChoices:Object.keys(data.weapons);
    return [...new Set(configured.filter(id=>Object.hasOwn(data.weapons,id)))];
  }catch(error){console.error("[weapon-mastery] pool resolution failed",error);throw error;}
}

export function canonicalWeaponMasteryId(value,data,candidates=null){
  try{
    if(typeof value!=="string"||!value.trim()||!data?.weapons)return null;
    const pool=Array.isArray(candidates)?candidates:Object.keys(data.weapons),needle=token(value);
    return pool.find(id=>token(id)===needle||token(data.weapons[id]?.name)===needle)||null;
  }catch(error){console.error("[weapon-mastery] canonicalization failed",error);throw error;}
}

export function resolveWeaponMasteryChoices({ruleset,level,subclassId=null,cls,data,equipment,selections={}}){
  try{
    const count=weaponMasteryCountFor(ruleset,cls?.id,level,subclassId);
    if(!count)return[];
    const pool=weaponMasteryPoolFor(cls,data);
    if(pool.length<count)throw new Error(`${cls?.name||"Class"} requires ${count} Weapon Mastery choices, but only ${pool.length} verified weapons are available.`);

    // UI-created state is strict, but older saves can contain labels, duplicates,
    // retired weapons, or too many choices after a level/class change. Canonicalize
    // those values here so illegal persisted state can never survive generation.
    const raw=Array.isArray(selections.weaponMasteries)?selections.weaponMasteries:[],fixed=[];
    for(const value of raw){
      const id=canonicalWeaponMasteryId(value,data,pool);
      if(id&&!fixed.includes(id))fixed.push(id);
      if(fixed.length===count)break;
    }

    // Preserve the Forge's useful default: when slots remain Random, prefer weapons
    // the generated character actually carries before filling from the legal class pool.
    const equipped=[];
    for(const value of equipment?.weapons||[]){
      const id=canonicalWeaponMasteryId(value,data,pool);
      if(id&&!fixed.includes(id)&&!equipped.includes(id))equipped.push(id);
    }
    const seeded=[...fixed,...equipped].slice(0,count),remaining=count-seeded.length,
      resolved=[...seeded,...sample(pool,remaining,seeded)].slice(0,count);
    if(resolved.length!==count||new Set(resolved).size!==resolved.length||resolved.some(id=>!pool.includes(id)))
      throw new Error(`${cls?.name||"Class"} Weapon Mastery resolution produced an illegal state.`);
    return resolved;
  }catch(error){console.error("[weapon-mastery] choice resolution failed",error);throw error;}
}
