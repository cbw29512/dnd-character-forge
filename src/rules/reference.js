import { REFERENCE_2014, REFERENCE_2024, MASTERY_REFERENCE } from "../data/quick-reference.js";
import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { abilityMod } from "./math.js";

const dataFor=ruleset=>ruleset==="2014"?RAW_2014:RAW_2024,refsFor=ruleset=>ruleset==="2014"?REFERENCE_2014:REFERENCE_2024;
export function buildQuickReference(character){
  try{
    const rules=refsFor(character.ruleset),items=[];
    for(const trait of character.species.traits||[])push(items,`species:${trait}`,trait,required(rules.species?.[trait],trait));
    if(character.background.feature)push(items,`background:${character.background.feature}`,character.background.feature,required(rules.background?.[character.background.feature],character.background.feature));
    for(const feat of character.feats||[])push(items,`feat:${feat.id}`,feat.name,required(rules.feat?.[feat.name],feat.name));
    if(character.fightingStyle)push(items,`style:${character.fightingStyle.name}`,character.fightingStyle.name,required(rules.style?.[character.fightingStyle.name],character.fightingStyle.name));
    for(const name of character.features||[]){if(name==="Fighting Style"||name.startsWith("Fighting Style:"))continue;push(items,`feature:${name}`,name,dynamicFeature(character,name)||required(rules.feature?.[name],name));}
    for(const mastery of masteryEntries(character))push(items,`mastery:${mastery.weaponId}`,`${mastery.weaponName} — ${mastery.property}`,required(MASTERY_REFERENCE[mastery.property],mastery.property));
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate quick-reference entries detected.");return items;
  }catch(error){console.error("[reference] build failed",error);throw error;}
}
export function masteryEntries(character){
  try{
    if(character.ruleset!=="2024"||!character.masteryIds?.length)return[];const data=dataFor(character.ruleset);
    return character.masteryIds.map(weaponId=>{const weapon=data.weapons[weaponId];if(!weapon)throw new Error(`Unknown mastery weapon ${weaponId}.`);if(!weapon.mastery)throw new Error(`${weapon.name} is missing its Weapon Mastery property.`);if(!MASTERY_REFERENCE[weapon.mastery])throw new Error(`Missing quick reference for ${weapon.mastery}.`);return{weaponId,weaponName:weapon.name,property:weapon.mastery};});
  }catch(error){console.error("[reference] mastery lookup failed",error);throw error;}
}
function dynamicFeature(character,name){
  try{
    if(name==="Second Wind")return secondWind(character);
    if(name==="Weapon Mastery")return{category:"Fighter",timing:"Passive",text:`Use the mastery properties for ${character.masteryIds.length} chosen weapons listed below. After a Long Rest, you can change one chosen weapon.`};
    if(name==="Tactical Shift")return{category:"Fighter",timing:"With Second Wind",text:`After using Second Wind as a Bonus Action, move up to ${Math.floor(character.speed/2)} ft without provoking Opportunity Attacks.`};
    if(name==="Arcane Recovery")return arcaneRecovery(character);
    if(name==="Scholar")return{category:"Wizard",timing:"Passive",text:`Expertise is already applied to ${pretty(character.expertise[0])}.`};
    if(name==="Channel Divinity: Preserve Life"||name==="Preserve Life")return preserveLife(character);
    if(name==="Sear Undead")return searUndead(character);
    return null;
  }catch(error){console.error(`[reference] dynamic ${name} failed`,error);throw error;}
}
function secondWind(character){
  const healing=`1d10 + ${character.level} HP`;if(character.ruleset==="2014")return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. One use; regain it after a Short or Long Rest.`};
  const uses=character.level>=4?3:2;return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. ${uses} uses; regain one after a Short Rest and all after a Long Rest.`};
}
function arcaneRecovery(character){
  const levels=Math.ceil(character.level/2),limit=`up to ${levels} total spell-slot level${levels===1?"":"s"}`;
  return character.ruleset==="2014"?{category:"Wizard",timing:"After Short Rest",text:`Once per day, recover expended slots totaling ${limit}; none can be level 6+.`}:{category:"Wizard",timing:"After Short Rest",text:`Recover expended slots totaling ${limit}; none can be level 6+. Once used, it returns after a Long Rest.`};
}
function preserveLife(character){
  const pool=5*character.level;if(character.ruleset==="2014")return{category:"Life Domain",timing:"Action · Channel Divinity",text:`Distribute up to ${pool} HP among creatures within 30 ft, but no creature can be healed above half its maximum. It has no effect on Undead or Constructs.`};
  return{category:"Life Domain",timing:"Magic action · Channel Divinity",text:`Distribute up to ${pool} HP among Bloodied creatures within 30 ft, including yourself, but no creature can be healed above half its maximum.`};
}
function searUndead(character){const dice=Math.max(1,abilityMod(character.abilities.wis));return{category:"Cleric",timing:"With Turn Undead",text:`Roll ${dice}d8. Each Undead that fails its Turn Undead save takes that much Radiant damage; this damage does not end the turning effect.`};}
function push(items,id,name,entry){items.push({id,name,...entry});}
function required(entry,name){if(!entry)throw new Error(`Missing quick reference for ${name}.`);return entry;}
function pretty(value){return String(value||"the chosen skill").replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}
