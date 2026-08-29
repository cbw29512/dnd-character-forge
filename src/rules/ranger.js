import { pick, sample } from "./random.js";
import { duplicateValues } from "./duplicates.js";
import { abilityMod } from "./math.js";

const SLOTS_2014=Object.freeze({1:{},2:{1:2},3:{1:3},4:{1:3},5:{1:4,2:2},6:{1:4,2:2},7:{1:4,2:3},8:{1:4,2:3},9:{1:4,2:3,3:2},10:{1:4,2:3,3:2},11:{1:4,2:3,3:3},12:{1:4,2:3,3:3},13:{1:4,2:3,3:3,4:1},14:{1:4,2:3,3:3,4:1},15:{1:4,2:3,3:3,4:2},16:{1:4,2:3,3:3,4:2},17:{1:4,2:3,3:3,4:3,5:1},18:{1:4,2:3,3:3,4:3,5:1},19:{1:4,2:3,3:3,4:3,5:2},20:{1:4,2:3,3:3,4:3,5:2}});
const SLOTS_2024=Object.freeze({1:{1:2},2:{1:2},3:{1:3},4:{1:3},5:{1:4,2:2},6:{1:4,2:2},7:{1:4,2:3},8:{1:4,2:3},9:{1:4,2:3,3:2},10:{1:4,2:3,3:2},11:{1:4,2:3,3:3},12:{1:4,2:3,3:3},13:{1:4,2:3,3:3,4:1},14:{1:4,2:3,3:3,4:1},15:{1:4,2:3,3:3,4:2},16:{1:4,2:3,3:3,4:2},17:{1:4,2:3,3:3,4:3,5:1},18:{1:4,2:3,3:3,4:3,5:1},19:{1:4,2:3,3:3,4:3,5:2},20:{1:4,2:3,3:3,4:3,5:2}});
const KNOWN_2014=Object.freeze({1:0,2:2,3:3,4:3,5:4,6:4,7:5,8:5,9:6,10:6,11:7,12:7,13:8,14:8,15:9,16:9,17:10,18:10,19:11,20:11});
const PREPARED_2024=Object.freeze({1:2,2:3,3:4,4:5,5:6,6:6,7:7,8:7,9:9,10:9,11:10,12:10,13:11,14:11,15:12,16:12,17:14,18:14,19:15,20:15});
const MARK_CASTS_2024=Object.freeze({1:2,2:2,3:2,4:2,5:3,6:3,7:3,8:3,9:4,10:4,11:4,12:4,13:5,14:5,15:5,16:5,17:6,18:6,19:6,20:6});

export const FAVORED_ENEMY_CREATURE_TYPES_2014=Object.freeze(["aberrations","beasts","celestials","constructs","dragons","elementals","fey","fiends","giants","monstrosities","oozes","plants","undead"]);
export const FAVORED_ENEMY_HUMANOID_RACES_2014=Object.freeze({
  humans:Object.freeze({name:"Humans",languages:Object.freeze(["Common"])}),
  dwarves:Object.freeze({name:"Dwarves",languages:Object.freeze(["Dwarvish"])}),
  elves:Object.freeze({name:"Elves",languages:Object.freeze(["Elvish"])}),
  halflings:Object.freeze({name:"Halflings",languages:Object.freeze(["Halfling"])}),
  goblins:Object.freeze({name:"Goblins",languages:Object.freeze(["Common","Goblin"])}),
  hobgoblins:Object.freeze({name:"Hobgoblins",languages:Object.freeze(["Common","Goblin"])}),
  bugbears:Object.freeze({name:"Bugbears",languages:Object.freeze(["Common","Goblin"])}),
  orcs:Object.freeze({name:"Orcs",languages:Object.freeze(["Common","Orc"])}),
  gnolls:Object.freeze({name:"Gnolls",languages:Object.freeze(["Gnoll"])}),
  lizardfolk:Object.freeze({name:"Lizardfolk",languages:Object.freeze(["Draconic"])}),
  kobolds:Object.freeze({name:"Kobolds",languages:Object.freeze(["Common","Draconic"])})
});
const TYPE_LANGUAGES_2014=Object.freeze({aberrations:Object.freeze(["Deep Speech"]),beasts:Object.freeze([]),celestials:Object.freeze(["Celestial"]),constructs:Object.freeze([]),dragons:Object.freeze(["Draconic"]),elementals:Object.freeze(["Primordial"]),fey:Object.freeze(["Sylvan"]),fiends:Object.freeze(["Abyssal","Infernal"]),giants:Object.freeze(["Giant"]),monstrosities:Object.freeze([]),oozes:Object.freeze([]),plants:Object.freeze([]),undead:Object.freeze([])});
const HUMANOID_PAIR_IDS_2014=buildHumanoidPairIds();
// Backward-compatible export name: this is the complete legal Favored Enemy choice
// pool represented by this verified SRD slice, including the RAW two-humanoid-races alternative.
export const FAVORED_ENEMY_TYPES_2014=Object.freeze([...FAVORED_ENEMY_CREATURE_TYPES_2014,...HUMANOID_PAIR_IDS_2014]);
export const FAVORED_ENEMY_LANGUAGE_OPTIONS_2014=Object.freeze(Object.fromEntries(FAVORED_ENEMY_TYPES_2014.map(id=>[id,Object.freeze(favoredEnemyLanguagesFor(id))])));
export const NATURAL_EXPLORER_TERRAINS_2014=Object.freeze(["arctic","coast","desert","forest","grassland","mountain","swamp","underdark"]);
export const HUNTER_PREY_2014=Object.freeze({"colossus-slayer":"Colossus Slayer","giant-killer":"Giant Killer","horde-breaker":"Horde Breaker"});
export const HUNTER_DEFENSE_2014=Object.freeze({"escape-the-horde":"Escape the Horde","multiattack-defense":"Multiattack Defense","steel-will":"Steel Will"});
export const HUNTER_MULTIATTACK_2014=Object.freeze({volley:"Volley","whirlwind-attack":"Whirlwind Attack"});
export const HUNTER_SUPERIOR_DEFENSE_2014=Object.freeze({evasion:"Evasion","stand-against-the-tide":"Stand Against the Tide","uncanny-dodge":"Uncanny Dodge"});
export const HUNTER_PREY_2024=Object.freeze({"colossus-slayer":"Colossus Slayer","horde-breaker":"Horde Breaker"});
export const HUNTER_DEFENSE_2024=Object.freeze({"escape-the-horde":"Escape the Horde","multiattack-defense":"Multiattack Defense"});

export function rangerProgressionFor(ruleset,level,subclassId=null,wisModifier=0){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Ranger level ${level}.`);
    if(ruleset==="2014")return Object.freeze({known:KNOWN_2014[value],prepared:0,slots:Object.freeze({...SLOTS_2014[value]}),hunterMarkFreeCasts:0,hunterMarkDie:"d6",masteryCount:0,fightingStyle:value>=2,favoredEnemyCount:value>=14?3:value>=6?2:1,naturalExplorerTerrainCount:value>=10?3:value>=6?2:1,primevalAwareness:value>=3,attacksPerAction:value>=5?2:1,landsStride:value>=8,hideInPlainSight:value>=10,roving:false,speedBonus:0,expertiseCount:0,extraLanguages:0,tireless:false,tirelessUses:0,vanish:value>=14,relentlessHunter:false,natureVeil:false,natureVeilUses:0,preciseHunter:false,feralSenses:value>=18,blindsightRange:0,epicBoon:false,foeSlayer:value>=20,huntersLore:false,superiorHuntersPrey:false,superiorHuntersDefense:false,hunter:subclassId==="hunter"&&value>=3});
    if(ruleset!=="2024")throw new Error(`Unsupported Ranger ruleset: ${ruleset}.`);
    const wisdomUses=Math.max(1,Number(wisModifier||0));
    return Object.freeze({known:0,prepared:PREPARED_2024[value],slots:Object.freeze({...SLOTS_2024[value]}),hunterMarkFreeCasts:MARK_CASTS_2024[value],hunterMarkDie:value>=20?"d10":"d6",masteryCount:2,fightingStyle:value>=2,favoredEnemyCount:0,naturalExplorerTerrainCount:0,primevalAwareness:false,attacksPerAction:value>=5?2:1,landsStride:false,hideInPlainSight:false,roving:value>=6,speedBonus:value>=6?10:0,expertiseCount:value>=9?3:value>=2?1:0,extraLanguages:value>=2?2:0,tireless:value>=10,tirelessUses:value>=10?wisdomUses:0,vanish:false,relentlessHunter:value>=13,natureVeil:value>=14,natureVeilUses:value>=14?wisdomUses:0,preciseHunter:value>=17,feralSenses:value>=18,blindsightRange:value>=18?30:0,epicBoon:value>=19,foeSlayer:value>=20,huntersLore:subclassId==="hunter"&&value>=3,superiorHuntersPrey:subclassId==="hunter"&&value>=11,superiorHuntersDefense:subclassId==="hunter"&&value>=15,hunter:subclassId==="hunter"&&value>=3});
  }catch(error){console.error("[ranger] progression resolution failed",error);throw error;}
}

export function resolveRangerClassSelections(ruleset,level,subclassId,selections={}){
  try{
    const p=rangerProgressionFor(ruleset,level,subclassId),resolved={favoredEnemies:[],favoredEnemyLanguages:[],naturalExplorerTerrains:[],huntersPrey:null,defensiveTactics:null,multiattack:null,superiorDefense:null};
    if(ruleset==="2014"){
      resolved.favoredEnemies=resolveList(selections.favoredEnemies,FAVORED_ENEMY_TYPES_2014,p.favoredEnemyCount,"Favored Enemy");
      resolved.favoredEnemyLanguages=resolveFavoredEnemyLanguages(resolved.favoredEnemies,selections.favoredEnemyLanguages);
      resolved.naturalExplorerTerrains=resolveList(selections.naturalExplorerTerrains,NATURAL_EXPLORER_TERRAINS_2014,p.naturalExplorerTerrainCount,"Natural Explorer terrain");
      if(p.hunter){resolved.huntersPrey=resolveOne(selections.huntersPrey,HUNTER_PREY_2014,"Hunter's Prey");if(Number(level)>=7)resolved.defensiveTactics=resolveOne(selections.defensiveTactics,HUNTER_DEFENSE_2014,"Defensive Tactics");if(Number(level)>=11)resolved.multiattack=resolveOne(selections.multiattack,HUNTER_MULTIATTACK_2014,"Multiattack");if(Number(level)>=15)resolved.superiorDefense=resolveOne(selections.superiorDefense,HUNTER_SUPERIOR_DEFENSE_2014,"Superior Hunter's Defense");}
      return Object.freeze(resolved);
    }
    if(ruleset!=="2024")throw new Error(`Unsupported Ranger selection ruleset: ${ruleset}.`);
    if(p.hunter){resolved.huntersPrey=resolveOne(selections.huntersPrey,HUNTER_PREY_2024,"Hunter's Prey");if(Number(level)>=7)resolved.defensiveTactics=resolveOne(selections.defensiveTactics,HUNTER_DEFENSE_2024,"Defensive Tactics");}
    return Object.freeze(resolved);
  }catch(error){console.error("[ranger] class selection resolution failed",error);throw error;}
}

export function rangerSpellSlots(ruleset,level){try{return Object.freeze({...rangerProgressionFor(ruleset,level).slots});}catch(error){console.error("[ranger] slot lookup failed",error);throw error;}}
export function rangerMaxSpellLevel(ruleset,level){try{const levels=Object.keys(rangerSpellSlots(ruleset,level)).map(Number);return levels.length?Math.max(...levels):0;}catch(error){console.error("[ranger] max spell level failed",error);throw error;}}
export function rangerSpellChoiceCount(character){try{const p=rangerProgressionFor(character.ruleset,character.level,character.subclass?.id,abilityMod(character.abilities.wis));return character.ruleset==="2014"?p.known:p.prepared;}catch(error){console.error("[ranger] spell choice count failed",error);throw error;}}
export function favoredEnemyLabel2014(id){try{if(FAVORED_ENEMY_CREATURE_TYPES_2014.includes(id))return pretty(id);if(HUMANOID_PAIR_IDS_2014.includes(id))return id;throw new Error(`Unknown 2014 Favored Enemy choice: ${id}.`);}catch(error){console.error("[ranger] Favored Enemy label failed",error);throw error;}}

function resolveFavoredEnemyLanguages(favoredEnemies,selected){
  try{
    const fixed=Array.isArray(selected)?selected:[];if(fixed.length>favoredEnemies.length)throw new Error(`Choose at most ${favoredEnemies.length} Favored Enemy languages.`);
    return favoredEnemies.map((enemy,index)=>{const options=FAVORED_ENEMY_LANGUAGE_OPTIONS_2014[enemy]||[],requested=fixed[index]||null;if(!options.length){if(requested)throw new Error(`${favoredEnemyLabel2014(enemy)} has no verified Favored Enemy language in this Forge slice.`);return null;}if(requested&&!options.includes(requested))throw new Error(`${requested} is not a verified Favored Enemy language for ${favoredEnemyLabel2014(enemy)}.`);return requested||pick(options);});
  }catch(error){console.error("[ranger] Favored Enemy language selection failed",error);throw error;}
}
function buildHumanoidPairIds(){const entries=Object.values(FAVORED_ENEMY_HUMANOID_RACES_2014),pairs=[];for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++)pairs.push(`Humanoids: ${entries[i].name} & ${entries[j].name}`);return Object.freeze(pairs);}
function favoredEnemyLanguagesFor(id){
  if(TYPE_LANGUAGES_2014[id])return[...TYPE_LANGUAGES_2014[id]];
  const match=String(id).match(/^Humanoids: (.+) & (.+)$/);if(!match)return[];
  const byName=new Map(Object.values(FAVORED_ENEMY_HUMANOID_RACES_2014).map(entry=>[entry.name,entry]));const first=byName.get(match[1]),second=byName.get(match[2]);if(!first||!second)return[];return[...new Set([...first.languages,...second.languages])];
}
function resolveList(selected,available,required,label){try{const fixed=Array.isArray(selected)?selected:[];const duplicates=duplicateValues(fixed);if(duplicates.length)throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}`);const legal=new Set(available),bad=fixed.filter(id=>!legal.has(id));if(bad.length)throw new Error(`Unsupported ${label}: ${bad.join(", ")}`);if(fixed.length>required)throw new Error(`Choose at most ${required} ${label} option${required===1?"":"s"}.`);return[...fixed,...sample(available,required-fixed.length,fixed)];}catch(error){console.error(`[ranger] ${label} selection failed`,error);throw error;}}
function resolveOne(selected,map,label){try{if(selected!=null&&selected!=="random"&&!map[selected])throw new Error(`Unsupported ${label}: ${selected}.`);return selected&&selected!=="random"?selected:pick(Object.keys(map));}catch(error){console.error(`[ranger] ${label} selection failed`,error);throw error;}}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());}
