import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.party-print-browser");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {name:"desktop-2024",width:1440,height:1100,ruleset:"2024"},
  {name:"phone-2024",width:390,height:1000,ruleset:"2024"},
  {name:"desktop-2014",width:1440,height:1100,ruleset:"2014"}
];

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditScript()}</body>`);
const server=createServer((req,res)=>{try{const url=new URL(req.url,"http://127.0.0.1");if(url.pathname==="/__party-print-audit.html"){res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fixture);return;}const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative);if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){res.writeHead(403);res.end("Forbidden");return;}const body=readFileSync(target);res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});res.end(body);}catch(error){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end(`Not found: ${error.message}`);}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{for(const item of CASES)await verify(item,port);console.log(`[party-print-browser] verified ${CASES.length} direct Party Forge print cases`);}finally{await new Promise(resolve=>server.close(resolve));}

async function verify(item,port){
  const url=`http://127.0.0.1:${port}/__party-print-audit.html?ruleset=${item.ruleset}`;
  const common=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars",`--window-size=${item.width},${item.height}`,"--virtual-time-budget=7500"];
  const {stdout:dom}=await execFileAsync(CHROME,[...common,"--dump-dom",url],{encoding:"utf8",timeout:40000,maxBuffer:10*1024*1024});
  const match=dom.match(/<pre id="partyPrintAuditResult">([^<]+)<\/pre>/);assert.ok(match,`${item.name}: Party print audit result was not produced`);
  const audit=JSON.parse(decodeHtml(match[1]));
  assert.equal(audit.auditError,"",`${item.name}: runtime failed: ${audit.auditError}`);
  assert.equal(audit.memberCount,4,`${item.name}: expected four party members`);
  assert.equal(audit.printButtonPresent,true,`${item.name}: Print the Party action is missing`);
  assert.equal(audit.printIsPrimary,true,`${item.name}: Print the Party is not the primary roster action`);
  assert.equal(audit.saveIsSecondary,true,`${item.name}: Save all should be secondary to direct print`);
  assert.equal(audit.actionsAboveCards,true,`${item.name}: party-level actions must appear before individual roster cards`);
  assert.equal(audit.printCalled,true,`${item.name}: party print did not call window.print()`);
  assert.equal(audit.printCalledSynchronously,true,`${item.name}: party print left the original click turn before window.print()`);
  assert.equal(audit.stagedNameCount,4,`${item.name}: print staging did not include all four party members`);
  assert.ok(audit.stagedPageCount>=4,`${item.name}: party print staged too few character pages (${audit.stagedPageCount})`);
  assert.equal(audit.partyBoundaryCount,3,`${item.name}: party print did not force a page boundary before members 2-4`);
  assert.equal(audit.printRootActive,true,`${item.name}: print root was not activated before window.print()`);
  assert.equal(audit.printRootCleaned,true,`${item.name}: print staging did not clean up after afterprint`);
  assert.equal(audit.titleRestored,true,`${item.name}: document title was not restored after print`);
  assert.ok(audit.horizontalOverflow<=1,`${item.name}: Party Forge print action caused ${audit.horizontalOverflow}px horizontal overflow`);
  if(item.width<=390)assert.equal(audit.mobileActionsStacked,true,`${item.name}: party actions are not full-width stacked controls on phone`);
  const png=path.join(OUT,`${item.name}.png`);
  await execFileAsync(CHROME,[...common,`--screenshot=${png}`,url],{encoding:"utf8",timeout:40000,maxBuffer:4*1024*1024});
  console.log(`[party-print-browser] ${item.name}: ${audit.stagedNameCount} members · ${audit.stagedPageCount} staged pages · actions before cards · ${audit.partyBoundaryCount} member boundaries · overflow ${audit.horizontalOverflow}px`);
}

function auditScript(){return `<script>(()=>{let auditError="";window.addEventListener("error",event=>{auditError=event?.error?.message||event?.message||"window error";});window.addEventListener("unhandledrejection",event=>{auditError=event?.reason?.message||String(event?.reason||"unhandled rejection");});const run=()=>setTimeout(()=>{try{const params=new URLSearchParams(location.search),ruleset=params.get("ruleset")||"2024",rules=document.getElementById("ruleset"),originalTitle=document.title;rules.value=ruleset;rules.dispatchEvent(new Event("change",{bubbles:true}));document.getElementById("partyForgeToggle")?.click();const size=document.getElementById("partySize"),level=document.getElementById("partyLevel"),composition=document.getElementById("partyComposition");if(size)size.value="4";if(level)level.value="5";if(composition)composition.value="balanced";document.getElementById("forgePartyButton")?.click();setTimeout(()=>{try{const roster=document.querySelector(".party-roster"),cards=[...document.querySelectorAll(".party-member-card")],names=cards.map(card=>card.querySelector("h3")?.textContent?.trim()).filter(Boolean),actions=roster?.querySelector(".party-roster-actions"),printButton=document.getElementById("printParty"),saveButton=document.getElementById("savePartyPregens"),firstCard=cards[0],actionsAboveCards=Boolean(actions&&firstCard&&actions.getBoundingClientRect().bottom<=firstCard.getBoundingClientRect().top+1);let printCalled=false,printCalledSynchronously=false,stagedNameCount=0,stagedPageCount=0,partyBoundaryCount=0,printRootActive=false,inClick=false;window.print=()=>{printCalled=true;printCalledSynchronously=inClick;const root=document.getElementById("premiumPrintRoot"),text=root?.textContent||"";stagedNameCount=names.filter(name=>text.includes(name)).length;stagedPageCount=root?.querySelectorAll(".premium-sheet").length||0;partyBoundaryCount=root?.querySelectorAll('[data-party-print-start="true"]').length||0;printRootActive=Boolean(document.body.classList.contains("premium-print-active")&&root&&root.getAttribute("aria-hidden")==="false");window.dispatchEvent(new Event("afterprint"));};inClick=true;printButton?.click();inClick=false;const root=document.getElementById("premiumPrintRoot"),rootCleaned=Boolean(root&&!document.body.classList.contains("premium-print-active")&&!(root.innerHTML||"").trim()&&root.getAttribute("aria-hidden")==="true"),rootStyle=printButton?getComputedStyle(printButton):null,saveStyle=saveButton?getComputedStyle(saveButton):null,rootWidth=printButton?.getBoundingClientRect().width||0,saveWidth=saveButton?.getBoundingClientRect().width||0,data={auditError,memberCount:cards.length,printButtonPresent:Boolean(printButton),printIsPrimary:Boolean(actions?.firstElementChild===printButton),saveIsSecondary:Boolean(saveButton?.classList.contains("party-member-save")&&!saveButton?.classList.contains("party-forge-button")),actionsAboveCards,printCalled,printCalledSynchronously,stagedNameCount,stagedPageCount,partyBoundaryCount,printRootActive,printRootCleaned:rootCleaned,titleRestored:document.title===originalTitle,horizontalOverflow:Math.max(0,Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-document.documentElement.clientWidth),mobileActionsStacked:innerWidth>720||Boolean(rootStyle&&saveStyle&&rootWidth>300&&saveWidth>300&&rootStyle.display!=="none"&&saveStyle.display!=="none")};const result=document.createElement("pre");result.id="partyPrintAuditResult";result.textContent=JSON.stringify(data);document.body.append(result);}catch(error){auditError=error.message;emitFailure(auditError);}},1100);}catch(error){auditError=error.message;emitFailure(auditError);}},200);function emitFailure(message){const result=document.createElement("pre");result.id="partyPrintAuditResult";result.textContent=JSON.stringify({auditError:message,memberCount:0,printButtonPresent:false,printIsPrimary:false,saveIsSecondary:false,actionsAboveCards:false,printCalled:false,printCalledSynchronously:false,stagedNameCount:0,stagedPageCount:0,partyBoundaryCount:0,printRootActive:false,printRootCleaned:false,titleRestored:false,horizontalOverflow:999,mobileActionsStacked:false});document.body.append(result);}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();})();<\/script>`;}
function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}
