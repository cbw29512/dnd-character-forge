import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function seeded(seed){
  let value=seed>>>0;
  return()=>{value=(value+0x6D2B79F5)>>>0;let t=value;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
}
function constrainedLegacyBard(){
  const state=createInitialState();state.ruleset="2014";state.constraints.level="20";state.constraints.class="bard";state.constraints.subclass="college-lore";state.constraints.species="human";state.constraints.background="acolyte";state.classSelections={instruments:["Lute"]};state.spellSelections={magicalSecrets:["eldritch-blast","hellish-rebuke"]};return state;
}

test("fixed 2014 Bard Magical Secrets survive every deterministic random fill",()=>{
  const original=Math.random;
  try{
    for(let seed=1;seed<=128;seed++){
      Math.random=seeded(seed);
      const character=generateCharacter(constrainedLegacyBard());
      assert.equal(character.validation.valid,true,`seed ${seed} produced an invalid Bard`);
      assert.ok(character.spells.magicalSecrets.includes("eldritch-blast"),`seed ${seed} lost Eldritch Blast`);
      assert.ok(character.spells.magicalSecrets.includes("hellish-rebuke"),`seed ${seed} lost Hellish Rebuke`);
      const buckets=[character.spells.cantrips.all,character.spells.magicalSecrets,character.spells.loreDiscoveries];
      for(let left=0;left<buckets.length;left++)for(let right=left+1;right<buckets.length;right++){
        const overlap=buckets[left].filter(id=>buckets[right].includes(id));assert.deepEqual(overlap,[],`seed ${seed} created cross-bucket overlap: ${overlap.join(", ")}`);
      }
    }
  }catch(error){console.error("[bard-fixed-choice-reservation-test] deterministic reservation gate failed",error);throw error;}
  finally{Math.random=original;}
});
