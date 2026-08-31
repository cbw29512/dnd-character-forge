import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),"utf8");

test("public site exposes a concise privacy disclosure",()=>{
  const index=read("index.html"),privacy=read("privacy.html"),markdown=read("PRIVACY.md");
  assert.match(index,/href="privacy\.html"[^>]*>Privacy<\/a>/);
  for(const text of [privacy,markdown]){
    assert.match(text,/without an account/i);
    assert.match(text,/local storage/i);
    assert.match(text,/analytics or telemetry client/i);
  }
});

test("privacy disclosure matches the current local-library implementation",()=>{
  const library=read("src/library/local-library.js"),index=read("index.html");
  assert.match(library,/localStorage\.getItem/);
  assert.match(library,/localStorage\.setItem/);
  assert.match(index,/connect-src 'self'/);
});
