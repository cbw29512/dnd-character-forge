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

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditScript()}</body>`);
const server=createServer((req,res)=>{try{const url=new URL(req.url,"http://127.0.0.1");if(url.pathname==="/__pregen-backup-audit.html"){res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fixture);return;}const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative);if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){res.writeHead(403);res.end("Forbidden");return;}const body=readFileSync(target);res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});res.end(body);}catch(error){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end(`Not found: ${error.message}`);}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{for(const item of CASES)await verifyCase(item,port);console.log(`[pregen-backup-browser] verified ${CASES.length} save/export/import flows in Chrome`);}finally{await new Promise(resolve=>server.close(resolve));}

async function verifyCase(item,port){
  const url=`http://127.0.0.1:${port}/__pregen-backup-audit.html?case=${item.name}`;
  const common=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars",`--window-size=${item.width},${item.height}`,"--virtual-time-budget=10000"];
  const {stdout:dom}=await execFileAsync(CHROME,[...common,"--dump-dom",url],{encoding:"utf8",timeout:35000,maxBuffer:8*1024*1024});
  const match=dom.match(/<pre id="pregenBackupAudit">([^<]+)<\/pre>/);assert.ok(match,`${item.name}: pregen backup audit result was not produced`);
  const audit=JSON.parse(decodeHtml(match[1]));
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
  await execFileAsync(CHROME,[...common,`--screenshot=${png}`,url],{encoding:"utf8",timeout:35000,maxBuffer:4*1024*1024});
  console.log(`[pregen-backup-browser] ${item.name}: save 1 · duplicate skip 1 · restore 1 · overflow ${audit.horizontalOverflow}px`);
}

function auditScript(){return `<script>(()=>{const KEY="character-forge:pregen-library:v1",sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)),visible=element=>{if(!element)return false;const style=getComputedStyle(element),rect=element.getBoundingClientRect();return style.display!=="none"&&style.visibility!=="hidden"&&rect.width>0&&rect.height>0;},waitFor=async(check,label,timeout=7000)=>{const start=Date.now();while(Date.now()-start<timeout){if(check())return;sleep(80);await sleep(80);}throw new Error("Timed out waiting for "+label);},setBackupFile=async(input,text)=>{const transfer=new DataTransfer();transfer.items.add(new File([text],"pregens.json",{type:"application/json"}));input.files=transfer.files;input.dispatchEvent(new Event("change",{bubbles:true}));};const run=async()=>{let auditError="",data={};try{await sleep(150);document.getElementById("forgeButton")?.click();await waitFor(()=>document.querySelector("#result .character-sheet"),"forged character");const save=document.querySelector('#result [data-action="save"]');if(!save)throw new Error("Save to Pregens action is missing");save.click();await waitFor(()=>save.classList.contains("is-saved"),"saved pregen confirmation");const saved=JSON.parse(localStorage.getItem(KEY)||"[]");if(saved.length!==1)throw new Error("Expected exactly one saved pregen before backup");document.querySelector('[data-tab="pregens"]')?.click();await waitFor(()=>document.querySelector('[data-view="pregens"]')?.hidden===false,"Pregens tab");const exportButton=document.getElementById("exportPregenBackup"),importButton=document.getElementById("importPregenBackup"),input=document.getElementById("pregenBackupFile"),toast=document.getElementById("toast");if(!exportButton||!importButton||!input)throw new Error("Backup controls are missing");exportButton.click();await waitFor(()=>/exported to a verified backup/i.test(toast?.textContent||""),"export confirmation");const exportConfirmed=/exported to a verified backup/i.test(toast?.textContent||"");const backup=JSON.stringify({format:"character-forge-pregen-backup",schemaVersion:1,entrySchemaVersion:1,exportedAt:new Date().toISOString(),entries:saved});await setBackupFile(input,backup);await waitFor(()=>/duplicate/i.test(toast?.textContent||""),"duplicate import confirmation");const duplicateConfirmed=/duplicate/i.test(toast?.textContent||"");const afterDuplicateCount=JSON.parse(localStorage.getItem(KEY)||"[]").length;localStorage.removeItem(KEY);await setBackupFile(input,backup);await waitFor(()=>/^1 pregen restored/i.test(toast?.textContent||""),"restore confirmation");await waitFor(()=>document.querySelectorAll(".library-card").length===1,"restored library card");const root=document.documentElement,body=document.body,actions=document.querySelector(".library-backup-actions")?.getBoundingClientRect(),exportRect=exportButton.getBoundingClientRect(),importRect=importButton.getBoundingClientRect();data={savedCount:saved.length,afterDuplicateCount,restoredCount:JSON.parse(localStorage.getItem(KEY)||"[]").length,cardCount:document.querySelectorAll(".library-card").length,backupControlsVisible:visible(exportButton)&&visible(importButton),exportConfirmed,duplicateConfirmed,restoreConfirmed:/^1 pregen restored/i.test(toast?.textContent||""),viewportWidth:root.clientWidth,horizontalOverflow:Math.max(0,Math.max(root.scrollWidth,body.scrollWidth)-root.clientWidth),actions:{left:actions?Math.round(actions.left*100)/100:-999,right:actions?Math.round(actions.right*100)/100:99999},exportHeight:Math.round(exportRect.height*100)/100,importHeight:Math.round(importRect.height*100)/100};}catch(error){auditError=error?.message||String(error);}const result=document.createElement("pre");result.id="pregenBackupAudit";result.textContent=JSON.stringify({auditError,...data});document.body.append(result);};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();})();<\/script>`;}
function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}
