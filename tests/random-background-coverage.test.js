import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createInitialState } from "../src/state.js";
import { randomBackgroundCoverageMessage } from "../src/ui/options.js";

function stateFor(ruleset){const state=createInitialState();state.ruleset=ruleset;return state;}

test("2014 Random background guidance explains the one-option strict SRD pool",()=>{
  const message=randomBackgroundCoverageMessage(stateFor("2014"));
  assert.match(message,/2014 SRD Random background has 1 verified option here: Acolyte\./);
  assert.match(message,/Forge Original/);
  assert.match(message,/clearly marked as original/);
});

test("2024 Random background guidance names the four verified SRD choices and keeps Originals opt-in",()=>{
  const message=randomBackgroundCoverageMessage(stateFor("2024"));
  assert.match(message,/rotates across 4 verified options/);
  for(const name of ["Acolyte","Criminal","Sage","Soldier"])assert.match(message,new RegExp(`\\b${name}\\b`));
  assert.match(message,/Forge Original backgrounds stay opt-in/);
});

test("Forge panel owns an accessible live Random coverage note",async()=>{
  const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/id="randomBackgroundCoverage"/);
  assert.match(html,/id="randomBackgroundCoverage"[^>]*aria-live="polite"/);
  assert.match(html,/class="choice-summary"/);
});
