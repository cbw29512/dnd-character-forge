import { RANDOM } from "../schema.js";
import { pick } from "./random.js";
const LEVELS_2014=Object.freeze([4,8,10,12,16,19]),LEVELS_2024=Object.freeze([4,8,10,12,16]),EPIC_BOONS=Object.freeze(["boon-combat-prowess","boon-dimensional-travel","boon-fate","boon-irresistible-offense","boon-night-spirit","boon-truesight"]);
export function applyRogueAdvancement(character,data,selections={}){
  try{
    if(character.class.id!=="rogue")return character;const next=structuredClone(character),choices=[];
    if(character.ruleset==="2014"){
      for(const level of LEVELS_2014){if(character.level<level)continue;const selected=selections[level]??RANDOM;if(![RANDOM,"asi"].includes(selected))throw new Error(`Illegal 2014 Rogue advancement selection at level ${level}: ${selected}`);choices.push({level,type:"asi",name:"Ability Score Improvement",increases:applyAsi(next.abilities,["dex","con","wis","int","cha","str"],20),locked:selected!==RANDOM});}
    }else if(character.ruleset==="2024"){
      let grapplerTaken=next.feats.some(feat=>feat.id==="grappler");
      for(const level of LEVELS_2024){if(character.level<level)continue;const selected=selections[level]??RANDOM,canGrapple=!grapplerTaken&&(next.abilities.dex>=13||next.abilities.str>=13);if(![RANDOM,"ability-score-improvement","grappler"].includes(selected))throw new Error(`Illegal 2024 Rogue General feat at level ${level}: ${selected}`);const useGrappler=selected==="grappler"||(selected===RANDOM&&canGrapple&&Math.random()<.2);if(useGrappler){if(!canGrapple)throw new Error(`Grappler is not legal for this 2024 Rogue at level ${level}.`);const feat=requiredFeat(data,"grappler"),ability=next.abilities.dex<20?"dex":"str";next.abilities[ability]+=1;next.feats.push(feat);grapplerTaken=true;choices.push({level,type:"feat",id:feat.id,name:feat.name,increases:{[ability]:1},locked:selected!==RANDOM});}else{const feat=requiredFeat(data,"ability-score-improvement"),increases=applyAsi(next.abilities,["dex","con","wis","int","cha","str"],20);next.feats.push(feat);choices.push({level,type:"feat",id:feat.id,name:feat.name,increases,locked:selected!==RANDOM});}}
      if(character.level>=19){const selected=selections[19]??RANDOM;if(selected!==RANDOM&&!EPIC_BOONS.includes(selected))throw new Error(`Illegal Rogue Epic Boon selection: ${selected}`);const feat=requiredFeat(data,selected===RANDOM?pick(EPIC_BOONS):selected),ability=epicAbility(next.abilities,feat.id);next.abilities[ability]+=1;next.abilityMaximums[ability]=30;next.feats.push(feat);choices.push({level:19,type:"epic-boon",id:feat.id,name:feat.name,increases:{[ability]:1},locked:selected!==RANDOM});}
    }else throw new Error(`Unsupported Rogue advancement ruleset: ${character.ruleset}`);
    next.advancementChoices=choices;return next;
  }catch(error){console.error("[rogue-advancement] advancement failed",error);throw error;}
}
function applyAsi(abilities,priority,max){const first=bestAbility(abilities,priority,max),result={},room=max-abilities[first];if(room>=2){abilities[first]+=2;result[first]=2;return result;}if(room===1){abilities[first]+=1;result[first]=1;}const remaining=priority.filter(id=>id!==first&&abilities[id]<max);if(remaining.length){const second=bestAbility(abilities,remaining,max);abilities[second]+=1;result[second]=(result[second]||0)+1;}return result;}
function bestAbility(abilities,priority,max){const legal=priority.filter(id=>abilities[id]<max);if(!legal.length)throw new Error(`No legal ability remains below ${max}.`);return legal.sort((a,b)=>abilities[b]-abilities[a]||priority.indexOf(a)-priority.indexOf(b))[0];}
function epicAbility(abilities,featId){return featId==="boon-irresistible-offense"?bestAbility(abilities,["dex","str"],30):bestAbility(abilities,["dex","con","wis","int","cha","str"],30);}
function requiredFeat(data,id){const feat=data.feats?.find(item=>item.id===id);if(!feat)throw new Error(`Required RAW feat is missing: ${id}`);return feat;}
export const ROGUE_ADVANCEMENT=Object.freeze({levels2014:LEVELS_2014,levels2024:LEVELS_2024,epicBoons:EPIC_BOONS});
