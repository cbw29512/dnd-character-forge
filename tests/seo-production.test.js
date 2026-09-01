import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const CANONICAL="https://cbw29512.github.io/dnd-character-forge/";
const SOCIAL_IMAGE="assets/character-forge-social-v4.jpg";
const index=fs.readFileSync("index.html","utf8");

function meta(name,attribute="name"){
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const re=new RegExp(`<meta\\s+[^>]*${attribute}="${escaped}"[^>]*content="([^"]+)"[^>]*>`,`i`);
  const match=index.match(re);
  assert.ok(match,`missing ${attribute}=${name}`);
  return match[1];
}
function link(rel){
  const escaped=rel.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const re=new RegExp(`<link\\s+[^>]*rel="${escaped}"[^>]*href="([^"]+)"[^>]*>`,`i`);
  const match=index.match(re);
  assert.ok(match,`missing rel=${rel}`);
  return match[1];
}
function pngDimensions(path){
  const bytes=fs.readFileSync(path);
  assert.equal(bytes.subarray(1,4).toString("ascii"),"PNG",`${path} must be a PNG`);
  return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}
function jpegDimensions(path){
  const bytes=fs.readFileSync(path);
  assert.equal(bytes[0],0xff,`${path} must start with JPEG SOI`);
  assert.equal(bytes[1],0xd8,`${path} must start with JPEG SOI`);
  assert.equal(bytes.at(-2),0xff,`${path} must end with JPEG EOI`);
  assert.equal(bytes.at(-1),0xd9,`${path} must end with JPEG EOI`);
  let offset=2;
  while(offset<bytes.length-9){
    if(bytes[offset]!==0xff){offset+=1;continue;}
    const marker=bytes[offset+1];
    if(marker===0xd8||marker===0xd9){offset+=2;continue;}
    const length=bytes.readUInt16BE(offset+2);
    if(marker>=0xc0&&marker<=0xc3){return {height:bytes.readUInt16BE(offset+5),width:bytes.readUInt16BE(offset+7)};}
    offset+=2+length;
  }
  throw new Error(`${path} JPEG dimensions not found`);
}

test("production SEO metadata is complete and internally consistent",()=>{
  try{
    const title=index.match(/<title>([^<]+)<\/title>/i)?.[1];
    assert.ok(title);
    assert.ok(title.length>=30&&title.length<=60,`title length ${title.length} should be 30–60`);
    const description=meta("description");
    assert.ok(description.length>=120&&description.length<=160,`description length ${description.length} should be 120–160`);
    assert.equal(link("canonical"),CANONICAL);
    assert.match(meta("robots"),/\bindex\b/);
    assert.match(meta("robots"),/\bfollow\b/);
    assert.doesNotMatch(index,/noindex/i);

    assert.equal(meta("og:type","property"),"website");
    assert.equal(meta("og:url","property"),CANONICAL);
    assert.equal(meta("og:title","property"),title);
    assert.equal(meta("og:description","property"),description);
    assert.equal(meta("og:image","property"),`${CANONICAL}${SOCIAL_IMAGE}`);
    assert.equal(meta("og:image:type","property"),"image/jpeg");
    assert.equal(meta("og:image:width","property"),"400");
    assert.equal(meta("og:image:height","property"),"210");
    assert.equal(meta("twitter:card"),"summary_large_image");
    assert.equal(meta("twitter:title"),title);
    assert.equal(meta("twitter:description"),description);
    assert.equal(meta("twitter:image"),`${CANONICAL}${SOCIAL_IMAGE}`);
    assert.equal(link("manifest"),"site.webmanifest");
    assert.equal(link("icon"),"assets/favicon.svg");
  }catch(error){console.error("[test] production SEO metadata",error);throw error;}
});

test("production shell keeps essential RAW trust copy without duplicate SEO surfaces",()=>{
  try{
    assert.equal((index.match(/<h1\b/gi)||[]).length,1,"page should expose exactly one H1");
    assert.match(index,/complete[s]? a legal 2014 or 2024 SRD character/i);
    assert.match(index,/12 classes · levels 1–20 · supported SRD content/i);
    assert.match(index,/RAW accuracy-first/i);
    assert.doesNotMatch(index,/id="structured-data"/i);
    assert.doesNotMatch(index,/"@type"\s*:\s*"FAQPage"/i);
    assert.doesNotMatch(index,/class="seo-about"/i);
  }catch(error){console.error("[test] lean RAW trust surface",error);throw error;}
});

test("CSP protects the static application without obsolete inline-script allowances",()=>{
  try{
    const policy=meta("Content-Security-Policy","http-equiv");
    assert.match(policy,/script-src 'self'(?:;|$)/);
    assert.doesNotMatch(policy,/unsafe-inline|unsafe-eval|sha256-/);
    assert.match(policy,/object-src 'none'/);
    assert.match(policy,/base-uri 'self'/);

    const headers=fs.readFileSync("_headers","utf8");
    assert.match(headers,/X-Content-Type-Options: nosniff/);
    assert.match(headers,/X-Frame-Options: DENY/);
    assert.match(headers,/Permissions-Policy:/);
    assert.match(headers,/script-src 'self'(?:;|$)/);
    assert.doesNotMatch(headers,/unsafe-inline|unsafe-eval|sha256-/);
  }catch(error){console.error("[test] CSP contract",error);throw error;}
});

test("crawl discovery files point at the canonical production URL",()=>{
  try{
    const robots=fs.readFileSync("robots.txt","utf8");
    assert.match(robots,/User-agent: \*/);
    assert.match(robots,/Allow: \//);
    assert.match(robots,new RegExp(`Sitemap: ${CANONICAL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}sitemap\\.xml`));

    const sitemap=fs.readFileSync("sitemap.xml","utf8");
    assert.match(sitemap,/http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9/);
    assert.match(sitemap,new RegExp(`<loc>${CANONICAL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}<\\/loc>`));

    const manifest=JSON.parse(fs.readFileSync("site.webmanifest","utf8"));
    assert.equal(manifest.start_url,"./");
    assert.equal(manifest.scope,"./");
    assert.equal(manifest.display,"standalone");
    assert.equal(manifest.icons.length,2);
  }catch(error){console.error("[test] crawl discovery contract",error);throw error;}
});

test("social and install icons have production dimensions",()=>{
  try{
    assert.ok(fs.existsSync(SOCIAL_IMAGE),"social image must exist as a public asset");
    assert.deepEqual(jpegDimensions(SOCIAL_IMAGE),{width:400,height:210});
    assert.deepEqual(pngDimensions("assets/icon-192.png"),{width:192,height:192});
    assert.deepEqual(pngDimensions("assets/icon-512.png"),{width:512,height:512});
    assert.ok(fs.statSync("assets/favicon.svg").size>200);
  }catch(error){console.error("[test] production icon contract",error);throw error;}
});

test("homepage trust copy reflects the verified class engine without a class-name wall",()=>{
  try{
    assert.match(index,/12 classes · levels 1–20 · supported SRD content/i);
    assert.match(index,/verified SRD classes, species, backgrounds, subclasses, and rules implemented for each edition/i);
    assert.match(index,/Unsupported content stays unavailable rather than being guessed\./i);
    assert.doesNotMatch(index,/Warlock stays unavailable/i);
    assert.doesNotMatch(index,/Fix Divine Order or Blessed Strikes only when you care/);
  }catch(error){console.error("[test] homepage trust copy",error);throw error;}
});