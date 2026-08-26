import test from "node:test";
import assert from "node:assert/strict";
import { classSelectionsFromCharacter } from "../src/ui/class-selection-state.js";

test("2014 Warlock reforge restores Pact Boon and every resolved Eldritch Invocation",()=>{
  const character={
    class:{id:"warlock"},
    warlockSelections:{
      pactBoon:{id:"tome",name:"Pact of the Tome"},
      familiarForm:null,
      invocations:{all:["agonizing-blast","book-of-ancient-secrets"]}
    }
  };
  assert.deepEqual(classSelectionsFromCharacter(character),{
    pactBoon:"tome",
    eldritchInvocations:["agonizing-blast","book-of-ancient-secrets"]
  });
});

test("2024 Warlock reforge restores invocation-based pacts without inventing a 2014 Pact Boon",()=>{
  const character={
    class:{id:"warlock"},
    warlockSelections:{
      pactBoon:null,
      familiarForm:"Imp",
      invocations:{all:["pact-of-the-blade","pact-of-the-chain","pact-of-the-tome"]}
    }
  };
  assert.deepEqual(classSelectionsFromCharacter(character),{
    eldritchInvocations:["pact-of-the-blade","pact-of-the-chain","pact-of-the-tome"]
  });
});
