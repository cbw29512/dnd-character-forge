import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const WORKFLOW_URL=new URL("../.github/workflows/srd-reference-integrity.yml",import.meta.url);
const REQUIRED_CATALOG_PATHS=[
  "src/data/spell-reference-2014-generated.js",
  "src/data/spell-reference-2024-generated.js"
];

test("SRD reference integrity is certified on relevant main pushes",()=>{
  try{
    const workflow=readFileSync(WORKFLOW_URL,"utf8");
    const pushBlock=workflow.match(/^  push:\s*\n([\s\S]*?)(?=^  pull_request:)/m)?.[1];

    assert.ok(pushBlock,"SRD integrity workflow must define a push trigger.");
    assert.match(pushBlock,/^    branches:\s*$/m,"push trigger must declare a branch allow-list.");
    assert.match(pushBlock,/^      - main\s*$/m,"SRD integrity must re-certify relevant changes after they reach main.");

    for(const path of REQUIRED_CATALOG_PATHS){
      assert.ok(pushBlock.includes(`- '${path}'`),`main push trigger must cover ${path}.`);
    }

    assert.match(workflow,/^  pull_request:\s*$/m,"PR-time SRD integrity certification must remain enabled.");
    assert.match(workflow,/^  workflow_dispatch:\s*$/m,"manual SRD integrity certification must remain available.");
  }catch(error){
    console.error("[test] SRD reference workflow contract failed",error);
    throw error;
  }
});
