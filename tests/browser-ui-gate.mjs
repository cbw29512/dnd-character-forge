import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.browser-ui");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {name:"desktop",width:1440,height:1100},
  {name:"tablet",width:820,height:1100},
  {name:"phone",width:390,height:1000},
  {name:"compact-phone",width:360,height:900}
];

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditScript()}</body>`);
const server=createServer((req,res)=>{try{const url=new URL(req.url,"http://127.0.0.1");if(url.pathname==="/__ui-audit.html"){res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fixture);return;}const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative);if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){res.writeHead(403);res.end("Forbidden");return;}const body=readFileSync(target);res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});res.end(body);}catch(error){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end(`Not found: ${error.message}`);}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{for(const item of CASES)await verifyViewport(item,port);console.log(`[browser-ui] verified ${CASES.length} responsive Forge viewports in Chrome`);}finally{await new Promise(resolve=>server.close(resolve));}

async function verifyViewport(item,port){
  const url=`http://127.0.0.1:${port}/__ui-audit.html?case=${item.name}`;
  const common=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars",`--window-size=${item.width},${item.height}`,"--virtual-time-budget=5000"];
  const {stdout:dom}=await execFileAsync(CHROME,[...common,"--dump-dom",url],{encoding:"utf8",timeout:30000,maxBuffer:8*1024*1024});
  const match=dom.match(/<pre id="uiAuditResult">([^<]+)<\/pre>/);assert.ok(match,`${item.name}: UI audit result was not produced`);
  const audit=JSON.parse(decodeHtml(match[1]));
  const forgedPng=path.join(OUT,`${item.name}.png`),landingPng=path.join(OUT,`${item.name}-landing.png`);
  await execFileAsync(CHROME,[...common,`--screenshot=${forgedPng}`,url],{encoding:"utf8",timeout:30000,maxBuffer:4*1024*1024});
  await execFileAsync(CHROME,[...common,"--virtual-time-budget=1200",`--screenshot=${landingPng}`,`${url}&capture=landing`],{encoding:"utf8",timeout:30000,maxBuffer:4*1024*1024});
  assert.equal(audit.auditError,"",`${item.name}: audit runtime failed: ${audit.auditError}`);assert.equal(audit.characterRendered,true,`${item.name}: Forge did not render a character`);assert.equal(audit.errorVisible,false,`${item.name}: Forge displayed an error: ${audit.errorText||"unknown"}`);assert.ok(audit.horizontalOverflow<=1,`${item.name}: page has ${audit.horizontalOverflow}px horizontal overflow`);assert.equal(audit.forgeButton.visible,true,`${item.name}: Forge Character action is hidden`);assert.ok(audit.forgeButton.height>=40,`${item.name}: Forge Character action is too short for touch/keyboard use`);
  for(const [selector,box] of Object.entries(audit.boxes)){if(!box.present||!box.visible)continue;assert.ok(box.left>=-1,`${item.name}: ${selector} escapes left viewport (${box.left})`);assert.ok(box.right<=audit.viewportWidth+1,`${item.name}: ${selector} escapes right viewport (${box.right} > ${audit.viewportWidth})`);assert.ok(box.width>0,`${item.name}: ${selector} collapsed to zero width`);}
  if(item.width<=390){const forgePanel=audit.boxes[".forge-panel"],resultStage=audit.boxes[".result-stage"],limit=item.height*.82;assert.ok(audit.initialForgePanelTop<=limit,`${item.name}: landing Forge controls begin too far below the first viewport (${audit.initialForgePanelTop}px > ${Math.round(limit)}px)`);assert.equal(forgePanel.present,true,`${item.name}: Forge panel is missing`);assert.equal(forgePanel.visible,true,`${item.name}: Forge panel is hidden`);assert.equal(resultStage.present,true,`${item.name}: generated result stage is missing`);assert.equal(resultStage.visible,true,`${item.name}: generated result stage is hidden`);assert.ok(resultStage.top<=limit,`${item.name}: generated character begins too far below the first viewport (${resultStage.top}px > ${Math.round(limit)}px)`);assert.ok(resultStage.top<forgePanel.top,`${item.name}: generated character must appear before edit controls (${resultStage.top}px !< ${forgePanel.top}px)`);}
  console.log(`[browser-ui] ${item.name}: ${audit.viewportWidth}px · overflow ${audit.horizontalOverflow}px · landing Forge y=${audit.initialForgePanelTop}px · generated result y=${audit.boxes[".result-stage"].top}px · character rendered`);
}
function auditScript(){return `<script>(()=>{let auditError="";window.addEventListener("error",event=>{auditError=event?.error?.message||event?.message||"window error";});window.addEventListener("unhandledrejection",event=>{auditError=event?.reason?.message||String(event?.reason||"unhandled rejection");});const run=()=>setTimeout(()=>{if(new URLSearchParams(location.search).get('capture')==='landing')return;const initialForgePanel=document.querySelector('.forge-panel')?.getBoundingClientRect(),initialForgePanelTop=initialForgePanel?Math.round(initialForgePanel.top*100)/100:null;const forge=document.getElementById("forgeButton");if(forge)forge.click();setTimeout(()=>{const visible=element=>{if(!element)return false;const style=getComputedStyle(element),rect=element.getBoundingClientRect();return style.display!=="none"&&style.visibility!=="hidden"&&rect.width>0&&rect.height>0;};const box=selector=>{const element=document.querySelector(selector);if(!element)return {present:false,visible:false};const rect=element.getBoundingClientRect();return {present:true,visible:visible(element),left:Math.round(rect.left*100)/100,right:Math.round(rect.right*100)/100,top:Math.round(rect.top*100)/100,bottom:Math.round(rect.bottom*100)/100,width:Math.round(rect.width*100)/100,height:Math.round(rect.height*100)/100};};const root=document.documentElement,body=document.body,error=document.getElementById("error"),forgeButton=document.getElementById("forgeButton");const data={auditError,initialForgePanelTop,viewportWidth:root.clientWidth,horizontalOverflow:Math.max(0,Math.max(root.scrollWidth,body.scrollWidth)-root.clientWidth),characterRendered:Boolean(document.querySelector("#result .character-sheet")),errorVisible:visible(error),errorText:error?.textContent?.trim()||"",forgeButton:{visible:visible(forgeButton),height:forgeButton?forgeButton.getBoundingClientRect().height:0},boxes:{".site-header":box(".site-header"),".forge-panel":box(".forge-panel"),".result-stage":box(".result-stage"),".character-sheet":box("#result .character-sheet"),".forge-button":box("#forgeButton"),".primary-nav":box(".primary-nav")}};const result=document.createElement("pre");result.id="uiAuditResult";result.textContent=JSON.stringify(data);document.body.append(result);},700);},100);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();})();<\/script>`;}
function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}
