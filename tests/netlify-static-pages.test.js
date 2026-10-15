import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";

const NETLIFY_URL="https://character-forge-test.netlify.app/";
const LEGACY_URL="https://cbw29512.github.io/dnd-character-forge/";
const read=(path)=>fs.readFileSync(path,"utf8");

test("Netlify publishes and canonicalizes guide, FAQ, privacy, and shared static CSS",()=>{
  const output=fs.mkdtempSync(path.join(os.tmpdir(),"forge-build-contract-"));
  const result=spawnSync(process.execPath,["scripts/netlify-build.mjs"],{
    cwd:process.cwd(),
    env:{...process.env,CHARACTER_FORGE_BUILD_OUTPUT:output,SITE_URL:NETLIFY_URL,COMMIT_REF:"static-pages-test",BRANCH:"test"},
    encoding:"utf8"
  });
  try{
    assert.equal(result.status,0,result.stderr||result.stdout);
    for(const relative of ["guide.html","faq.html","privacy.html"]){
      assert.ok(fs.existsSync(path.join(output,relative)),`${relative} must be published`);
      const built=read(path.join(output,relative));
      assert.match(built,new RegExp(NETLIFY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
      assert.doesNotMatch(built,new RegExp(LEGACY_URL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));
    }
    assert.ok(fs.existsSync(path.join(output,"styles/static-pages.css")));
    const sitemap=read(path.join(output,"sitemap.xml"));
    assert.match(sitemap,/https:\/\/character-forge-test\.netlify\.app\/guide\.html/);
    assert.match(sitemap,/https:\/\/character-forge-test\.netlify\.app\/faq\.html/);
    assert.match(sitemap,/https:\/\/character-forge-test\.netlify\.app\/privacy\.html/);
    const notFound=read(path.join(output,"404.html"));
    assert.match(notFound,/https:\/\/character-forge-test\.netlify\.app\/faq\.html/);
  }finally{
    fs.rmSync(output,{recursive:true,force:true});
  }
});
