import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { buildNarrativeDossier } from "../src/print/dossier.js";
import { LITERARY_BACKGROUND_IDS } from "../src/print/dossier-background-literary.js";
import { LITERARY_SUBCLASS_IDS } from "../src/print/dossier-subclass-literary-all.js";

const backgroundIds=new Set(LITERARY_BACKGROUND_IDS),subclassIds=new Set(LITERARY_SUBCLASS_IDS);

function make({classId="barbarian",subclass="berserker",background="soldier",name="Mara Voss"}={}){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.level="7";
  state.constraints.class=classId;
  state.constraints.subclass=subclass;
  state.constraints.species="human";
  state.constraints.background=background;
  state.constraints.name=name;
  return generateCharacter(state);
}

test("every supported background and subclass has a dedicated literary profile",()=>{
  for(const data of [FORGE_2014,FORGE_2024]){
    const missingBackgrounds=data.backgrounds.map(item=>item.id).filter(id=>!backgroundIds.has(id));
    const missingSubclasses=data.subclasses.map(item=>item.id).filter(id=>!subclassIds.has(id));
    assert.deepEqual(missingBackgrounds,[],`${data.ruleset} backgrounds missing literary profiles`);
    assert.deepEqual(missingSubclasses,[],`${data.ruleset} subclasses missing literary profiles`);
  }
});

test("changing only the subclass materially changes the character's tale and art direction",()=>{
  const berserker=buildNarrativeDossier(make({subclass:"berserker"}));
  const tempest=buildNarrativeDossier(make({subclass:"iron-tempest"}));
  assert.notEqual(berserker.backstory[2],tempest.backstory[2]);
  assert.notEqual(berserker.personality.flaw,tempest.personality.flaw);
  assert.notEqual(berserker.artDirection.subclass,tempest.artDirection.subclass);
  assert.match(berserker.backstory.join(" "),/Path of the Berserker/);
  assert.match(tempest.backstory.join(" "),/Path of the Iron Tempest/);
});

test("changing only the background materially changes the formative history",()=>{
  const soldier=buildNarrativeDossier(make({background:"soldier",name:"Tarin Vale"}));
  const criminal=buildNarrativeDossier(make({background:"criminal",name:"Tarin Vale"}));
  assert.notEqual(soldier.backstory[0],criminal.backstory[0]);
  assert.notEqual(soldier.backstory[1],criminal.backstory[1]);
  assert.notEqual(soldier.artDirection.background,criminal.artDirection.background);
  assert.match(soldier.backstory.join(" "),/discipline|order|formation|campaign|soldier/i);
  assert.match(criminal.backstory.join(" "),/trust|coin|alley|coded|criminal|loyalt/i);
});

test("literary dossiers remain deterministic, substantial, and rules-isolated",()=>{
  const character=make({classId:"warlock",subclass:"fiend-patron",background:"acolyte",name:"Ilyra Fen"});
  assert.equal(character.validation.valid,true);
  const before=JSON.stringify({ac:character.ac,hp:character.hp,abilities:character.abilities,attacks:character.attacks,validation:character.validation});
  const one=buildNarrativeDossier(character),two=buildNarrativeDossier(character);
  assert.deepEqual(one,two);
  assert.equal(one.backstory.length,4);
  for(const [index,paragraph] of one.backstory.entries())assert.ok(paragraph.length>=180,`paragraph ${index+1} is too thin for the literary contract`);
  assert.ok(one.artDirection?.brief?.length>=120);
  assert.match(one.disclaimer,/does not add or change game rules/i);
  assert.equal(JSON.stringify({ac:character.ac,hp:character.hp,abilities:character.abilities,attacks:character.attacks,validation:character.validation}),before);
});
