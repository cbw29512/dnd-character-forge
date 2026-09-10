import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { SOURCE } from "../src/schema.js";
import { generateCharacter } from "../src/rules/generator.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { buildNarrativeDossier } from "../src/print/dossier.js";
import { LITERARY_BACKGROUND_IDS } from "../src/print/dossier-background-literary.js";
import { LITERARY_SUBCLASS_IDS } from "../src/print/dossier-subclass-literary-all.js";
import { literarySymbolIds } from "../src/print/dossier-literary-motifs.js";

const backgroundIds=new Set(LITERARY_BACKGROUND_IDS),subclassIds=new Set(LITERARY_SUBCLASS_IDS),symbols=literarySymbolIds();
const backgroundSymbols=new Set(symbols.backgrounds),subclassSymbols=new Set(symbols.subclasses),classSymbols=new Set(symbols.classes);

function make({ruleset="2024",classId="barbarian",subclass="berserker",background="soldier",species="human",level="7",name="Mara Voss",sourceMode=SOURCE.RAW}={}){
  const state=createInitialState();
  state.sourceMode=sourceMode;
  state.ruleset=ruleset;
  state.constraints.level=level;
  state.constraints.class=classId;
  state.constraints.subclass=subclass;
  state.constraints.species=species;
  state.constraints.background=background;
  state.constraints.name=name;
  return generateCharacter(state);
}

test("every supported background, class, and subclass has a dedicated literary identity",()=>{
  for(const data of [FORGE_2014,FORGE_2024]){
    assert.deepEqual(data.backgrounds.map(item=>item.id).filter(id=>!backgroundIds.has(id)),[],`${data.ruleset} backgrounds missing literary profiles`);
    assert.deepEqual(data.backgrounds.map(item=>item.id).filter(id=>!backgroundSymbols.has(id)),[],`${data.ruleset} backgrounds missing story symbols`);
    assert.deepEqual(data.classes.map(item=>item.id).filter(id=>!classSymbols.has(id)),[],`${data.ruleset} classes missing story symbols`);
    assert.deepEqual(data.subclasses.map(item=>item.id).filter(id=>!subclassIds.has(id)),[],`${data.ruleset} subclasses missing literary profiles`);
    assert.deepEqual(data.subclasses.map(item=>item.id).filter(id=>!subclassSymbols.has(id)),[],`${data.ruleset} subclasses missing story symbols`);
  }
});

test("SRD subclasses resolve their actual literary profiles end to end",()=>{
  const champion=buildNarrativeDossier(make({classId:"fighter",subclass:"champion",name:"Dara Holt"}));
  const life=buildNarrativeDossier(make({classId:"cleric",subclass:"life-domain",background:"acolyte",name:"Sera Vale"}));
  assert.match(champion.artDirection.subclass,/martial silhouette|arena|training-ground/i);
  assert.match(champion.backstory.join(" "),/Champion/);
  assert.match(life.artDirection.subclass,/sacred light|healer|holy focus/i);
  assert.match(life.backstory.join(" "),/Life Domain/);
  assert.doesNotMatch(champion.artDirection.subclass,/class-specific gear/i);
});

test("changing only the subclass materially changes tale, psychology, title, hook, and art",()=>{
  const berserker=buildNarrativeDossier(make({subclass:"berserker",sourceMode:SOURCE.HOMEBREW}));
  const tempest=buildNarrativeDossier(make({subclass:"iron-tempest",sourceMode:SOURCE.HOMEBREW}));
  assert.notEqual(berserker.backstory[2],tempest.backstory[2]);
  assert.notEqual(berserker.storyTitle,tempest.storyTitle);
  assert.notEqual(berserker.personality.flaw,tempest.personality.flaw);
  assert.notEqual(berserker.personality.fear,tempest.personality.fear);
  assert.notEqual(berserker.personality.secret,tempest.personality.secret);
  assert.notEqual(berserker.hooks[0],tempest.hooks[0]);
  assert.notEqual(berserker.artDirection.subclass,tempest.artDirection.subclass);
  assert.notEqual(berserker.artDirection.variantKey,tempest.artDirection.variantKey);
  assert.match(berserker.backstory.join(" "),/Path of the Berserker/);
  assert.match(tempest.backstory.join(" "),/Path of the Iron Tempest/);
});

test("changing only the background materially changes formative history and story imagery",()=>{
  const soldier=buildNarrativeDossier(make({background:"soldier",name:"Tarin Vale"}));
  const criminal=buildNarrativeDossier(make({background:"criminal",name:"Tarin Vale"}));
  assert.notEqual(soldier.backstory[0],criminal.backstory[0]);
  assert.notEqual(soldier.backstory[1],criminal.backstory[1]);
  assert.notEqual(soldier.storyTitle,criminal.storyTitle);
  assert.notEqual(soldier.personality.ideal,criminal.personality.ideal);
  assert.notEqual(soldier.artDirection.background,criminal.artDirection.background);
  assert.notEqual(soldier.artDirection.symbolicAnchor,criminal.artDirection.symbolicAnchor);
  assert.match(soldier.backstory.join(" "),/discipline|order|formation|campaign|soldier/i);
  assert.match(criminal.backstory.join(" "),/trust|coin|alley|coded|criminal|loyalt/i);
});

test("compatible background and subclass intersect as one authored premise without claiming RAW",()=>{
  const character=make({classId:"paladin",subclass:"oath-beacon",background:"grave-warden",name:"Elira Venn",sourceMode:SOURCE.HOMEBREW});
  assert.equal(character.audit.rawIntegrity,false);
  const dossier=buildNarrativeDossier(character);
  assert.match(dossier.storyTitle,/Unmarked Grave|Beacon In Smoke/);
  assert.match(dossier.backstory[0],/wet earth|names spoken carefully|burial grounds/i);
  assert.match(dossier.backstory[2],/Oath of the Beacon/);
  assert.match(dossier.backstory[2],/preserve one memory|hope|visible|dangerous and practical/i);
  assert.match(dossier.personality.ideal,/dead cannot defend the truth/i);
  assert.match(dossier.personality.fear,/remain bright|privately exhausted/i);
  assert.match(dossier.personality.secret,/unmarked grave/i);
  assert.match(dossier.hooks[0],/unmarked grave/i);
  assert.match(dossier.hooks[0],/beacon in smoke/i);
  assert.match(dossier.artDirection.symbolicAnchor,/unmarked grave; beacon in smoke/i);
  assert.match(dossier.artDirection.brief,/consequential quiet moment/i);
});

test("literary dossiers remain deterministic, substantial, and rules-isolated",()=>{
  const character=make({classId:"warlock",subclass:"fiend-patron",background:"acolyte",name:"Ilyra Fen"});
  assert.equal(character.validation.valid,true);
  const before=JSON.stringify({ac:character.ac,hp:character.hp,abilities:character.abilities,attacks:character.attacks,features:character.features,validation:character.validation,audit:character.audit});
  const one=buildNarrativeDossier(character),two=buildNarrativeDossier(character);
  assert.deepEqual(one,two);
  assert.equal(one.backstory.length,4);
  for(const [index,paragraph] of one.backstory.entries())assert.ok(paragraph.length>=180,`paragraph ${index+1} is too thin for the literary contract`);
  assert.ok(one.storyTitle?.length>=12);
  assert.ok(one.artDirection?.brief?.length>=200);
  assert.match(one.disclaimer,/does not add or change game rules/i);
  assert.equal(JSON.stringify({ac:character.ac,hp:character.hp,abilities:character.abilities,attacks:character.attacks,features:character.features,validation:character.validation,audit:character.audit}),before);
});
