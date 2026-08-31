import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const SOCIAL_IMAGE="assets/character-forge-social-v3.jpg";

test("Discord social preview asset is a complete cache-busted JPEG",()=>{
  const image=readFileSync(new URL(`../${SOCIAL_IMAGE}`,import.meta.url));
  assert.ok(image.length>10000,"social preview JPEG should not be suspiciously small or truncated");
  assert.equal(image[0],0xff,"social preview must start with JPEG SOI");
  assert.equal(image[1],0xd8,"social preview must start with JPEG SOI");
  assert.equal(image.at(-2),0xff,"social preview must end with JPEG EOI");
  assert.equal(image.at(-1),0xd9,"social preview must end with JPEG EOI");
});

test("obsolete social PNG fallbacks are removed",()=>{
  assert.equal(existsSync(new URL("../assets/character-forge-social.png",import.meta.url)),false);
  assert.equal(existsSync(new URL("../assets/character-forge-social-v2.png",import.meta.url)),false);
});

test("social metadata uses the cache-busted Discord-safe preview",()=>{
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/property="og:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/character-forge-social-v3\.jpg"/);
  assert.match(html,/property="og:image:type" content="image\/jpeg"/);
  assert.match(html,/name="twitter:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/character-forge-social-v3\.jpg"/);
});
