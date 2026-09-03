import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { buildNarrativeDossier } from "../src/print/dossier.js";
import { DOSSIER_DISLIKES, DOSSIER_LIKES, DOSSIER_MANNERISMS, DOSSIER_STORY_EVENTS, DOSSIER_STORY_PLACES } from "../src/print/dossier-flavor.js";
import { DOSSIER_NARRATIVE_ARCS, narrativeArcFor } from "../src/print/dossier-narratives.js";

const CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
const NAMES=["Alden Ashford","Alira Alderbrook","Aric Amberwick","Arlen Blackmere","Aster Blackthorn","Bren Briar","Briala Brighthollow","Cael Brightwood","Cassian Calder","Cira Cinder","Corin Cloudmere","Dain Crestfall"];

function make(classId,name){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints.level="7";
  state.constraints.class=classId;
  state.constraints.subclass="random";
  state.constraints.species="dwarf";
  state.constraints.background="soldier";
  state.constraints.name=name;
  return generateCharacter(state);
}

test("dossier V3 has broad original flavor pools and ten distinct story structures",()=>{
  assert.equal(DOSSIER_NARRATIVE_ARCS.length,10);
  assert.equal(new Set(DOSSIER_NARRATIVE_ARCS.map(item=>item.id)).size,10);
  assert.equal(new Set(Array.from({length:10},(_,index)=>narrativeArcFor(index).id)).size,10);
  assert.ok(DOSSIER_MANNERISMS.length>=24);
  assert.ok(DOSSIER_LIKES.length>=20);
  assert.ok(DOSSIER_DISLIKES.length>=20);
  assert.ok(DOSSIER_STORY_EVENTS.length>=24);
  assert.ok(DOSSIER_STORY_PLACES.length>=24);
});

test("all 12 classes keep four-paragraph dossiers while materially varying narrative structure",()=>{
  const dossiers=CLASSES.map((classId,index)=>{
    const character=make(classId,NAMES[index]);
    assert.equal(character.validation.valid,true,`${classId} fixture invalid`);
    const dossier=buildNarrativeDossier(character);
    assert.equal(dossier.backstory.length,4,`${classId} backstory page contract`);
    assert.equal(dossier.hooks.length,4,`${classId} hook contract`);
    assert.ok(dossier.storyArc?.id,`${classId} missing story arc`);
    assert.equal(new Set(dossier.personality.mannerisms).size,3,`${classId} repeated mannerism`);
    assert.equal(new Set(dossier.personality.likes).size,3,`${classId} repeated likes`);
    assert.equal(new Set(dossier.personality.dislikes).size,3,`${classId} repeated dislikes`);
    assert.doesNotMatch(dossier.roleplay.guidance,/as a the\b/i,`${classId} roleplay archetype grammar`);
    return dossier;
  });
  assert.ok(new Set(dossiers.map(item=>item.storyArc.id)).size>=8,"12-class matrix should exercise at least eight narrative structures");
  assert.equal(new Set(dossiers.map(item=>item.backstory[0])).size,12,"opening paragraphs should not collapse to a shared template");
  assert.ok(new Set(dossiers.map(item=>item.personality.trait)).size>=8,"personality traits should vary with narrative structure");
});

test("dossier narrative remains deterministic for the same character",()=>{
  const character=make("ranger","Tessa Riverstone"),one=buildNarrativeDossier(character),two=buildNarrativeDossier(character);
  assert.deepEqual(one,two);
});
