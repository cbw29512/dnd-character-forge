import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const SHARE_URL="https://cbw29512.github.io/dnd-character-forge/share/";
const ROOT_URL="https://cbw29512.github.io/dnd-character-forge/";
const SHARE_IMAGE=`${ROOT_URL}assets/icon-512.png?share=20260901`;
const html=fs.readFileSync("share/index.html","utf8");
const redirect=fs.readFileSync("src/share-redirect.js","utf8");

function meta(name,attribute="name"){
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const re=new RegExp(`<meta\\s+[^>]*${attribute}="${escaped}"[^>]*content="([^"]+)"[^>]*>`,`i`);
  const match=html.match(re);
  assert.ok(match,`missing ${attribute}=${name}`);
  return match[1];
}

test("dedicated share route exposes a fresh Discord/Open Graph cache key",()=>{
  assert.equal(meta("robots"),"noindex,follow");
  assert.equal(meta("og:url","property"),SHARE_URL);
  assert.equal(meta("og:image","property"),SHARE_IMAGE);
  assert.equal(meta("og:image:type","property"),"image/png");
  assert.equal(meta("og:image:width","property"),"512");
  assert.equal(meta("og:image:height","property"),"512");
  assert.equal(meta("twitter:card"),"summary");
  assert.equal(meta("twitter:image"),SHARE_IMAGE);
  assert.match(html,new RegExp(`<link\\s+rel="canonical"\\s+href="${ROOT_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}"`));
});

test("share route redirects humans without making crawlers follow the stale root embed",()=>{
  assert.doesNotMatch(html,/http-equiv="refresh"/i);
  assert.match(html,/<script\s+src="\.\.\/src\/share-redirect\.js"><\/script>/i);
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.match(redirect,/window\.location\.replace/);
  assert.match(redirect,/new URL\("\.\.\/", window\.location\.href\)/);
});
