import assert from "node:assert/strict";
import test from "node:test";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { buildNarrativeDossier } from "../src/print/dossier.js";
import { LITERARY_SCENE_IDS } from "../src/print/dossier-background-scenes.js";
import { renderPremiumPrintSheet } from "../src/ui/premium-print.js";

const sceneIds=new Set(LITERARY_SCENE_IDS);
const FORBIDDEN=["undefined","[object Object]","old keepsake","class-specific gear","earlier life left unresolved","road dust, smoke, worn leather"];

function make({ruleset="2024",classId="fighter",subclass="champion",species="human",background="soldier",name="Quality Witness",level=7}={}){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints.level=String(level);
  state.constraints.class=classId;
  state.constraints.subclass=subclass;
  state.constraints.species=species;
  state.constraints.background=background;
  state.constraints.name=name;
  const character=generateCharacter(state);
  assert.equal(character.validation.valid,true,`${ruleset}/${classId}/${subclass}/${species}/${background}/L${level} fixture invalid`);
  return character;
}

function dossierText(dossier){
  return [
    dossier.storyTitle,dossier.subtitle,...dossier.backstory,
    dossier.personality.trait,dossier.personality.ideal,dossier.personality.bond,dossier.personality.flaw,
    dossier.personality.fear,dossier.personality.secret,...dossier.personality.mannerisms,
    ...dossier.personality.likes,...dossier.personality.dislikes,...dossier.appearance,...dossier.hooks,
    dossier.roleplay.quote,dossier.roleplay.guidance,dossier.artDirection?.brief,dossier.artDirection?.symbolicAnchor
  ].filter(Boolean).join(" ");
}

function assertClean(dossier,label){
  const text=dossierText(dossier);
  for(const marker of FORBIDDEN)assert.doesNotMatch(text,new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"),`${label} leaked ${marker}`);
  assert.ok(dossier.storyTitle.length>=12,`${label} missing literary title`);
  assert.equal(dossier.backstory.length,4,`${label} wrong paragraph count`);
  assert.ok(dossier.artDirection?.variantKey,`${label} missing portrait variant`);
  assert.ok(dossier.artDirection?.backgroundSymbol,`${label} missing background symbol`);
  assert.ok(dossier.artDirection?.pathSymbol,`${label} missing path symbol`);
}

test("every supported background has an authored turning-point scene and clean dossier",()=>{
  for(const data of [FORGE_2014,FORGE_2024]){
    for(const background of data.backgrounds){
      assert.ok(sceneIds.has(background.id),`${data.ruleset}/${background.id} missing literary scene bank`);
      const fighter=data.classes.find(item=>item.id==="fighter");
      const subclass=data.subclasses.find(item=>item.classId==="fighter");
      const level=Math.max(Number(fighter?.subclassLevel||1),Number(subclass?.level||1),7);
      const dossier=buildNarrativeDossier(make({ruleset:data.ruleset,classId:"fighter",subclass:subclass?.id,background:background.id,name:`Witness ${background.id}`,level}));
      assertClean(dossier,`${data.ruleset}/${background.id}`);
    }
  }
});

test("every supported subclass resolves clean literary output through the certified legal baseline",()=>{
  for(const data of [FORGE_2014,FORGE_2024]){
    for(const subclass of data.subclasses){
      const cls=data.classes.find(item=>item.id===subclass.classId);
      assert.ok(cls,`${data.ruleset}/${subclass.id} missing owning class`);
      const level=Math.max(Number(cls.subclassLevel||1),Number(subclass.level||1));
      assert.ok(level<=Number(cls.maxLevel||20),`${data.ruleset}/${subclass.id} unlock exceeds class max level`);
      const character=make({ruleset:data.ruleset,classId:subclass.classId,subclass:subclass.id,species:data.species[0].id,background:data.backgrounds[0].id,name:`Witness ${subclass.id}`,level});
      const dossier=buildNarrativeDossier(character);
      assertClean(dossier,`${data.ruleset}/${subclass.id}`);
      assert.equal(character.subclass?.id,subclass.id,`${data.ruleset}/${subclass.id} subclass drift`);
      assert.match(dossier.backstory.join(" "),new RegExp(subclass.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"),`${subclass.id} name absent from its own story`);
    }
  }
});

test("background scene banks provide deterministic variety rather than one repeated rupture",()=>{
  const stories=["Elira One","Elira Two","Elira Three","Elira Four"].map(name=>buildNarrativeDossier(make({classId:"paladin",subclass:"oath-beacon",background:"grave-warden",name})).backstory[1]);
  assert.ok(new Set(stories).size>=2,"grave-warden scene bank did not vary across deterministic seeds");
  for(const story of stories)assert.match(story,/burial|grave|headstone|cemetery|stones|plot|paupers/i);
});

test("printed fallback portrait carries the exact story variant and both motifs",()=>{
  const character=make({classId:"paladin",subclass:"oath-beacon",background:"grave-warden",name:"Elira Venn"});
  character.presentation={...(character.presentation||{}),sheetCustomization:{packetMode:"deluxe"}};
  const target={innerHTML:""};
  const model=renderPremiumPrintSheet(character,target);
  assert.equal(model.dossier.artDirection.variantKey,"grave-warden--oath-beacon");
  assert.match(target.innerHTML,/data-portrait-variant="grave-warden--oath-beacon"/);
  assert.match(target.innerHTML,/ps-narrative-origin">unmarked grave</);
  assert.match(target.innerHTML,/ps-narrative-path">beacon in smoke</);
});
