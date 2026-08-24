// Sorcerer state is table-driven so edition differences cannot silently bleed together.
const FULL_CASTER_SLOTS=Object.freeze({
  1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},
  11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},
  17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}
});
const CANTRIPS_2014=Object.freeze([4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6]);
const KNOWN_2014=Object.freeze([2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15]);
const CANTRIPS_2024=Object.freeze([4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6]);
const PREPARED_2024=Object.freeze([2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22]);
const SLOT_CREATION_COSTS=Object.freeze({1:2,2:3,3:5,4:6,5:7});
const SLOT_CREATION_MIN_LEVEL_2024=Object.freeze({1:2,2:3,3:5,4:7,5:9});

export function sorcererProgressionFor(ruleset,level,subclassId=null){
  try{
    const value=Number(level);
    if(!["2014","2024"].includes(ruleset))throw new Error(`Unsupported Sorcerer ruleset: ${ruleset}.`);
    if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Sorcerer level ${level}.`);
    const draconic2014=subclassId==="draconic-bloodline",draconic2024=subclassId==="draconic-sorcery";
    const shared={sorceryPoints:value>=2?value:0,slots:Object.freeze({...FULL_CASTER_SLOTS[value]}),maxSpellLevel:maxSorcererSpellLevel(value)};
    if(ruleset==="2014")return Object.freeze({...shared,
      cantrips:CANTRIPS_2014[value-1],known:KNOWN_2014[value-1],prepared:null,metamagicCount:value<3?0:value<10?2:value<17?3:4,
      innateSorcery:false,sorcerousRestoration:value>=20,sorcerousRestorationAmount:value>=20?4:0,sorceryIncarnate:false,epicBoon:false,arcaneApotheosis:false,
      draconicResilience:draconic2014&&value>=1,draconicHpBonus:draconic2014?value:0,draconicArmorFormula:draconic2014?"13 + DEX":null,dragonAncestor:draconic2014,
      elementalAffinity:draconic2014&&value>=6,dragonWings:draconic2014&&value>=14,draconicPresence:draconic2014&&value>=18,dragonCompanion:false,draconicSpells:false
    });
    return Object.freeze({...shared,
      cantrips:CANTRIPS_2024[value-1],known:null,prepared:PREPARED_2024[value-1],metamagicCount:value<2?0:value<10?2:value<17?4:6,
      innateSorcery:value>=1,innateSorceryUses:value>=1?2:0,sorcerousRestoration:value>=5,sorcerousRestorationAmount:value>=5?Math.floor(value/2):0,sorceryIncarnate:value>=7,epicBoon:value>=19,arcaneApotheosis:value>=20,
      draconicResilience:draconic2024&&value>=3,draconicHpBonus:draconic2024&&value>=3?value:0,draconicArmorFormula:draconic2024&&value>=3?"10 + DEX + CHA":null,dragonAncestor:false,
      draconicSpells:draconic2024&&value>=3,elementalAffinity:draconic2024&&value>=6,dragonWings:draconic2024&&value>=14,draconicPresence:false,dragonCompanion:draconic2024&&value>=18
    });
  }catch(error){console.error("[sorcerer] progression lookup failed",error);throw error;}
}

export function maxSorcererSpellLevel(level){
  try{const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported Sorcerer level ${level}.`);return Math.min(9,Math.ceil(value/2));}
  catch(error){console.error("[sorcerer] max spell level lookup failed",error);throw error;}
}

export function sorcererSlotCreation(ruleset,slotLevel){
  try{
    const level=Number(slotLevel);if(!["2014","2024"].includes(ruleset))throw new Error(`Unsupported Sorcerer ruleset: ${ruleset}.`);if(!Number.isInteger(level)||!SLOT_CREATION_COSTS[level])throw new Error(`Sorcerer cannot create spell slot level ${slotLevel}.`);
    return Object.freeze({slotLevel:level,cost:SLOT_CREATION_COSTS[level],minimumSorcererLevel:ruleset==="2024"?SLOT_CREATION_MIN_LEVEL_2024[level]:null});
  }catch(error){console.error("[sorcerer] slot creation lookup failed",error);throw error;}
}
