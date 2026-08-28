import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function seeded(seed){
  let value=seed>>>0;
  return()=>{value=(value+0x6D2B79F5)>>>0;let t=value;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
}

function fixedLoreHuman(){
  const state=createInitialState();state.ruleset="2024";state.constraints.level="3";state.constraints.class="bard";state.constraints.subclass="college-lore";state.constraints.species="human";state.constraints.background="sage";state.classSelections={classSkills:["deception","persuasion"],loreBonusSkills:["nature","religion"],expertise:["deception","history"]};return state;
}

test("random Human Skillful never consumes a fixed College of Lore proficiency",()=>{
  const original=Math.random;
  try{
    for(let seed=1;seed<=128;seed++){
      Math.random=seeded(seed);
      const character=generateCharacter(fixedLoreHuman());
      assert.equal(character.validation.valid,true,`seed ${seed} produced an invalid Bard`);
      assert.equal(character.audit.rawIntegrity,true,`seed ${seed} failed RAW integrity`);
      assert.ok(character.bardSelections.loreBonusSkills.includes("nature"),`seed ${seed} lost fixed Lore Nature`);
      assert.ok(character.bardSelections.loreBonusSkills.includes("religion"),`seed ${seed} lost fixed Lore Religion`);
      assert.ok(!["nature","religion"].includes(character.speciesChoices.skill),`seed ${seed} let Human Skillful consume fixed Lore skill ${character.speciesChoices.skill}`);
    }
  }catch(error){console.error("[bard-species-lore-reservation-test] reservation gate failed",error);throw error;}
  finally{Math.random=original;}
});
