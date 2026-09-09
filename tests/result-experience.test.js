import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");

test("generated character keeps one visible action surface for reforge and print",()=>{
  const adapter=read("src/ui/render-safe.js");
  const baseRenderer=read("src/ui/render.js");

  assert.match(baseRenderer,/data-action="reroll"/);
  assert.match(baseRenderer,/data-action="print"/);
  assert.match(adapter,/simplifySheetActions\(target\)/);
  assert.match(adapter,/for\(const action of \["reroll","print"\]\)/);
  assert.match(adapter,/button\.hidden=true/);
  assert.match(adapter,/button\.setAttribute\("aria-hidden","true"\)/);
  assert.match(adapter,/button\.tabIndex=-1/);
  assert.match(adapter,/save\.textContent="Save to Pregens"/);
  assert.match(adapter,/Your character is ready/);
  assert.match(adapter,/← Back to Setup/);
  assert.match(adapter,/Print \/ PDF/);
});

test("result polish keeps the unique save action prominent on phones",()=>{
  const base=read("styles/base.css");
  const css=read("styles/result-polish.css");

  assert.match(base,/@import url\("\.\/result-polish\.css"\)/);
  assert.match(css,/\.character-actions\.character-save-actions/);
  assert.match(css,/@media \(max-width:680px\)/);
  assert.match(css,/grid-template-columns:1fr/);
  assert.match(css,/\[data-action="save"\][^}]*width:100%/s);
  assert.match(css,/\.forge-action-bar \.forge-action-copy small[^}]*display:none/s);
});

test("production smoke protects the public support pages and new result stylesheet",()=>{
  const smoke=read("scripts/production-smoke.sh");

  assert.match(smoke,/guide\.html\|How to generate a pregen/);
  assert.match(smoke,/faq\.html\|Questions about the D&D 5e pregen generator\./);
  assert.match(smoke,/privacy\.html\|Character Forge is designed to work without an account or hosted character database\./);
  assert.match(smoke,/styles\/result-polish\.css/);
  assert.match(smoke,/styles\/static-pages\.css/);
  assert.match(smoke,/support pages, routes, and critical assets are healthy/);
});
