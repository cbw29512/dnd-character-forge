import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const base=readFileSync(new URL("../styles/base.css",import.meta.url),"utf8");

test("core Forge document exposes language, viewport, labelled navigation, live result and alert semantics",()=>{
  assert.match(html,/<html lang="en">/);
  assert.match(html,/name="viewport" content="width=device-width,initial-scale=1"/);
  assert.match(html,/<nav class="primary-nav" aria-label="Primary">/);
  assert.match(html,/class="forge-panel" aria-labelledby="forge-title"/);
  assert.match(html,/class="result-stage" aria-live="polite" aria-label="Generated character"/);
  assert.match(html,/id="error" class="error-banner" role="alert"/);
});

test("primary interactive controls remain native keyboard-operable controls",()=>{
  assert.match(html,/<button class="nav-link is-active" data-tab="forge">Forge<\/button>/);
  assert.match(html,/<button id="forgeButton" class="forge-button" type="button">/);
  assert.match(html,/<button id="openSpellPicker" class="secondary-button" type="button">Choose spells<\/button>/);
  assert.match(html,/<select id="ruleset">/);
  assert.match(html,/<input id="name" autocomplete="off"/);
});

test("focus-visible treatment and reduced-motion preference are explicit",()=>{
  assert.match(base,/button:focus-visible, select:focus-visible, input:focus-visible/);
  assert.match(base,/outline:\s*3px solid/);
  assert.match(base,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(base,/scroll-behavior:\s*auto/);
  assert.match(base,/transition-duration:\s*\.01ms !important/);
});
