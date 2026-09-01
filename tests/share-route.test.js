import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const SHARE_URL="https://cbw29512.github.io/dnd-character-forge/share/";
const ROOT_URL="https://cbw29512.github.io/dnd-character-forge/";
const SOCIAL_ASSET="assets/character-forge-social-v4.jpg";
const SHARE_IMAGE=`${ROOT_URL}${SOCIAL_ASSET}`;
const html=fs.readFileSync("share/index.html","utf8");
const redirect=fs.readFileSync("src/share-redirect.js","utf8");

function meta(name,attribute="name"){
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const re=new RegExp(`<meta\\s+[^>]*${attribute}="${escaped}"[^>]*content="([^"]+)"[^>]*>`,`i`);
  const match=html.match(re);
  assert.ok(match,`missing ${attribute}=${name}`);
  return match[1];
}

test("dedicated share route exposes source-accurate premium social metadata",()=>{
  assert.equal(meta("robots"),"noindex,follow");
  assert.equal(meta("og:url","property"),SHARE_URL);
  assert.equal(meta("og:image","property"),SHARE_IMAGE);
  assert.equal(meta("og:image:type","property"),"image/jpeg");
  assert.equal(meta("og:image:width","property"),"1200");
  assert.equal(meta("og:image:height","property"),"630");
  assert.equal(meta("twitter:card"),"summary_large_image");
  assert.equal(meta("twitter:image"),SHARE_IMAGE);
  assert.match(meta("description"),/rules-validated D&D 5e characters/i);
  assert.match(meta("description"),/Forge Original options/i);
  assert.doesNotMatch(html,/RAW audits/i);
  assert.doesNotMatch(html,/RAW 2014 & 2024/i);
  assert.match(html,new RegExp(`<link\\s+rel="canonical"\\s+href="${ROOT_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}"`));
});

test("share route uses the production-certified premium social image",()=>{
  assert.ok(fs.existsSync(SOCIAL_ASSET),"Premium social image must exist");
  const bytes=fs.readFileSync(SOCIAL_ASSET);
  assert.equal(bytes[0],0xff,"social image must start with JPEG SOI");
  assert.equal(bytes[1],0xd8,"social image must start with JPEG SOI");
  assert.equal(bytes.at(-2),0xff,"social image must end with JPEG EOI");
  assert.equal(bytes.at(-1),0xd9,"social image must end with JPEG EOI");
});

test("share route redirects humans without making crawlers follow the stale root embed",()=>{
  assert.doesNotMatch(html,/http-equiv="refresh"/i);
  assert.match(html,/<script\s+src="\.\.\/src\/share-redirect\.js"><\/script>/i);
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.match(redirect,/window\.location\.replace/);
  assert.match(redirect,/new URL\("\.\.\/", window\.location\.href\)/);
});
