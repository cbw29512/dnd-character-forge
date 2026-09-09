import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {spawnSync} from "node:child_process";

const NETLIFY_URL="https://character-forge-test.netlify.app/";
const LEGACY_URL="https://cbw29512.github.io/dnd-character-forge/";
const read=(path)=>fs.readFileSync(path,"utf8");

test("Netlify publishes and canonicalizes guide, FAQ, privacy, and shared static CSS",()=>{
  fs.rmSync("_site",{recursive:true,force:true});
  const result=spawnSync(process.execPath,["scripts/netlify-build.mjs"],{
    cwd:process.cwd(),
    env:{...process.env,SITE_URL:NETLIFY_URL,COMMIT_REF:"static-pages-test",BRANCH:"test"},
    encoding:"utf8"
  });
  try{
    assert.equal(result.status,0,result.stderr||result.stdout);
    for(const relative of ["guide.html","faq.html","privacy.html"]){
      assert.ok(fs.existsSync(`_site/${relative}`),`${relative} must be published`);
      const built=read(`_site/${relative}`);
      assert.match(built,new RegExp(NETLIFY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
      assert.doesNotMatch(built,new RegExp(LEGACY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
    }
    assert.ok(fs.existsSync("_site/styles/static-pages.css"));
    const sitemap=read("_site/sitemap.xml");
    assert.match(sitemap,/https:\/\/character-forge-test\.netlify\.app\/guide\.html/);
    assert.match(sitemap,/https:\/\/character-forge-test\.netlify\.app\/faq\.html/);
    assert.match(sitemap,/https:\/\/character-forge-test\.netlify\.app\/privacy\.html/);
    const notFound=read("_site/404.html");
    assert.match(notFound,/https:\/\/character-forge-test\.netlify\.app\/faq\.html/);
  }finally{
    fs.rmSync("_site",{recursive:true,force:true});
  }
});
