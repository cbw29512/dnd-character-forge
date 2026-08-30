import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { warlockInvocationById } from "../data/warlock-invocations.js";
import { warlockSpellById } from "../data/warlock-spells.js";
import { warlockReferenceProvenance } from "../data/warlock-provenance.js";

export function buildWarlockQuickReference(character){
  try{
    if(character?.class?.id!=="warlock")throw new Error("Warlock reference builder received another class.");
    const safe={...character,features:[]},items=[...buildCoreQuickReference(safe)];
    for(const name of character.features||[])items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));
    const invocations=character.warlockSelections?.invocations?.all||[],targets=new Map((character.warlockSelections?.invocationCantripTargets||[]).map(record=>[record.slot,record.targetCantrip])),lessons=[...(character.warlockSelections?.lessonsOriginFeats||[])],seen=new Map();let lessonIndex=0;
    for(const [slot,id] of invocations.entries()){
      const option=warlockInvocationById(character.ruleset,id),occurrence=(seen.get(id)||0)+1;seen.set(id,occurrence);const refId=`invocation:${id}${occurrence===1?"":`#${occurrence}`}`;let name=option.name,text=option.summary;
      const target=targets.get(slot);if(target){const spell=warlockSpellById(character.ruleset,target);name=`${option.name} — ${spell.name}`;text=`${option.summary} Selected cantrip: ${spell.name}.`;}
      if(id==="lessons-of-the-first-ones"){const grant=lessons[lessonIndex++];if(grant){name=`${option.name} — ${grant.name}`;text=`${option.summary} This copy grants ${grant.name}.`;}}
      items.push(entry(character,refId,name,{category:"Eldritch Invocation",timing:option.timing,text},"invocation",option.name));
    }
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Warlock quick-reference entries detected.");return items;
  }catch(error){console.error("[warlock-reference] build failed",error);throw error;}
}
function featureReference(c,name){
  try{
    if(name==="Pact Magic")return rr("Warlock","Magic",`Charisma spellcasting. Spell save DC ${c.spells?.saveDc}; spell attack +${c.spells?.attackBonus}. You have ${c.spells?.pactMagic?.slotCount} Pact Magic slot${c.spells?.pactMagic?.slotCount===1?"":"s"}, each level ${c.spells?.pactMagic?.slotLevel}; regain them after a Short or Long Rest.`);
    if(name==="Eldritch Invocations")return rr("Warlock","Passive / varies",`${c.warlock?.invocations||0} invocation choice${c.warlock?.invocations===1?"":"s"} are listed separately with their play timing and prerequisites already validated.`);
    if(name==="Otherworldly Patron")return rr("Warlock","Subclass","The Fiend is your patron; its subclass features are listed separately at the Warlock levels where they apply.");
    if(name==="Warlock Subclass")return rr("Warlock","Subclass","Fiend Patron grants subclass features at Warlock levels 3, 6, 10, and 14.");
    if(name.startsWith("Pact Boon:"))return pactBoonReference(c);
    if(name==="Magical Cunning")return rr("Warlock","1 minute · once per Long Rest",`Regain expended Pact Magic slots up to half your maximum, rounded up (${Math.ceil((c.warlock?.slotCount||0)/2)} at this level).`);
    if(name==="Contact Patron")return rr("Warlock","Once per Long Rest","Contact Other Plane is always prepared. Cast it once without a slot to contact your patron and automatically succeed on the spell's saving throw.");
    if(name==="Mystic Arcanum")return rr("Warlock","Once each per Long Rest",`Cast each listed Mystic Arcanum once without a spell slot. Current arcanum levels: ${Object.keys(c.spells?.mysticArcanum||{}).join(", ")||"none"}.`);
    if(name==="Eldritch Master")return c.ruleset==="2014"?rr("Warlock","1 minute · once per Long Rest","Entreat your patron for 1 minute to regain all expended Pact Magic slots."):rr("Warlock","Magical Cunning upgrade","When you use Magical Cunning, regain all expended Pact Magic slots instead of only half your maximum.");
    if(name==="Ability Score Improvement")return rr("Warlock","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunities are already reflected in the ability scores.`);
    if(name==="Epic Boon")return rr("Warlock","Applied",`Your level-19 Epic Boon is ${c.feats?.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`);
    if(name==="Dark One's Blessing"){const amount=Math.max(1,(c.abilities?.cha!=null?Math.floor((c.abilities.cha-10)/2):0)+c.level);return c.ruleset==="2014"?rr("The Fiend","When you reduce a hostile creature to 0 HP",`Gain ${amount} Temporary Hit Points (Charisma modifier + Warlock level, minimum 1).`):rr("Fiend Patron","Enemy reduced to 0 HP",`Gain ${amount} Temporary Hit Points when an enemy drops to 0 HP, including when another creature drops an enemy within 10 feet of you.`);}
    if(name==="Fiend Spells")return rr("Fiend Patron","Always prepared","Fiend Spells are always prepared at the listed Warlock levels and do not consume your normal prepared-spell count; they appear on the spell page.");
    if(name==="Dark One's Own Luck")return c.ruleset==="2014"?rr("The Fiend","After an ability check or saving throw · once per Short/Long Rest","Add 1d10 after seeing the d20 result but before the outcome is resolved."):rr("Fiend Patron","After an ability check or saving throw",`Add 1d10 after seeing the d20 result but before the outcome. Uses per Long Rest equal your Charisma modifier, minimum 1.`);
    if(name==="Fiendish Resilience")return c.ruleset==="2014"?rr("The Fiend","After Short or Long Rest","Choose a damage type and gain resistance until you choose again; damage from magical weapons or silver weapons bypasses this resistance."):rr("Fiend Patron","After Short or Long Rest","Choose a damage type other than Force and gain resistance to it until you choose again.");
    if(name==="Hurl Through Hell")return c.ruleset==="2014"?rr("The Fiend","Attack hit · once per Long Rest","After you hit a creature, banish it through a nightmarish realm until the end of your next turn; a non-fiend takes 10d10 Psychic damage when it returns."):rr("Fiend Patron","Once per turn after attack hit","Force a Charisma save; on failure the target vanishes until the end of your next turn and is Incapacitated, taking 8d10 Psychic damage on return if it isn't a Fiend. Restore the use after a Long Rest or by expending a Pact Magic slot.");
    throw new Error(`Missing Warlock play reference for ${name}.`);
  }catch(error){console.error(`[warlock-reference] feature ${name} failed`,error);throw error;}
}
function pactBoonReference(c){
  try{const boon=c.warlockSelections?.pactBoon?.id;if(boon==="chain")return rr("Pact Boon","Familiar","You know Find Familiar as a ritual with additional familiar forms. When you take the Attack action, you can forgo one attack so your familiar can attack with its Reaction.");if(boon==="blade")return rr("Pact Boon","Action / 1-hour ritual","Create a pact weapon in your empty hand or bond a magic weapon by ritual. You are proficient with the pact weapon, and it counts as magical for overcoming resistance and immunity.");if(boon==="tome")return rr("Pact Boon","Book of Shadows","Your Book of Shadows grants three cantrips chosen from any class's spell list; they don't count against Warlock cantrips and count as Warlock spells for you.");throw new Error("2014 Pact Boon selection is missing.");}catch(error){console.error("[warlock-reference] Pact Boon failed",error);throw error;}
}
function entry(c,id,name,ref,kind,sourceName=name){try{return{id,name,...ref,source:warlockReferenceProvenance(c,kind,sourceName)};}catch(error){console.error(`[warlock-reference] entry ${name} failed`,error);throw error;}}
function rr(category,timing,text){return Object.freeze({category,timing,text});}
