import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { MASTERY_REFERENCE, REFERENCE_2014, REFERENCE_2024 } from "../data/quick-reference.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { RANGER_DRUIDIC_WARRIOR_CANTRIPS_2024 } from "../data/ranger-spells.js";
import { rangerReferenceProvenance } from "../data/ranger-provenance.js";
import { referenceProvenance } from "../data/rule-provenance.js";

export function buildRangerQuickReference(character){
  try{
    if(character?.class?.id!=="ranger")throw new Error("Ranger reference builder received another class.");
    const safe={...character,features:[],fightingStyle:null,fightingStyles:[],masteryIds:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-dimensional-travel")},items=[...buildCoreQuickReference(safe)];
    for(const style of character.fightingStyles||[])items.push(entry(character,`style:${style.name}`,style.name,styleReference(character,style),"style"));
    const boon=(character.feats||[]).find(feat=>feat.id==="boon-dimensional-travel");if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[]){if(name==="Fighting Style"||name.startsWith("Fighting Style:"))continue;items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));}
    for(const mastery of masteryEntries(character))items.push(mastery);
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Ranger quick-reference entries detected.");return items;
  }catch(error){console.error("[ranger-reference] build failed",error);throw error;}
}

function featureReference(c,name){
  try{
    const p=c.ranger,s=c.rangerSelections||{},refs={
      "Favored Enemy":c.ruleset==="2014"?rr("Ranger","Exploration",`Favored enemies: ${(s.favoredEnemies||[]).map(pretty).join(", ")}. You have Advantage on Wisdom (Survival) checks to track them and on Intelligence checks to recall information about them.${s.favoredEnemyLanguages?.length?` Associated languages: ${s.favoredEnemyLanguages.join(", ")}.`:""}`):rr("Ranger","Hunter's Mark",`Hunter's Mark is always prepared and doesn't count against your normal prepared spells. Cast it ${p.hunterMarkFreeCasts} times without a spell slot per Long Rest; you can also cast it with spell slots. Its extra damage die is ${p.hunterMarkDie}.`),
      "Natural Explorer":rr("Ranger","Favored terrain",`Favored terrain: ${(s.naturalExplorerTerrains||[]).map(pretty).join(", ")}. In favored terrain, double Proficiency Bonus on proficient Intelligence/Wisdom checks related to it. While traveling an hour or more there, difficult terrain doesn't slow the group, the group can't become lost except by magic, you remain alert while doing another travel activity, you can move stealthily at normal pace while alone, forage twice as much food, and learn extra details while tracking.`),
      Spellcasting:rr("Ranger","Magic",c.ruleset==="2014"?`Wisdom spellcasting. You know ${p.known} Ranger spell${p.known===1?"":"s"} at this level and regain expended spell slots after a Long Rest. When gaining a Ranger level, you can replace one known Ranger spell with another spell you can cast.`:`Wisdom spellcasting. Prepare ${p.prepared} normal Ranger spells at this level; Hunter's Mark is additional and always prepared. After a Long Rest, you can replace one prepared Ranger spell with another Ranger spell for which you have slots.`),
      "Primeval Awareness":rr("Ranger","Action · spend Ranger spell slot",`For ${c.spells?"1 minute per level of the slot spent":"1 minute per spell-slot level"}, sense whether aberrations, celestials, dragons, elementals, fey, fiends, or