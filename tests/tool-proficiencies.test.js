import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/state.js";
import { generateCharacter } from "../src/rules/generator.js";

function monk(background){const state=createInitialState();state.ruleset="2024";state.constraints.class="monk";state.constraints.level="1";state.constraints.background=background;return generateCharacter(state);}

test("2024 Monk class package adds only the class-selected tool",()=>{
  for(const background of ["criminal","soldier"]){
    for(let i=0;i<100;i++){
      const character=monk(background),classTool=character.tools.find(tool=>character.class.toolChoices.includes(tool));
      assert.ok(classTool);
      const classInventory=character.inventory.find(item=>item.name===classTool);assert.ok(classInventory);assert.equal(classInventory.quantity,1);
      const backgroundTool=character.background.tool,backgroundInventory=character.inventory.find(item=>item.name===backgroundTool);assert.ok(backgroundInventory);assert.equal(backgroundInventory.quantity,1);
    }
  }
});

test("Criminal Monk owns one Thieves' Tools set rather than duplicating it",()=>{
  for(let i=0;i<100;i++){const character=monk("criminal"),tools=character.inventory.filter(item=>item.name==="Thieves' Tools");assert.equal(tools.length,1);assert.equal(tools[0].quantity,1);}
});
