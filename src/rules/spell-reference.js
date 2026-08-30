import { SPELL_REFERENCE_2024_BY_ID } from "../data/spell-reference-2024.js";

export function getSpellReference(ruleset,spellId){
  try{if(ruleset!=="2024")return null;const spell=SPELL_REFERENCE_2024_BY_ID[spellId];if(!spell)throw new Error(`Missing SRD 5.2.1 spell reference for ${spellId}.`);return spell;}
  catch(error){console.error("[spell-reference] lookup failed",error);throw error;}
}
export function resolveSpellReference(character,spellId){
  try{const base=getSpellReference(character.ruleset,spellId);if(!base)return null;if(base.level!==0)return{...base,currentEffect:null};return resolveCantripReference(character,spellId);}
  catch(error){console.error("[spell-reference] resolution failed",error);throw error;}
}
export function resolveCantripReference(character,spellId){
  try{
    const base=getSpellReference(character.ruleset,spellId);if(!base)return null;if(base.level!==0)throw new Error(`${base.name} is not a cantrip.`);const current={...base};
    if(base.beamScaling){const beams=tierDice(character.level);current.currentEffect=`${beams} beam${beams===1?"":"s"}; each beam makes a separate ranged spell attack for 1d${base.damage.die} ${base.damage.type} damage and can target the same or different targets`;}
    else if(base.shillelaghScaling){const die=character.level>=17?"2d6":character.level>=11?"d12":character.level>=5?"d10":"d8";current.currentEffect=`Held Club or Quarterstaff uses your spellcasting ability; weapon damage die ${die}, dealing Force or its normal damage type`;}
    else if(base.damage?.scales){const dice=tierDice(character.level);current.currentEffect=`${dice}d${base.damage.die} ${base.damage.type} damage`;}
    else if(base.trueStrikeScaling){const extra=character.level>=17?3:character.level>=11?2:character.level>=5?1:0;current.currentEffect=extra?`Weapon attack + ${extra}d6 Radiant damage`:`Weapon attack; no extra cantrip damage yet`;}
    else if(base.rangeScaling){const range=character.level>=17?120:character.level>=11?60:character.level>=5?30:15;current.range=`${range} ft`;current.currentEffect=`Stabilize a creature at 0 HP within ${range} ft`;}
    else current.currentEffect=null;return current;
  }
  catch(error){console.error("[spell-reference] cantrip resolution failed",error);throw error;}
}
export function characterActiveSpellReferences(character){
  try{
    if(character?.ruleset!=="2024"||!character?.spells)return[];
    const refs=[],seen=new Set(),spells=character.spells;
    const add=(id,preparation,{cantrip=false}={})=>{
      if(!id||seen.has(id))return;
      const reference=cantrip?resolveCantripReference(character,id):resolveSpellReference(character,id);
      if(!reference)return;
      if(cantrip&&reference.level!==0)throw new Error(`${id} is listed as a cantrip but resolves to level ${reference.level}.`);
      refs.push({...reference,preparation});seen.add(id);
    };
    for(const id of spells.cantrips?.all||[])add(id,"Cantrip",{cantrip:true});
    for(const id of spells.tome?.cantrips||[])add(id,"Pact Tome Cantrip",{cantrip:true});
    for(const id of spells.alwaysPrepared||[])add(id,"Always Prepared");
    for(const id of spells.prepared?.all||[])add(id,"Prepared");
    for(const id of spells.known?.all||[])add(id,"Known");
    for(const id of spells.tome?.rituals||[])add(id,"Pact Tome Ritual");
    for(const id of spells.invocationSpells||[])add(id,"Invocation");
    for(const id of Object.values(spells.mysticArcanum||{}))add(id,"Mystic Arcanum");
    return refs;
  }catch(error){console.error("[spell-reference] active references failed",error);throw error;}
}
export function characterCantripReferences(character){
  try{
    if(character?.ruleset!=="2024"||!character?.spells)return[];
    return (character.spells.cantrips?.all||[]).map(id=>resolveCantripReference(character,id));
  }catch(error){console.error("[spell-reference] character cantrips failed",error);throw error;}
}
const tierDice=level=>level>=17?4:level>=11?3:level>=5?2:1;
