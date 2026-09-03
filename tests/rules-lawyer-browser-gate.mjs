import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.rules-lawyer-browser");
const CHROME=process.env.CHROME_BIN||"google-chrome";
const BUILD="CF-2026.09.03-RLC2";
const CASES=[
  {name:"desktop-2024",width:1440,height:1100,ruleset:"2024"},
  {name:"phone-2024",width:390,height:1000,ruleset:"2024"},
  {name:"desktop-2014",width:1440,height:1100,ruleset:"2014"}
];

rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
const source=readFileSync(path.join(ROOT,"index.html"),"utf8");
const fixture=source.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/i,"").replace("</body>",`${auditModule()}</body>`);
const server=createServer((req,res)=>{try{const url=new URL(req.url,"http://127.0.0.1");if(url.pathname==="/__rules-lawyer-audit.html"){res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});res.end(fixture);return;}const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html",target=path.resolve(ROOT,relative);if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){res.writeHead(403);res.end("Forbidden");return;}const body=readFileSync(target);res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});res.end(body);}catch(error){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end(`Not found: ${error.message}`);}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{for(const item of CASES)await verify(item,port);console.log(`[rules-lawyer-browser] verified ${CASES.length} certification cases`);}finally{await new Promise(resolve=>server.close(resolve));}

async function verify(item,port){
  const url=`http://127.0.0.1:${port}/__rules-lawyer-audit.html?ruleset=${item.ruleset}`;
  const common=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars",`--window-size=${item.width},${item.height}`,"--virtual-time-budget=7500"];
  const {stdout:dom}=await execFileAsync(CHROME,[...common,"--dump-dom",url],{encoding:"utf8",timeout:40000,maxBuffer:10*1024*1024});
  const match=dom.match(/<pre id="rulesLawyerAuditResult">([^<]+)<\/pre>/);assert.ok(match,`${item.name}: certification audit result was not produced`);
  const audit=JSON.parse(decodeHtml(match[1]));
  assert.equal(audit.error,"",`${item.name}: runtime failed: ${audit.error}`);
  assert.equal(audit.ruleset,item.ruleset,`${item.name}: generated the wrong rules edition`);
  assert.equal(audit.validationValid,true,`${item.name}: generated character was not validated`);
  assert.equal(audit.auditPass,true,`${item.name}: Rules Audit did not pass`);
  assert.equal(audit.rawIntegrity,true,`${item.name}: RAW integrity did not pass`);
  assert.equal(audit.sealPresent,true,`${item.name}: visible Rules Lawyer certification seal is missing`);
  assert.equal(audit.sealRaw,true,`${item.name}: visible seal was not the RAW-certified variant`);
  assert.equal(audit.sealTextValid,true,`${item.name}: visible seal is missing certification/build text`);
  assert.ok(audit.pageCount>=1,`${item.name}: premium print packet did not render a printable page`);
  assert.equal(audit.footerCount,audit.pageCount,`${item.name}: every premium page must have exactly one audit footer`);
  assert.equal(audit.certifiedFooterCount,audit.footerCount,`${item.name}: build certification is missing from at least one premium page footer`);
  assert.ok(audit.horizontalOverflow<=1,`${item.name}: certification seal caused ${audit.horizontalOverflow}px horizontal overflow`);
  const png=path.join(OUT,`${item.name}.png`);
  await execFileAsync(CHROME,[...common,`--screenshot=${png}`,url],{encoding:"utf8",timeout:40000,maxBuffer:4*1024*1024});
  console.log(`[rules-lawyer-browser] ${item.name}: ${audit.pageCount} print pages · ${audit.certifiedFooterCount} certified footers · overflow ${audit.horizontalOverflow}px`);
}

function auditModule(){return `<script type="module">
import { createInitialState } from "./src/state.js";
import { generateCharacter } from "./src/rules/generator.js";
import { renderCharacter } from "./src/ui/render.js";
import { createHeroExperience } from "./src/ui/hero-experience.js";
import { renderPremiumPrintSheet } from "./src/ui/premium-print.js";
let error="";
try{
  const params=new URLSearchParams(location.search),ruleset=params.get("ruleset")||"2024";
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level=ruleset==="2014"?"1":"5";
  state.constraints.class="fighter";
  state.constraints.species="human";
  state.constraints.background=ruleset==="2014"?"acolyte":"criminal";
  state.constraints.name="Certification Sentinel";
  const character=generateCharacter(state);
  const result=document.getElementById("result");
  createHeroExperience();
  renderCharacter(character,result);
  await new Promise(resolve=>setTimeout(resolve,250));
  const printTarget=document.createElement("div");
  printTarget.id="rulesLawyerPrintTarget";
  printTarget.style.position="absolute";
  printTarget.style.left="-20000px";
  printTarget.style.top="0";
  document.body.append(printTarget);
  renderPremiumPrintSheet(character,printTarget);
  const seal=document.querySelector(".rules-lawyer-cert"),footers=[...printTarget.querySelectorAll(".ps-audit")],pages=[...printTarget.querySelectorAll("article.premium-sheet")],root=document.documentElement,body=document.body;
  const data={error,ruleset:character.ruleset,validationValid:Boolean(character.validation?.valid),auditPass:character.audit?.status==="PASS",rawIntegrity:character.audit?.rawIntegrity===true,sealPresent:Boolean(seal),sealRaw:Boolean(seal?.classList.contains("is-raw")),sealTextValid:Boolean(seal&&/RULES LAWYER CERTIFIED/.test(seal.textContent)&&/${BUILD}/.test(seal.textContent)),pageCount:pages.length,footerCount:footers.length,certifiedFooterCount:footers.filter(footer=>/RULES LAWYER CERTIFIED/.test(footer.textContent)&&/${BUILD}/.test(footer.textContent)).length,horizontalOverflow:Math.max(0,Math.max(root.scrollWidth,body.scrollWidth)-root.clientWidth)};
  const output=document.createElement("pre");output.id="rulesLawyerAuditResult";output.textContent=JSON.stringify(data);document.body.append(output);
}catch(caught){error=caught?.message||String(caught);const output=document.createElement("pre");output.id="rulesLawyerAuditResult";output.textContent=JSON.stringify({error,ruleset:"",validationValid:false,auditPass:false,rawIntegrity:false,sealPresent:false,sealRaw:false,sealTextValid:false,pageCount:0,footerCount:0,certifiedFooterCount:0,horizontalOverflow:999});document.body.append(output);}
<\/script>`;}
function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}
