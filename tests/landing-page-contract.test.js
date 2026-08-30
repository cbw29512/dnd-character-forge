import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=readFileSync(new URL("../styles/landing.css",import.meta.url),"utf8");
const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");
const heroExperience=readFileSync(new URL("../src/ui/hero-experience.js",import.meta.url),"utf8");
const heroCss=readFileSync(new URL("../styles/hero-experience.css",import.meta.url),"utf8");
const renderSafe=readFileSync(new URL("../src/ui/render-safe.js",import.meta.url),"utf8");

test("landing page puts the actual Forge in the launch experience",()=>{
  try{
    assert.match(html,/class="forge-workspace"/);
    assert.match(html,/class="hero-copy"/);
    assert.match(html,/class="forge-panel"/);
    assert.match(html,/class="launch-cta"/);
    assert.match(html,/Want a character immediately\?/);
    assert.match(html,/Leave every choice Random and Forge will build a complete legal character\./);
    assert.match(html,/class="random-note">RAW only</);
    assert.equal((html.match(/id="forgeButton"/g)||[]).length,1,"Forge button must remain unique");
    assert.ok(html.indexOf('id="forgeButton"')<html.indexOf('class="field-grid"'),"Forge action should appear before the long choice list");
  }catch(error){console.error("[test] landing launch contract",error);throw error;}
});

test("landing remains a deliberate pre-generation state until the user Forges",()=>{
  try{
    assert.match(html,/class="forge-empty-state"/);
    assert.match(html,/YOUR HERO AWAITS/);
    assert.match(html,/Choose what matters\.<br>We handle the rules\./);
    const boot=app.match(/function boot\(\)\{[\s\S]*?\n\}\n\nfunction createMagicControls/)?.[0]||"";
    assert.match(boot,/addEventListener\("click",forge\)/);
    assert.doesNotMatch(boot,/;forge\(\);/,"boot must not replace the landing state with an automatic random character");
    assert.match(heroExperience,/if\(hero\.querySelector\("\.hero-flow"\)\)return/);
    assert.match(heroCss,/\.forge-workspace:has\(\.character-sheet\) \.hero-copy\{display:none\}/);
    assert.match(css,/\.forge-workspace:not\(:has\(\.character-sheet\)\)/);
    assert.match(css,/\.forge-workspace:has\(\.character-sheet\)/);
    assert.match(css,/grid-template-areas:\s*"hero panel"\s*"result result"/);
    assert.match(css,/grid-template-areas:"panel result"/);
  }catch(error){console.error("[test] landing pre-generation contract",error);throw error;}
});

test("single header support link uses the verified Buy Me a Coffee destination safely",()=>{
  try{
    const links=[...html.matchAll(/href="https:\/\/buymeacoffee\.com\/divclass016"[^>]*>/g)].map(match=>match[0]);
    assert.equal(links.length,1,"Production shell should expose one unobtrusive header support link");
    assert.match(links[0],/target="_blank"/);
    assert.match(links[0],/rel="noopener noreferrer"/);
    assert.doesNotMatch(html,/class="support-card"/);
  }catch(error){console.error("[test] support link contract",error);throw error;}
});

test("Party Forge stays reachable from the primary Forge launch surface",()=>{
  try{
    assert.match(app,/createHeroExperience\(\)/);
    assert.match(heroExperience,/function ensurePartyForge\(\)/);
    assert.match(heroExperience,/toggle\.id="partyForgeToggle"/);
    assert.match(heroExperience,/toggle\.textContent="⚔ Forge a Party"/);
    assert.match(heroExperience,/launch\.appendChild\(toggle\)/);
    assert.match(heroExperience,/panel\.id="partyForgePanel"/);
    assert.match(heroExperience,/ensurePartyForge\(\)/);
  }catch(error){console.error("[test] Party Forge reachability contract",error);throw error;}
});

test("landing stylesheet loads after responsive rules and stays out of print",()=>{
  try{
    assert.ok(html.indexOf('styles/landing.css')>html.indexOf('styles/responsive.css'));
    assert.match(css,/@media print\{/);
    assert.match(css,/\.header-support/);
    assert.match(css,/\.forge-empty-state/);
    assert.match(css,/display:none !important/);
  }catch(error){console.error("[test] landing stylesheet contract",error);throw error;}
});

test("dynamic controls do not depend on the Forge button being a direct panel child",()=>{
  try{
    assert.match(app,/errorAnchor=document\.getElementById\("error"\)/);
    assert.match(app,/errorAnchor\?\.parentElement===panel\)panel\.insertBefore\(wrapper,errorAnchor\)/);
    assert.doesNotMatch(app,/panel\.insertBefore\(wrapper,anchor\)/);
  }catch(error){console.error("[test] dynamic control anchor contract",error);throw error;}
});

test("post-render action bar is inserted above the workspace, not into the hero grid",()=>{
  try{
    assert.match(renderSafe,/workspace\.parentNode\.insertBefore\(bar,workspace\)/);
    assert.doesNotMatch(renderSafe,/insertBefore\?\.\(bar,hero\|\|workspace\)/);
  }catch(error){console.error("[test] post-render action bar contract",error);throw error;}
});
