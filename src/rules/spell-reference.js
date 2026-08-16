import { SPELL_REFERENCE_2024_BY_ID } from "../data/spell-reference-2024.js";
import { CLERIC_SPELLS_2024 } from "../data/cleric-spells.js";

const CLERIC_LEVEL1_IDS=new Set(CLERIC_SPELLS_2024.filter(spell=>spell.level===1).map(spell=>spell.id));
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
export function characterActiveSpellReferences(character){
  try{
    if(character.ruleset!=="2024"||!character.spells)return[];
    const refs=character.spells.cantrips.all.map(id=>({...resolveCantripReference(character,id),preparation:"Cantrip"}));
    if(character.class.id!=="cleric")return refs;
    const always=new Set(character.spells.alwaysPrepared||[]),prepared=new Set(character.spells.prepared?.all||[]),active=[...new Set([...always,...prepared])];
    for(const id of active){if(!CLERIC_LEVEL1_IDS.has(id))continue;const ref=resolveSpellReference(character,id);refs.push({...ref,preparation:always.has(id)?"Always Prepared":"Prepared"});}
    return refs;
  }catch(error){console.error("[spell-reference] active references failed",error);throw error;}
}
export function characterCantripReferences(character){try{return characterActiveSpellReferences(character).filter(spell=>spell.level===0);}catch(error){console.error("[spell-reference] character cantrips failed",error);throw error;}}
const tierDice=level=>level>=17?4:level>=11?3:level>=5?2:1;
