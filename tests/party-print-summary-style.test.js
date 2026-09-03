import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const summary=readFileSync(new URL("../styles/print/party-summary.css",import.meta.url),"utf8");
const loadPoint=readFileSync(new URL("../styles/print/premium-sorcerer.css",import.meta.url),"utf8");

test("Party Print loads the DM quick-reference stylesheet",()=>{
  assert.match(loadPoint,/party-summary\.css/);
});

test("DM quick reference owns one Letter-page-safe printable layout",()=>{
  assert.match(summary,/\.party-print-summary\s*\{[^}]*height:10\.36in/s);
  assert.match(summary,/\.party-print-summary\s*\{[^}]*break-after:page/s);
  assert.match(summary,/\.party-summary-grid\s*\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
  assert.match(summary,/\.party-summary-card\s*\{[^}]*break-inside:avoid/s);
  assert.match(summary,/print-color-adjust:exact/);
});
