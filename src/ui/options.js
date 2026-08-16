import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";

const dataFor = state => state.ruleset === "2014" ? RAW_2014 : RAW_2024;

export function populateOptions(state) {
  try {
    const data = dataFor(state);
    fill("species",data.species); fill("class",data.classes); fill("background",data.backgrounds);
    populateSubclasses(state);
  } catch (error) { console.error("[ui] populateOptions failed",error); throw error; }
}
export function populateSubclasses(state) {
  try {
    const data=dataFor(state), classId=state.constraints.class;
    const items=classId && classId!=="random" ? data.subclasses.filter(item=>item.classId===classId) : [];
    fill("subclass",items);
    const element=document.getElementById("subclass");
    element.disabled=items.length===0;
    if (items.length===0) state.constraints.subclass="random";
  } catch (error) { console.error("[ui] populateSubclasses failed",error); throw error; }
}
function fill(id,items) {
  try {
    const el=document.getElementById(id),current=el.value;
    el.innerHTML=`<option value="random">Random</option>${items.map(i=>`<option value="${i.id}">${i.name}</option>`).join("")}`;
    if ([...el.options].some(option=>option.value===current)) el.value=current; else el.value="random";
  } catch (error) { console.error(`[ui] fill ${id} failed`,error); throw error; }
}
