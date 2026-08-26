const CANTRIPS=Object.freeze([2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4]);
const KNOWN_OR_PREPARED=Object.freeze([2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15]);
const INVOCATIONS_2014=Object.freeze([0,2,2,2,3,3,4,4,5,5,5,6,6,6,7,7,7,8,8,8]);
const INVOCATIONS_2024=Object.freeze([1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10]);
const PACT_SLOTS=Object.freeze([1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4]);
const SLOT_LEVEL=Object.freeze([1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5]);

export function warlockProgressionFor(ruleset,level,subclassId=null){
  try{
    const value=Number(level);
    if(!["2014","2024"].includes(ruleset))throw new Error(`Unsupported Warlock ruleset: ${ruleset}.`);
    if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Warlock level ${level}.`);
    const slotCount=PACT_SLOTS[value-1],slotLevel=SLOT_LEVEL[value-1],fiend=ruleset==="2014"?subclassId==="fiend":subclassId==="fiend-patron";
    const shared={cantrips:CANTRIPS[value-1],slotCount,slotLevel,slots:Object.freeze({[slotLevel]:slotCount}),maxPactSpellLevel:slotLevel,mysticArcanum:Object.freeze(activeArcanum(value)),eldritchMaster:value>=20};
    if(ruleset==="2014")return Object.freeze({...shared,known:KNOWN_OR_PREPARED[value-1],prepared:null,invocations:INVOCATIONS_2014[value-1],pactBoon:value>=3,magicalCunning:false,contactPatron:false,epicBoon:false,darkOnesBlessing:fiend&&value>=1,darkOnesOwnLuck:fiend&&value>=6,fiendishResilience:fiend&&value>=10,hurlThroughHell:fiend&&value>=14,fiendSpells:false});
    return Object.freeze({...shared,known:null,prepared:KNOWN_OR_PREPARED[value-1],invocations:INVOCATIONS_2024[value-1],pactBoon:false,magicalCunning:value>=2,contactPatron:value>=9,epicBoon:value>=19,darkOnesBlessing:fiend&&value>=3,darkOnesOwnLuck:fiend&&value>=6,fiendishResilience:fiend&&value>=10,hurlThroughHell:fiend&&value>=14,fiendSpells:fiend&&value>=3});
  }catch(error){console.error("[warlock] progression lookup failed",error);throw error;}
}

export function warlockMaxPactSpellLevel(level){
  try{const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported Warlock level ${level}.`);return SLOT_LEVEL[value-1];}
  catch(error){console.error("[warlock] max Pact Magic level lookup failed",error);throw error;}
}

export function activeMysticArcanumLevels(level){
  try{const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported Warlock level ${level}.`);return Object.keys(activeArcanum(value)).map(Number);}
  catch(error){console.error("[warlock] Mystic Arcanum level lookup failed",error);throw error;}
}

function activeArcanum(level){
  const out={};if(level>=11)out[6]=1;if(level>=13)out[7]=1;if(level>=15)out[8]=1;if(level>=17)out[9]=1;return out;
}