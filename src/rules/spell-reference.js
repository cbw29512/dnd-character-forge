import { SPELL_REFERENCE_2024_BY_ID } from "../data/spell-reference-2024.js";

export function getSpellReference(ruleset,spellId){
  try{
    if(ruleset!=="2024")return null;
    const spell=SPELL_REFERENCE_2024_BY_ID[spellId];if(!spell)throw new Error(`Missing SRD 5.2.1 spell reference for ${spellId}.`);return spell;
  }catch(error){console.error("[spell-reference] lookup failed",error);throw error;}
}
export function resolveCantripReference(character,spellId){
  try{
    const base=getSpellReference(character.ruleset,spellId);if(!base)return null;const current={...base};
    if(base.damage?.scales){const dice=tierDice(character.level);current.currentEffect=`${dice}d${base.damage.die} ${base.damage.type} damage`;}else if(base.trueStrikeScaling){const extra=character.level>=17?3:character.level>=11?2:character.level>=5?1:0;current.currentEffect=extra?`Weapon attack + ${extra}d6 Radiant damage`:`Weapon attack; no extra cantrip damage yet`;}else if(base.rangeScaling){const range=character.level>=17?120:character.level>=11?60:character.level>=5?30:15;current.range=`${range} ft`;current.currentEffect=`Stabilize a creature at 0 HP within ${range} ft`;}else current.currentEffect=null;
    return current;
  }catch(error){console.error("[spell-reference] cantrip resolution failed",error);throw error;}
}
export function characterCantripReferences(character){
  try{if(character.ruleset!=="2024"||!character.spells)return[];return character.spells.cantrips.all.map(id=>resolveCantripReference(character,id));}
  catch(error){console.error("[spell-reference] character cantrips failed",error);throw error;}
}
const tierDice=level=>level>=17?4:level>=11?3:level>=5?2:1;
