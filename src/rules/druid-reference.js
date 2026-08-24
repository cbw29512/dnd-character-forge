import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { druidReferenceProvenance } from "../data/druid-provenance.js";
import { druidFormsFor, druidFormById } from "../data/druid-forms.js";
import { natureWardResistance } from "./druid.js";

export function buildDruidQuickReference(character){
  try{
    if(character?.class?.id!=="druid")throw new Error("Druid reference builder received another class.");
    const safe={...character,features:[],feats:(character.feats||[]).filter(feat=>feat.id!=="boon-dimensional-travel")},items=[...buildCoreQuickReference(safe)];
    const boon=(character.feats||[]).find(feat=>feat.id==="boon-dimensional-travel");if(boon)items.push(entry(character,`feat:${boon.id}`,boon.name,boonReference(character),"feat"));
    for(const name of character.features||[])items.push(entry(character,`feature:${name}`,name,featureReference(character,name),"feature"));
    for(const form of formEntries(character))items.push(form);
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Druid quick-reference entries detected.");return items;
  }catch(error){console.error("[druid-reference] build failed",error);throw error;}
}
function featureReference(c,name){
  try{
    const d=c.druid,s=c.druidSelections||{},refs={
      Druidic:c.ruleset==="2014"?rr("Druid","Language","You know Druidic and can use it to leave hidden messages. Other Druids automatically notice them; others can notice the message's presence with the listed check but need magic to decipher it."):rr("Druid","Language / magic","You know Druidic and can leave hidden Druidic messages. Speak with Animals is always prepared through this feature."),
      Spellcasting:rr("Druid","Magic",c.ruleset==="2014"?`Wisdom spellcasting. You prepare ${c.spells?.prepared?.all?.length||0} normal Druid spells after a Long Rest, plus Circle spells; your preparation count is Druid level + Wisdom modifier (minimum 1).`:`Wisdom spellcasting. You have ${d.prepared} normal prepared Druid spells from the class table. Speak with Animals and Circle spells are additional and don't consume those choices.`),
      "Wild Shape":c.ruleset==="2014"?rr("Druid","Action",`Use Wild Shape ${d.unlimitedWildShape?"without limit":`${d.wildShapeUses} times per Short or Long Rest`}. Assume a Beast you've seen with CR up to ${crLabel(d.maxCr)}${d.allowFly?"; flying forms are legal":d.allowSwim?"; swimming forms are legal but flying forms aren't":"; swimming and flying forms aren't legal"}. Duration: up to ${d.durationHours} hour${d.durationHours===1?"":"s"}. You use the Beast's HP and revert when the form drops to 0 HP; excess damage carries over.`):rr("Druid","Bonus Action",`Use Wild Shape ${d.wildShapeUses} times; regain one use after a Short Rest and all after a Long Rest. Assume one of your ${d.knownFormCount} known Beast forms for up to ${d.durationHours} hour${d.durationHours===1?"":"s"}. You keep your own HP and gain ${d.wildShapeTempHp} Temporary HP when you transform.`),
      "Wild Shape Improvement":rr("Druid","Wild Shape",`Your legal Beast forms now reach CR ${crLabel(d.maxCr)}${d.allowFly?" and may have a Fly Speed":d.allowSwim?" and may have a Swim Speed":""}.`),
      "Ability Score Improvement":rr("Druid","Applied",`${(c.class.asiLevels||[]).filter(level=>c.level>=level).length} earned Ability Score Improvement opportunities are already reflected in the ability scores.`),
      "Bonus Cantrip":rr("Circle of the Land","Applied","Circle of the Land grants one additional Druid cantrip; it is already included in the selected cantrip count."),
      "Natural Recovery":c.ruleset==="2014"?rr("Circle of the Land","Short Rest",`During a Short Rest, recover expended spell slots with a combined level up to ${d.naturalRecovery}; no recovered slot can be level 6 or higher. Once used, recover this feature after a Long Rest.`):rr("Circle of the Land","Free casting / Short Rest",`Once per Long Rest, cast one prepared level 1+ Circle spell without a slot. After a Short Rest, also recover spell slots totaling up to ${d.naturalRecovery} levels; none can be level 6 or higher.`),
      "Circle Spells":rr("Circle of the Land","Always prepared",`Current land: ${pretty(s.circleLand)}. Its unlocked Circle spells are always prepared and don't count against normal Druid preparation.`),
      "Land's Stride":rr("Circle of the Land","Movement","Nonmagical difficult terrain costs no extra movement. Nonmagical plants don't slow or damage you, and you have Advantage on saves against magically created or manipulated plants that impede movement."),
      "Nature's Ward":c.ruleset==="2014"?rr("Circle of the Land","Passive","You can't be Charmed or Frightened by Elementals or Fey, and you are immune to poison and disease."):rr("Circle of the Land","Passive",`You are immune to the Poisoned condition and have ${natureWardResistance(s.circleLand)} Resistance while ${pretty(s.circleLand)} is your current land.`),
      "Nature's Sanctuary":c.ruleset==="2014"?rr("Circle of the Land","Incoming Beast/Plant attack","When a Beast or Plant attacks you, it makes a Wisdom save against your Druid spell save DC. On a failure, it chooses a different target or the attack automatically misses; on a success it is immune for 24 hours."):rr("Circle of the Land","Magic action / Wild Shape use",`Spend a Wild Shape use to create a 15-ft Cube within 120 ft for 1 minute. You and allies have Half Cover there, and allies gain your current Nature's Ward Resistance. Move the Cube up to 60 ft as a Bonus Action.`),
      "Timeless Body":rr("Druid","Passive","For every 10 years that pass, your body ages only 1 year."),
      "Beast Spells":c.ruleset==="2014"?rr("Druid","While Wild Shaped","Cast Druid spells in Beast form using verbal and somatic components, but you still can't provide material components."):rr("Druid","While Wild Shaped","Cast spells in Beast form except spells with a Material component that has a listed cost or that consumes the component."),
      Archdruid:c.ruleset==="2014"?rr("Druid","Capstone","Use Wild Shape an unlimited number of times. You can ignore verbal and somatic components and non-costly, non-consumed material components for Druid spells in normal or Beast form."):rr("Druid","Capstone","Evergreen Wild Shape restores one use when Initiative is rolled and you have none. Nature Magician converts unspent Wild Shape uses into one spell slot at 2 spell levels per use, once per Long Rest. Longevity slows aging to one year per ten."),
      "Primal Order":rr("Druid","Level-1 choice",`Current Primal Order: ${pretty(s.primalOrder)}.`),
      "Primal Order: Magician":rr("Druid","Applied","You know one extra Druid cantrip. Add your Wisdom modifier (minimum +1) to Intelligence (Arcana or Nature) checks; this bonus is already reflected on the sheet."),
      "Primal Order: Warden":rr("Druid","Proficiencies","You gain proficiency with Martial weapons and training with Medium armor."),
      "Wild Companion":rr("Druid","Magic action",`Spend a spell slot or one Wild Shape use to cast Find Familiar without Material components. The familiar is Fey and disappears when you finish a Long Rest.`),
      "Wild Resurgence":rr("Druid","No action",`Once on each of your turns, if you have no Wild Shape uses, spend a spell slot to regain one use. You can also spend one Wild Shape use to gain a level-1 spell slot, once per Long Rest.`),
      "Elemental Fury":rr("Druid","Level-7 choice",`Current Elemental Fury option: ${pretty(s.elementalFury)}.`),
      "Elemental Fury: Potent Spellcasting":rr("Druid","Druid cantrip damage","Add your Wisdom modifier to damage dealt by Druid cantrips."),
      "Elemental Fury: Primal Strike":rr("Druid","Once per turn",`When a weapon attack or Beast-form attack hits, deal an extra ${d.improvedElementalFury?"2d8":"1d8"} Cold, Fire, Lightning, or Thunder damage.`),
      "Improved Elemental Fury":rr("Druid","Upgrade",s.elementalFury==="potent-spellcasting"?"Druid cantrips with a range of 10 ft or more gain 300 ft of range.":"Primal Strike's extra damage increases to 2d8."),
      "Land's Aid":rr("Circle of the Land","Magic action / Wild Shape use",`Spend one Wild Shape use; choose a point within 60 ft and create a 10-ft-radius Sphere. Chosen creatures make a Constitution save, taking ${d.landsAidDice}d6 Necrotic on a failure or half on success; one creature in the area heals ${d.landsAidDice}d6 HP.`),
      "Circle Land: Arid":rr("Circle of the Land","Current land","Arid Circle spells are always prepared at their unlocked levels; Nature's Ward grants Fire Resistance."),
      "Circle Land: Polar":rr("Circle of the Land","Current land","Polar Circle spells are always prepared at their unlocked levels; Nature's Ward grants Cold Resistance."),
      "Circle Land: Temperate":rr("Circle of the Land","Current land","Temperate Circle spells are always prepared at their unlocked levels; Nature's Ward grants Lightning Resistance."),
      "Circle Land: Tropical":rr("Circle of the Land","Current land","Tropical Circle spells are always prepared at their unlocked levels; Nature's Ward grants Poison Resistance."),
      "Epic Boon":rr("Druid","Applied",`Your level-19 Epic Boon is ${c.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`)
    };
    const ref=refs[name];if(!ref)throw new Error(`Missing Druid play reference for ${name}.`);return ref;
  }catch(error){console.error(`[druid-reference] feature ${name} failed`,error);throw error;}
}
function boonReference(c){return rr("Epic Boon","After Attack or Magic action",`The +1 ${pretty(c.epicBoonAbility)} increase and maximum of 30 are already applied. Immediately after taking the Attack or Magic action, teleport up to 30 ft to an unoccupied space you can see.`);}
function formEntries(c){
  try{
    const ids=c.ruleset==="2014"?(c.druidSelections?.fieldForms||[]):(c.druidSelections?.knownForms||[]);return ids.map(id=>{const form=druidFormById(c.ruleset,id),speeds=Object.entries(form.speeds).filter(([,v])=>v).map(([k,v])=>`${pretty(k)} ${v} ft`).join(", "),attack=form.actions.find(a=>a.toHit!=null)||form.actions[0];return{id:`form:${form.id}`,name:`Wild Shape — ${form.name}`,category:c.ruleset==="2014"?"Field Form Example":"Known Wild Shape Form",timing:`CR ${form.cr} · AC ${form.ac} · HP ${form.hp}`,text:`${form.size} Beast · ${speeds}. ${attack?`${attack.name}${attack.toHit!=null?` +${attack.toHit}`:""}${attack.damage?` · ${attack.damage}`:""}.`:""}${form.traits.length?` ${form.traits.join("; ")}`:""}`,source:form.source};});
  }catch(error){console.error("[druid-reference] form entries failed",error);throw error;}
}
function entry(c,id,name,ref,kind){return{id,name,...ref,source:druidReferenceProvenance(c,kind,name)};}
function rr(category,timing,text){return{category,timing,text};}
function crLabel(value){return value===.25?"1/4":value===.5?"1/2":String(value);}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());}
