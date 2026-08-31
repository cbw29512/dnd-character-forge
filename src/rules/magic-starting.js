import { MAGIC_MODES } from "../state.js";
import { forgeDataFor } from "../data/forge-data.js";

const DMG_2014={
  low:{"1-4":{gold:"normal starting equipment",items:{}},"5-10":{gold:"500 gp + 1d10 × 25 gp",items:{uncommon:0}},"11-16":{gold:"5,000 gp + 1d10 × 250 gp",items:{uncommon:1}},"17-20":{gold:"20,000 gp + 1d10 × 250 gp",items:{uncommon:2}}},
  normal:{"1-4":{gold:"normal starting equipment",items:{}},"5-10":{gold:"500 gp + 1d10 × 25 gp",items:{uncommon:0}},"11-16":{gold:"5,000 gp + 1d10 × 250 gp",items:{uncommon:2}},"17-20":{gold:"20,000 gp + 1d10 × 250 gp",items:{uncommon:2,rare:1}}},
  high:{"1-4":{gold:"normal starting equipment",items:{}},"5-10":{gold:"500 gp + 1d10 × 25 gp",items:{uncommon:1}},"11-16":{gold:"5,000 gp + 1d10 × 250 gp",items:{uncommon:3,rare:1}},"17-20":{gold:"20,000 gp + 1d10 × 250 gp",items:{uncommon:3,rare:2,veryRare:1}}}
};
const DMG_2024={
  low:{"1-1":{gold:"normal starting equipment",items:{}},"2-4":{gold:"normal starting equipment",items:{common:1}},"5-10":{gold:"500 gp + 1d10 × 25 gp",items:{common:1,uncommon:1}},"11-16":{gold:"5,000 gp + 1d10 × 250 gp",items:{common:2,uncommon:3,rare:1}},"17-20":{gold:"20,000 gp + 1d10 × 250 gp",items:{common:2,uncommon:4,rare:3,veryRare:1}}},
  normal:{"1-1":{gold:"normal starting equipment",items:{}},"2-4":{gold:"normal starting equipment",items:{common:1}},"5-10":{gold:"500 gp + 1d10 × 25 gp",items:{common:1,uncommon:1}},"11-16":{gold:"5,000 gp + 1d10 × 250 gp",items:{common:2,uncommon:3,rare:1}},"17-20":{gold:"20,000 gp + 1d10 × 250 gp",items:{common:2,uncommon:4,rare:3,veryRare:1}}},
  high:{"1-1":{gold:"normal starting equipment",items:{}},"2-4":{gold:"normal starting equipment",items:{common:1}},"5-10":{gold:"500 gp + 1d10 × 25 gp",items:{common:1,uncommon:1}},"11-16":{gold:"5,000 gp + 1d10 × 250 gp",items:{common:2,uncommon:3,rare:1}},"17-20":{gold:"20,000 gp + 1d10 × 250 gp",items:{common:2,uncommon:4,rare:3,veryRare:1}}}
};

const GENERAL_ELIGIBILITY=Object.freeze({classIds:null,requiresClassWeapon:false});
const WEAPON_ELIGIBILITY=Object.freeze({classIds:null,requiresClassWeapon:true});
export const STARTING_MAGIC_ITEM_CATALOG=Object.freeze([
  {id:"potion-of-healing",name:"Potion of Healing",rarity:"common",kind:"potion",attunement:false,eligibility:GENERAL_ELIGIBILITY},
  {id:"potion-of-climbing",name:"Potion of Climbing",rarity:"common",kind:"potion",attunement:false,eligibility:GENERAL_ELIGIBILITY},
  {id:"bag-of-holding",name:"Bag of Holding",rarity:"uncommon",kind:"wondrous",attunement:false,eligibility:GENERAL_ELIGIBILITY},
  {id:"goggles-of-night",name:"Goggles of Night",rarity:"uncommon",kind:"wondrous",attunement:false,eligibility:GENERAL_ELIGIBILITY},
  {id:"cloak-of-protection",name:"Cloak of Protection",rarity:"uncommon",kind:"wondrous",attunement:true,eligibility:GENERAL_ELIGIBILITY},
  {id:"weapon-plus-1",name:"Weapon, +1",rarity:"uncommon",kind:"weapon",attunement:false,eligibility:WEAPON_ELIGIBILITY},
  {id:"sending-stones",name:"Sending Stones",rarity:"uncommon",kind:"wondrous",attunement:false,eligibility:GENERAL_ELIGIBILITY},
  {id:"ring-of-protection",name:"Ring of Protection",rarity:"rare",kind:"ring",attunement:true,eligibility:GENERAL_ELIGIBILITY},
  {id:"weapon-plus-2",name:"Weapon, +2",rarity:"rare",kind:"weapon",attunement:false,eligibility:WEAPON_ELIGIBILITY},
  {id:"cloak-of-the-bat",name:"Cloak of the Bat",rarity:"rare",kind:"wondrous",attunement:true,eligibility:GENERAL_ELIGIBILITY},
  {id:"potion-of-superior-healing",name:"Potion of Superior Healing",rarity:"rare",kind:"potion",attunement:false,eligibility:GENERAL_ELIGIBILITY},
  {id:"ring-of-regeneration",name:"Ring of Regeneration",rarity:"veryRare",kind:"ring",attunement:true,eligibility:GENERAL_ELIGIBILITY},
  {id:"weapon-plus-3",name:"Weapon, +3",rarity:"veryRare",kind:"weapon",attunement:false,eligibility:WEAPON_ELIGIBILITY},
  {id:"potion-of-supreme-healing",name:"Potion of Supreme Healing",rarity:"veryRare",kind:"potion",attunement:false,eligibility:GENERAL_ELIGIBILITY}
].map(item=>Object.freeze(item)));

function tierFor(level){try{if(level<=1)return "1-1";if(level<=4)return "2-4";if(level<=10)return "5-10";if(level<=16)return "11-16";return "17-20";}catch(error){console.error("[magic] tier lookup failed",error);throw error;}}
function verifiedClassWeapon(ruleset,classId){
  try{
    const data=forgeDataFor(ruleset),cls=data.classes.find(value=>value.id===classId);
    if(!cls)throw new Error(`Unknown ${ruleset} class ${classId} while checking magic-item eligibility.`);
    for(const pkg of cls.equipmentPackages||[])for(const weaponId of pkg.weapons||[])if(data.weapons[weaponId])return {weaponId,weapon:data.weapons[weaponId]};
    return null;
  }catch(error){console.error("[magic] verified class weapon lookup failed",error);throw error;}
}

export function magicItemEligibleForClass({ruleset,classId,item,usedIds=[]}){
  try{
    if(!item||typeof item!=="object")throw new Error("Magic-item eligibility requires an item record.");
    forgeDataFor(ruleset).classes.find(value=>value.id===classId)||(()=>{throw new Error(`Unknown ${ruleset} class ${classId}.`);})();
    if(usedIds.includes(item.id))return false;
    const allowedClasses=item.eligibility?.classIds;
    if(Array.isArray(allowedClasses)&&!allowedClasses.includes(classId))return false;
    if(item.eligibility?.requiresClassWeapon&&!verifiedClassWeapon(ruleset,classId))return false;
    return true;
  }catch(error){console.error("[magic] item eligibility check failed",error);throw error;}
}

function candidatesFor(ruleset,classId,rarity,usedIds=[]){
  try{return STARTING_MAGIC_ITEM_CATALOG.filter(item=>item.rarity===rarity&&magicItemEligibleForClass({ruleset,classId,item,usedIds}));}
  catch(error){console.error("[magic] candidate lookup failed",error);throw error;}
}
function pick(items,offset=0){try{return items.length?items[offset%items.length]:null;}catch(error){console.error("[magic] item pick failed",error);throw error;}}
function resolveMagicMode(mode){
  try{
    if(mode!==MAGIC_MODES.RANDOM_MAGIC)return mode;
    const choices=[MAGIC_MODES.NO_MAGIC,MAGIC_MODES.LOW_MAGIC,MAGIC_MODES.NORMAL_MAGIC,MAGIC_MODES.HIGH_MAGIC];
    return choices[Math.floor(Math.random()*choices.length)];
  }catch(error){console.error("[magic] random mode resolution failed",error);throw error;}
}
function concreteItem(item,ruleset,classId){
  try{
    if(item.kind!=="weapon")return {...item};
    const resolved=verifiedClassWeapon(ruleset,classId);
    if(!resolved)throw new Error(`No verified class-legal weapon is available to resolve ${item.name} for ${ruleset} ${classId}.`);
    const enhancement=item.name.match(/,\s*\+\d+$/)?.[0];
    if(!enhancement)throw new Error(`Magic weapon template ${item.name} has no enhancement suffix.`);
    return {...item,id:`${item.id}:${resolved.weaponId}`,baseItemId:item.id,weaponId:resolved.weaponId,name:`${resolved.weapon.name}${enhancement}`};
  }catch(error){console.error("[magic] concrete item resolution failed",error);throw error;}
}

export function startingMagicPlan(ruleset,level,mode){
  try{
    const resolvedMode=resolveMagicMode(mode);
    if(resolvedMode===MAGIC_MODES.NO_MAGIC)return {ruleset,level,mode:resolvedMode,requestedMode:mode,gold:"normal starting equipment",items:[],source:mode===MAGIC_MODES.RANDOM_MAGIC?"Random campaign magic — resolved to No Magic":"No Magic — explicit user setting"};
    const table=ruleset==="2014"?DMG_2014:DMG_2024,band=tierFor(level),row=table[resolvedMode]?.[ruleset==="2014"?({"1-1":"1-4","2-4":"1-4"}[band]||band):band];
    if(!row)throw new Error(`No starting-magic guidance exists for ${ruleset} level ${level} mode ${resolvedMode}.`);
    return {ruleset,level,mode:resolvedMode,requestedMode:mode,gold:row.gold,allowance:row.items,items:[],source:mode===MAGIC_MODES.RANDOM_MAGIC?`Random campaign magic — resolved to ${resolvedMode}`:(ruleset==="2014"?"DMG 2014 Starting at Higher Levels":"2024 Starting Equipment at Higher Levels")};
  }catch(error){console.error("[magic] starting plan failed",error);throw error;}
}

export function generateStartingMagic({ruleset,level,mode,classId}){
  try{
    const plan=startingMagicPlan(ruleset,level,mode),usedIds=[];
    let index=0;
    for(const [rarity,count] of Object.entries(plan.allowance||{}))for(let i=0;i<count;i++){
      const candidates=candidatesFor(ruleset,classId,rarity,usedIds),item=pick(candidates,index++);
      if(!item)throw new Error(`No verified ${rarity} magic item is available for ${classId}.`);
      usedIds.push(item.id);plan.items.push({...concreteItem(item,ruleset,classId),source:plan.source});
    }
    return plan;
  }catch(error){console.error("[magic] starting magic generation failed",error);throw error;}
}
