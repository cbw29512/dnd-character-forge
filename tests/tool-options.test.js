import test from "node:test";
import assert from "node:assert/strict";
import { ARTISAN_TOOLS, MUSICAL_INSTRUMENTS, MONK_TOOL_CHOICES } from "../src/data/tool-options.js";
import { RAW_2014 } from "../src/data/raw-2014.js";
import { RAW_2024 } from "../src/data/raw-2024.js";

test("shared SRD tool catalog contains all artisan tools and instrument variants",()=>{
  assert.equal(ARTISAN_TOOLS.length,17);
  assert.equal(MUSICAL_INSTRUMENTS.length,10);
  assert.equal(MONK_TOOL_CHOICES.length,27);
  assert.equal(new Set(MONK_TOOL_CHOICES).size,27);
  for(const required of ["Alchemist's Supplies","Smith's Tools","Woodcarver's Tools","Bagpipes","Lute","Viol"])assert.ok(MONK_TOOL_CHOICES.includes(required));
});

test("both Monk class records use the shared complete tool catalog",()=>{
  for(const data of [RAW_2014,RAW_2024]){
    const monk=data.classes.find(item=>item.id==="monk");
    assert.ok(monk);
    assert.equal(monk.toolCount,1);
    assert.deepEqual([...monk.toolChoices],[...MONK_TOOL_CHOICES]);
  }
});
