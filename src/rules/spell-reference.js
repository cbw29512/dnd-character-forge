import { SPELL_REFERENCE_2024, SPELL_REFERENCE_2024_BY_ID } from "../data/spell-reference-2024.js";
import { speciesMagic } from "./species.js";

const normalizeSpellName=value=>String(value||"").replace(/’/g,"'").trim().toLowerCase();
const SPELL_ID_BY_NAME=Object.freeze(Object.fromEntries(SPELL_REFERENCE_2024.map(spell=>[normalizeSpellName(spell.name),spell.id])));

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
    if(character?.ruleset!=="2024")return[];
    const refs=[],seen=new Set(),spells=character.spells||{};
    const add=(id,preparation,{cantrip=false,castingAbility=null,grantSource=null}={})=>{
      if(!id||seen.has(id))return;
      const reference=cantrip?resolveCantripReference(character,id):resolveSpellReference(character,id);
      if(!reference)return;
      if(cantrip&&reference.level!==0)throw new Error(`${id} is listed as a cantrip but resolves to level ${reference.level}.`);
      refs.push({...reference,preparation,castingAbility,grantSource});seen.add(id);
    };
    const addName=(name,preparation,options={})=>{
      if(!name)return;
      const id=SPELL_ID_BY_NAME[normalizeSpellName(name)];
      if(!id)throw new Error(`Missing SRD 5.2.1 spell reference for granted spell ${name}.`);
      add(id,preparation,options);
    };

    for(const id of spells.cantrips?.all||[])add(id,"Cantrip",{cantrip:true,grantSource:"class"});
    for(const id of spells.tome?.cantrips||[])add(id,"Pact Tome Cantrip",{cantrip:true,grantSource:"warlock"});
    for(const id of spells.alwaysPrepared||[])add(id,"Always Prepared",{grantSource:"class"});
    for(const id of spells.prepared?.all||[])add(id,"Prepared",{grantSource:"class"});
    for(const id of spells.known?.all||[])add(id,"Known",{grantSource:"class"});
    for(const id of spells.tome?.rituals||[])add(id,"Pact Tome Ritual",{grantSource:"warlock"});
    for(const id of spells.invocationSpells||[])add(id,"Invocation",{grantSource:"warlock"});
    for(const id of Object.values(spells.mysticArcanum||{}))add(id,"Mystic Arcanum",{grantSource:"warlock"});

    const innate=speciesMagic(character);
    if(innate){
      for(const name of innate.cantrips||[])addName(name,"Species Cantrip",{cantrip:true,castingAbility:innate.ability,grantSource:"species"});
      for(const name of innate.spells||[])addName(name,"Species Magic",{castingAbility:innate.ability,grantSource:"species"});
    }

    const initiates=character.magicInitiates?.length?character.magicInitiates:(character.magicInitiate?[character.magicInitiate]:[]);
    for(const magic of initiates){
      const source=magic.source||"feat",ability=magic.spellcastingAbility||null;
      for(const id of magic.cantrips||[])add(id,"Magic Initiate Cantrip",{cantrip:true,castingAbility:ability,grantSource:source});
      if(magic.level1Spell)add(magic.level1Spell,"Magic Initiate · Always Prepared",{castingAbility:ability,grantSource:source});
    }
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
