import { createInitialState, MAGIC_MODES } from "../state.js";
import { SOURCE } from "../schema.js";
import { FORGE_2014, FORGE_2024 } from "../data/forge-data.js";
import { isForgeOriginalBackground } from "../data/original-backgrounds.js";
import { buildRulesLawyerCertification } from "./certification.js";
import { generateCharacter } from "./generator.js";
import { generateStartingMagic } from "./magic-starting.js";
import { pick } from "./random.js";

export const PARTY_COMPOSITIONS=Object.freeze({BALANCED:"balanced",RANDOM:"random"});

const BALANCED_LANES=Object.freeze({
  2:["frontline","versatile"],
  3:["frontline","expert","caster"],
  4:["frontline","expert","divine","arcane"],
  5:["frontline","expert","divine","arcane","flex"],
  6:["frontline","frontline","expert","divine","arcane","flex"]
});

const ROLE_POOLS=Object.freeze({
  frontline:Object.freeze(["barbarian","fighter","paladin","monk"]),
  expert:Object.freeze(["rogue","ranger","bard"]),
  divine:Object.freeze(["cleric","druid","paladin","ranger"]),
  arcane:Object.freeze(["wizard","sorcerer","warlock","bard"]),
  caster:Object.freeze(["cleric","druid","wizard","sorcerer","warlock","bard"]),
  versatile:Object.freeze(["cleric","druid","bard","ranger","paladin"]),
  flex:Object.freeze(["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"])
});

const FALLBACK_NAMES=Object.freeze(["Aster Vale","Bram Stone","Cira Dawn","Dain Rowan","Elara Reed","Fen Ash","Galen Hart","Iris Thorn","Jora Flint","Kestrel Moon","Lyra Voss","Marek Grey"]);

function dataFor(ruleset){return ruleset==="2014"?FORGE_2014:FORGE_2024;}

function rawBackgroundsFor(data){
  const backgrounds=(data?.backgrounds||[]).filter(background=>!isForgeOriginalBackground(background));
  if(!backgrounds.length)throw new Error("Party Forge could not find a verified RAW background pool.");
  return backgrounds;
}

function validatePartyRequest({ruleset,level,size,composition}){
  if(!["2014","2024"].includes(ruleset))throw new Error("Party Forge supports the 2014 and 2024 verified SRD rulesets only.");
  if(!Number.isInteger(level)||level<1||level>20)throw new Error("Party level must be an integer from 1 through 20.");
  if(!Number.isInteger(size)||size<2||size>6)throw new Error("Party size must be between 2 and 6 characters.");
  if(!Object.values(PARTY_COMPOSITIONS).includes(composition))throw new Error("Party composition mode is unavailable.");
}

function chooseBalancedClasses(classIds,size,allowDuplicateClasses){
  const lanes=BALANCED_LANES[size],used=new Set(),choices=[];
  for(const role of lanes){
    const rolePool=ROLE_POOLS[role].filter(id=>classIds.includes(id));
    let candidates=allowDuplicateClasses?rolePool:rolePool.filter(id=>!used.has(id));
    if(!candidates.length)candidates=allowDuplicateClasses?[...classIds]:classIds.filter(id=>!used.has(id));
    if(!candidates.length)throw new Error("Party Forge could not satisfy the requested duplicate-class rule.");
    const classId=pick(candidates);choices.push({classId,role});used.add(classId);
  }
  return choices;
}

function chooseRandomClasses(classIds,size,allowDuplicateClasses){
  const used=new Set(),choices=[];
  for(let index=0;index<size;index+=1){
    const candidates=allowDuplicateClasses?[...classIds]:classIds.filter(id=>!used.has(id));
    if(!candidates.length)throw new Error("Party Forge ran out of distinct verified classes.");
    const classId=pick(candidates);choices.push({classId,role:"random"});used.add(classId);
  }
  return choices;
}

function uniquePartyName(character,index,usedNames){
  if(!usedNames.has(character.name)){usedNames.add(character.name);return character;}
  const fallback=FALLBACK_NAMES.find(name=>!usedNames.has(name))||`Hero ${index+1}`;
  usedNames.add(fallback);
  return {...character,name:fallback};
}

export function generateParty({ruleset="2024",level=1,size=4,composition=PARTY_COMPOSITIONS.BALANCED,allowDuplicateClasses=false,magicMode=MAGIC_MODES.RANDOM_MAGIC}={}){
  try{
    validatePartyRequest({ruleset,level,size,composition});
    const data=dataFor(ruleset),classIds=data.classes.map(cls=>cls.id),rawBackgrounds=rawBackgroundsFor(data);
    const selections=composition===PARTY_COMPOSITIONS.BALANCED?chooseBalancedClasses(classIds,size,allowDuplicateClasses):chooseRandomClasses(classIds,size,allowDuplicateClasses);
    const usedNames=new Set();
    const members=selections.map(({classId,role},index)=>{
      const state=createInitialState();
      state.sourceMode=SOURCE.RAW;
      state.ruleset=ruleset;
      state.magicMode=magicMode;
      state.constraints={...state.constraints,level:String(level),class:classId,background:pick(rawBackgrounds).id};
      let character=generateCharacter(state);
      if(!character.validation?.valid)throw new Error(`Party member ${index+1} failed RAW validation.`);
      const certification=buildRulesLawyerCertification(character);
      if(!certification.rawCertified)throw new Error(`Party member ${index+1} failed Rules Lawyer certification.`);
      character={...character,startingMagic:generateStartingMagic({ruleset,level:character.level,mode:magicMode,classId:character.class.id})};
      character.startingGold=character.startingMagic.gold;
      character=uniquePartyName(character,index,usedNames);
      return Object.freeze({...character,partyRole:role});
    });
    return Object.freeze({
      id:crypto.randomUUID(),
      ruleset,
      level,
      size,
      composition,
      allowDuplicateClasses:Boolean(allowDuplicateClasses),
      members:Object.freeze(members)
    });
  }catch(error){console.error("[party-forge] party generation failed",error);throw error;}
}
