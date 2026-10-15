import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { versionModuleImports, versionHtmlAssets, versionCssImports, versionPublicAssets } from "../scripts/version-assets.mjs";

test("static, re-exported, side-effect and dynamic modules share a release URL",()=>{
  const source=`import {x} from "./one.js"; export {y} from '../two.js'; import "./side.js"; await import('./lazy.js?mode=1#part'); import z from "https://example.com/lib.js";`;
  const output=versionModuleImports(source,"rev1");
  for(const resource of ["./one.js?release=rev1","../two.js?release=rev1","./side.js?release=rev1","./lazy.js?mode=1&release=rev1#part"])assert.ok(output.includes(resource));
  assert.ok(output.includes('from "https://example.com/lib.js"'));
});

test("HTML modulepreloads, script entries and styles use matching release URLs",()=>{
  const source='<link rel="modulepreload" href="src/app.js"><script type="module" src="src/app.js"></script><link href="styles/app.css" rel="stylesheet"><script src="https://example.com/lib.js"></script>';
  const output=versionHtmlAssets(source,"rev2");
  assert.equal(output.match(/src\/app\.js\?release=rev2/g).length,2);
  assert.ok(output.includes('styles/app.css?release=rev2'));
  assert.ok(output.includes('src="https://example.com/lib.js"'));
});

test("nested local CSS imports use the release revision and preserve external CSS",()=>{
  const output=versionCssImports('@import url("./base.css"); @import "../print.css"; @import url("https://example.com/font.css");',"rev3");
  assert.ok(output.includes('./base.css?release=rev3'));
  assert.ok(output.includes('../print.css?release=rev3'));
  assert.ok(output.includes('url("https://example.com/font.css")'));
});

test("changing a leaf module changes the release revision and entry URLs",()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),"forge-assets-"));
  const seed=()=>{fs.writeFileSync(path.join(directory,"index.html"),'<script src="app.js"></script>');fs.writeFileSync(path.join(directory,"app.js"),'import "./leaf.js";');};
  try{
    seed();fs.writeFileSync(path.join(directory,"leaf.js"),'export const n=1;');
    const before=versionPublicAssets(directory);
    seed();fs.writeFileSync(path.join(directory,"leaf.js"),'export const n=2;');
    const after=versionPublicAssets(directory);
    assert.notEqual(before,after);
    assert.ok(fs.readFileSync(path.join(directory,"index.html"),"utf8").includes(`release=${after}`));
    assert.ok(fs.readFileSync(path.join(directory,"app.js"),"utf8").includes(`release=${after}`));
  }catch(error){console.error("[asset-version-test] Release fixture failed",error);throw error;}
  finally{fs.rmSync(directory,{recursive:true,force:true});}
});
