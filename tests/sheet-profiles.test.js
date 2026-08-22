import test from "node:test";
import assert from "node:assert/strict";
import { SHEET_PROFILES, sheetProfileFor, orderedSheetSections } from "../src/ui/sheet-profiles.js";

const SRD_CLASSES=["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];

test("all twelve SRD classes have explicit character sheet profiles",()=>{
  try{
    assert.deepEqual(Object.keys(SHEET_PROFILES).sort(),[...SRD_CLASSES].sort());
    for(const classId of SRD_CLASSES){const profile=sheetProfileFor(classId);assert.equal(profile.id,classId);assert.ok(profile.theme);assert.ok(profile.primary.length>0);}
  }catch(error){console.error("[test] sheet profile coverage",error);throw error;}
});

test("unknown classes fail closed instead of receiving a generic sheet",()=>{
  try{assert.throws(()=>sheetProfileFor("mystery-class"),/No sheet profile/i);}
  catch(error){console.error("[test] unknown sheet profile",error);throw error;}
});

test("fighter puts attacks ahead of play reference and skills",()=>{
  try{
    const sections=orderedSheetSections({class:{id:"fighter"},ruleset:"2024",spells:null,classResources:[]});
    assert.equal(sections[0],"attacks");
    assert.ok(sections.indexOf("playReference")<sections.indexOf("skills"));
  }catch(error){console.error("[test] fighter sheet hierarchy",error);throw error;}
});

test("wizard puts spellcasting and spell reference before attacks",()=>{
  try{
    const sections=orderedSheetSections({class:{id:"wizard"},ruleset:"2024",spells:{},classResources:[]});
    assert.equal(sections[0],"spellcasting");
    assert.equal(sections[1],"spellReference");
    assert.ok(sections.indexOf("spellReference")<sections.indexOf("attacks"));
  }catch(error){console.error("[test] wizard sheet hierarchy",error);throw error;}
});

test("2014 caster layout omits the 2024 structured spell-reference section",()=>{
  try{
    const sections=orderedSheetSections({class:{id:"cleric"},ruleset:"2014",spells:{},classResources:[]});
    assert.ok(sections.includes("spellcasting"));
    assert.ok(!sections.includes("spellReference"));
  }catch(error){console.error("[test] 2014 sheet reference boundary",error);throw error;}
});

test("class resources appear only when validated resource data exists",()=>{
  try{
    const withoutResources=orderedSheetSections({class:{id:"barbarian"},ruleset:"2024",spells:null,classResources:[]});
    const withResources=orderedSheetSections({class:{id:"barbarian"},ruleset:"2024",spells:null,classResources:[{name:"Rage",value:"2"}]});
    assert.ok(!withoutResources.includes("classResources"));
    assert.equal(withResources[0],"classResources");
  }catch(error){console.error("[test] resource visibility",error);throw error;}
});
