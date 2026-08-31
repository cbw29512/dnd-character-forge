import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import test from "node:test";

const signature=Buffer.from([137,80,78,71,13,10,26,10]);

function inspectPng(path,expectedWidth,expectedHeight){
  const data=readFileSync(new URL(`../${path}`,import.meta.url));
  assert.deepEqual(data.subarray(0,8),signature,`${path} must have a PNG signature`);

  let offset=8;
  let width=0;
  let height=0;
  let bitDepth=0;
  let colorType=-1;
  let sawIend=false;
  const idat=[];

  while(offset+12<=data.length){
    const length=data.readUInt32BE(offset);
    const type=data.toString("ascii",offset+4,offset+8);
    const start=offset+8;
    const end=start+length;
    assert.ok(end+4<=data.length,`${path} has a truncated ${type} chunk`);

    if(type==="IHDR"){
      width=data.readUInt32BE(start);
      height=data.readUInt32BE(start+4);
      bitDepth=data[start+8];
      colorType=data[start+9];
    }else if(type==="IDAT"){
      idat.push(data.subarray(start,end));
    }else if(type==="IEND"){
      sawIend=true;
      break;
    }
    offset=end+4;
  }

  assert.equal(width,expectedWidth,`${path} width`);
  assert.equal(height,expectedHeight,`${path} height`);
  assert.equal(bitDepth,8,`${path} bit depth`);
  assert.ok(sawIend,`${path} must include IEND`);
  assert.ok(idat.length>0,`${path} must include IDAT data`);

  const channels={0:1,2:3,3:1,4:2,6:4}[colorType];
  assert.ok(channels,`${path} uses unsupported color type ${colorType}`);
  const inflated=inflateSync(Buffer.concat(idat));
  const scanlineBytes=Math.ceil(expectedWidth*channels*bitDepth/8);
  assert.equal(inflated.length,expectedHeight*(scanlineBytes+1),`${path} pixel stream must fully decode`);
}

test("public install PNG assets fully decode at their advertised dimensions",()=>{
  inspectPng("assets/icon-192.png",192,192);
  inspectPng("assets/icon-512.png",512,512);
});

test("obsolete social PNG fallbacks are removed",()=>{
  assert.equal(existsSync(new URL("../assets/character-forge-social.png",import.meta.url)),false);
  assert.equal(existsSync(new URL("../assets/character-forge-social-v2.png",import.meta.url)),false);
});

test("social metadata uses the cache-busted Discord-safe preview",()=>{
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/property="og:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/character-forge-social-v3\.jpg"/);
  assert.match(html,/property="og:image:type" content="image\/jpeg"/);
  assert.match(html,/name="twitter:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/character-forge-social-v3\.jpg"/);
});
