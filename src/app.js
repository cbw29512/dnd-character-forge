import { createInitialState } from "./state.js";
import { SOURCE } from "./schema.js";
import { generateCharacter } from "./rules/generator.js";
import { createAbilityFeat } from "./rules/homebrew.js";
import { savePregen } from "./library/local-library.js";
import { renderCharacter } from "./ui/render.js";
import { populateOptions } from "./ui/options.js";
import { bindPregenLibrary, renderPregenLibrary } from "./ui/library.js";

const state = createInitialState();
const constraintIds = ["level","species","class","subclass","background","name"];

function boot() {
  try {
    populateOptions(state);
    bindConstraints();
    bindMode();
    bindTabs();
    bindHomebrew();
    bindResultActions();
    bindPregenLibrary();
    document.getElementById("forgeButton").addEventListener("click", forge);
    forge();
  } catch (error) { showError(error); }
}
function bindConstraints() {
  try {
    constraintIds.forEach(id => document.getElementById(id).addEventListener("change", event => { state.constraints[id] = event.target.value; }));
    document.getElementById("name").addEventListener("input", event => { state.constraints.name = event.target.value; });
    document.getElementById("ruleset").addEventListener("change", event => {
      state.ruleset = event.target.value;
      state.constraints.species = "random";
      state.constraints.class = "random";
      state.constraints.subclass = "random";
      state.constraints.background = "random";
      populateOptions(state);
    });
  } catch (error) { console.error("[app] bindConstraints failed", error); throw error; }
}
function bindMode() {
  try {
    document.getElementById("sourceMode").addEventListener("change", event => {
      state.sourceMode = event.target.value;
      document.getElementById("homebrewPanel").hidden = state.sourceMode !== SOURCE.HOMEBREW;
    });
  } catch (error) { console.error("[app] bindMode failed", error); throw error; }
}
function bindTabs() {
  try {
    document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(item => item.classList.toggle("is-active", item === button));
      document.querySelectorAll("[data-view]").forEach(view => view.hidden = view.dataset.view !== button.dataset.tab);
      if (button.dataset.tab === "pregens") renderPregenLibrary();
    }));
  } catch (error) { console.error("[app] bindTabs failed", error); throw error; }
}
function bindHomebrew() {
  try {
    document.getElementById("addHomebrew").addEventListener("click", () => {
      try {
        const item = createAbilityFeat({ name:document.getElementById("hbName").value, ability:document.getElementById("hbAbility").value, amount:document.getElementById("hbAmount").value });
        const duplicate = state.homebrew.some(value=>value.name.trim().toLowerCase()===item.name.trim().toLowerCase());
        if (duplicate) throw new Error(`Homebrew named "${item.name}" is already active.`);
        state.homebrew.push(item);
        document.getElementById("hbList").textContent = `Active: ${state.homebrew.map(value=>value.name).join(", ")}`;
      } catch (error) { showError(error); }
    });
  } catch (error) { console.error("[app] bindHomebrew failed", error); throw error; }
}
function bindResultActions() {
  try {
    document.getElementById("result").addEventListener("click", async event => {
      try {
        const action = event.target.closest("[data-action]")?.dataset.action;
        if (action === "reroll") forge();
        if (action === "print") window.print();
        if (action === "save") {
          const entry = await savePregen(state.currentCharacter);
          renderPregenLibrary();
          showToast(`${entry.name} saved to My Pregens.`);
        }
      } catch (error) { showToast(error.message,true); }
    });
  } catch (error) { console.error("[app] bindResultActions failed", error); throw error; }
}
function forge() {
  const button = document.getElementById("forgeButton");
  try {
    button.classList.add("is-forging");
    document.getElementById("error").hidden = true;
    state.currentCharacter = generateCharacter(state);
    renderCharacter(state.currentCharacter, document.getElementById("result"));
  } catch (error) { showError(error); }
  finally { window.setTimeout(()=>button.classList.remove("is-forging"),160); }
}
function showError(error) {
  console.error("[app]", error);
  const element = document.getElementById("error");
  element.textContent = error.message;
  element.hidden = false;
}
function showToast(message,isError=false) {
  try {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.toggle("is-error",isError);
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(()=>{ toast.hidden = true; },3600);
  } catch (error) { console.error("[app] showToast failed", error); }
}
boot();
