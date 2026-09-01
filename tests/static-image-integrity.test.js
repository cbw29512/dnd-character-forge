import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const SOCIAL_IMAGE="assets/icon-512.png";
const PNG_SIGNATURE=[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a];

test("Discord social preview uses the stable branded app icon",()=>{
  const image=readFileSync(new URL(`../${SOCIAL_IMAGE}`,import.meta.url));
  assert.ok(image.length>5000,"social preview icon should be a real rendered PNG");
  assert.deepEqual([...image.subarray(0,8)],PNG_SIGNATURE,"social preview must be a valid PNG");
});

test("broken legacy large social preview is removed",()=>{
  assert.equal(existsSync(new URL("../assets/character-forge-social-v3.jpg",import.meta.url)),false);
  assert.equal(existsSync(new URL("../assets/character-forge-social.png",import.meta.url)),false);
  assert.equal(existsSync(new URL("../assets/character-forge-social-v2.png",import.meta.url)),false);
});

test("social metadata uses the compact Discord-safe preview",()=>{
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  assert.match(html,/property="og:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/icon-512\.png"/);
  assert.match(html,/property="og:image:type" content="image\/png"/);
  assert.match(html,/property="og:image:width" content="512"/);
  assert.match(html,/property="og:image:height" content="512"/);
  assert.match(html,/name="twitter:card" content="summary"/);
  assert.match(html,/name="twitter:image" content="https:\/\/cbw29512\.github\.io\/dnd-character-forge\/assets\/icon-512\.png"/);
  assert.doesNotMatch(html,/character-forge-social-v3/);
});
