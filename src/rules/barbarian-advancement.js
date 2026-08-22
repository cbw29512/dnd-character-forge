import { pick } from "./random.js";
const NORMAL_LEVELS=Object.freeze([4,8,12,16]),LEVELS_2014=Object.freeze([4,8,12,16,19]),EPIC_BOONS=Object.freeze(["boon-combat-prowess","boon-dimensional-travel","boon-fate","boon-irresistible-offense","boon-night-spirit","boon-truesight"]);
export function applyBarbarianAdvancement(character,data){
  try{
    if(character.class.id!=="barbarian")return character;const next=structuredClone(character),choices=[];
    if(character.ruleset==="2014"){
      let grapplerTaken=false;for(const level of LEVELS_2014){if(character.level<level)continue;const canGrapple=!grapplerTaken&&next.abilities.str>=13,useFeat=canGrapple&&Math.random()<.25;if(useFeat){const feat=requiredFeat(data,"grappler");next.feats.push(feat);grapplerTaken=true;choices.push({level,type:"feat",id:feat.id,name:feat.name});}else choices.push({level,type:"asi",name:"Ability Score Improvement",increases:applyAsi(next.abilities,["str","con","dex"],20)});}
    }else if(character.ruleset==="2024"){
      let grapplerTaken=next.feats.some(feat=>feat.id==="grappler");for(const level of NORMAL_LEVELS){if(character.level<level)continue;const canGrapple=!grapplerTaken&&(next.abilities.str>=13||next.abilities.dex>=13),useGrappler=canGrapple&&Math.random()<.25;if(useGrappler){const feat=requiredFeat(data,"grappler"),ability=bestAbility(next.abilities,["str","dex"],20);next.abilities[ability]+=1;next.feats.push(feat);grapplerTaken=true;choices.push({level,type:"feat",id:feat.id,name:feat.name,increases:{[ability]:1}});}else{const feat=requiredFeat(data,"ability-score-improvement"),increases=applyAsi(next.abilities,["str","con","dex"],20);next.feats.push(feat);choices.push({level,type:"feat",id:feat.id,name:feat.name,increases});}}
      if(character.level>=19){const feat=requiredFeat(data,pick(EPIC_BOONS)),ability=epicAbility(next.abilities,feat.id);next.abilities[ability]+=1;next.abilityMaximums[ability]=Math.max(next.abilityMaximums[ability]||20,next.abilities[ability]);next.feats.push(feat);choices.push({level:19,type:"epic-boon",id:feat.id,name:feat.name,increases:{[ability]:1}});}
    }else throw new Error(`Unsupported Barbarian advancement ruleset: ${character.ruleset}`);
    next.feats=dedupeRepeatable(next.feats);next.advancementChoices=choices;return next;
  }catch(error){console.error("[barbarian-advancement] advancement failed",error);throw error;}
}
function applyAsi(abilities,priority,max){try{const first=bestAbility(abilities,priority,max),result={},room=max-abilities[first];if(room>=2){abilities[first]+=2;result[first]=2;return result;}if(room===1){abilities[first]+=1;result[first]=1;}const remaining=priority.filter(a=>a!==first&&abilities[a]<max);if(remaining.length){const second=bestAbility(abilities,remaining,max);abilities[second]+=1;result[second]=(result[second]||0)+1;}return result;}catch(error){console.error("[barbarian-advancement] ASI failed",error);throw error;}}
function bestAbility(abilities,priority,max){const legal=priority.filter(id=>abilities[id]<max);if(!legal.length)throw new Error(`No legal ability remains below ${max}.`);return legal.sort((a,b)=>abilities[b]-abilities[a]||priority.indexOf(a)-priority.indexOf(b))[0];}
function epicAbility(abilities,featId){if(featId==="boon-irresistible-offense")return"str";return bestAbility(abilities,["str","con","dex","wis","cha","int"],30);}
function requiredFeat(data,id){const feat=data.feats.find(item=>item.id===id);if(!feat)throw new Error(`Required RAW feat is missing: ${id}`);return feat;}
function dedupeRepeatable(feats){const seen=new Set();return feats.filter(feat=>{if(feat.id==="ability-score-improvement")return true;if(seen.has(feat.id))return false;seen.add(feat.id);return true;});}
export const BARBARIAN_ADVANCEMENT=Object.freeze({normal2024:NORMAL_LEVELS,levels2014:LEVELS_2014,epicBoons:EPIC_BOONS});
