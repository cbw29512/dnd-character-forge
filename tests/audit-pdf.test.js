import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { createAbilityFeat } from "../src/rules/homebrew.js";

test("RAW characters carry a passing SRD rules audit",()=>{
  try{
    const state=createInitialState();
    state.constraints.level="3";
    state.constraints.class="fighter";
    state.constraints.species="human";
    state.constraints.background="criminal";
    const character=generateCharacter(state);
    assert.equal(character.validation.valid,true);
    assert.equal(character.audit.status,"PASS");
    assert.equal(character.audit.sourceMode,SOURCE.RAW);
    assert.equal(character.audit.rawIntegrity,true);
    assert.equal(character.audit.sourceVersion,"SRD 5.2.1");
    assert.match(character.audit.sourceUrl,/dndbeyond\.com\/srd/);
    assert.ok(character.audit.checks.some(item=>item.includes("no Homebrew mechanics")));
  }catch(error){console.error("[test] RAW rules audit",error);throw error;}
});

test("Homebrew characters disclose Homebrew in the rules audit",()=>{
  try{
    const state=createInitialState();
    state.sourceMode=SOURCE.HOMEBREW;
    state.constraints.level="1";
    state.constraints.class="fighter";
    state.homebrew.push(createAbilityFeat({name:"Audit Test",ability:"str",amount:1}));
    const character=generateCharacter(state);
    assert.equal(character.validation.valid,true);
    assert.equal(character.audit.sourceMode,SOURCE.HOMEBREW);
    assert.equal(character.audit.rawIntegrity,false);
    assert.ok(character.audit.checks.some(item=>item.includes("Homebrew mode is explicit")));
  }catch(error){console.error("[test] Homebrew rules audit",error);throw error;}
});

test("site exposes the rule-audit stylesheet and PDF export action",()=>{
  try{
    const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
    const render=readFileSync(new URL("../src/ui/render.js",import.meta.url),"utf8");
    assert.match(html,/styles\/audit\.css/);
    assert.match(html,/Rule-audit PDF/);
    assert.match(render,/Export PDF \/ Print/);
    assert.match(render,/Rules Audit/);
  }catch(error){console.error("[test] audit UI contract",error);throw error;}
});

test("print CSS is explicitly configured for Letter PDF output",()=>{
  try{
    const css=readFileSync(new URL("../styles/responsive.css",import.meta.url),"utf8");
    assert.match(css,/@page\s*\{[^}]*size:Letter portrait;/s);
    assert.match(css,/print-color-adjust:exact/);
    assert.match(css,/break-inside:avoid/);
  }catch(error){console.error("[test] PDF print CSS",error);throw error;}
});
