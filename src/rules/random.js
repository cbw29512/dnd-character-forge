import { FORGE_FAMILY_NAMES, FORGE_GIVEN_NAMES } from "../data/original-names.js";

const RECENT_LIMIT=4;
const NAME_RECENT_LIMIT=8;
const recentByCategory=new Map();
const recentGivenNames=[];
const recentFamilyNames=[];
let pickSerial=0;
let classContext=null;

// The generator historically owns this small local array. Recognizing it here
// keeps old callers compatible while moving actual Random identity generation
// onto the large Forge Original composable pool.
const LEGACY_GENERATOR_NAME_POOL=Object.freeze(new Set([
  "Aric Vale","Mira Stone","Tavian Reed","Selene Hart","Bren Ashford","Kael Rowan"
]));

const BACKGROUND_AFFINITY=Object.freeze({
  barbarian:Object.freeze(["soldier","pit-fighter","caravan-guard","monster-hunter","wilderness-guide"]),
  bard:Object.freeze(["royal-envoy","treasure-seeker","criminal","sage","deep-sailor"]),
  cleric:Object.freeze(["acolyte","grave-warden","field-medic","royal-envoy"]),
  druid:Object.freeze(["wilderness-guide","field-medic","grave-warden","monster-hunter","hedge-mage"]),
  fighter:Object.freeze(["soldier","watchman","caravan-guard","bounty-hunter","pit-fighter"]),
  monk:Object.freeze(["field-medic","watchman","caravan-guard","sage"]),
  paladin:Object.freeze(["soldier","watchman","royal-envoy","acolyte","grave-warden"]),
  ranger:Object.freeze(["wilderness-guide","monster-hunter","bounty-hunter","caravan-guard","deep-sailor"]),
  rogue:Object.freeze(["criminal","bounty-hunter","treasure-seeker","watchman","deep-sailor"]),
  sorcerer:Object.freeze(["hedge-mage","royal-envoy","treasure-seeker","sage"]),
  warlock:Object.freeze(["grave-warden","hedge-mage","treasure-seeker","criminal"]),
  wizard:Object.freeze(["sage","hedge-mage","royal-envoy","treasure-seeker"])
});

export function pick(items) {
  try {
    if (!Array.isArray(items) || items.length === 0) throw new Error("Cannot pick from an empty list");
    if(isLegacyGeneratorNamePool(items))return randomCharacterName();
    const eligible = items.filter(item => item?.randomEligibleInForge === true || item?.randomEligible !== false);
    if (eligible.length === 0) throw new Error("Cannot pick from a list with no Random-eligible choices");

    pickSerial += 1;
    const category = categoryFor(eligible);
    const recent = remembersCategory(category) ? recentFor(category) : [];
    const fresh = recent.length && eligible.length > 1 ? eligible.filter(item => !recent.includes(choiceKey(item))) : eligible;
    const pool = fresh.length ? fresh : eligible;
    const selected = category === "background" ? pickBackground(pool) : pool[Math.floor(Math.random() * pool.length)];

    updateContext(category, selected);
    if (remembersCategory(category)) remember(category, selected, eligible.length);
    return selected;
  } catch (error) { console.error("[random] pick failed", error); throw error; }
}

export function randomCharacterName(){
  try{
    const given=pickFreshNamePart(FORGE_GIVEN_NAMES,recentGivenNames),family=pickFreshNamePart(FORGE_FAMILY_NAMES,recentFamilyNames);
    rememberNamePart(recentGivenNames,given);rememberNamePart(recentFamilyNames,family);
    return `${given} ${family}`;
  }catch(error){console.error("[random] character name failed",error);throw error;}
}

export function sample(items, count, excluded = []) {
  try {
    const pool = items.filter(item => !excluded.includes(item));
    if (pool.length < count) throw new Error(`Need ${count} choices but only ${pool.length} are available`);
    for (let index = pool.length - 1; index > 0; index--) {
      const target = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[target]] = [pool[target], pool[index]];
    }
    return pool.slice(0, count);
  } catch (error) { console.error("[random] sample failed", error); throw error; }
}

export function roll4d6DropLowest() {
  try {
    const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6)).sort((a,b)=>a-b);
    return rolls.slice(1).reduce((sum, value) => sum + value, 0);
  } catch (error) { console.error("[random] dice roll failed", error); throw error; }
}

export function resetRandomHistory(){
  try{recentByCategory.clear();recentGivenNames.length=0;recentFamilyNames.length=0;classContext=null;pickSerial=0;}
  catch(error){console.error("[random] history reset failed",error);throw error;}
}

function categoryFor(items){
  try{
    const item=items.find(value=>value&&typeof value==="object");
    if(!item)return null;
    if(item.hitDie&&item.skillChoices)return "class";
    if(item.classId&&Number.isFinite(Number(item.level)))return `subclass:${item.classId}`;
    if(Array.isArray(item.skills)&&Array.isArray(item.equipment)&&!item.classId)return "background";
    if(item.speed!=null&&(item.size||item.sizes||item.traits||item.abilityAdds))return "species";
    return item.randomCategory||null;
  }catch(error){console.error("[random] category resolution failed",error);return null;}
}

function pickBackground(pool){
  try{
    const context=classContext&&pickSerial-classContext.serial<=4?classContext:null;
    if(!context)return pool[Math.floor(Math.random()*pool.length)];
    const preferred=new Set(BACKGROUND_AFFINITY[context.id]||[]);
    const weighted=pool.map(item=>{
      let weight=1;
      if(preferred.has(item.id))weight+=5;
      if(Array.isArray(item.abilities)&&context.primary?.some(ability=>item.abilities.includes(ability)))weight+=3;
      if(Array.isArray(item.skills)&&context.skills?.some(skill=>item.skills.includes(skill)))weight+=2;
      return {item,weight};
    });
    const total=weighted.reduce((sum,entry)=>sum+entry.weight,0);
    let roll=Math.random()*total;
    for(const entry of weighted){roll-=entry.weight;if(roll<0)return entry.item;}
    return weighted.at(-1).item;
  }catch(error){console.error("[random] background weighting failed",error);return pool[Math.floor(Math.random()*pool.length)];}
}

function updateContext(category,selected){
  try{
    if(category==="class"){
      classContext={id:selected.id,primary:[...(selected.primary||[])],skills:[...(selected.skillChoices||[])],serial:pickSerial};
      return;
    }
    if(category==="background")classContext=null;
    else if(classContext&&pickSerial-classContext.serial>4)classContext=null;
  }catch(error){console.error("[random] context update failed",error);classContext=null;}
}

function remember(category,item,eligibleCount){
  try{
    const limit=Math.min(RECENT_LIMIT,Math.max(0,eligibleCount-1));
    if(limit===0){recentByCategory.delete(category);return;}
    const key=choiceKey(item),recent=recentFor(category).filter(value=>value!==key);
    recent.unshift(key);recentByCategory.set(category,recent.slice(0,limit));
  }catch(error){console.error("[random] recent-choice update failed",error);}
}
function recentFor(category){return recentByCategory.get(category)||[];}
function remembersCategory(category){return category==="class"||category==="species"||category==="background"||String(category||"").startsWith("subclass:");}
function choiceKey(item){return typeof item==="object"&&item!==null?String(item.id||item.name||JSON.stringify(item)):String(item);}
function isLegacyGeneratorNamePool(items){return items.length===LEGACY_GENERATOR_NAME_POOL.size&&items.every(item=>typeof item==="string"&&LEGACY_GENERATOR_NAME_POOL.has(item));}
function pickFreshNamePart(pool,recent){
  const fresh=recent.length&&pool.length>recent.length?pool.filter(value=>!recent.includes(value)):pool;
  return fresh[Math.floor(Math.random()*fresh.length)];
}
function rememberNamePart(recent,value){
  const without=recent.filter(item=>item!==value);without.unshift(value);recent.splice(0,recent.length,...without.slice(0,Math.min(NAME_RECENT_LIMIT,without.length)));
}
