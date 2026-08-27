import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixedUrl=new URL("../styles/print/premium-fixed.css",import.meta.url);
const v3Url=new URL("../styles/print/premium-v3-base.css",import.meta.url);

test("Deluxe packets release the legacy full-height main grid so the Rules Index keeps its own row",async()=>{
  const [fixed,v3]=await Promise.all([readFile(fixedUrl,"utf8"),readFile(v3Url,"utf8")]);
  assert.match(fixed,/\.ps-main-columns\s*\{[^}]*height\s*:\s*100%/s,"legacy fixed profile no longer exposes the height contract this override protects");
  assert.match(v3,/\.sheet-packet-deluxe\s+\.ps-main-columns\s*\{[^}]*height\s*:\s*auto[^}]*min-height\s*:\s*0/s,"Deluxe packets must release the main grid from full body height");
  assert.doesNotMatch(v3,/\.sheet-packet-deluxe\s+\.ps-main-columns\s*\{[^}]*height\s*:\s*100%/s,"Deluxe override must not restore the overlap-causing full height");
});
