import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";

export function populateOptions(state) {
  try {
    const data = state.ruleset === "2014" ? RAW_2014 : RAW_2024;
    fill("species", data.species); fill("class", data.classes); fill("background", data.backgrounds);
    fill("subclass", data.subclasses);
  } catch (error) { console.error("[ui] populateOptions failed", error); throw error; }
}
function fill(id, items) {
  try {
    const el = document.getElementById(id), current = el.value;
    el.innerHTML = `<option value="random">Random</option>${items.map(i=>`<option value="${i.id}">${i.name}</option>`).join("")}`;
    if ([...el.options].some(o=>o.value===current)) el.value=current;
  } catch (error) { console.error(`[ui] fill ${id} failed`, error); throw error; }
}
