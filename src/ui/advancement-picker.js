import { RANDOM } from "../schema.js";
import { BARBARIAN_ADVANCEMENT } from "../rules/barbarian-advancement.js";
import { ROGUE_ADVANCEMENT } from "../rules/rogue-advancement.js";
import { FIGHTER_ADVANCEMENT } from "../rules/fighter-advancement.js";

const GENERAL_2024=[[RANDOM,"Random"],["ability-score-improvement","Ability Score Improvement"],["grappler","Grappler"]];
const ASI_GRAPPLER_2014=[[RANDOM,"Random"],["asi","Ability Score Improvement"],["grappler","Grappler"]];
const ROGUE_2014=[[RANDOM,"Random"],["asi","Ability Score Improvement"]];
const BOON_NAMES={"boon-combat-prowess":"Boon of Combat Prowess","boon-dimensional-travel":"Boon of Dimensional Travel","boon-fate":"Boon of Fate","boon-irresistible-offense":"Boon of Irresistible Offense","boon-night-spirit":"Boon of the Night Spirit","boon-truesight":"Boon of Truesight"};

export function bindAdvancementPicker(state){
  try{const fields=document.getElementById("advancementFields");fields.addEventListener("change",event=>{const select=event.target.closest("select[data-advancement-level]");if(!select)return;state.advancementSelections[select.dataset.advancementLevel]=select.value;refreshAdvancementPicker(state);});}
  catch(error){console.error("[advancement-picker] bind failed",error);throw error;}
}
export function refreshAdvancementPicker(state){
  try{
    const panel=document.getElementById("advancementPanel"),fields=document.getElementById("advancementFields"),summary=document.getElementById("advancementSummary"),classId=state.constraints.class,isSupported=["barbarian","rogue","fighter"].includes(classId);panel.hidden=!isSupported;if(!isSupported){fields.innerHTML="";return;}
    const chosenLevel=state.constraints.level===RANDOM?20:Number(state.constraints.level),levels=levelsFor(classId,state.ruleset),visible=levels.filter(level=>level<=chosenLevel),grapplerLevel=Object.entries(state.advancementSelections||{}).find(([,value])=>value==="grappler")?.[0]||null;
    fields.innerHTML=visible.map(level=>fieldFor(state,classId,level,grapplerLevel)).join("");const locked=visible.filter(level=>(state.advancementSelections?.[level]??RANDOM)!==RANDOM);summary.textContent=locked.length?`${locked.length} advancement choice${locked.length===1?"":"s"} locked`:`All advancement choices Random`;
  }catch(error){console.error("[advancement-picker] refresh failed",error);throw error;}
}
export function resetAdvancementSelections(state){try{state.advancementSelections={4:RANDOM,6:RANDOM,8:RANDOM,10:RANDOM,12:RANDOM,14:RANDOM,16:RANDOM,19:RANDOM};refreshAdvancementPicker(state);}catch(error){console.error("[advancement-picker] reset failed",error);throw error;}}
function levelsFor(classId,ruleset){if(classId==="barbarian")return ruleset==="2014"?BARBARIAN_ADVANCEMENT.levels2014:[...BARBARIAN_ADVANCEMENT.normal2024,19];if(classId==="rogue")return ruleset==="2014"?ROGUE_ADVANCEMENT.levels2014:[...ROGUE_ADVANCEMENT.levels2024,19];return ruleset==="2014"?FIGHTER_ADVANCEMENT.levels2014:[...FIGHTER_ADVANCEMENT.levels2024,19];}
function fieldFor(state,classId,level,grapplerLevel){const isEpic=state.ruleset==="2024"&&level===19,advancement=classId==="barbarian"?BARBARIAN_ADVANCEMENT:classId==="rogue"?ROGUE_ADVANCEMENT:FIGHTER_ADVANCEMENT,options=isEpic?[[RANDOM,"Random"],...advancement.epicBoons.map(id=>[id,BOON_NAMES[id]])]:state.ruleset==="2014"?(classId==="rogue"?ROGUE_2014:ASI_GRAPPLER_2014):GENERAL_2024,current=state.advancementSelections?.[level]??RANDOM;return `<label class="advancement-field"><span>Level ${level}${isEpic?" · Epic Boon":""}</span><select data-advancement-level="${level}">${options.map(([value,name])=>`<option value="${value}"${value===current?" selected":""}${value==="grappler"&&grapplerLevel&&grapplerLevel!==String(level)?" disabled":""}>${name}</option>`).join("")}</select></label>`;}
