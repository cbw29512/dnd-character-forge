import { SPELL_REFERENCE_2024_BY_ID } from "../data/spell-reference-2024.js";

export function hasSpellReference(ruleset,spellId){
  try{return ruleset==="2024"&&Boolean(SPELL_REFERENCE_2024_BY_ID[spellId]);}
  catch(error){console.error("[spell-reference] coverage check failed",error);throw error;}
}

export function getSpellReference(ruleset,spellId){
  try{if(ruleset!=="2024")return null;const spell=SPELL_REFERENCE_2024_BY_ID[spellId];if(!spell)throw new Error(`Missing SRD 5.2.1 spell reference for ${spellId}.`);return spell;}
  catch(error){console.error("[spell-reference] lookup failed",error);throw error;}
}

export function resolveSpellReference(character,spellId){
  try{const base=getSpellReference(character.ruleset,spellId);if(!base)return null;if(base.level!==0)return{...base,currentEffect:null};return resolveCantripReference(character,spellId);}
  catch(error){console.error("[spell-reference] resolution failed",error);throw error;}
}

export function resolveCantripReference(character,spellId){
  try{const base=getSpellReference(character.ruleset,spellId);if(!base)return null;if(base.level!==0)throw new Error(`${base.name} is not a cantrip.`);const current={...base};if(base.damage?.scales){const dice=tierDice(character.level);current.currentEffect=`${dice}d${base.damage.die} ${base.damage.type} damage`;}else if(base.trueStrikeScaling){const extra=character.level>=17?3:character.level>=11?2:character.level>=5?1:0;current.currentEffect=extra?`Weapon attack + ${extra}d6 Radiant damage`:`Weapon attack; no extra cantrip damage yet`;}else if(base.rangeScaling){const range=character.level>=17?120:character.level>=11?60:character.level>=5?30:15;current.range=`${range} ft`;current.currentEffect=`Stabilize a creature at 0 HP within ${range} ft`;}else current.currentEffect=null;return current;}
  catch(error){console.error("[spell-reference] cantrip resolution failed",error);throw error;}
}

export function activeSpellIds(character){
  try{
    if(!character?.spells)return[];
    const ids=[...(character.spells.cantrips?.all||[])];
    if(character.class.id==="wizard"){
      ids.push(...(character.spells.prepared?.all||[]));
      // 2024 Ritual Adept makes unprepared Ritual-tag spellbook spells usable at the table.
      for(const id of character.spells.spellbook?.all||[]){const ref=SPELL_REFERENCE_2024_BY_ID[id];if(character.ruleset==="2024"&&ref?.ritual)ids.push(id);}
    }else{
      ids.push(...(character.spells.prepared?.all||[]),...(character.spells.alwaysPrepared||[]));
    }
    return[...new Set(ids)];
  }catch(error){console.error("[spell-reference] active spell id resolution failed",error);throw error;}
}

export function missingActiveSpellReferenceIds(character){
  try{if(character.ruleset!=="2024"||!character.spells)return[];return activeSpellIds(character).filter(id=>!hasSpellReference(character.ruleset,id));}
  catch(error){console.error("[spell-reference] missing reference scan failed",error);throw error;}
}

export function characterActiveSpellReferences(character){
  try{
    if(character.ruleset!=="2024"||!character.spells)return[];
    const cantrips=new Set(character.spells.cantrips?.all||[]),always=new Set(character.spells.alwaysPrepared||[]),prepared=new Set(character.spells.prepared?.all||[]),book=new Set(character.spells.spellbook?.all||[]),refs=[];
    for(const id of activeSpellIds(character)){
      if(!hasSpellReference(character.ruleset,id))continue;
      const ref=resolveSpellReference(character,id),preparation=cantrips.has(id)?"Cantrip":always.has(id)?"Always Prepared":prepared.has(id)?"Prepared":book.has(id)&&ref.ritual?"Spellbook · Ritual":"Available";
      refs.push({...ref,preparation});
    }
    return refs;
  }catch(error){console.error("[spell-reference] active references failed",error);throw error;}
}

export function characterCantripReferences(character){try{return characterActiveSpellReferences(character).filter(spell=>spell.level===0);}catch(error){console.error("[spell-reference] character cantrips failed",error);throw error;}}
const tierDice=level=>level>=17?4:level>=11?3:level>=5?2:1;
