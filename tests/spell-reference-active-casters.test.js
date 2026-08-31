import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { characterActiveSpellReferences } from "../src/rules/spell-reference.js";

const CASTERS=["wizard","cleric","bard","druid","paladin","ranger","sorcerer","warlock"];

const fixture=overrides=>({
  ruleset:"2024",
  level:20,
  class:{id:"wizard"},
  species:{id:"orc"},
  speciesChoices:{},
  magicInitiates:[],
  spells:{
    cantrips:{all:[]},
    known:{all:[]},
    prepared:{all:[]},
    alwaysPrepared:[],
    spellbook:{all:[]},
    tome:{cantrips:[],rituals:[]},
    invocationSpells:[],
    mysticArcanum:{},
    ...overrides
  }
});

const byId=refs=>new Map(refs.map(ref=>[ref.id,ref]));
const activeIds=spells=>[...new Set([
  ...(spells?.cantrips?.all||[]),
  ...(spells?.tome?.cantrips||[]),
  ...(spells?.alwaysPrepared||[]),
  ...(spells?.prepared?.all||[]),
  ...(spells?.known?.all||[]),
  ...(spells?.tome?.rituals||[]),
  ...(spells?.invocationSpells||[]),
  ...Object.values(spells?.mysticArcanum||{}).filter(Boolean)
])];

function generatedCaster(classId){
  const state=createInitialState();
  state.ruleset="2024";
  state.constraints={level:"20",species:"orc",class:classId,subclass:"random",background:"soldier",name:`${classId} active reference audit`};
  return generateCharacter(state);
}

test("active 2024 spell references expose every supported active spell bucket with deterministic labels",()=>{
  const character=fixture({
    cantrips:{all:["fire-bolt"]},
    alwaysPrepared:["shield"],
    prepared:{all:["magic-missile","shield"]},
    known:{all:["fireball","shield"]},
    spellbook:{all:["delayed-blast-fireball"]},
    tome:{cantrips:["guidance"],rituals:["find-familiar"]},
    invocationSpells:["detect-magic"],
    mysticArcanum:{7:"delayed-blast-fireball"}
  });
  const refs=characterActiveSpellReferences(character),lookup=byId(refs);
  assert.deepEqual(refs.map(ref=>ref.id),[
    "fire-bolt","guidance","shield","magic-missile","fireball","find-familiar","detect-magic","delayed-blast-fireball"
  ]);
  assert.equal(lookup.get("fire-bolt").preparation,"Cantrip");
  assert.equal(lookup.get("guidance").preparation,"Pact Tome Cantrip");
  assert.equal(lookup.get("shield").preparation,"Always Prepared","always-prepared must win duplicate priority");
  assert.equal(lookup.get("magic-missile").preparation,"Prepared");
  assert.equal(lookup.get("fireball").preparation,"Known");
  assert.equal(lookup.get("find-familiar").preparation,"Pact Tome Ritual");
  assert.equal(lookup.get("detect-magic").preparation,"Invocation");
  assert.equal(lookup.get("delayed-blast-fireball").preparation,"Mystic Arcanum");
  assert.equal(new Set(refs.map(ref=>ref.id)).size,refs.length,"active references must not duplicate spell ids");
});

test("every generated 2024 caster exposes exactly its class-active spell buckets when no extra magic source is present",()=>{
  for(const classId of CASTERS){
    const character=generatedCaster(classId),expected=activeIds(character.spells),refs=characterActiveSpellReferences(character);
    assert.ok(expected.length>0,`${classId}: expected active magic at level 20`);
    assert.deepEqual(new Set(refs.map(ref=>ref.id)),new Set(expected),`${classId}: active Spell Reference coverage drift`);
    assert.equal(new Set(refs.map(ref=>ref.id)).size,refs.length,`${classId}: duplicate active Spell Reference id`);
    assert.ok(refs.every(ref=>ref.source==="SRD 5.2.1"),`${classId}: non-SRD reference leaked into active panel`);
  }
});

test("species-granted magic resolves for a 2024 noncaster with no class spell state",()=>{
  const character={ruleset:"2024",level:5,class:{id:"fighter"},species:{id:"tiefling"},speciesChoices:{legacy:"infernal",spellcastingAbility:"cha"},magicInitiates:[],spells:null};
  const refs=characterActiveSpellReferences(character),lookup=byId(refs);
  assert.deepEqual(refs.map(ref=>ref.id),["fire-bolt","thaumaturgy","hellish-rebuke","darkness"]);
  assert.equal(lookup.get("fire-bolt").preparation,"Species Cantrip");
  assert.equal(lookup.get("hellish-rebuke").preparation,"Species Magic");
  assert.ok(refs.every(ref=>ref.castingAbility==="cha"));
  assert.ok(refs.every(ref=>ref.grantSource==="species"));
});

test("Magic Initiate spells resolve for a 2024 noncaster and preserve grant metadata",()=>{
  const character={ruleset:"2024",level:4,class:{id:"fighter"},species:{id:"orc"},speciesChoices:{},spells:null,magicInitiates:[{cantrips:["guidance","light"],level1Spell:"bless",spellcastingAbility:"wis",source:"background"}]};
  const refs=characterActiveSpellReferences(character),lookup=byId(refs);
  assert.deepEqual(refs.map(ref=>ref.id),["guidance","light","bless"]);
  assert.equal(lookup.get("guidance").preparation,"Magic Initiate Cantrip");
  assert.equal(lookup.get("bless").preparation,"Magic Initiate · Always Prepared");
  assert.ok(refs.every(ref=>ref.castingAbility==="wis"));
  assert.ok(refs.every(ref=>ref.grantSource==="background"));
});

test("class-active magic wins duplicate display priority over secondary grant sources",()=>{
  const character=fixture({cantrips:{all:["guidance"]}});character.magicInitiates=[{cantrips:["guidance"],level1Spell:"bless",spellcastingAbility:"wis",source:"background"}];
  const refs=characterActiveSpellReferences(character),lookup=byId(refs);
  assert.equal(refs.filter(ref=>ref.id==="guidance").length,1);
  assert.equal(lookup.get("guidance").preparation,"Cantrip");
  assert.equal(lookup.get("bless").preparation,"Magic Initiate · Always Prepared");
});

test("Wizard spellbook-only spells are not treated as active references",()=>{
  const refs=characterActiveSpellReferences(fixture({
    prepared:{all:["magic-missile"]},
    spellbook:{all:["magic-missile","shield","fireball"]}
  }));
  assert.deepEqual(refs.map(ref=>ref.id),["magic-missile"]);
});

test("generated leveled references stay fail-closed to their verified SRD page",()=>{
  const ref=characterActiveSpellReferences(fixture({known:{all:["fireball"]}}))[0];
  assert.equal(ref.id,"fireball");
  assert.equal(ref.preparation,"Known");
  assert.equal(ref.resolution,`See SRD 5.2.1 page ${ref.srdPage} for spell resolution.`);
  assert.equal(ref.source,"SRD 5.2.1");
});

test("2014 characters never expose 2024 spell references",()=>{
  const character=fixture({known:{all:["fireball"]}});character.ruleset="2014";
  assert.deepEqual(characterActiveSpellReferences(character),[]);
});

test("unknown active spell ids fail closed instead of inventing reference data",()=>{
  assert.throws(()=>characterActiveSpellReferences(fixture({prepared:{all:["definitely-not-an-srd-spell"]}})),/Missing SRD 5\.2\.1 spell reference/);
});
