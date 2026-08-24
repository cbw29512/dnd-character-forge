import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { bardReferenceProvenance } from "../data/bard-provenance.js";
import { bardMagicalSecretsPool } from "../data/bard-magical-secrets.js";
import { abilityMod } from "./math.js";

export function buildBardQuickReference(character){
  try{
    if(character?.class?.id!=="bard")throw new Error("Bard reference builder received another class.");
    const safe={...character,features:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-spell-recall")},items=[...buildCoreQuickReference(safe)];
    const boon=(character.feats||[]).find(feat=>feat.id==="boon-spell-recall");if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[])items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Bard quick-reference entries detected.");return items;
  }catch(error){console.error("[bard-reference] build failed",error);throw error;}
}

function featureReference(c,name){
  try{
    const p=c.bard,uses=Math.max(1,abilityMod(c.abilities.cha)),refs={
      Spellcasting:rr("Bard","Magic",c.ruleset==="2014"?`Charisma spellcasting. You know ${c.spells?.known?.all?.length||0} level 1+ Bard spells plus ${p.cantrips} cantrips. Slots return after a Long Rest. A known Bard spell with the Ritual tag can be cast as a Ritual. A musical instrument can be your focus.`:`Charisma spellcasting. You have ${p.prepared} normal prepared spells plus feature-granted spells. On gaining a Bard level, one prepared spell can be replaced; Magical Secrets expands that pool from level 10. A musical instrument can be your focus.`),
      "Bardic Inspiration":c.ruleset==="2014"?rr("Bard","Bonus Action",`Another creature within 60 ft that can hear you gains one ${p.bardicInspirationDie} for 10 minutes. It can add the die to an ability check, attack roll, or save before the outcome is declared. ${uses} use${uses===1?"":"s"}; regain after ${p.bardicInspirationRecovery}.`):rr("Bard","Bonus Action",`Another creature within 60 ft that can see or hear you gains one ${p.bardicInspirationDie} for 1 hour. After it fails a D20 Test, it can add the die to the d20. ${uses} use${uses===1?"":"s"}; regain after ${p.bardicInspirationRecovery}.`),
      "Jack of All Trades":c.ruleset==="2014"?rr("Bard","Ability checks","Add half your Proficiency Bonus, rounded down, to an ability check that doesn't already include your Proficiency Bonus."):rr("Bard","Unproficient skill checks","Add half your Proficiency Bonus, rounded down, to a check using a skill proficiency you lack when the check doesn't otherwise use your Proficiency Bonus."),
      "Song of Rest":rr("Bard","Short Rest",`When you or friendly creatures who can hear your performance spend Hit Dice at the end of a Short Rest, each regains an extra ${p.songOfRestDie} Hit Points.`),
      "Bard College":rr("Bard","Subclass","College of Lore grants features at Bard levels 3, 6, and 14."),
      "Bard Subclass":rr("Bard","Subclass","College of Lore grants features at Bard levels 3, 6, and 14."),
      Expertise:rr("Bard","Applied",`Expertise is applied to ${c.expertise.length} skills: ${c.expertise.map(pretty).join(", ")||"none"}.`),
      "Ability Score Improvement":rr("Bard","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunities are already reflected in the ability scores.`),
      "Font of Inspiration":c.ruleset==="2014"?rr("Bard","Recovery","Regain all Bardic Inspiration uses after a Short or Long Rest."):rr("Bard","Recovery / spell slot","Regain all Bardic Inspiration uses after a Short or Long Rest. You can also expend a spell slot with no action to regain one expended use."),
      Countercharm:c.ruleset==="2014"?rr("Bard","Action","Perform until the end of your next turn. You and friendly creatures within 30 ft who can hear you have Advantage on saves against being Frightened or Charmed; the performance ends early if you become Incapacitated or Silenced or end it voluntarily."):rr("Bard","Reaction","When you or a creature within 30 ft fails a save against an effect applying Charmed or Frightened, use your Reaction to cause that save to be rerolled with Advantage."),
      "Magical Secrets":c.ruleset==="2014"?rr("Bard","Spell selection",`At Bard 10, 14, and 18, learn two spells from any class each time. They count as Bard spells and consume normal Spells Known. Current standard secrets: ${spellNames(c,c.spells?.magicalSecrets||[]).join(", ")||"none"}.`):rr("Bard","Prepared spell selection",`From Bard 10, new or replaced prepared spells can come from Bard, Cleric, Druid, or Wizard as allowed by the feature. Current outside-Bard preparations: ${spellNames(c,c.spells?.magicalSecrets||[]).join(", ")||"none"}.`),
      "Superior Inspiration":c.ruleset==="2014"?rr("Bard","Roll Initiative","If you roll Initiative with no Bardic Inspiration uses, regain one."):rr("Bard","Roll Initiative",`If you roll Initiative with fewer than ${p.superiorInspirationFloor} Bardic Inspiration uses, regain uses until you have ${p.superiorInspirationFloor}.`),
      "Epic Boon":rr("Bard","Applied",`Your level-19 Epic Boon is ${c.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`),
      "Words of Creation":rr("Bard","Always prepared","Power Word Heal and Power Word Kill are always prepared. When either is cast, a second creature can be targeted if it is within 10 ft of the first target."),
      "Bonus Proficiencies":rr("College of Lore","Applied",`Three additional skill proficiencies are already applied: ${(c.bardSelections?.loreBonusSkills||[]).map(pretty).join(", ")||"three legal skills"}.`),
      "Cutting Words":c.ruleset==="2014"?rr("College of Lore","Reaction",`When a visible creature within 60 ft makes an attack roll, ability check, or damage roll, expend Bardic Inspiration and subtract your ${p.bardicInspirationDie}. Decide after its roll but before the outcome or damage is resolved; it must hear you and not be immune to Charmed.`):rr("College of Lore","Reaction",`When a visible creature within 60 ft makes a damage roll or succeeds on an ability check or attack roll, expend Bardic Inspiration and subtract your ${p.bardicInspirationDie}, reducing damage or potentially turning success into failure.`),
      "Additional Magical Secrets":rr("College of Lore","Always known",`At Bard 6, learn two spells from any class. They count as Bard spells but don't count against normal Spells Known. Current Lore secrets: ${spellNames(c,c.spells?.loreDiscoveries||[]).join(", ")}.`),
      "Magical Discoveries":rr("College of Lore","Always prepared",`Two qualifying Cleric, Druid, or Wizard spells are always prepared and can be replaced on gaining a Bard level. Current discoveries: ${spellNames(c,c.spells?.loreDiscoveries||[]).join(", ")}.`),
      "Peerless Skill":c.ruleset==="2014"?rr("College of Lore","Ability check","On an ability check, expend Bardic Inspiration and add the die after the d20 roll but before the GM declares success or failure."):rr("College of Lore","Failed check or attack","After failing an ability check or attack roll, expend Bardic Inspiration and add the die to the d20. If the result still fails, the Bardic Inspiration use isn't expended.")
    };
    const ref=refs[name];if(!ref)throw new Error(`Missing Bard play reference for ${name}.`);return ref;
  }catch(error){console.error(`[bard-reference] feature ${name} failed`,error);throw error;}
}
function boonReference(c){return rr("Epic Boon","Casting level 1–4 spell",`The +1 ${pretty(c.epicBoonAbility)} increase and maximum of 30 are already applied. When you cast using a level 1–4 slot, roll 1d4; if the roll equals the slot's level, the slot isn't expended.`);}
function spellNames(c,ids){try{const byId=new Map(bardMagicalSecretsPool(c.ruleset).map(spell=>[spell.id,spell.name]));return(ids||[]).map(id=>byId.get(id)||id);}catch(error){console.error("[bard-reference] spell labels failed",error);throw error;}}
function entry(c,id,name,ref,kind){return{id,name,...ref,source:bardReferenceProvenance(c,kind,name)};}
function rr(category,timing,text){return{category,timing,text};}
function pretty(value){return String(value||"").replace(/([A-Z])/g," $1").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase()).trim();}
