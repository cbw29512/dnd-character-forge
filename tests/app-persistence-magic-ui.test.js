import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app=readFileSync(new URL("../src/app.js",import.meta.url),"utf8");
const components=readFileSync(new URL("../styles/components.css",import.meta.url),"utf8");

test("opening a saved pregen restores its visible Starting Resources summary when saved magic data exists",()=>{
  try{
    const viewSavedPregen=app.match(/function viewSavedPregen\(entry\)\{[\s\S]*?\n\}\n\nfunction syncControls/)?.[0]||"";
    assert.ok(viewSavedPregen,"viewSavedPregen implementation must remain present");
    const requiredSteps=[
      'renderCharacter(character,document.getElementById("result"))',
      "markPregenSaved()",
      "if(character.startingMagic)renderStartingMagicSummary(character)",
      'showTab("forge")'
    ];
    let previous=-1;
    for(const step of requiredSteps){
      const position=viewSavedPregen.indexOf(step);
      assert.ok(position>previous,`Saved pregen restoration step is missing or out of order: ${step}`);
      previous=position;
    }
  }catch(error){console.error("[test] saved pregen Starting Resources restoration",error);throw error;}
});

test("saving a pregen gives persistent visible confirmation and friendly duplicate feedback",()=>{
  try{
    assert.match(app,/actionButton\.textContent="Saving…"/);
    assert.match(app,/button\.textContent="✓ Saved to Pregens"/);
    assert.match(app,/Already saved to My Pregens\./);
    assert.match(app,/classList\.contains\("is-saved"\)/);
    assert.match(app,/entry\.presentationUpdated\?/);
    assert.match(components,/\.action-button\.is-saved\s*\{/);
  }catch(error){console.error("[test] saved pregen confirmation",error);throw error;}
});

test("2024 starting-magic guidance states that Low Normal and High share the one official SRD allocation",()=>{
  try{
    assert.match(app,/SRD 5\.2\.1 has one official Starting Equipment at Higher Levels schedule/);
    assert.match(app,/Low \/ Normal \/ High therefore use the same official item allocation/);
    assert.match(app,/No Magic is the explicit override/);
  }catch(error){console.error("[test] 2024 starting magic guidance",error);throw error;}
});

test("campaign magic cards do not imply different 2024 item quantities before edition guidance is read",()=>{
  try{
    assert.doesNotMatch(app,/Conservative campaign\./);
    assert.doesNotMatch(app,/More generous magic availability\./);
    assert.match(app,/OFFICIAL GUIDANCE/);
  }catch(error){console.error("[test] campaign magic card copy",error);throw error;}
});
