const MAX_SOURCE_BYTES=8*1024*1024,MAX_SIDE=560,MAX_OUTPUT_CHARS=450000,ALLOWED=new Set(["image/jpeg","image/png","image/webp"]),QUALITIES=[.82,.7,.58,.46];

export function bindPortraitUpload(state,showToast){
  try{
    const panel=ensurePanel();
    panel.querySelector("#portraitFile").addEventListener("change",async event=>{
      try{const file=event.target.files?.[0];if(!file)return;state.portraitDataUrl=await normalizePortrait(file);applyPortraitToCurrent(state);renderPortraitUpload(state);showToast("Portrait ready for premium PDF export.");}
      catch(error){console.error("[portrait] upload failed",error);event.target.value="";showToast(error.message,true);}
    });
    panel.querySelector("#removePortrait").addEventListener("click",()=>{try{state.portraitDataUrl=null;applyPortraitToCurrent(state);renderPortraitUpload(state);showToast("Portrait removed; class crest will be used.");}catch(error){console.error("[portrait] remove failed",error);showToast(error.message,true);}});
    renderPortraitUpload(state);
  }catch(error){console.error("[portrait] bind failed",error);throw error;}
}
export function renderPortraitUpload(state){
  try{const panel=ensurePanel(),preview=panel.querySelector("#portraitPreview"),empty=panel.querySelector("#portraitEmpty"),remove=panel.querySelector("#removePortrait"),has=validPortrait(state.portraitDataUrl);preview.hidden=!has;empty.hidden=has;remove.hidden=!has;if(has)preview.src=state.portraitDataUrl;else preview.removeAttribute("src");}
  catch(error){console.error("[portrait] render failed",error);throw error;}
}
export function restorePortraitFromCharacter(state,character){try{state.portraitDataUrl=validPortrait(character?.presentation?.portraitDataUrl)?character.presentation.portraitDataUrl:null;renderPortraitUpload(state);}catch(error){console.error("[portrait] restore failed",error);throw error;}}
export function applyPortraitToCurrent(state){
  try{if(!state.currentCharacter)return;if(validPortrait(state.portraitDataUrl))state.currentCharacter.presentation={...(state.currentCharacter.presentation||{}),portraitDataUrl:state.portraitDataUrl};else if(state.currentCharacter.presentation){delete state.currentCharacter.presentation.portraitDataUrl;if(!Object.keys(state.currentCharacter.presentation).length)delete state.currentCharacter.presentation;}}
  catch(error){console.error("[portrait] apply failed",error);throw error;}
}
function ensurePanel(){
  try{let panel=document.getElementById("portraitPanel");if(panel)return panel;const anchor=document.getElementById("spellPickerPanel");if(!anchor)throw new Error("Portrait panel anchor is unavailable.");panel=document.createElement("div");panel.id="portraitPanel";panel.className="portrait-panel";panel.innerHTML=`<div class="portrait-heading"><div><strong>Character portrait</strong><small>Optional · used only on the premium printable sheet.</small></div><span class="portrait-badge">Presentation</span></div><div class="portrait-body"><div class="portrait-preview-wrap"><img id="portraitPreview" alt="Character portrait preview" hidden><div id="portraitEmpty" class="portrait-empty"><strong>Class crest</strong><span>Upload art to replace the automatic crest.</span></div></div><div class="portrait-actions"><label class="portrait-upload-button">Choose image<input id="portraitFile" type="file" accept="image/jpeg,image/png,image/webp"></label><button id="removePortrait" class="portrait-remove" type="button" hidden>Remove portrait</button><small>JPEG, PNG, or WebP · resized and compressed locally before saving.</small></div></div>`;anchor.parentNode.insertBefore(panel,anchor);return panel;}
  catch(error){console.error("[portrait] panel creation failed",error);throw error;}
}
async function normalizePortrait(file){
  try{if(!ALLOWED.has(file.type))throw new Error("Portrait must be a JPEG, PNG, or WebP image.");if(file.size>MAX_SOURCE_BYTES)throw new Error("Portrait source image must be 8 MB or smaller.");const url=await readFile(file),image=await loadImage(url),scale=Math.min(1,MAX_SIDE/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));const context=canvas.getContext("2d");if(!context)throw new Error("This browser cannot prepare portrait images.");context.fillStyle="#eadcc2";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);return encodePortrait(canvas);}
  catch(error){console.error("[portrait] normalization failed",error);throw error;}
}
function encodePortrait(canvas){
  try{for(const quality of QUALITIES){const output=canvas.toDataURL("image/jpeg",quality);if(validPortrait(output)&&output.length<=MAX_OUTPUT_CHARS)return output;}throw new Error("Portrait is too detailed to store efficiently. Try a simpler crop or smaller source image.");}
  catch(error){console.error("[portrait] encoding failed",error);throw error;}
}
function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(new Error("Portrait file could not be read."));reader.readAsDataURL(file);});}
function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Portrait image could not be decoded."));image.src=src;});}
export function validPortrait(value){return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(String(value||""));}
