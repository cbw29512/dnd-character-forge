import { RANDOM } from "../schema.js";

const LOCKED_SELECTORS=Object.freeze([
  ["level","Level"],
  ["species","Species"],
  ["class","Class"],
  ["subclass","Subclass"],
  ["background","Background"]
]);

export function validateVisibleForgeSelections(state,root=globalThis.document){
  try{
    if(!state?.constraints)throw new Error("Forge state is missing build constraints. Reload the Forge and try again.");
    if(!root?.getElementById)throw new Error("Forge controls are unavailable. Reload the Forge and try again.");
    for(const [id,label] of LOCKED_SELECTORS){
      const value=state.constraints[id];
      if(!value||value===RANDOM)continue;
      const control=root.getElementById(id);
      if(!control)throw new Error(`${label} control is unavailable. Reload the Forge and try again.`);
      const legal=Array.from(control.options||[]).some(option=>String(option.value)===String(value));
      if(!legal)throw new Error(`${label} "${value}" is not available under ${state.ruleset} rules with the current build. Set ${label} to Random or choose one of the listed options, then Forge again.`);
    }
    return true;
  }catch(error){
    console.error("[forge-preflight] selection validation failed",error);
    throw error;
  }
}
