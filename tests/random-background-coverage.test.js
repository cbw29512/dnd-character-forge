import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createInitialState } from "../src/state.js";
import { randomBackgroundCoverageMessage } from "../src/ui/options.js";

function stateFor(ruleset){const state=createInitialState();state.ruleset=ruleset;return state;}

test("2014 Random guidance discloses its SRD and Forge Original pools",()=>{
  const message=randomBackgroundCoverageMessage(stateFor("2014"));
  assert.match(message,/2014 Random.*1 SRD background \(Acolyte\) and 12 Forge Original backgrounds/);
  assert.doesNotMatch(message,/opt-in|1 verified option here/);
  assert.match(message,/clearly marked as original/);
});

test("2024 Random guidance names its four SRD choices and discloses Originals",()=>{
  const message=randomBackgroundCoverageMessage(stateFor("2024"));
  assert.match(message,/4 SRD backgrounds/);
  for(const name of ["Acolyte","Criminal","Sage","Soldier"])assert.match(message,new RegExp(`\\b${name}\\b`));
  assert.match(message,/12 Forge Original backgrounds/);
  assert.match(message,/choose a named background to keep that choice fixed/);
});

test("Forge panel owns an accessible live Random coverage note",async()=>{
  const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/id="randomBackgroundCoverage"/);
  assert.match(html,/id="randomBackgroundCoverage"[^>]*aria-live="polite"/);
  assert.match(html,/class="choice-summary"/);
});
