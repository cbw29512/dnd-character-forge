import { createDefaultSheetCustomization, normalizeSheetCustomization } from "../print/customization.js";
import { selectPrintTheme } from "../print/theme.js";

const CONTROL_IDS=["sheetPacketMode","sheetStyle","sheetPaper","sheetOrnament","sheetFrame","sheetPrintMode","portraitFilter","portraitVisible","portraitX","portraitY","portraitZoom"];

export function bindSheetCustomizer(state,showToast){
  try{
    const panel=ensurePanel();
    for(const id of CONTROL_IDS){
      const node=panel.querySelector(`#${id}`);
      if(!node)throw new Error(`Missing sheet customizer control: ${id}`);
      node.addEventListener("input",()=>updateStateFromPanel(state,panel));
      node.addEventListener("change",()=>updateStateFromPanel(state,panel));
    }
    panel.querySelector("#resetSheetStyle").addEventListener("click",()=>{
      try{state.sheetCustomization=createDefaultSheetCustomization();applySheetCustomizationToCurrent(state);renderSheetCustomizer(state);showToast("Sheet presentation reset to deluxe class defaults.");}
      catch(error){console.error("[sheet-customizer] reset failed",error);showToast(error.message,true);}
    });
    renderSheetCustomizer(state);
  }catch(error){console.error("[sheet-customizer] bind failed",error);throw error;}
}

export function renderSheetCustomizer(state){
  try{
    const panel=ensurePanel(),value=normalizeSheetCustomization(state.sheetCustomization),theme=selectPrintTheme({class:{id:resolvedClassId(state)}});
    state.sheetCustomization={...value};
    setValue(panel,"sheetPacketMode",value.packetMode);setValue(panel,"sheetStyle",value.style);setValue(panel,"sheetPaper",value.paper);setValue(panel,"sheetOrnament",value.ornament);setValue(panel,"sheetFrame",value.frame);setValue(panel,"sheetPrintMode",value.printMode);setValue(panel,"portraitFilter",value.portraitFilter);
    panel.querySelector("#portraitVisible").checked=value.portraitVisible;
    for(const id of ["portraitX","portraitY","portraitZoom"]){panel.querySelector(`#${id}`).value=String(value[id]);}
    panel.querySelector("#portraitXValue").textContent=`${value.portraitX}%`;panel.querySelector("#portraitYValue").textContent=`${value.portraitY}%`;panel.querySelector("#portraitZoomValue").textContent=`${value.portraitZoom}%`;
    panel.querySelector("#sheetThemeName").textContent=`${theme.label} · ${theme.visualIdentity}`;
    syncPortraitPreview(value);
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
  try{state.sheetCustomization={...normalizeSheetCustomization(character?.presentation?.sheetCustomization)};renderSheetCustomizer(state);}
  catch(error){console.error("[sheet-customizer] restore failed",error);throw error;}
}

function updateStateFromPanel(state,panel){
  try{
    state.sheetCustomization={...normalizeSheetCustomization({
      packetMode:panel.querySelector("#sheetPacketMode").value,style:panel.querySelector("#sheetStyle").value,paper:panel.querySelector("#sheetPaper").value,ornament:panel.querySelector("#sheetOrnament").value,frame:panel.querySelector("#sheetFrame").value,printMode:panel.querySelector("#sheetPrintMode").value,portraitFilter:panel.querySelector("#portraitFilter").value,portraitVisible:panel.querySelector("#portraitVisible").checked,portraitX:panel.querySelector("#portraitX").value,portraitY:panel.querySelector("#portraitY").value,portraitZoom:panel.querySelector("#portraitZoom").value
    })};
    applySheetCustomizationToCurrent(state);renderSheetCustomizer(state);
  }catch(error){console.error("[sheet-customizer] update failed",error);throw error;}
}

function syncPortraitPreview(value){
  try{
    const preview=document.getElementById("portraitPreview"),wrap=preview?.closest(".portrait-preview-wrap");if(!preview||!wrap)return;
    preview.style.objectPosition=`${value.portraitX}% ${value.portraitY}%`;
    preview.style.transform=`scale(${value.portraitZoom/100})`;
    preview.style.transformOrigin=`${value.portraitX}% ${value.portraitY}%`;
    preview.classList.toggle("preview-painted",value.portraitFilter==="painted");
    preview.classList.toggle("preview-grayscale",value.portraitFilter==="grayscale");
    wrap.classList.toggle("preview-hidden",!value.portraitVisible);
  }catch(error){console.error("[sheet-customizer] portrait preview sync failed",error);throw error;}
}

function ensurePanel(){
  try{
    let panel=document.getElementById("sheetCustomizerPanel");if(panel)return panel;
    const portrait=document.getElementById("portraitPanel"),anchor=document.getElementById("spellPickerPanel");if(!portrait&&!anchor)throw new Error("Sheet customizer anchor is unavailable.");
    panel=document.createElement("section");panel.id="sheetCustomizerPanel";panel.className="sheet-customizer-panel";panel.innerHTML=markup();
    if(portrait)portrait.insertAdjacentElement("afterend",panel);else anchor.parentNode.insertBefore(panel,anchor);return panel;
  }catch(error){console.error("[sheet-customizer] panel creation failed",error);throw error;}
}
function markup(){return `<div class="sheet-customizer-heading"><div><strong>Premium sheet studio</strong><small>Presentation only. Rules, math, and legality remain locked.</small></div><span id="sheetThemeName" class="sheet-theme-badge">Class theme</span></div><div class="sheet-customizer-grid"><label>Packet<select id="sheetPacketMode"><option value="deluxe">Deluxe showcase</option><option value="table">Compact table packet</option></select></label><label>Style<select id="sheetStyle"><option value="ornate">Ornate showcase</option><option value="classic">Classic premium</option><option value="minimal">Minimal</option></select></label><label>Paper<select id="sheetPaper"><option value="ivory">Ivory</option><option value="parchment">Parchment</option><option value="white">Clean white</option></select></label><label>Ornaments<select id="sheetOrnament"><option value="rich">Rich</option><option value="balanced">Balanced</option><option value="minimal">Minimal</option></select></label><label>Portrait frame<select id="sheetFrame"><option value="class">Class frame</option><option value="filigree">Filigree</option><option value="clean">Clean</option></select></label><label>Print mode<select id="sheetPrintMode"><option value="premium">Premium color</option><option value="ink-saver">Ink saver</option></select></label><label>Portrait finish<select id="portraitFilter"><option value="natural">Natural</option><option value="painted">Painted</option><option value="grayscale">Grayscale</option></select></label></div><label class="sheet-toggle"><input id="portraitVisible" type="checkbox" checked><span>Show portrait on printed sheet</span></label><div class="portrait-tuning"><label>Horizontal focus <output id="portraitXValue">50%</output><input id="portraitX" type="range" min="0" max="100" value="50"></label><label>Vertical focus <output id="portraitYValue">32%</output><input id="portraitY" type="range" min="0" max="100" value="32"></label><label>Portrait zoom <output id="portraitZoomValue">100%</output><input id="portraitZoom" type="range" min="100" max="165" value="100"></label></div><button id="resetSheetStyle" class="sheet-reset" type="button">Reset deluxe defaults</button>`;}
function resolvedClassId(state){const fixed=state.constraints?.class;return fixed&&fixed!=="random"?fixed:state.currentCharacter?.class?.id||"fighter";}
function setValue(panel,id,value){const node=panel.querySelector(`#${id}`);if(node)node.value=value;}
