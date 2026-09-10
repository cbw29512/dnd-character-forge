import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { FORGE_BUILD } from "../src/rules/certification.js";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.party-forge-browser");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const CASES=[
  {name:"desktop-2024",width:1440,height:1100,ruleset:"2024"},
  {name:"phone-2024",width:390,height:1000,ruleset:"2024"},
  {name:"desktop-2014",width:1440,height:1100,ruleset:"2014"}
];

rmSync(OUT,{recursive:true,force:true});
mkdirSync(OUT,{recursive:true});
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditScript()}</body>`);
const server=createServer((req,res)=>{
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    if(url.pathname==="/__party-audit.html"){
      res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});
      res.end(fixture);
      return;
    }
    const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative);
    if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){
      res.writeHead(403);res.end("Forbidden");return;
    }
    const body=readFileSync(target);
    res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});
    res.end(body);
  }catch(error){
    console.error("[party-forge-browser] fixture server failed",error);
    res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});
    res.end(`Not found: ${error.message}`);
  }
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{
  for(const item of CASES)await verify(item,port);
  console.log(`[party-forge-browser] verified ${CASES.length} Party Forge browser cases`);
}finally{
  await new Promise(resolve=>server.close(resolve));
}

async function verify(item,port){
  try{
    const url=`http://127.0.0.1:${port}/__party-audit.html?ruleset=${item.ruleset}`;
    const common=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars",`--window-size=${item.width},${item.height}`,"--virtual-time-budget=7000"];
    const dom=await dumpAuditDom(item,url,common);
    const match=dom.match(/<pre id="partyAuditResult"[^>]*>([^<]+)<\/pre>/);
    assert.ok(match,`${item.name}: Party Forge audit marker was not produced`);
    const audit=JSON.parse(decodeHtml(match[1]));
    assert.equal(audit.stage,"complete",`${item.name}: Party Forge audit stopped at ${audit.stage||"unknown"}: ${audit.auditError||"no diagnostic"}`);
    assert.equal(audit.auditError,"",`${item.name}: runtime failed: ${audit.auditError}`);
    assert.equal(audit.togglePresent,true,`${item.name}: Forge a Party control is missing`);
    assert.equal(audit.panelVisible,true,`${item.name}: Party Forge panel did not open`);
    assert.equal(audit.rosterPresent,true,`${item.name}: party roster did not render`);
    assert.equal(audit.memberCount,4,`${item.name}: expected four party members`);
    assert.equal(audit.validatedProof,true,`${item.name}: roster did not report four Rules Lawyer Certified members`);
    assert.ok(audit.proofText.includes(FORGE_BUILD.id),`${item.name}: roster certification proof did not use current build ${FORGE_BUILD.id}`);
    assert.equal(audit.ruleset,item.ruleset,`${item.name}: Party Forge crossed rules editions`);
    assert.ok(audit.horizontalOverflow<=1,`${item.name}: Party Forge caused ${audit.horizontalOverflow}px horizontal overflow`);
    if(item.width<=390){
      assert.ok(audit.rosterTop>=-2&&audit.rosterTop<item.height*.65,`${item.name}: generated roster starts too far below the visible viewport (${audit.rosterTop}px)`);
      assert.ok(audit.rosterTop<audit.panelTop,`${item.name}: generated party must appear before the editor on phones (${audit.rosterTop}px !< ${audit.panelTop}px)`);
    }
    const png=path.join(OUT,`${item.name}.png`);
    await execFileAsync(CHROME,[...common,`--screenshot=${png}`,url],{encoding:"utf8",timeout:35000,maxBuffer:4*1024*1024});
    console.log(`[party-forge-browser] ${item.name}: ${audit.memberCount} members · ${FORGE_BUILD.id} · overflow ${audit.horizontalOverflow}px · roster y=${audit.rosterTop}px · editor y=${audit.panelTop}px`);
  }catch(error){
    console.error(`[party-forge-browser] ${item.name}: verification failed`,error);
    throw error;
  }
}

async function dumpAuditDom(item,url,common){
  let lastDom="",lastStderr="";
  for(let attempt=1;attempt<=2;attempt+=1){
    try{
      const result=await execFileAsync(CHROME,[...common,"--dump-dom",url],{encoding:"utf8",timeout:35000,maxBuffer:8*1024*1024});
      lastDom=result.stdout||"";
      lastStderr=result.stderr||"";
      const marker=lastDom.match(/<pre id="partyAuditResult"[^>]*>([^<]+)<\/pre>/);
      if(marker){
        const audit=JSON.parse(decodeHtml(marker[1]));
        if(audit.stage==="complete"||audit.stage==="error")return lastDom;
        console.warn(`[party-forge-browser] ${item.name}: Chrome dump ${attempt}/2 stopped at audit stage ${audit.stage||"unknown"}; retrying`);
      }else{
        console.warn(`[party-forge-browser] ${item.name}: audit marker missing on Chrome dump ${attempt}/2; retrying`);
      }
    }catch(error){
      console.error(`[party-forge-browser] ${item.name}: Chrome dump ${attempt}/2 failed`,error);
      if(attempt===2)throw error;
    }
  }
  const tail=lastDom.slice(-1200).replace(/\s+/g," ").trim(),stderr=lastStderr.slice(-800).replace(/\s+/g," ").trim();
  throw new Error(`${item.name}: Party Forge audit did not reach a terminal stage after 2 Chrome attempts.${tail?` DOM tail: ${tail}`:""}${stderr?` Chrome stderr: ${stderr}`:""}`);
}

function auditScript(){
  return `<script>(()=>{
    const state={stage:"boot",auditError:"",togglePresent:false,panelVisible:false,rosterPresent:false,memberCount:0,validatedProof:false,proofText:"",ruleset:"",horizontalOverflow:999,scrollY:0,rosterTop:9999,panelTop:9999};
    let result=null;
    const publish=patch=>{
      try{
        Object.assign(state,patch||{});
        if(!result){result=document.createElement("pre");result.id="partyAuditResult";result.hidden=true;}
        result.textContent=JSON.stringify(state);
        if(!result.isConnected)(document.body||document.documentElement).append(result);
      }catch(error){console.error("[party-audit] publish failed",error);}
    };
    const failure=error=>{const message=error?.message||String(error||"audit failure");publish({stage:"error",auditError:message});};
    window.addEventListener("error",event=>failure(event?.error||new Error(event?.message||"window error")));
    window.addEventListener("unhandledrejection",event=>failure(event?.reason||new Error("unhandled rejection")));
    publish({stage:"waiting-dom"});
    const waitFor=(label,probe,limit=3000)=>new Promise((resolve,reject)=>{
      const started=Date.now();
      const check=()=>{
        try{
          const value=probe();
          if(value){resolve(value);return;}
          if(Date.now()-started>=limit){reject(new Error(label+" was not ready within "+limit+"ms"));return;}
          setTimeout(check,50);
        }catch(error){reject(error);}
      };
      check();
    });
    const run=async()=>{
      try{
        publish({stage:"waiting-ui"});
        const rules=await waitFor("ruleset control",()=>document.getElementById("ruleset"));
        const toggle=await waitFor("Party Forge toggle",()=>document.getElementById("partyForgeToggle"));
        const panel=await waitFor("Party Forge panel",()=>document.getElementById("partyForgePanel"));
        const button=await waitFor("Party Forge action",()=>document.getElementById("forgePartyButton"));
        const params=new URLSearchParams(location.search),ruleset=params.get("ruleset")||"2024";
        rules.value=ruleset;
        rules.dispatchEvent(new Event("change",{bubbles:true}));
        if(panel.hidden)toggle.click();
        publish({stage:"configuring",togglePresent:true,panelVisible:!panel.hidden,ruleset});
        const size=document.getElementById("partySize"),level=document.getElementById("partyLevel"),composition=document.getElementById("partyComposition");
        if(!size||!level||!composition)throw new Error("Party Forge controls are incomplete");
        size.value="4";level.value="5";composition.value="balanced";
        button.click();
        publish({stage:"waiting-roster"});
        const roster=await waitFor("four-member Party Forge roster",()=>document.querySelectorAll(".party-member-card").length===4?document.querySelector(".party-roster"):null,4000);
        await new Promise(resolve=>requestAnimationFrame(()=>resolve()));
        const root=document.documentElement,body=document.body,proof=document.querySelector(".party-roster-proof"),proofText=proof?.textContent||"",currentPanel=document.getElementById("partyForgePanel");
        publish({stage:"complete",auditError:"",togglePresent:Boolean(toggle),panelVisible:Boolean(currentPanel&&!currentPanel.hidden),rosterPresent:Boolean(roster),memberCount:document.querySelectorAll(".party-member-card").length,validatedProof:Boolean(proof&&/4\\/4 RULES LAWYER CERTIFIED/.test(proofText)),proofText,ruleset:document.getElementById("ruleset")?.value||"",horizontalOverflow:Math.max(0,Math.max(root.scrollWidth,body.scrollWidth)-root.clientWidth),scrollY:Math.round(window.scrollY),rosterTop:Math.round(roster.getBoundingClientRect().top*100)/100,panelTop:currentPanel?Math.round(currentPanel.closest('.forge-panel').getBoundingClientRect().top*100)/100:9999});
      }catch(error){failure(error);}
    };
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
  })();<\/script>`;
}

function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){
  const ext=path.extname(file).toLowerCase();
  return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";
}
