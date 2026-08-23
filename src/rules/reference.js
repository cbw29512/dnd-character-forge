import { REFERENCE_2014, REFERENCE_2024, MASTERY_REFERENCE } from "../data/quick-reference.js";
import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { referenceProvenance } from "../data/rule-provenance.js";
import { abilityMod } from "./math.js";

const dataFor=ruleset=>ruleset==="2014"?RAW_2014:RAW_2024,refsFor=ruleset=>ruleset==="2014"?REFERENCE_2014:REFERENCE_2024;
export function buildQuickReference(character){
  try{
    const rules=refsFor(character.ruleset),items=[];
    for(const trait of character.species.traits||[])push(character,items,`species:${trait}`,trait,required(rules.species?.[trait],trait));
    if(character.background.feature)push(character,items,`background:${character.background.feature}`,character.background.feature,required(rules.background?.[character.background.feature],character.background.feature));
    for(const feat of character.feats||[])push(character,items,`feat:${feat.id}`,feat.name,required(rules.feat?.[feat.name],feat.name));
    const styles=character.fightingStyles?.length?character.fightingStyles:(character.fightingStyle?[character.fightingStyle]:[]);
    for(const style of styles)push(character,items,`style:${style.name}`,style.name,required(rules.style?.[style.name],style.name));
    for(const name of character.features||[]){if(name==="Fighting Style"||name.startsWith("Fighting Style:"))continue;push(character,items,`feature:${name}`,name,dynamicFeature(character,name)||required(rules.feature?.[name],name));}
    for(const mastery of masteryEntries(character))push(character,items,`mastery:${mastery.weaponId}`,`${mastery.weaponName} — ${mastery.property}`,required(MASTERY_REFERENCE[mastery.property],mastery.property));
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
    if(name==="Spellcasting")return spellcasting(character);
    if(name==="Second Wind")return secondWind(character);
    if(name==="Action Surge")return actionSurge(character);
    if(["Extra Attack","Two Extra Attacks","Three Extra Attacks"].includes(name))return extraAttack(character);
    if(name==="Indomitable")return indomitable(character);
    if(name==="Remarkable Athlete")return remarkableAthlete(character);
    if(name==="Additional Fighting Style")return additionalFightingStyle(character);
    if(name==="Superior Critical")return superiorCritical(character);
    if(name==="Weapon Mastery")return{category:"Fighter",timing:"Passive",text:`Use the mastery properties for ${character.masteryIds.length} chosen weapons listed below. After a Long Rest, you can change one chosen weapon.`};
    if(name==="Tactical Shift")return{category:"Fighter",timing:"With Second Wind",text:`After using Second Wind as a Bonus Action, move up to ${Math.floor(character.speed/2)} ft without provoking Opportunity Attacks.`};
    if(name==="Arcane Recovery")return arcaneRecovery(character);
    if(name==="Scholar")return{category:"Wizard",timing:"Passive",text:`Expertise is already applied to ${pretty(character.expertise[0])}.`};
    if(name==="Channel Divinity: Preserve Life"||name==="Preserve Life")return preserveLife(character);
    if(name==="Sear Undead")return searUndead(character);
    if(name==="Survivor")return survivor(character);
    return null;
  }catch(error){console.error(`[reference] dynamic ${name} failed`,error);throw error;}
}
function spellcasting(character){
  try{
    const base="Use the spell section above for save DC, attack bonus, slots, and prepared spells. Expended spell slots return after a Long Rest.";
    if(character.ruleset==="2014"&&character.class.id==="wizard")return{category:"Wizard",timing:"Magic / Ritual",text:`${base} A Ritual-tag spell in your spellbook can be cast as a Ritual without being prepared.`};
    if(character.ruleset==="2014"&&character.class.id==="cleric")return{category:"Cleric",timing:"Magic / Ritual",text:`${base} A prepared Cleric spell with the Ritual tag can be cast as a Ritual.`};
    if(character.ruleset==="2024"&&character.class.id==="wizard")return{category:"Wizard",timing:"Magic",text:`${base} After a Long Rest, you can replace prepared level 1+ spells with legal spells from your spellbook; Ritual Adept is listed separately.`};
    return{category:"Cleric",timing:"Magic",text:`${base} After a Long Rest, you can replace prepared level 1+ spells with other Cleric spells for which you have slots.`};
  }catch(error){console.error("[reference] spellcasting failed",error);throw error;}
}
function secondWind(character){
  try{const healing=`1d10 + ${character.level} HP`;if(character.ruleset==="2014")return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. One use; regain it after a Short or Long Rest.`};const uses=character.fighter?.secondWindUses;if(!Number.isInteger(uses))throw new Error("2024 Second Wind reference requires Fighter progression data.");return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. ${uses} uses; regain one expended use after a Short Rest and all expended uses after a Long Rest.`};}
  catch(error){console.error("[reference] Second Wind failed",error);throw error;}
}
function actionSurge(character){try{const uses=character.fighter?.actionSurgeUses;if(!Number.isInteger(uses))throw new Error("Action Surge reference requires Fighter progression data.");const restriction=character.ruleset==="2024"?" The additional action cannot be the Magic action.":"";return{category:"Fighter",timing:"On your turn",text:`Take one additional action.${restriction} ${uses} use${uses===1?"":"s"} between rests; regain all uses after a Short or Long Rest${uses>1?", and use it no more than once on the same turn":""}.`};}catch(error){console.error("[reference] Action Surge failed",error);throw error;}}
function extraAttack(character){try{const attacks=character.fighter?.attacksPerAction;if(!Number.isInteger(attacks))throw new Error("Extra Attack reference requires Fighter progression data.");return{category:"Fighter",timing:"Attack action",text:`Attack ${numberWord(attacks)} times instead of once whenever you take the Attack action on your turn.`};}catch(error){console.error("[reference] Extra Attack failed",error);throw error;}}
function indomitable(character){try{const uses=character.fighter?.indomitableUses;if(!Number.isInteger(uses)||uses<1)throw new Error("Indomitable reference requires active Fighter progression data.");const bonus=character.ruleset==="2024"?` with a +${character.level} bonus`:"";return{category:"Fighter",timing:"Failed saving throw",text:`Reroll a failed saving throw${bonus} and use the new roll. ${uses} use${uses===1?"":"s"}; regain all uses after a Long Rest.`};}catch(error){console.error("[reference] Indomitable failed",error);throw error;}}
function remarkableAthlete(character){try{if(character.ruleset==="2014"){const bonus=Math.ceil(character.proficiency/2),jump=Math.max(0,abilityMod(character.abilities.str));return{category:"Champion",timing:"Ability checks / running jump",text:`Add +${bonus} to Strength, Dexterity, or Constitution checks that do not already use your Proficiency Bonus. Your running long-jump distance also increases by ${jump} ft.`};}return{category:"Champion",timing:"Passive / after crit",text:`You have Advantage on Initiative rolls and Strength (Athletics) checks. Immediately after a Critical Hit, move up to ${Math.floor(character.speed/2)} ft without provoking Opportunity Attacks.`};}catch(error){console.error("[reference] Remarkable Athlete failed",error);throw error;}}
function additionalFightingStyle(character){try{const styles=(character.fightingStyles||[]).map(style=>style.name).join(" + ");return{category:"Champion",timing:"Passive",text:`You have a second Fighting Style. Active styles: ${styles}. Each style is listed separately with its own mechanics and source citation.`};}catch(error){console.error("[reference] Additional Fighting Style failed",error);throw error;}}
function superiorCritical(character){try{return character.ruleset==="2014"?{category:"Champion",timing:"Passive",text:"Your weapon attacks score a Critical Hit on a d20 roll of 18–20."}:{category:"Champion",timing:"Passive",text:"Weapon and Unarmed Strike attack rolls score a Critical Hit on a d20 roll of 18–20."};}catch(error){console.error("[reference] Superior Critical failed",error);throw error;}}
function survivor(character){try{const healing=5+abilityMod(character.abilities.con);if(character.ruleset==="2014")return{category:"Champion",timing:"Start of turn",text:`If you have at least 1 HP and no more than half your maximum HP, regain ${healing} HP at the start of each of your turns.`};return{category:"Champion",timing:"Passive / start of turn",text:`You have Advantage on Death Saving Throws, and a death save roll of 18–20 gains the benefit of a 20. While Bloodied with at least 1 HP, regain ${healing} HP at the start of each turn.`};}catch(error){console.error("[reference] Survivor failed",error);throw error;}}
function arcaneRecovery(character){
  try{const levels=Math.ceil(character.level/2),limit=`up to ${levels} total spell-slot level${levels===1?"":"s"}`;return character.ruleset==="2014"?{category:"Wizard",timing:"After Short Rest",text:`Once per day, recover expended slots totaling ${limit}; none can be level 6+.`}:{category:"Wizard",timing:"After Short Rest",text:`Recover expended slots totaling ${limit}; none can be level 6+. Once used, it returns after a Long Rest.`};}
  catch(error){console.error("[reference] Arcane Recovery failed",error);throw error;}
}
function preserveLife(character){
  try{const pool=5*character.level;if(character.ruleset==="2014")return{category:"Life Domain",timing:"Action · Channel Divinity",text:`Distribute up to ${pool} HP among creatures within 30 ft, but no creature can be healed above half its maximum. It has no effect on Undead or Constructs.`};return{category:"Life Domain",timing:"Magic action · Channel Divinity",text:`Distribute up to ${pool} HP among Bloodied creatures within 30 ft, including yourself, but no creature can be healed above half its maximum.`};}
  catch(error){console.error("[reference] Preserve Life failed",error);throw error;}
}
function searUndead(character){try{const dice=Math.max(1,abilityMod(character.abilities.wis));return{category:"Cleric",timing:"With Turn Undead",text:`Roll ${dice}d8. Each Undead that fails its Turn Undead save takes that much Radiant damage; this damage does not end the turning effect.`};}catch(error){console.error("[reference] Sear Undead failed",error);throw error;}}
function numberWord(value){try{return({1:"once",2:"twice",3:"three",4:"four"})[value]||String(value);}catch(error){console.error("[reference] number word failed",error);throw error;}}
function push(character,items,id,name,entry){try{const kind=id.split(":",1)[0],source=referenceProvenance(character,kind,name);items.push({id,name,...entry,source});}catch(error){console.error(`[reference] provenance attach failed for ${name}`,error);throw error;}}
function required(entry,name){try{if(!entry)throw new Error(`Missing quick reference for ${name}.`);return entry;}catch(error){console.error(`[reference] required entry failed for ${name}`,error);throw error;}}
function pretty(value){try{return String(value||"the chosen skill").replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}catch(error){console.error("[reference] pretty label failed",error);throw error;}}
