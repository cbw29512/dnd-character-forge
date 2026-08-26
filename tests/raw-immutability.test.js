import test from "node:test";
import assert from "node:assert/strict";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";

function expectDeepFrozen(value, path = "root") {
  assert.equal(Object.isFrozen(value), true, `${path} must be frozen`);
  if (value === null || typeof value !== "object") return;
  for (const key of Reflect.ownKeys(value)) expectDeepFrozen(value[key], `${path}.${String(key)}`);
}

test("2014 RAW forge catalog is deeply immutable", () => {
  expectDeepFrozen(FORGE_2014);
  assert.throws(() => {
    FORGE_2014.classes[0].name = "Homebrew Barbarian";
  }, TypeError);
});

test("2024 RAW forge catalog is deeply immutable", () => {
  expectDeepFrozen(FORGE_2024);
  assert.throws(() => {
    FORGE_2024.classes[0].name = "Homebrew Barbarian";
  }, TypeError);
});

test("2014 and 2024 RAW catalogs remain separate objects", () => {
  assert.notStrictEqual(FORGE_2014, FORGE_2024);
  assert.equal(FORGE_2014.ruleset, "2014");
  assert.equal(FORGE_2024.ruleset, "2024");
});

test("Homebrew cannot mutate a RAW nested record by reference", () => {
  const copied = structuredClone(FORGE_2014.classes[0]);
  copied.name = "Homebrew Barbarian";
  copied.skillCount = 99;
  assert.equal(FORGE_2014.classes[0].name, "Barbarian");
  assert.notEqual(copied.name, FORGE_2014.classes[0].name);
  assert.notEqual(copied.skillCount, FORGE_2014.classes[0].skillCount);
});
