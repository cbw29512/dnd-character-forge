import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.pregen-backup-browser");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[{name:"desktop",width:1440,height:1000},{name:"phone",width:390,height:900}];
const RETRYABLE_AUDIT_TIMEOUT=/^Timed out waiting for (?:forged character|saved pregen confirmation|Pregens tab|export confirmation|duplicate import confirmation|restore confirmation|restored library card)$/;

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditScript()}</body>`);
const server=createServer((req,res)=>{try{const url=new URL(req.url,"http://127.0.0.1");if(url.pathname==="/__pregen-backup-audit.html"){res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fixture);return;}const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative);if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){res.writeHead(403);res.end("Forbidden");return;}const body=readFileSync(target);res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});res.end(body);}catch(error){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end(`Not found: ${error.message}`);}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{for(const item of CASES)await verifyCase(item,port);console.log(`[pregen-backup-browser] verified ${CASES.length} save/export/import flows in Chrome`);}finally{await new Promise(resolve=>server.close(resolve));}

async function verifyCase(item,port){
  const url=`http://127.0.0.1:${port}/__pregen-backup-audit.html?case=${item.name}`;
  const common=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars",`--window-size=${item.width},${item.height}`,"--virtual-time-budget=12000"];
  const audit=await readBackupAudit(item,url,common);
  assert.equal(audit.auditError,"",`${item.name}: backup flow failed: ${audit.auditError}`);
  assert.equal(audit.savedCount,1,`${item.name}: forged character was not saved exactly once`);
  assert.equal(audit.afterDuplicateCount,1,`${item.name}: duplicate import changed library size`);
  assert.equal(audit.restoredCount,1,`${item.name}: cleared library did not restore from backup`);
  assert.equal(audit.cardCount,1,`${item.name}: restored library card did not render`);
  assert.equal(audit.backupControlsVisible,true,`${item.name}: backup controls are not visible`);
  assert.equal(audit.exportConfirmed,true,`${item.name}: export confirmation was not shown`);
  assert.equal(audit.duplicateConfirmed,true,`${item.name}: duplicate import confirmation was not shown`);
  assert.equal(audit.restoreConfirmed,true,`${item.name}: restore confirmation was not shown`);
  assert.ok(audit.horizontalOverflow<=1,`${item.name}: backup library has ${audit.horizontalOverflow}px horizontal overflow`);
  assert.ok(audit.actions.left>=-1,`${item.name}: backup controls escape left viewport`);
  assert.ok(audit.actions.right<=audit.viewportWidth+1,`${item.name}: backup controls escape right viewport`);
  assert.ok(audit.exportHeight>=40,`${item.name}: Export backup button is too short (${audit.exportHeight}px)`);
  assert.ok(audit.importHeight>=40,`${item.name}: Import backup button is too short (${audit.importHeight}px)`);
  const png=path.join(OUT,`${item.name}.png`);
  await execFileAsync(CHROME,[...common,`--screenshot=${png}`,url],{encoding:"utf8",timeout:40000,maxBuffer:4*1024*1024});
  console.log(`[pregen-backup-browser] ${item.name}: save 1 · duplicate skip 1 · restore 1 · overflow ${audit.horizontalOverflow}px`);
}

async function readBackupAudit(item,url,common){
  let lastDom="",lastAudit=null;
  for(let attempt=1;attempt<=2;attempt+=1){
    const {stdout:dom}=await execFileAsync(CHROME,[...common,"--dump-dom",url],{encoding:"utf8",timeout:40000,maxBuffer:8*1024*1024});
    lastDom=dom||"";
    const match=lastDom.match(/<pre id="pregenBackupAudit">([^<]+)<\/pre>/);
    if(!match){
      if(attempt<2){console.warn(`[pregen-backup-browser] ${item.name}: audit marker missing on Chrome attempt ${attempt}/2; retrying with a fresh browser process`);continue;}
      assert.ok(match,`${item.name}: pregen backup audit result was not produced`);
    }
    const audit=JSON.parse(decodeHtml(match[1]));
    lastAudit=audit;
    if(!RETRYABLE_AUDIT_TIMEOUT.test(audit.auditError||""))return audit;
    if(attempt<2){console.warn(`[pregen-backup-browser] ${item.name}: transient ${audit.auditError}; retrying with a fresh browser process`);continue;}
    return audit;
  }
  return lastAudit;
}

function auditScript(){return `<script>(()=>{const KEY="character-forge:pregen-library:v1",sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)),visible=element=>{if(!element)return false;const style=getComputedStyle(element),rect=element.getBoundingClientRect();return style.display!=="none"&&style.visibility!=="hidden"&&rect.width>0&&rect.height>0;},waitFor=async(check,label,timeout=8000)=>{const start=Date.now();while(Date.now()-start<timeout){if(check())return;await sleep(80);}throw new Error("Timed out waiting for "+label);},setBackupFile=async(input,text)=>{const transfer=new DataTransfer();transfer.items.add(new File([text],"pregens.json",{type:"application/json"}));input.files=transfer.files;input.dispatchEvent(new Event("change",{bubbles:true}));};const run=async()=>{let auditError="",data={};try{await sleep(150);document.getElementById("forgeButton")?.click();await waitFor(()=>document.querySelector("#result .character-sheet"),"forged character");const save=document.querySelector('#result [data-action="save"]');if(!save)throw new Error("Save to Pregens action is missing");save.click();await waitFor(()=>save.classList.contains("is-saved"),"saved pregen confirmation");const saved=JSON.parse(localStorage.getItem(KEY)||"[]");if(saved.length!==1)throw new Error("Expected exactly one saved pregen before backup");document.querySelector('[data-tab="pregens"]')?.click();await waitFor(()=>document.querySelector('[data-view="pregens"]')?.hidden===false,"Pregens tab");const exportButton=document.getElementById("pregenExport"),importButton=document.getElementById("pregenImport"),input=document.getElementById("pregenImportFile"),toast=document.getElementById("toast"),toastMessages=[];if(!exportButton||!importButton||!input||!toast)throw new Error("Backup controls or toast are missing");const recordToast=()=>{const message=(toast.textContent||"").trim();if(message&&!toastMessages.includes(message))toastMessages.push(message);};new MutationObserver(recordToast).observe(toast,{childList:true,subtree:true,characterData:true});exportButton.click();await waitFor(()=>toastMessages.some(message=>/pregen backup exported/i.test(message)),"export confirmation");const exportConfirmed=toastMessages.some(message=>/pregen backup exported/i.test(message));const backup=JSON.stringify({format:"character-forge-pregen-backup",backupVersion:1,exportedAt:new Date().toISOString(),pregens:saved});await setBackupFile(input,backup);await waitFor(()=>toastMessages.some(message=>/duplicate/i.test(message)),"duplicate import confirmation");const duplicateConfirmed=toastMessages.some(message=>/duplicate/i.test(message));const afterDuplicateCount=JSON.parse(localStorage.getItem(KEY)||"[]").length;localStorage.removeItem(KEY);await setBackupFile(input,backup);await waitFor(()=>toastMessages.some(message=>/imported 1 pregen/i.test(message)),"restore confirmation");await waitFor(()=>document.querySelectorAll(".library-card").length===1,"restored library card");const root=document.documentElement,body=document.body,actions=document.querySelector(".library-backup-actions")?.getBoundingClientRect(),exportRect=exportButton.getBoundingClientRect(),importRect=importButton.getBoundingClientRect();data={savedCount:saved.length,afterDuplicateCount,restoredCount:JSON.parse(localStorage.getItem(KEY)||"[]").length,cardCount:document.querySelectorAll(".library-card").length,backupControlsVisible:visible(exportButton)&&visible(importButton),exportConfirmed,duplicateConfirmed,restoreConfirmed:toastMessages.some(message=>/imported 1 pregen/i.test(message)),viewportWidth:root.clientWidth,horizontalOverflow:Math.max(0,Math.max(root.scrollWidth,body.scrollWidth)-root.clientWidth),actions:{left:actions?Math.round(actions.left*100)/100:-999,right:actions?Math.round(actions.right*100)/100:99999},exportHeight:Math.round(exportRect.height*100)/100,importHeight:Math.round(importRect.height*100)/100,toastMessages};}catch(error){auditError=error?.message||String(error);}const result=document.createElement("pre");result.id="pregenBackupAudit";result.textContent=JSON.stringify({auditError,...data});document.body.append(result);};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();})();<\/script>`;}
function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}
