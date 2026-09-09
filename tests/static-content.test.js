import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const BASE="https://cbw29512.github.io/dnd-character-forge/";
const read=(path)=>fs.readFileSync(path,"utf8");

function meta(html,name,attribute="name"){
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const match=html.match(new RegExp(`<meta\\s+[^>]*${attribute}="${escaped}"[^>]*content="([^"]+)"[^>]*>`,`i`));
  assert.ok(match,`missing ${attribute}=${name}`);
  return match[1];
}

function canonical(html){
  const match=html.match(/<link\s+[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/i);
  assert.ok(match,"missing canonical link");
  return match[1];
}

test("guide and FAQ expose focused crawlable search-intent pages",()=>{
  const guide=read("guide.html");
  const faq=read("faq.html");

  assert.equal(canonical(guide),`${BASE}guide.html`);
  assert.equal(canonical(faq),`${BASE}faq.html`);
  assert.match(meta(guide,"robots"),/index/);
  assert.match(meta(faq,"robots"),/index/);
  assert.ok(meta(guide,"description").length>=120);
  assert.ok(meta(faq,"description").length>=120);
  assert.match(guide,/How to generate a pregen/i);
  assert.match(guide,/2014 · SRD 5\.1/i);
  assert.match(guide,/2024 · SRD 5\.2\.1/i);
  assert.match(faq,/levels 1–20 across all 12 supported SRD classes/i);
  assert.match(faq,/Unsupported book content is not silently invented/i);
  assert.doesNotMatch(faq,/every D&D book option[^<]*Yes/i);
});

test("CSP-protected support pages use external styling only",()=>{
  for(const path of ["privacy.html","faq.html","guide.html","404.html","share/index.html"]){
    const html=read(path);
    assert.doesNotMatch(html,/<style\b/i,`${path} must not rely on inline CSS under Netlify CSP`);
    assert.match(html,/static-pages\.css/i,`${path} must load the shared static stylesheet`);
  }
  const headers=read("_headers");
  assert.match(headers,/style-src 'self'/);
  assert.doesNotMatch(headers,/style-src[^\n]*unsafe-inline/);
});

test("static pages preserve mobile readability and touch targets",()=>{
  const css=read("styles/static-pages.css");
  assert.match(css,/\.button-link\{[^}]*min-height:44px/s);
  assert.match(css,/@media \(max-width:700px\)/);
  assert.match(css,/\.step-grid,\.faq-grid\{grid-template-columns:1fr\}/);
  assert.match(css,/\.skip-link:focus\{transform:translateY\(0\)\}/);
});

test("sitemap contains every intentional indexable static page",()=>{
  const sitemap=read("sitemap.xml");
  for(const url of [BASE,`${BASE}guide.html`,`${BASE}faq.html`,`${BASE}privacy.html`]){
    assert.match(sitemap,new RegExp(`<loc>${url.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}<\\/loc>`));
  }
  assert.doesNotMatch(sitemap,/share\//);
  assert.doesNotMatch(sitemap,/404\.html/);
});

test("privacy page has canonical discovery metadata without changing its storage claims",()=>{
  const privacy=read("privacy.html");
  assert.equal(canonical(privacy),`${BASE}privacy.html`);
  assert.ok(meta(privacy,"description").length>=120);
  assert.match(privacy,/stored in your browser's local storage/i);
  assert.match(privacy,/does not include an analytics or telemetry client/i);
});
