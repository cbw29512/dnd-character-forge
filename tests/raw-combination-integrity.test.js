import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { FORGE_2014, FORGE_2024 } from "../src/data/forge-data.js";
import { generateCharacter } from "../src/rules/generator.js";

const EDITIONS=Object.freeze([
  Object.freeze({ruleset:"2014",data:FORGE_2014}),
  Object.freeze({ruleset:"2024",data:FORGE_2024})
]);
const ABILITIES=Object.freeze(["str","dex","con","int","wis","cha"]);

function rawEligible(items){return items.filter(item=>item?.randomEligible!==false&&item?.contentKind!=="forge-original");}
function criticalLevels(cls){
  const values=[1,Number(cls.subclassLevel||1),4,5,10,19,Number(cls.maxLevel||20)];
  return [...new Set(values.filter(level=>Number.isInteger(level)&&level>=1&&level<=Number(cls.maxLevel||20)))].sort((a,b)=>a-b);
}
function stateFor({ruleset,classId,level,speciesId,backgroundId,subclassId="random"}){
  const state=createInitialState();
  state.ruleset=ruleset;
  state.constraints={...state.constraints,level:String(level),class:classId,subclass:subclassId,species:speciesId,background:backgroundId,name:`RAW audit ${ruleset} ${classId} L${level}`};
  return state;
}
function duplicates(values,key=value=>value){
  const seen=new Set(),dupes=[];
  for(const value of values||[]){const token=key(value);if(seen.has(token))dupes.push(token);else seen.add(token);}
  return dupes;
}
function assertRawCharacter(character,{ruleset,classId,level,speciesId,backgroundId,subclassId=null,data}){
  const label=`${ruleset} ${classId} L${level} ${speciesId}/${backgroundId}${subclassId?` ${subclassId}`:""}`;
  assert.equal(character.ruleset,ruleset,`${label}: ruleset drift`);
  assert.equal(character.class.id,classId,`${label}: class drift`);
  assert.equal(character.level,level,`${label}: level drift`);
  assert.equal(character.species.id,speciesId,`${label}: species drift`);
  assert.equal(character.background.id,backgroundId,`${label}: background drift`);
  if(subclassId)assert.equal(character.subclass?.id,subclassId,`${label}: subclass drift`);

  assert.notEqual(character.background?.contentKind,"forge-original",`${label}: Forge Original background leaked into RAW audit`);
  assert.notEqual(character.subclass?.contentKind,"forge-original",`${label}: Forge Original subclass leaked into RAW audit`);
  assert.equal(character.validation?.valid,true,`${label}: validation failed: ${(character.validation?.errors||[]).join(" | ")}`);
  assert.equal(character.audit?.status,"PASS",`${label}: Rules Audit failed`);
  assert.equal(character.audit?.rawIntegrity,true,`${label}: RAW integrity flag failed`);

  for(const field of ["ac","hp","initiative","speed","passivePerception","proficiency"])
    assert.equal(Number.isFinite(character[field]),true,`${label}: ${field} is not finite`);
  for(const ability of ABILITIES){
    assert.equal(Number.isFinite(character.abilities?.[ability]),true,`${label}: ${ability} score invalid`);
    assert.equal(Number.isFinite(character.saveBonuses?.[ability]),true,`${label}: ${ability} save invalid`);
  }

  assert.deepEqual(duplicates(character.skills),[],`${label}: duplicate skills`);
  assert.deepEqual(duplicates(character.expertise),[],`${label}: duplicate expertise`);
  assert.deepEqual(duplicates(character.languages),[],`${label}: duplicate languages`);
  assert.deepEqual(duplicates(character.toolProficiencies),[],`${label}: duplicate tools`);
  assert.deepEqual(duplicates(character.masteryIds),[],`${label}: duplicate masteries`);
  assert.deepEqual(duplicates(character.feats,feat=>feat.id),[],`${label}: duplicate feats`);
  assert.ok(character.skills.length>=character.class.skillCount,`${label}: class skill count lost through collisions`);
  for(const expertise of character.expertise)assert.ok(character.skills.includes(expertise)||character.toolProficiencies.includes(expertise),`${label}: illegal Expertise ${expertise}`);

  const masteryPool=character.class.masteryChoices?.length?character.class.masteryChoices:Object.keys(data.weapons);
  for(const id of character.masteryIds){
    assert.ok(data.weapons[id],`${label}: unknown mastery weapon ${id}`);
    assert.ok(masteryPool.includes(id),`${label}: mastery ${id} outside verified class pool`);
  }

  assert.ok(Array.isArray(character.attacks),`${label}: attacks missing`);
  for(const attack of character.attacks){
    assert.ok(attack?.name,`${label}: unnamed attack`);
    assert.equal(Number.isFinite(attack.attackBonus),true,`${label}: ${attack.name} attack bonus invalid`);
    assert.equal(Number.isFinite(attack.damageBonus),true,`${label}: ${attack.name} damage bonus invalid`);
  }
  assert.ok(Array.isArray(character.inventory),`${label}: inventory missing`);
  for(const item of character.inventory){
    assert.ok(item&&typeof item==="object",`${label}: unstructured inventory item`);
    assert.ok(String(item.name||"").trim(),`${label}: blank inventory item`);
    assert.ok(Number.isFinite(item.quantity)&&item.quantity>0,`${label}: invalid inventory quantity for ${item.name}`);
  }
}

for(const {ruleset,data} of EDITIONS){
  const species=rawEligible(data.species),backgrounds=rawEligible(data.backgrounds),classes=rawEligible(data.classes),subclasses=rawEligible(data.subclasses);

  test(`${ruleset} RAW class/species/background combinations are valid at critical levels`,()=>{
    let generated=0;
    for(const cls of classes)for(const level of criticalLevels(cls))for(const race of species)for(const background of backgrounds){
      const character=generateCharacter(stateFor({ruleset,classId:cls.id,level,speciesId:race.id,backgroundId:background.id}));
      assertRawCharacter(character,{ruleset,classId:cls.id,level,speciesId:race.id,backgroundId:background.id,data});
      generated++;
    }
    assert.ok(generated>100,`${ruleset}: combination matrix was unexpectedly small`);
  });

  test(`${ruleset} every RAW subclass is valid with every RAW species/background at unlock and cap`,()=>{
    let generated=0;
    for(const subclass of subclasses){
      const cls=classes.find(item=>item.id===subclass.classId);if(!cls)continue;
      const unlock=Math.max(Number(cls.subclassLevel||1),Number(subclass.level||1));
      for(const level of [...new Set([unlock,Number(cls.maxLevel||20)])])for(const race of species)for(const background of backgrounds){
        const character=generateCharacter(stateFor({ruleset,classId:cls.id,level,speciesId:race.id,backgroundId:background.id,subclassId:subclass.id}));
        assertRawCharacter(character,{ruleset,classId:cls.id,level,speciesId:race.id,backgroundId:background.id,subclassId:subclass.id,data});
        generated++;
      }
    }
    assert.ok(generated>50,`${ruleset}: subclass combination matrix was unexpectedly small`);
  });

  test(`${ruleset} default Random generation never selects Forge Original content`,()=>{
    for(const cls of classes)for(const level of [1,Math.min(10,cls.maxLevel),cls.maxLevel])for(let attempt=0;attempt<10;attempt++){
      const state=createInitialState();state.ruleset=ruleset;state.constraints.class=cls.id;state.constraints.level=String(level);
      const character=generateCharacter(state);
      assert.notEqual(character.background?.contentKind,"forge-original",`${ruleset} ${cls.id} L${level}: Random background leak`);
      assert.notEqual(character.subclass?.contentKind,"forge-original",`${ruleset} ${cls.id} L${level}: Random subclass leak`);
      assert.equal(character.audit?.rawIntegrity,true,`${ruleset} ${cls.id} L${level}: Random lost RAW integrity`);
    }
  });
}
