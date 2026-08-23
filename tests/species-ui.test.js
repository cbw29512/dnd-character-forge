import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/ui/species-options.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../styles/components.css",import.meta.url),"utf8");

test("Forge exposes a dedicated Random-by-default species options panel",()=>{
  try{assert.match(html,/id="speciesChoicePanel"/);assert.match(html,/id="speciesChoiceFields"/);assert.match(html,/id="speciesChoiceSummary"/);assert.match(html,/Fix only the choices you care about/);assert.match(ui,/<option value="random">Random<\/option>/);}
  catch(error){console.error("[test] species options panel",error);throw error;}
});

test("species options cover every choice-bearing 2024 SRD species",()=>{
  try{for(const id of ["dragonborn","elf","gnome","goliath","human","tiefling"])assert.match(ui,new RegExp(`speciesId===["']${id}["']`));assert.match(ui,/Draconic ancestry/);assert.match(ui,/Elven lineage/);assert.match(ui,/Gnomish lineage/);assert.match(ui,/Giant ancestry/);assert.match(ui,/Skillful proficiency/);assert.match(ui,/Fiendish legacy/);}
  catch(error){console.error("[test] species option coverage",error);throw error;}
});

test("High Elf exposes its Wizard cantrip only when High Elf is fixed",()=>{
  try{assert.match(ui,/selections\.lineage==="high"/);assert.match(ui,/High Elf Wizard cantrip/);assert.match(ui,/delete state\.speciesSelections\.cantrip/);}
  catch(error){console.error("[test] High Elf conditional cantrip",error);throw error;}
});

test("app binds, resets, syncs, and restores species option state",()=>{
  try{assert.match(app,/bindSpeciesOptions\(state\)/);assert.match(app,/resetSpeciesOptions\(state\)/);assert.match(app,/renderSpeciesOptions\(state\)/);assert.match(app,/character\.speciesChoices/);assert.match(app,/size:character\.size/);assert.match(app,/state\.speciesSelections=\{\}/);}
  catch(error){console.error("[test] species state wiring",error);throw error;}
});

test("species option panel has compact responsive styling",()=>{
  try{assert.match(css,/\.species-choice-panel/);assert.match(css,/\.species-choice-fields/);assert.match(css,/@media \(max-width:680px\).*species-choice-fields/s);}
  catch(error){console.error("[test] species option responsive CSS",error);throw error;}
});
