import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {spawnSync} from "node:child_process";

const NETLIFY_URL="https://character-forge-test.netlify.app/";
const LEGACY_URL="https://cbw29512.github.io/dnd-character-forge/";

function read(path){return fs.readFileSync(path,"utf8");}

test("Netlify configuration publishes only generated static output",()=>{
  const config=read("netlify.toml");
  assert.match(config,/command\s*=\s*"node scripts\/netlify-build\.mjs"/);
  assert.match(config,/publish\s*=\s*"_site"/);
  assert.match(config,/NODE_VERSION\s*=\s*"22"/);
  assert.match(config,/from\s*=\s*"\/share"/);
  assert.match(config,/to\s*=\s*"\/share\/"/);
  assert.match(config,/from\s*=\s*"\/privacy"/);
});

test("Netlify build rewrites production host without mutating source files",()=>{
  fs.rmSync("_site",{recursive:true,force:true});
  const result=spawnSync(process.execPath,["scripts/netlify-build.mjs"],{
    cwd:process.cwd(),
    env:{...process.env,SITE_URL:NETLIFY_URL,COMMIT_REF:"deadbeef",BRANCH:"main"},
    encoding:"utf8"
  });
  try{
    assert.equal(result.status,0,result.stderr||result.stdout);
    const builtIndex=read("_site/index.html");
    const builtShare=read("_site/share/index.html");
    const builtRobots=read("_site/robots.txt");
    const builtSitemap=read("_site/sitemap.xml");
    const built404=read("_site/404.html");
    const sourceIndex=read("index.html");
    const source404=read("404.html");

    assert.doesNotMatch(builtIndex,new RegExp(LEGACY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
    assert.match(builtIndex,new RegExp(NETLIFY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
    assert.match(builtShare,new RegExp(NETLIFY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
    assert.match(builtRobots,/Sitemap: https:\/\/character-forge-test\.netlify\.app\/sitemap\.xml/);
    assert.match(builtSitemap,/<loc>https:\/\/character-forge-test\.netlify\.app\/<\/loc>/);
    assert.match(built404,/href="https:\/\/character-forge-test\.netlify\.app\/"/);
    assert.match(sourceIndex,new RegExp(LEGACY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),"source must remain valid for GitHub Pages during cutover");
    assert.match(source404,new RegExp(LEGACY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),"source 404 must remain valid during Pages fallback");

    const buildInfo=JSON.parse(read("_site/build-info.json"));
    assert.equal(buildInfo.commit,"deadbeef");
    assert.equal(buildInfo.branch,"main");
    assert.equal(buildInfo.siteUrl,NETLIFY_URL);
    assert.ok(fs.existsSync("_site/_headers"));
  }finally{
    fs.rmSync("_site",{recursive:true,force:true});
  }
});

test("Netlify headers prevent stale application shells and mutable code",()=>{
  const headers=read("_headers");
  assert.match(headers,/\/index\.html[\s\S]*Cache-Control: no-cache, no-store, must-revalidate/);
  assert.match(headers,/\/build-info\.json[\s\S]*Cache-Control: no-cache, no-store, must-revalidate/);
  assert.match(headers,/\/styles\/\*[\s\S]*max-age=3600, must-revalidate/);
  assert.match(headers,/\/src\/\*[\s\S]*max-age=3600, must-revalidate/);
  assert.doesNotMatch(headers,/max-age=31536000, immutable/);
});

test("production 404 is explicit and safe",()=>{
  const page=read("404.html");
  assert.match(page,/<meta name="robots" content="noindex,nofollow">/);
  assert.match(page,/That page isn’t in the Forge\./);
  assert.match(page,/Return to Character Forge/);
  assert.match(page,new RegExp(LEGACY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
});

test("production smoke can switch from Pages to Netlify exact-SHA verification",()=>{
  const workflow=read(".github/workflows/production-smoke.yml");
  assert.match(workflow,/vars\.NETLIFY_PRODUCTION_URL/);
  assert.match(workflow,/build-info\.json/);
  assert.match(workflow,/deployed_sha/);
  assert.match(workflow,/missing-\$\{GITHUB_SHA\}/);
  assert.match(workflow,/That page isn’t in the Forge\./);
});
