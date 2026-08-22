import { RANDOM } from "../schema.js";
import { pick } from "./random.js";

const NORMAL_2024=Object.freeze([4,8,12,16]);
const LEVELS_2014=Object.freeze([4,8,12,16,19]);
const EPIC_BOONS=Object.freeze(["boon-combat-prowess","boon-dimensional-travel","boon-fate","boon-irresistible-offense","boon-night-spirit","boon-truesight"]);

export function applyMonkAdvancement(character,data,selections={}){
  try{
    if(character.class.id!=="monk")return character;
    const next=structuredClone(character),choices=[];
    if(character.ruleset==="2014"){
      const lockedGrapplerLevel=reservedGrapplerLevel(LEVELS_2014,character.level,selections);
      let grapplerTaken=next.feats.some(feat=>feat.id==="grappler");
      for(const level of LEVELS_2014){
        if(character.level<level)continue;
        const selected=selections[level]??RANDOM,canGrapple=!grapplerTaken&&next.abilities.str>=13;
        if(![RANDOM,"asi","grappler"].includes(selected))throw new Error(`Illegal 2014 Monk advancement at level ${level}: ${selected}`);
        const reservedForLater=selected===RANDOM&&lockedGrapplerLevel!==null&&level<lockedGrapplerLevel;
        const useGrappler=selected==="grappler"||(selected===RANDOM&&!reservedForLater&&canGrapple&&Math.random()<.2);
        if(useGrappler){
          if(!canGrapple)throw new Error(`Grappler is not legal for this 2014 Monk at level ${level}.`);
          const feat=requiredFeat(data,"grappler");next.feats.push(feat);grapplerTaken=true;choices.push({level,type:"feat",id:feat.id,name:feat.name,locked:selected!==RANDOM});
        }else choices.push({level,type:"asi",name:"Ability Score Improvement",increases:applyAsi(next.abilities,["dex","wis","con","str","cha","int"],20),locked:selected!==RANDOM});
      }
    }else if(character.ruleset==="2024"){
      const lockedGrapplerLevel=reservedGrapplerLevel(NORMAL_2024,character.level,selections);
      let grapplerTaken=next.feats.some(feat=>feat.id==="grappler");
      for(const level of NORMAL_2024){
        if(character.level<level)continue;
        const selected=selections[level]??RANDOM,meetsPrerequisite=!grapplerTaken&&(next.abilities.str>=13||next.abilities.dex>=13),hasIncreaseRoom=next.abilities.str<20||next.abilities.dex<20;
        if(![RANDOM,"ability-score-improvement","grappler"].includes(selected))throw new Error(`Illegal 2024 Monk General feat at level ${level}: ${selected}`);
        const reservedForLater=selected===RANDOM&&lockedGrapplerLevel!==null&&level<lockedGrapplerLevel;
        const useGrappler=selected==="grappler"||(selected===RANDOM&&!reservedForLater&&meetsPrerequisite&&hasIncreaseRoom&&Math.random()<.2);
        if(useGrappler){
          if(!meetsPrerequisite)throw new Error(`Grappler is not legal for this 2024 Monk at level ${level}.`);
          const feat=requiredFeat(data,"grappler"),increases={};
          if(hasIncreaseRoom){const ability=bestAbility(next.abilities,["dex","str"],20);next.abilities[ability]+=1;increases[ability]=1;}
          next.feats.push(feat);grapplerTaken=true;choices.push({level,type:"feat",id:feat.id,name:feat.name,increases,locked:selected!==RANDOM});
        }else{
          const feat=requiredFeat(data,"ability-score-improvement"),increases=applyAsi(next.abilities,["dex","wis","con","str","cha","int"],20);next.feats.push(feat);choices.push({level,type:"feat",id:feat.id,name:feat.name,increases,locked:selected!==RANDOM});
        }
      }
      if(character.level>=19){
        const selected=selections[19]??RANDOM;if(selected!==RANDOM&&!EPIC_BOONS.includes(selected))throw new Error(`Illegal Monk Epic Boon selection: ${selected}`);
        const feat=requiredFeat(data,selected===RANDOM?pick(EPIC_BOONS):selected),ability=epicAbility(next.abilities,feat.id);next.abilities[ability]+=1;next.abilityMaximums[ability]=30;next.feats.push(feat);choices.push({level:19,type:"epic-boon",id:feat.id,name:feat.name,increases:{[ability]:1},locked:selected!==RANDOM});
      }
    }else throw new Error(`Unsupported Monk advancement ruleset: ${character.ruleset}`);
    next.advancementChoices=choices;return next;
  }catch(error){console.error("[monk-advancement] advancement failed",error);throw error;}
}
function reservedGrapplerLevel(levels,characterLevel,selections){const locked=levels.filter(level=>level<=characterLevel&&selections[level]==="grappler");if(locked.length>1)throw new Error(`Grappler cannot be selected more than once: levels ${locked.join(", ")}.`);return locked[0]??null;}
function applyAsi(abilities,priority,max){const first=bestAbility(abilities,priority,max),result={},room=max-abilities[first];if(room>=2){abilities[first]+=2;result[first]=2;return result;}if(room===1){abilities[first]+=1;result[first]=1;}const remaining=priority.filter(id=>id!==first&&abilities[id]<max);if(remaining.length){const second=bestAbility(abilities,remaining,max);abilities[second]+=1;result[second]=(result[second]||0)+1;}return result;}
function bestAbility(abilities,priority,max){const legal=priority.filter(id=>abilities[id]<max);if(!legal.length)throw new Error(`No legal ability remains below ${max}.`);return legal.sort((a,b)=>abilities[b]-abilities[a]||priority.indexOf(a)-priority.indexOf(b))[0];}
function epicAbility(abilities,featId){return featId==="boon-irresistible-offense"?bestAbility(abilities,["dex","str"],30):bestAbility(abilities,["dex","wis","con","str","cha","int"],30);}
function requiredFeat(data,id){const feat=data.feats?.find(item=>item.id===id);if(!feat)throw new Error(`Required RAW feat is missing: ${id}`);return feat;}
export const MONK_ADVANCEMENT=Object.freeze({normal2024:NORMAL_2024,levels2014:LEVELS_2014,epicBoons:EPIC_BOONS});
