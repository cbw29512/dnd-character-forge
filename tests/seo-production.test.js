import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const CANONICAL="https://cbw29512.github.io/dnd-character-forge/";
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

test("production SEO metadata is complete and internally consistent",()=>{
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
  assert.equal(meta("og:image","property"),`${CANONICAL}assets/character-forge-social.png`);
  assert.equal(meta("og:image:width","property"),"1200");
  assert.equal(meta("og:image:height","property"),"630");
  assert.equal(meta("twitter:card"),"summary_large_image");
  assert.equal(meta("twitter:title"),title);
  assert.equal(meta("twitter:description"),description);
  assert.equal(meta("twitter:image"),`${CANONICAL}assets/character-forge-social.png`);
  assert.equal(link("manifest"),"site.webmanifest");
  assert.equal(link("icon"),"assets/favicon.svg");
});

test("structured data matches visible product and FAQ copy",()=>{
  const match=index.match(/<script type="application\/ld\+json" id="structured-data">([\s\S]*?)<\/script>/i);
  assert.ok(match,"missing JSON-LD");
  const data=JSON.parse(match[1]);
  assert.equal(data["@context"],"https://schema.org");
  const graph=data["@graph"];
  assert.ok(Array.isArray(graph));
  const app=graph.find(item=>item["@type"]==="WebApplication");
  const faq=graph.find(item=>item["@type"]==="FAQPage");
  assert.ok(app&&faq);
  assert.equal(app.url,CANONICAL);
  assert.equal(app.isAccessibleForFree,true);
  assert.equal(app.offers?.price,"0");
  assert.match(app.featureList.join(" "),/2014 and 2024/);
  assert.equal(faq.mainEntity.length,4);
  for(const item of faq.mainEntity){
    assert.match(index,new RegExp(item.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replaceAll("&","&amp;"),"i"));
    assert.ok(item.acceptedAnswer?.text?.length>40);
  }
  assert.equal((index.match(/<h1\b/gi)||[]).length,1,"page should expose exactly one H1");
  assert.match(index,/free D&amp;D 5e pregenerated character generator for 2014 and 2024 SRD rules/i);
});

test("CSP protects the static application without unsafe script execution",()=>{
  const match=index.match(/<script type="application\/ld\+json" id="structured-data">([\s\S]*?)<\/script>/i);
  assert.ok(match);
  const hash=crypto.createHash("sha256").update(match[1],"utf8").digest("base64");
  const policy=meta("Content-Security-Policy","http-equiv");
  assert.match(policy,new RegExp(`script-src 'self' 'sha256-${hash.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}'`));
  assert.doesNotMatch(policy,/unsafe-inline|unsafe-eval/);
  assert.match(policy,/object-src 'none'/);
  assert.match(policy,/base-uri 'self'/);

  const headers=fs.readFileSync("_headers","utf8");
  assert.match(headers,/X-Content-Type-Options: nosniff/);
  assert.match(headers,/X-Frame-Options: DENY/);
  assert.match(headers,/Permissions-Policy:/);
  assert.match(headers,new RegExp(`sha256-${hash.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}`));
});

test("crawl discovery files point at the canonical production URL",()=>{
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
});

test("social and install icons have production dimensions",()=>{
  assert.deepEqual(pngDimensions("assets/character-forge-social.png"),{width:1200,height:630});
  assert.deepEqual(pngDimensions("assets/icon-192.png"),{width:192,height:192});
  assert.deepEqual(pngDimensions("assets/icon-512.png"),{width:512,height:512});
  assert.ok(fs.statSync("assets/favicon.svg").size>200);
});

test("homepage trust copy reflects the verified class engine",()=>{
  assert.match(index,/twelve SRD classes in both editions/i);
  for(const name of ["Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"]){
    assert.match(index,new RegExp(`\\b${name}\\b`));
  }
  assert.doesNotMatch(index,/Warlock stays unavailable/i);
  assert.doesNotMatch(index,/Fix Divine Order or Blessed Strikes only when you care/);
});
