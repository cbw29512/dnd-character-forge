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
const server=createServer((req,res)=>{
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    if(url.pathname==="/__mobile-action-audit.html"){
      res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});
      res.end(fixture);
      return;
    }
    const relative=decodeURIComponent(url.pathname.replace(/^\/+/,""))||"index.html";
    const target=path.resolve(ROOT,relative);
    if(!target.startsWith(path.resolve(ROOT)+path.sep)&&target!==path.resolve(ROOT,"index.html")){
      res.writeHead(403);res.end("Forbidden");return;
    }
    const body=readFileSync(target);
    res.writeHead(200,{"content-type":mime(target),"cache-control":"no-store"});
    res.end(body);
  }catch(error){res.writeHead(404,{"content-type":"text/plain; charset=utf-8"});res.end(`Not found: ${error.message}`);}
});

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{
  const url=`http://127.0.0.1:${port}/__mobile-action-audit.html`;
  const args=["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars","--window-size=390,844","--virtual-time-budget=5000","--dump-dom",url];
  const {stdout}=await execFileAsync(CHROME,args,{encoding:"utf8",timeout:30000,maxBuffer:8*1024*1024});
  const match=stdout.match(/<pre id="mobileActionAudit">([^<]+)<\/pre>/);
  assert.ok(match,"mobile action audit result was not produced");
  const audit=JSON.parse(decodeHtml(match[1]));
  assert.equal(audit.error,"",`mobile action audit runtime failed: ${audit.error}`);
  assert.equal(audit.initialForgeWorked,true,"phone: initial Forge did not render a character");
  assert.equal(audit.reforgeWorked,true,"phone: Reforge did not apply the updated setup");
  assert.equal(audit.reforgeFeedback,true,"phone: Reforge did not provide visible confirmation");
  assert.equal(audit.printButtonPresent,true,"phone: Print action is missing");
  assert.equal(audit.printCalledSynchronously,true,"phone: Print did not call window.print() in the original tap turn");
  assert.equal(audit.printRootCleaned,true,"phone: print staging root did not clean up after afterprint");
  console.log("[mobile-actions] phone Reforge + Print user-gesture contract verified");
}finally{
  await new Promise(resolve=>server.close(resolve));
}

function auditScript(){return `<script>(()=>{
let runtimeError="";
window.addEventListener("error",event=>{runtimeError=event?.error?.message||event?.message||"window error";});
window.addEventListener("unhandledrejection",event=>{runtimeError=event?.reason?.message||String(event?.reason||"unhandled rejection");});
const finish=data=>{const pre=document.createElement("pre");pre.id="mobileActionAudit";pre.textContent=JSON.stringify(data);document.body.append(pre);};
const run=()=>window.setTimeout(()=>{
  try{
    const forge=document.getElementById("forgeButton");
    if(!forge)throw new Error("Forge button missing");
    forge.click();
    const initialForgeWorked=Boolean(document.querySelector("#result .character-sheet"));
    const name=document.getElementById("name");
    name.value="Mobile Reforge Proof";
    name.dispatchEvent(new Event("input",{bubbles:true}));
    const reroll=document.querySelector('#result [data-action="reroll"]');
    if(!reroll)throw new Error("Reforge result action missing");
    reroll.click();
    const reforgeWorked=document.querySelector("#result .character-name")?.textContent?.trim()==="Mobile Reforge Proof";
    const reforgeFeedback=/reforged|Reforge completed/i.test(document.getElementById("toast")?.textContent||"");
    let printCalls=0;
    window.print=()=>{printCalls+=1;};
    const printButton=document.querySelector('#result [data-action="print"]');
    const printButtonPresent=Boolean(printButton);
    printButton?.click();
    const printCalledSynchronously=printCalls===1;
    window.dispatchEvent(new Event("afterprint"));
    const root=document.getElementById("premiumPrintRoot");
    const printRootCleaned=Boolean(root)&&root.innerHTML===""&&root.getAttribute("aria-hidden")==="true"&&!document.body.classList.contains("premium-print-active");
    finish({error:runtimeError,initialForgeWorked,reforgeWorked,reforgeFeedback,printButtonPresent,printCalledSynchronously,printRootCleaned});
  }catch(error){finish({error:error.message,initialForgeWorked:false,reforgeWorked:false,reforgeFeedback:false,printButtonPresent:false,printCalledSynchronously:false,printRootCleaned:false});}
},150);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
})();<\/script>`;}
function decodeHtml(value){return value.replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
function mime(file){const ext=path.extname(file).toLowerCase();return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";}
