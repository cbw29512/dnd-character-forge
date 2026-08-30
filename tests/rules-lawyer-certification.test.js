import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { createAbilityFeat } from "../src/rules/homebrew.js";
import { FORGE_BUILD, buildRulesLawyerCertification, certificationFooterText } from "../src/rules/certification.js";

test("validated RAW character earns the Rules Lawyer certification",()=>{
  const state=createInitialState();
  state.constraints.level="5";
  state.constraints.class="fighter";
  state.constraints.species="human";
  state.constraints.background="criminal";
  const character=generateCharacter(state),cert=buildRulesLawyerCertification(character);
  assert.equal(character.validation.valid,true);
  assert.equal(character.audit.status,"PASS");
  assert.equal(cert.status,"RULES LAWYER CERTIFIED");
  assert.equal(cert.rawCertified,true);
  assert.equal(cert.provenanceComplete,true);
  assert.ok(cert.mechanicCount>=3);
  assert.ok(cert.checkCount>=2);
  assert.equal(cert.buildId,FORGE_BUILD.id);
  assert.match(certificationFooterText(character),/RULES LAWYER CERTIFIED/);
  assert.match(certificationFooterText(character),new RegExp(FORGE_BUILD.id));
});

test("Homebrew cannot receive the RAW-certified seal",()=>{
  const state=createInitialState();
  state.sourceMode=SOURCE.HOMEBREW;
  state.constraints.level="1";
  state.constraints.class="fighter";
  state.homebrew.push(createAbilityFeat({name:"Certification Test",ability:"str",amount:1}));
  const cert=buildRulesLawyerCertification(generateCharacter(state));
  assert.equal(cert.rawCertified,false);
  assert.equal(cert.status,"AUDITED CUSTOM CONTENT");
});

test("certification refuses unvalidated or unaudited input",()=>{
  assert.throws(()=>buildRulesLawyerCertification({validation:{valid:false},audit:{status:"PASS"}}),/validated character/);
  assert.throws(()=>buildRulesLawyerCertification({validation:{valid:true},audit:{status:"FAIL"}}),/passing Rules Audit/);
});

test("web and PDF surfaces expose certification plus exact Forge build ID",()=>{
  const hero=readFileSync(new URL("../src/ui/hero-experience.js",import.meta.url),"utf8");
  const premium=readFileSync(new URL("../src/ui/premium-print.js",import.meta.url),"utf8");
  const css=readFileSync(new URL("../styles/certification.css",import.meta.url),"utf8");
  assert.match(hero,/RULES LAWYER CERTIFIED/);
  assert.match(hero,/buildRulesLawyerCertification/);
  assert.match(hero,/rules-lawyer-cert/);
  assert.match(premium,/certificationFooterText/);
  assert.match(premium,/replace\(\/<span class="ps-audit">\/g/);
  assert.match(css,/\.rules-lawyer-cert\.is-raw/);
});
