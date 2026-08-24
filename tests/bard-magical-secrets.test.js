import test from "node:test";
import assert from "node:assert/strict";
import { bardSpellsFor } from "../src/data/bard-spells.js";
import { clericSpellsFor } from "../src/data/cleric-spells.js";
import { druidSpellsFor } from "../src/data/druid-spells.js";
import { paladinSpellsFor } from "../src/data/paladin-spells.js";
import { rangerSpellsFor } from "../src/data/ranger-spells.js";
import { wizardSpellsFor } from "../src/data/wizard-spells.js";
import { BARD_MAGICAL_SECRETS_2014, BARD_MAGICAL_SECRETS_2024, BARD_LORE_DISCOVERIES_2024 } from "../src/data/bard-magical-secrets.js";

const ids=list=>new Set(list.map(spell=>spell.id));

test("2014 Magical Secrets covers every encoded SRD class spell plus the Warlock-only remainder",()=>{
  const pool=ids(BARD_MAGICAL_SECRETS_2014);
  for(const list of [bardSpellsFor("2014"),clericSpellsFor("2014"),druidSpellsFor("2014"),paladinSpellsFor("2014"),rangerSpellsFor("2014"),wizardSpellsFor("2014")])for(const spell of list)assert.ok(pool.has(spell.id),`missing ${spell.name}`);
  assert.ok(pool.has("eldritch-blast"));assert.ok(pool.has("hellish-rebuke"));assert.equal(BARD_MAGICAL_SECRETS_2014.filter(spell=>spell.id==="eldritch-blast")[0].sourceList,"Warlock");
  assert.equal(pool.size,BARD_MAGICAL_SECRETS_2014.length);
});

test("2024 Magical Secrets is exactly restricted to Bard, Cleric, Druid, and Wizard lists",()=>{
  const pool=ids(BARD_MAGICAL_SECRETS_2024),expected=new Set();for(const list of [bardSpellsFor("2024"),clericSpellsFor("2024"),druidSpellsFor("2024"),wizardSpellsFor("2024")])for(const spell of list)expected.add(spell.id);
  assert.deepEqual(pool,expected);assert.equal(pool.has("eldritch-blast"),false);assert.equal(pool.has("hellish-rebuke"),false);assert.equal(pool.size,BARD_MAGICAL_SECRETS_2024.length);
});

test("2024 College of Lore Magical Discoveries excludes Bard-only spells",()=>{
  const pool=ids(BARD_LORE_DISCOVERIES_2024),expected=new Set();for(const list of [clericSpellsFor("2024"),druidSpellsFor("2024"),wizardSpellsFor("2024")])for(const spell of list)expected.add(spell.id);
  assert.deepEqual(pool,expected);assert.equal(pool.has("vicious-mockery"),false);assert.equal(pool.size,BARD_LORE_DISCOVERIES_2024.length);
});

test("all Magical Secrets records are level-stable and source-labelled",()=>{for(const list of [BARD_MAGICAL_SECRETS_2014,BARD_MAGICAL_SECRETS_2024,BARD_LORE_DISCOVERIES_2024])for(const spell of list){assert.ok(Number.isInteger(spell.level)&&spell.level>=0&&spell.level<=9);assert.ok(spell.name);assert.ok(spell.sourceList);}});
