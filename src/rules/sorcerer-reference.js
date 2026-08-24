import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { sorcererReferenceProvenance } from "../data/sorcerer-provenance.js";
import { metamagicById } from "../data/sorcerer-metamagic.js";

export function buildSorcererQuickReference(character){
  try{
    if(character?.class?.id!=="sorcerer")throw new Error("Sorcerer reference builder received another class.");
    const safe={...character,features:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-dimensional-travel")};
    const items=[...buildCoreQuickReference(safe)],boon=(character.feats||[]).find(feat=>feat.id==="boon-dimensional-travel");
    if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[])items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));
    for(const id of character.sorcererSelections?.metamagic?.all||[]){const option=metamagicById(character.ruleset,id);items.push(entry(character,`metamagic:${id}`,option.name,metamagicReference(character,option),"metamagic"));}
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Sorcerer quick-reference entries detected.");return items;
  }catch(error){console.error("[sorcerer-reference] build failed",error);throw error;}
}

function featureReference(c,name){
  try{const ref=(c.ruleset==="2014"?legacy(c):revised(c))[name];if(!ref)throw new Error(`Missing Sorcerer play reference for ${name}.`);return ref;}
  catch(error){console.error(`[sorcerer-reference] feature ${name} failed`,error);throw error;}
}

function shared(c){
  try{return{
    Spellcasting:rr("Sorcerer","Spellcasting",`Charisma spellcasting. Spell save DC ${c.spells?.saveDc}; spell attack bonus +${c.spells?.attackBonus}. Spell slots and legal Sorcerer spell selections are listed on the spell page.`),
    "Ability Score Improvement":rr("Sorcerer","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunities are already reflected in the ability scores.`),
    "Elemental Affinity":elementalAffinity(c),
    "Dragon Wings":dragonWings(c)
  };}catch(error){console.error("[sorcerer-reference] shared references failed",error);throw error;}
}

function legacy(c){
  try{return{...shared(c),
    "Sorcerous Origin":rr("Sorcerer","Subclass","Draconic Bloodline grants Sorcerous Origin features at Sorcerer levels 1, 6, 14, and 18."),
    "Dragon Ancestor":dragonAncestor(c),
    "Draconic Resilience":rr("Draconic Bloodline","Passive",`Your Hit Point maximum is increased by ${c.draconicHpBonus||0}. While not wearing armor, AC is 13 + Dexterity modifier; this sheet calculates ${c.ac}.`),
    "Font of Magic":rr("Sorcerer","Resource",`${c.sorcerer?.sorceryPoints||0} Sorcery Points; regain all on a Long Rest. As a Bonus Action, convert a spell slot to Sorcery Points equal to its level or spend Sorcery Points to create a level 1–5 slot (costs 2/3/5/6/7). Created slots vanish on a Long Rest.`),
    Metamagic:rr("Sorcerer","Spell modification",`${c.sorcerer?.metamagicCount||0} Metamagic options are known and listed separately. Normally only one Metamagic option can modify a spell unless that option says otherwise.`),
    "Sorcerous Restoration":rr("Sorcerer","After Short Rest","Regain 4 expended Sorcery Points whenever you finish a Short Rest."),
    "Draconic Presence":rr("Draconic Bloodline","Action",`Spend 5 Sorcery Points to project a 60-ft awe or fear aura for 1 minute or until concentration ends. A hostile creature starting its turn there makes a Wisdom save against your spell save DC ${c.spells?.saveDc}; failure = Charmed or Frightened, and a success grants 24-hour immunity to the aura.`)
  };}catch(error){console.error("[sorcerer-reference] 2014 references failed",error);throw error;}
}

function revised(c){
  try{return{...shared(c),
    "Innate Sorcery":rr("Sorcerer","Bonus Action","Twice per Long Rest, activate for 1 minute: Sorcerer spell save DC increases by 1 and you have Advantage on attack rolls of Sorcerer spells."),
    "Font of Magic":rr("Sorcerer","Resource",`${c.sorcerer?.sorceryPoints||0} Sorcery Points; regain all on a Long Rest. Convert a spell slot to Sorcery Points equal to its level with no action, or use a Bonus Action to create a level 1–5 slot for 2/3/5/6/7 points; minimum Sorcerer levels are 2/3/5/7/9.`),
    Metamagic:rr("Sorcerer","Spell modification",`${c.sorcerer?.metamagicCount||0} Metamagic options are known and listed separately. Normally only one option can modify a spell unless an option or Sorcery Incarnate says otherwise.`),
    "Sorcerer Subclass":rr("Sorcerer","Subclass","Draconic Sorcery grants subclass features at Sorcerer levels 3, 6, 14, and 18."),
    "Draconic Resilience":rr("Draconic Sorcery","Passive",`Your Hit Point maximum is increased by ${c.draconicHpBonus||0}. While not wearing armor, base AC is 10 + Dexterity modifier + Charisma modifier; this sheet calculates ${c.ac}.`),
    "Draconic Spells":rr("Draconic Sorcery","Always prepared","Your Draconic Spells are always prepared at their listed Sorcerer levels and don't consume your normal prepared-spell allotment; they are listed on the spell page."),
    "Sorcerous Restoration":rr("Sorcerer","After Short Rest",`Once per Long Rest after a Short Rest, regain up to ${c.sorcerer?.sorcerousRestorationAmount||0} expended Sorcery Points.`),
    "Sorcery Incarnate":rr("Sorcerer","Innate Sorcery upgrade","If no uses of Innate Sorcery remain, spend 2 Sorcery Points when you take its Bonus Action to activate it. While it is active, you can use up to two Metamagic options on each spell you cast."),
    "Epic Boon":rr("Sorcerer","Applied",`Your level-19 Epic Boon is ${c.feats?.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`),
    "Arcane Apotheosis":rr("Sorcerer","Innate Sorcery upgrade","While Innate Sorcery is active, you can use one Metamagic option on each of your turns without spending Sorcery Points on that option."),
    "Dragon Companion":rr("Draconic Sorcery","Summon Dragon","Cast Summon Dragon without a Material component. Once per Long Rest, cast it without a spell slot; when you start casting it, you can remove Concentration, changing its duration to 1 minute for that casting.")
  };}catch(error){console.error("[sorcerer-reference] 2024 references failed",error);throw error;}
}

function dragonAncestor(c){
  try{const ancestry=c.sorcererSelections?.draconic?.ancestry;if(!ancestry)throw new Error("2014 Dragon Ancestor selection is missing.");return rr("Draconic Bloodline","Passive",`${ancestry.name} dragon ancestry (${ancestry.damageType}). You speak, read, and write Draconic, and double your proficiency bonus on applicable Charisma checks when interacting with dragons.`);}
  catch(error){console.error("[sorcerer-reference] Dragon Ancestor reference failed",error);throw error;}
}
function elementalAffinity(c){
  try{const type=c.sorcererSelections?.draconic?.elementalAffinity;if(!type)return null;return c.ruleset==="2014"?rr("Draconic Bloodline","On spell damage",`When a spell deals ${type} damage, add your Charisma modifier to one damage roll. At the same time, you can spend 1 Sorcery Point to gain ${type} resistance for 1 hour.`):rr("Draconic Sorcery","Passive / spell damage",`You have ${type} resistance. When a spell deals ${type} damage, add your Charisma modifier to one damage roll of that spell.`);}
  catch(error){console.error("[sorcerer-reference] Elemental Affinity reference failed",error);throw error;}
}
function dragonWings(c){
  try{return c.ruleset==="2014"?rr("Draconic Bloodline","Bonus Action","Manifest or dismiss dragon wings as a Bonus Action; while manifested and compatible with your armor/clothing, gain a flying speed equal to your current speed."):rr("Draconic Sorcery","Bonus Action","Manifest wings for 1 hour (or dismiss them with no action) and gain a 60-ft Fly Speed. Once used, regain the feature on a Long Rest or spend 3 Sorcery Points with no action to restore its use.");}
  catch(error){console.error("[sorcerer-reference] Dragon Wings reference failed",error);throw error;}
}

function metamagicReference(c,option){
  try{const refs=c.ruleset==="2014"?METAMAGIC_2014:METAMAGIC_2024,ref=refs[option.id];if(!ref)throw new Error(`Missing ${c.ruleset} Metamagic play reference for ${option.id}.`);return ref;}
  catch(error){console.error(`[sorcerer-reference] Metamagic ${option.id} failed`,error);throw error;}
}

const METAMAGIC_2014=Object.freeze({
  "careful-spell":rr("Metamagic","1 Sorcery Point","When the spell forces other creatures to save, protect creatures up to your Charisma modifier (minimum 1); each chosen creature automatically succeeds on that save."),
  "distant-spell":rr("Metamagic","1 Sorcery Point","For a spell with range 5+ ft, double its range; for a touch spell, make its range 30 ft."),
  "empowered-spell":rr("Metamagic","1 Sorcery Point","When rolling spell damage, reroll damage dice up to your Charisma modifier (minimum 1) and use the new rolls. This option can combine with another Metamagic option."),
  "extended-spell":rr("Metamagic","1 Sorcery Point","For a spell lasting at least 1 minute, double its duration to a maximum of 24 hours."),
  "heightened-spell":rr("Metamagic","3 Sorcery Points","One target has Disadvantage on its first saving throw against the spell."),
  "quickened-spell":rr("Metamagic","2 Sorcery Points","Change a spell with a casting time of 1 Action to a casting time of 1 Bonus Action for this casting."),
  "subtle-spell":rr("Metamagic","1 Sorcery Point","Cast the spell without Verbal or Somatic components."),
  "twinned-spell":rr("Metamagic","Spell level in points; minimum 1","For a qualifying single-target, non-self spell that can't target multiple creatures at its current level, target a second creature in range with the same spell.")
});
const METAMAGIC_2024=Object.freeze({
  "careful-spell":rr("Metamagic","1 Sorcery Point","When the spell forces creatures to save, protect creatures up to your Charisma modifier (minimum 1); each automatically succeeds and takes no damage if a successful save normally halves damage."),
  "distant-spell":rr("Metamagic","1 Sorcery Point","For a spell with range 5+ ft, double its range; for a touch spell, make its range 30 ft."),
  "empowered-spell":rr("Metamagic","1 Sorcery Point","When rolling spell damage, reroll damage dice up to your Charisma modifier (minimum 1) and use the new rolls. This option can combine with another Metamagic option."),
  "extended-spell":rr("Metamagic","1 Sorcery Point","For a spell lasting at least 1 minute, double its duration to a maximum of 24 hours; you also have Advantage on saves made to maintain Concentration on it."),
  "heightened-spell":rr("Metamagic","2 Sorcery Points","One target has Disadvantage on saving throws against the spell."),
  "quickened-spell":rr("Metamagic","2 Sorcery Points","Change an Action-casting-time spell to a Bonus Action for this casting. You can't use Quickened Spell if you've already cast a level 1+ spell this turn, and after using it you can't cast a level 1+ spell later on the same turn."),
  "seeking-spell":rr("Metamagic","1 Sorcery Point","After a spell attack misses, reroll the d20 and use the new roll. This option can combine with another Metamagic option."),
  "subtle-spell":rr("Metamagic","1 Sorcery Point","Cast without Verbal, Somatic, or non-costly Material components; required costly or consumed Material components still apply."),
  "transmuted-spell":rr("Metamagic","1 Sorcery Point","When a spell deals Acid, Cold, Fire, Lightning, Poison, or Thunder damage, change that damage type to another type in that list for this casting."),
  "twinned-spell":rr("Metamagic","1 Sorcery Point","When a spell can be upcast to target one additional creature, increase its effective level by 1 for that casting to target the additional creature.")
});

function boonReference(c){return rr("Epic Boon","After Attack or Magic action",`The +1 ${pretty(c.epicBoonAbility)} increase and maximum of 30 are already applied. Immediately after you take the Attack or Magic action, teleport up to 30 ft to an unoccupied space you can see.`);}
function entry(c,id,name,ref,kind){try{return{id,name,...ref,source:sorcererReferenceProvenance(c,kind,name)};}catch(error){console.error(`[sorcerer-reference] entry ${name} failed`,error);throw error;}}
function rr(category,timing,text){return Object.freeze({category,timing,text});}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase()).trim();}
