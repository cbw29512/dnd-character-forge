import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const SOCIAL_IMAGE="assets/character-forge-social-v4.jpg";

function readUint16BE(bytes,offset){
  return (bytes[offset]<<8)|bytes[offset+1];
}

function jpegDimensions(bytes){
  assert.equal(bytes[0],0xff,"JPEG must start with SOI marker");
  assert.equal(bytes[1],0xd8,"JPEG must start with SOI marker");
  assert.equal(bytes[bytes.length-2],0xff,"JPEG must end with EOI marker");
  assert.equal(bytes[bytes.length-1],0xd9,"JPEG must end with EOI marker");
  let offset=2;
  while(offset<bytes.length-9){
    if(bytes[offset]!==0xff){offset+=1;continue;}
    const marker=bytes[offset+1];
    if(marker===0xd8||marker===0xd9){offset+=2;continue;}
    const length=readUint16BE(bytes,offset+2);
    if(marker>=0xc0&&marker<=0xc3){
      return {height:readUint16BE(bytes,offset+5),width:readUint16BE(bytes,offset+7)};
    }
    offset+=2+length;
  }
  throw new Error("JPEG dimensions not found");
}

test("Discord social preview uses the approved Character Forge banner",()=>{
  const image=readFileSync(new URL(`../${SOCIAL_IMAGE}`,import.meta.url));
  assert.ok(image.length>10000,"social preview banner should be a real rendered JPEG");
  assert.deepEqual(jpegDimensions(image),{width:400,height:210});
});

test("broken legacy social previews stay out of production",()=>{
  assert.equal(existsSync(new URL("../assets/character-forge-social.png",import.meta.url)),false);
  assert.equal(existsSync(new URL("../assets/character-forge-social-v2.png",import.meta.url)),false);
});

test("social metadata uses the cache-busted Discord banner",()=>{
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/property="og:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/character-forge-social-v4\.jpg"/);
  assert.match(html,/property="og:image:type" content="image\/jpeg"/);
  assert.match(html,/property="og:image:width" content="400"/);
  assert.match(html,/property="og:image:height" content="210"/);
  assert.match(html,/name="twitter:card" content="summary_large_image"/);
  assert.match(html,/name="twitter:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/character-forge-social-v4\.jpg"/);
});
