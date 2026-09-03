import { FORGE_2014, FORGE_2024 } from "../data/forge-data.js";
import { isForgeOriginalBackground } from "../data/original-backgrounds.js";

const dataFor=state=>state.ruleset==="2014"?FORGE_2014:FORGE_2024;

export function populateOptions(state){
  try{const data=dataFor(state);fill("species",data.species);fill("class",data.classes);fill("background",data.backgrounds);populateLevels(state);populateSubclasses(state);renderRandomBackgroundCoverage(state);}
  catch(error){console.error("[ui] populateOptions failed",error);throw error;}
}
export function populateLevels(state){
  try{
    const data=dataFor(state),classId=state.constraints.class,cls=data.classes.find(item=>item.id===classId);
    const maxLevel=cls?.maxLevel||Math.min(...data.classes.map(item=>item.maxLevel||5));
    const element=document.getElementById("level"),current=state.constraints.level;
    element.innerHTML=`<option value="random">Random</option>${Array.from({length:maxLevel},(_,index)=>`<option value="${index+1}">${index+1}</option>`).join("")}`;
    if([...element.options].some(option=>option.value===current))element.value=current;else{state.constraints.level="random";element.value="random";}
  }catch(error){console.error("[ui] populateLevels failed",error);throw error;}
}
export function populateSubclasses(state){
  try{
    const data=dataFor(state),classId=state.constraints.class,cls=data.classes.find(item=>item.id===classId),level=state.constraints.level;
    const levelAllows=!cls||level==="random"||Number(level)>=cls.subclassLevel;
    const items=cls&&levelAllows?data.subclasses.filter(item=>item.classId===classId):[];
    fill("subclass",items);const element=document.getElementById("subclass");element.disabled=items.length===0;
    if(items.length===0||![...element.options].some(option=>option.value===state.constraints.subclass)){state.constraints.subclass="random";element.value="random";}
  }catch(error){console.error("[ui] populateSubclasses failed",error);throw error;}
}
export function randomBackgroundCoverageMessage(state){
  try{
    const verified=dataFor(state).backgrounds.filter(background=>!isForgeOriginalBackground(background)&&background.randomEligible!==false),names=verified.map(background=>background.name);
    if(!verified.length)return `${state.ruleset} SRD Random has no verified background options in this catalog. Choose a listed background instead.`;
    if(verified.length===1)return `${state.ruleset} SRD Random background has 1 verified option here: ${names[0]}. For more variety, choose a background labeled Forge Original; it stays clearly marked as original.`;
    return `${state.ruleset} SRD Random background rotates across ${verified.length} verified options: ${formatNames(names)}. Forge Original backgrounds stay opt-in.`;
  }catch(error){console.error("[ui] Random background coverage failed",error);throw error;}
}
export function renderRandomBackgroundCoverage(state){
  try{const node=document.getElementById("randomBackgroundCoverage");if(node)node.textContent=randomBackgroundCoverageMessage(state);}
  catch(error){console.error("[ui] Random background coverage render failed",error);throw error;}
}
function fill(id,items){
  try{const el=document.getElementById(id),current=el.value;el.innerHTML=`<option value="random">Random</option>${items.map(i=>`<option value="${i.id}">${i.displayName||i.name}</option>`).join("")}`;el.value=[...el.options].some(option=>option.value===current)?current:"random";}
  catch(error){console.error(`[ui] fill ${id} failed`,error);throw error;}
}
function formatNames(names){if(names.length<2)return names[0]||"";if(names.length===2)return `${names[0]} and ${names[1]}`;return `${names.slice(0,-1).join(", ")}, and ${names.at(-1)}`;}
