import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source=readFileSync(new URL("../src/ui/render-safe.js",import.meta.url),"utf8");

test("generated character action bar exposes a clear return to Forge setup",()=>{
  assert.match(source,/className="action-button forge-action-back"/);
  assert.match(source,/textContent="← Back to Forge Setup"/);
  assert.match(source,/aria-label","Back to Character Forge setup"/);
  assert.match(source,/backButton\.addEventListener\("click",goToForgeSetup\)/);
});

test("return navigation activates Forge, restores setup, and preserves an accessible focus target",()=>{
  assert.match(source,/document\.querySelector\('\[data-tab="forge"\]'\)\?\.click\(\)/);
  assert.match(source,/document\.querySelector\("\.forge-panel"\)/);
  assert.match(source,/scrollIntoView\(\{behavior:"smooth",block:"start"\}\)/);
  assert.match(source,/document\.getElementById\("ruleset"\)\?\.focus\(\{preventScroll:true\}\)/);
});

test("Character Forge brand becomes a second non-destructive home escape after render",()=>{
  assert.match(source,/const brand=document\.querySelector\("\.brand"\)/);
  assert.match(source,/brand\.dataset\.forgeHomeBound/);
  assert.match(source,/event\.preventDefault\(\)/);
  assert.match(source,/goToForgeSetup\(\)/);
});
