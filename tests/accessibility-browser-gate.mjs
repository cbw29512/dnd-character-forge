import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const CHROME=process.env.CHROME_BIN||"google-chrome";
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditScript()}</body>`);
const server=createServer((req,res)=>serve(req,res));

try{
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const {port}=server.address();
  const url=`http://127.0.0.1:${port}/__accessibility-audit.html`;
  const args=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--window-size=1280,1000","--virtual-time-budget=5000","--dump-dom",url];
  const {stdout:dom}=await execFileAsync(CHROME,args,{encoding:"utf8",timeout:30000,maxBuffer:8*1024*1024});
  const match=dom.match(/<pre id="accessibilityAuditResult">([^<]+)<\/pre>/);
  assert.ok(match,"Accessibility browser audit result was not produced.");
  const audit=JSON.parse(decodeHtml(match[1]));
  assert.equal(audit.auditError,"",`Accessibility audit runtime failed: ${audit.auditError}`);
  assert.deepEqual(audit.duplicateIds,[],`Duplicate DOM ids: ${audit.duplicateIds.join(", ")}`);
  assert.deepEqual(audit.unnamedControls,[],`Visible controls without accessible names: ${audit.unnamedControls.join(", ")}`);
  assert.deepEqual(audit.unlabelledFields,[],`Visible form fields without labels: ${audit.unlabelledFields.join(", ")}`);
  assert.deepEqual(audit.imagesMissingAlt,[],`Images missing alt text: ${audit.imagesMissingAlt.join(", ")}`);
  assert.equal(audit.tablist.role,"tablist","Primary navigation did not expose a tablist role.");
  assert.equal(audit.tablist.selectedCount,1,"Primary navigation must expose exactly one selected tab.");
  assert.equal(audit.tablist.tabbableCount,1,"Primary navigation must expose exactly one tab stop.");
  assert.equal(audit.keyboard.afterFocus,"forge-tab-pregens","ArrowRight did not move focus to Pregens.");
  assert.equal(audit.keyboard.afterSelected,"true","ArrowRight did not activate Pregens.");
  assert.equal(audit.keyboard.pregenPanelHidden,false,"Activated Pregens panel remained hidden.");
  assert.equal(audit.live.result,"polite","Generated character result must remain a polite live region.");
  assert.equal(audit.live.error,"alert","Generation errors must remain an alert region.");
  assert.equal(audit.live.toast,"status","Toast feedback must remain a status region.");
  assert.equal(audit.characterRendered,true,"Forge did not render a character during accessibility certification.");
  console.log(`[accessibility-browser] certified ${audit.controlCount} visible controls with keyboard tabs, labels, live regions, unique ids, and image alt coverage`);
}catch(error){
  console.error("[accessibility-browser] certification failed",error);
  process.exitCode=1;
}finally{
  if(server.listening)await new Promise(resolve=>server.close(resolve));
}

function serve(req,res){
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    if(url.pathname==="/__accessibility-audit.html"){
      res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fixture);return;
    }
    const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative),root=path.resolve(ROOT);
    if(!target.startsWith(root+path.sep)&&target!==path.join(root,"index.html")){res.writeHead(403);res.end("Forbidden");return;}
    res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});res.end(readFileSync(target));
  }catch(error){console.error("[accessibility-browser] fixture serve failed",error);res.writeHead(404);res.end("Not found");}
}

function auditScript(){
  return `<script>(()=>{let auditError="";window.addEventListener("error",event=>{auditError=event?.error?.message||event?.message||"window error";});window.addEventListener("unhandledrejection",event=>{auditError=event?.reason?.message||String(event?.reason||"unhandled rejection");});const visible=el=>{if(!el)return false;const style=getComputedStyle(el),rect=el.getBoundingClientRect();return !el.hidden&&style.display!=="none"&&style.visibility!=="hidden"&&rect.width>0&&rect.height>0;};const labelFor=el=>{const aria=el.getAttribute("aria-label")?.trim();if(aria)return aria;const labelled=el.getAttribute("aria-labelledby");if(labelled){const text=labelled.split(/\\s+/).map(id=>document.getElementById(id)?.textContent?.trim()||"").join(" ").trim();if(text)return text;}const label=el.closest("label")||document.querySelector('label[for="'+CSS.escape(el.id||"")+'"]');if(label?.textContent?.trim())return label.textContent.trim();return el.textContent?.trim()||el.getAttribute("title")?.trim()||"";};const run=()=>setTimeout(()=>{try{document.getElementById("forgeButton")?.click();setTimeout(()=>{try{const controls=[...document.querySelectorAll('button,a[href],input:not([type="hidden"]),select,textarea,[role="tab"]')].filter(visible);const unnamedControls=controls.filter(el=>!labelFor(el)).map(el=>el.id||el.outerHTML.slice(0,80));const fields=[...document.querySelectorAll('input:not([type="hidden"]),select,textarea')].filter(visible);const unlabelledFields=fields.filter(el=>!labelFor(el)).map(el=>el.id||el.outerHTML.slice(0,80));const ids=[...document.querySelectorAll('[id]')].map(el=>el.id),counts=new Map();ids.forEach(id=>counts.set(id,(counts.get(id)||0)+1));const duplicateIds=[...counts].filter(([,count])=>count>1).map(([id])=>id);const imagesMissingAlt=[...document.querySelectorAll('img')].filter(img=>!img.hasAttribute('alt')).map(img=>img.src||img.outerHTML.slice(0,80));const tabs=[...document.querySelectorAll('.primary-nav [role="tab"]')],tablist=document.querySelector('.primary-nav');const before=tabs.find(tab=>tab.getAttribute('aria-selected')==='true')||tabs[0];before?.focus();before?.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));const active=document.activeElement;const result={auditError,controlCount:controls.length,unnamedControls,unlabelledFields,duplicateIds,imagesMissingAlt,characterRendered:Boolean(document.querySelector('#result .character-sheet')),tablist:{role:tablist?.getAttribute('role')||'',selectedCount:tabs.filter(tab=>tab.getAttribute('aria-selected')==='true').length,tabbableCount:tabs.filter(tab=>tab.tabIndex===0).length},keyboard:{afterFocus:active?.id||'',afterSelected:active?.getAttribute('aria-selected')||'',pregenPanelHidden:Boolean(document.getElementById('forge-panel-pregens')?.hidden)},live:{result:document.querySelector('.result-stage')?.getAttribute('aria-live')||'',error:document.getElementById('error')?.getAttribute('role')||'',toast:document.getElementById('toast')?.getAttribute('role')||''}};const node=document.createElement('pre');node.id='accessibilityAuditResult';node.textContent=JSON.stringify(result);document.body.append(node);}catch(error){auditError=error.message;const node=document.createElement('pre');node.id='accessibilityAuditResult';node.textContent=JSON.stringify({auditError,unnamedControls:[],unlabelledFields:[],duplicateIds:[],imagesMissingAlt:[],controlCount:0,characterRendered:false,tablist:{},keyboard:{},live:{}});document.body.append(node);}},700);}catch(error){auditError=error.message;}},100);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();})();<\/script>`;
}

function decodeHtml(value){try{return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}catch(error){console.error("[accessibility-browser] decode failed",error);throw error;}}
function mime(file){try{const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}catch(error){console.error("[accessibility-browser] mime resolution failed",error);throw error;}}
