import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync=promisify(execFile);
const ROOT=fileURLToPath(new URL("../",import.meta.url));
const OUT=path.join(ROOT,"tests/.party-forge-browser");
const SOURCE=path.join(ROOT,"assets/character-forge-social-v4.jpg");
const TARGET=path.join(OUT,"approved-banner-upscale.png");
const CHROME=process.env.CHROME_BIN||"google-chrome";

const html="<!doctype html><html><head><meta charset=\"utf-8\"><style>html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#000}img{display:block;width:1200px;height:630px}</style></head><body><img src=\"/banner.jpg\" alt=\"\"></body></html>";
const server=createServer((req,res)=>{
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    if(url.pathname==="/banner.jpg"){
      res.writeHead(200,{"content-type":"image/jpeg","cache-control":"no-store"});
      res.end(readFileSync(SOURCE));
      return;
    }
    res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});
    res.end(html);
  }catch(error){
    console.error("[banner-upscale] server failure",error);
    res.writeHead(500,{"content-type":"text/plain; charset=utf-8"});
    res.end(error.message);
  }
});

await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const {port}=server.address();
try{
  await execFileAsync(CHROME,["--headless","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--hide-scrollbars","--window-size=1200,630","--virtual-time-budget=2500",`--screenshot=${TARGET}`,`http://127.0.0.1:${port}/`],{encoding:"utf8",timeout:35000,maxBuffer:4*1024*1024});
  assert.ok(existsSync(TARGET),"upscaled banner screenshot was not created");
  const png=readFileSync(TARGET);
  assert.deepEqual([...png.subarray(0,8)],[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a],"upscaled banner artifact must be a PNG");
  assert.equal(png.readUInt32BE(16),1200,"upscaled banner width must be 1200");
  assert.equal(png.readUInt32BE(20),630,"upscaled banner height must be 630");
  console.log(`[banner-upscale] captured approved banner at 1200x630 -> ${TARGET}`);
}catch(error){
  console.error("[banner-upscale] capture failed",error);
  throw error;
}finally{
  await new Promise(resolve=>server.close(resolve));
}
