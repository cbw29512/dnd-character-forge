import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const picker=fs.readFileSync(new URL("../src/ui/advancement-picker.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../src/app.js",import.meta.url),"utf8");
const renderer=fs.readFileSync(new URL("../src/ui/render.js",import.meta.url),"utf8");

test("Forge exposes one class-aware advancement panel wired to application state",()=>{
  assert.equal((html.match(/id="advancementPanel"/g)||[]).length,1);
  assert.equal((html.match(/id="advancementFields"/g)||[]).length,1);
  assert.match(html,/styles\/advancement\.css/);
  assert.match(app,/bindAdvancementPicker\(state\)/);
  assert.match(app,/refreshAdvancementPicker\(state\)/);
  assert.match(app,/advancementSelections/);
});

test("advancement picker preserves edition-specific choices for Barbarian Rogue and Fighter",()=>{
  assert.match(picker,/ROGUE_ADVANCEMENT/);
  assert.match(picker,/FIGHTER_ADVANCEMENT/);
  assert.match(picker,/\["barbarian","rogue","fighter"\]/);
  assert.match(picker,/ROGUE_2014/);
  assert.match(picker,/\["asi","Ability Score Improvement"\]/);
  assert.match(picker,/\["ability-score-improvement","Ability Score Improvement"\]/);
  assert.match(picker,/6:RANDOM/);
  assert.match(picker,/10:RANDOM/);
  assert.match(picker,/14:RANDOM/);
  for(const id of ["boon-combat-prowess","boon-dimensional-travel","boon-fate","boon-irresistible-offense","boon-night-spirit","boon-truesight"])assert.match(picker,new RegExp(id));
  assert.doesNotMatch(picker,/boon-spell-recall/);
});

test("printed class sheet gives feats and saving throws explicit sections",()=>{
  assert.match(renderer,/Feats & Boons/);
  assert.match(renderer,/sheet-section-feats/);
  assert.match(renderer,/save-grid/);
  assert.match(renderer,/item\.id\.startsWith\("feat:"\)/);
});
