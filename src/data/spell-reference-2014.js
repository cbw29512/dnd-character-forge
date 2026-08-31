import { SPELL_REFERENCE_2014_GENERATED } from "./spell-reference-2014-generated.js";

const deepFreeze=value=>{
  if(!value||typeof value!=="object"||Object.isFrozen(value))return value;
  for(const nested of Object.values(value))deepFreeze(nested);
  return Object.freeze(value);
};

const byId=new Map();
for(const spell of SPELL_REFERENCE_2014_GENERATED){
  if(byId.has(spell.id))throw new Error(`duplicate generated 2014 spell reference id: ${spell.id}`);
  if(spell.source!=="SRD 5.1")throw new Error(`${spell.id}: unexpected 2014 spell source ${spell.source}.`);
  byId.set(spell.id,deepFreeze({...spell}));
}

export const SPELL_REFERENCE_2014=Object.freeze([...byId.values()]);
export const SPELL_REFERENCE_2014_BY_ID=Object.freeze(Object.fromEntries(SPELL_REFERENCE_2014.map(spell=>[spell.id,spell])));
