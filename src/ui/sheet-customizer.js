import { normalizeSheetCustomization } from "../print/customization.js";
import { selectPrintTheme } from "../print/theme.js";

const MODE_SELECTOR='input[name="sheetPrintMode"]';

export function bindSheetCustomizer(state,showToast){
  try{
    const panel=ensurePanel(),controls=[...panel.querySelectorAll(MODE_SELECTOR)];
    if(controls.length!==2)throw new Error("Print appearance controls are unavailable.");
    for(const node of controls){
      node.addEventListener("change",()=>{
        try{updateStateFromPanel(state,panel);showToast(`Printed sheet set to ${node.value==="ink-saver"?"Black & White":"Color"}.`);}
        catch(error){console.error("[sheet-customizer] update failed",error);showToast(error.message,true);}
      });
    }
    renderSheetCustomizer(state);
  }catch(error){console.error("[sheet-customizer] bind failed",error);throw error;}
}

export function renderSheetCustomizer(state){
  try{
    const panel=ensurePanel(),value=normalizeSheetCustomization(state.sheetCustomization),theme=selectPrintTheme({class:{id:resolvedClassId(state)}});
    state.sheetCustomization={...value};
    for(const node of panel.querySelectorAll(MODE_SELECTOR))node.checked=node.value===value.printMode;
    panel.querySelector("#sheetThemeName").textContent=`${theme.label} · automatic class design`;
  }catch(error){console.error("[sheet-customizer] render failed",error);throw error;}
}

export function applySheetCustomizationToCurrent(state){
  try{
    if(!state.currentCharacter)return;
    const value=normalizeSheetCustomization(state.sheetCustomization);
    state.currentCharacter.presentation={...(state.currentCharacter.presentation||{}),sheetCustomization:{...value}};
  }catch(error){console.error("[sheet-customizer] apply failed",error);throw error;}
}

export function restoreSheetCustomizationFromCharacter(state,character){
  try{
    const value=normalizeSheetCustomization(character?.presentation?.sheetCustomization);
    state.sheetCustomization={...value};
    if(character)character.presentation={...(character.presentation||{}),sheetCustomization:{...value}};
    renderSheetCustomizer(state);
  }catch(error){console.error("[sheet-customizer] restore failed",error);throw error;}
}

function updateStateFromPanel(state,panel){
  try{
    const selected=panel.querySelector(`${MODE_SELECTOR}:checked`);
    if(!selected)throw new Error("Choose Color or Black & White for the printed sheet.");
    state.sheetCustomization={...normalizeSheetCustomization({printMode:selected.value})};
    applySheetCustomizationToCurrent(state);
    renderSheetCustomizer(state);
  }catch(error){console.error("[sheet-customizer] update failed",error);throw error;}
}

function ensurePanel(){
  try{
    let panel=document.getElementById("sheetCustomizerPanel");if(panel)return panel;
    const portrait=document.getElementById("portraitPanel"),anchor=document.getElementById("spellPickerPanel");if(!portrait&&!anchor)throw new Error("Sheet customizer anchor is unavailable.");
    panel=document.createElement("section");panel.id="sheetCustomizerPanel";panel.className="sheet-customizer-panel";panel.innerHTML=markup();
    if(portrait)portrait.insertAdjacentElement("afterend",panel);else anchor.parentNode.insertBefore(panel,anchor);return panel;
  }catch(error){console.error("[sheet-customizer] panel creation failed",error);throw error;}
}
function markup(){return `<div class="sheet-customizer-heading"><div><strong>Printed sheet</strong><small>The Forge handles the class artwork, paper, layout, and ornaments automatically.</small></div><span id="sheetThemeName" class="sheet-theme-badge">Class design</span></div><fieldset class="print-mode-choices"><legend>Choose one</legend><label><input type="radio" name="sheetPrintMode" value="premium" checked><span><b>Color</b><small>Full class colors and premium decoration.</small></span></label><label><input type="radio" name="sheetPrintMode" value="ink-saver"><span><b>Black & White</b><small>Clean monochrome sheet for any printer.</small></span></label></fieldset><p class="sheet-customizer-note">A professional class symbol prints in the top-left automatically. Uploading a character portrait replaces that symbol.</p>`;}
function resolvedClassId(state){const fixed=state.constraints?.class;return fixed&&fixed!=="random"?fixed:state.currentCharacter?.class?.id||"fighter";}
