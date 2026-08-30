import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.party-forge-browser");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {name:"desktop-2024",width:1440,height:1100,ruleset:"2024"},
  {name:"phone-2024",width:390,height:1000,ruleset:"2024"},
  {name:"desktop-2014",width:1440,height:1100,ruleset:"2014"}
];

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditScript()}</body>`);
const server=createServer((req,res)=>{try{const url=new URL(req.url,"http://127.0.0.1");if(url.pathname==="/__party-audit.html"){res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fixture);return;}const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative);if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){res.writeHead(403);res.end("Forbidden");return;}const body=readFileSync(target);res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});res.end(body);}catch(error){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end(`Not found: ${error.message}`);}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{for(const item of CASES)await verify(item,port);console.log(`[party-forge-browser] verified ${CASES.length} Party Forge browser cases`);}finally{await new Promise(resolve=>server.close(resolve));}

async function verify(item,port){
  const url=`http://127.0.0.1:${port}/__party-audit.html?ruleset=${item.ruleset}`;
  const common=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars",`--window-size=${item.width},${item.height}`,"--virtual-time-budget=6500"];
  const {stdout:dom}=await execFileAsync(CHROME,[...common,"--dump-dom",url],{encoding:"utf8",timeout:35000,maxBuffer:8*1024*1024});
  const match=dom.match(/<pre id="partyAuditResult">([^<]+)<\/pre>/);assert.ok(match,`${item.name}: Party Forge audit result was not produced`);
  const audit=JSON.parse(decodeHtml(match[1]));
  assert.equal(audit.auditError,"",`${item.name}: runtime failed: ${audit.auditError}`);
  assert.equal(audit.togglePresent,true,`${item.name}: Forge a Party control is missing`);
  assert.equal(audit.panelVisible,true,`${item.name}: Party Forge panel did not open`);
  assert.equal(audit.rosterPresent,true,`${item.name}: party roster did not render`);
  assert.equal(audit.memberCount,4,`${item.name}: expected four party members`);
  assert.equal(audit.validatedProof,true,`${item.name}: roster did not report four RAW-valid members`);
  assert.equal(audit.ruleset,item.ruleset,`${item.name}: Party Forge crossed rules editions`);
  assert.ok(audit.horizontalOverflow<=1,`${item.name}: Party Forge caused ${audit.horizontalOverflow}px horizontal overflow`);
  if(item.width<=390){assert.ok(audit.rosterTop>=-2&&audit.rosterTop<item.height*.65,`${item.name}: generated roster starts too far below the visible viewport (${audit.rosterTop}px)`);assert.ok(audit.rosterTop<audit.panelTop,`${item.name}: generated party must appear before the editor on phones (${audit.rosterTop}px !< ${audit.panelTop}px)`);}
  const png=path.join(OUT,`${item.name}.png`);
  await execFileAsync(CHROME,[...common,`--screenshot=${png}`,url],{encoding:"utf8",timeout:35000,maxBuffer:4*1024*1024});
  console.log(`[party-forge-browser] ${item.name}: ${audit.memberCount} members · overflow ${audit.horizontalOverflow}px · roster y=${audit.rosterTop}px · editor y=${audit.panelTop}px`);
}

function auditScript(){return `<script>(()=>{let auditError="";window.addEventListener("error",event=>{auditError=event?.error?.message||event?.message||"window error";});window.addEventListener("unhandledrejection",event=>{auditError=event?.reason?.message||String(event?.reason||"unhandled rejection");});const run=()=>setTimeout(()=>{try{const params=new URLSearchParams(location.search),ruleset=params.get("ruleset")||"2024",rules=document.getElementById("ruleset");rules.value=ruleset;rules.dispatchEvent(new Event("change",{bubbles:true}));const toggle=document.getElementById("partyForgeToggle");toggle?.click();const size=document.getElementById("partySize"),level=document.getElementById("partyLevel"),composition=document.getElementById("partyComposition");if(size)size.value="4";if(level)level.value="5";if(composition)composition.value="balanced";document.getElementById("forgePartyButton")?.click();setTimeout(()=>{const root=document.documentElement,body=document.body,panel=document.getElementById("partyForgePanel"),proof=document.querySelector(".party-roster-proof"),roster=document.querySelector(".party-roster"),data={auditError,togglePresent:Boolean(toggle),panelVisible:Boolean(panel&&!panel.hidden),rosterPresent:Boolean(roster),memberCount:document.querySelectorAll(".party-member-card").length,validatedProof:Boolean(proof&&/4\\/4 RAW validated/.test(proof.textContent)),ruleset:document.getElementById("ruleset")?.value||"",horizontalOverflow:Math.max(0,Math.max(root.scrollWidth,body.scrollWidth)-root.clientWidth),scrollY:Math.round(window.scrollY),rosterTop:roster?Math.round(roster.getBoundingClientRect().top*100)/100:9999,panelTop:panel?Math.round(panel.closest('.forge-panel').getBoundingClientRect().top*100)/100:9999};const result=document.createElement("pre");result.id="partyAuditResult";result.textContent=JSON.stringify(data);document.body.append(result);},900);}catch(error){auditError=error.message;const result=document.createElement("pre");result.id="partyAuditResult";result.textContent=JSON.stringify({auditError,togglePresent:false,panelVisible:false,rosterPresent:false,memberCount:0,validatedProof:false,ruleset:"",horizontalOverflow:999,scrollY:0,rosterTop:9999,panelTop:9999});document.body.append(result);}},200);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();})();<\/script>`;}
function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}
