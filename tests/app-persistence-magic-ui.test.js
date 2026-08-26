import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");

test("opening a saved pregen restores its visible Starting Resources summary when saved magic data exists",()=>{
  assert.match(app,/renderCharacter\(character,document\.getElementById\("result"\)\);if\(character\.startingMagic\)renderStartingMagicSummary\(character\);showTab\("forge"\)/);
});

test("2024 starting-magic guidance states that Low Normal and High share the one official SRD allocation",()=>{
  assert.match(app,/SRD 5\.2\.1 has one official Starting Equipment at Higher Levels schedule/);
  assert.match(app,/Low \/ Normal \/ High therefore use the same official item allocation/);
  assert.match(app,/No Magic is the explicit override/);
});

test("campaign magic cards do not imply different 2024 item quantities before edition guidance is read",()=>{
  assert.doesNotMatch(app,/Conservative campaign\./);
  assert.doesNotMatch(app,/More generous magic availability\./);
  assert.match(app,/OFFICIAL GUIDANCE/);
});
