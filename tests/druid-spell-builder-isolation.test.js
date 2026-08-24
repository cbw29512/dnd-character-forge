import test from "node:test";
import assert from "node:assert/strict";
import { buildDruidSpellcasting } from "../src/rules/druid-spellcasting.js";
import { druidProgressionFor, resolveDruidSelections } from "../src/rules/druid.js";
import { DRUID_SPELLS_2024 } from "../src/data/druid-spells.js";

function bareDruid(primalOrder="magician",circleLand="temperate"){
  const level=20,subclass={id:"circle-land",name:"Circle of the Land"},druidSelections=resolveDruidSelections("2024",level,subclass.id,{primalOrder,circleLand,elementalFury:"potent-spellcasting",knownForms:["rat","riding-horse","spider","wolf","black-bear","reef-shark","brown-bear","pteranodon"]});
  return{ruleset:"2024",level,class:{id:"druid",name:"Druid",spellcasting:"druid"},subclass,abilities:{wis:20},proficiency:6,druid:druidProgressionFor("2024",level,subclass.id),druidSelections};
}

test("2024 Druid spell builder never puts Circle cantrips in normal Magician cantrips",()=>{
  const baseCantrips=new Set(DRUID_SPELLS_2024.filter(spell=>spell.level===0).map(spell=>spell.id));
  for(const land of ["arid","polar","temperate","tropical"]){
    for(const order of ["magician","warden"]){
      for(let i=0;i<100;i++){
        const spells=buildDruidSpellcasting(bareDruid(order,land),{}),cantrips=spells.cantrips.all,always=spells.alwaysPrepared;
        assert.equal(cantrips.length,order==="magician"?5:4,`${order}/${land} cantrip count`);
        for(const id of cantrips)assert.ok(baseCantrips.has(id),`${order}/${land} leaked non-list cantrip ${id}`);
        assert.deepEqual(cantrips.filter(id=>always.includes(id)),[],`${order}/${land} overlapped Circle cantrip`);
      }
    }
  }
});
