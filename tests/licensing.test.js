import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ATTRIBUTION_51='This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.';
const ATTRIBUTION_521='This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.';

test("public page includes the exact SRD 5.1 and 5.2.1 CC attribution statements",()=>{try{assert.ok(html.includes(ATTRIBUTION_51));assert.ok(html.includes(ATTRIBUTION_521));}catch(error){console.error("[test] SRD attribution",error);throw error;}});
test("public page does not add extra Wizards attribution beside the required notices",()=>{try{assert.equal(/not affiliated with Wizards/i.test(html),false);}catch(error){console.error("[test] extra Wizards attribution",error);throw error;}});
