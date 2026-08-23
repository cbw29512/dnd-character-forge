import { REFERENCE_2014, REFERENCE_2024, MASTERY_REFERENCE } from "../data/quick-reference.js";
import { RAW_2014 } from "../data/raw-2014.js";
import { RAW_2024 } from "../data/raw-2024.js";
import { GNOME_LINEAGES, GOLIATH_ANCESTRIES, TIEFLING_LEGACIES } from "../data/species-2024.js";
import { wizardSpellsFor } from "../data/wizard-spells.js";
import { referenceProvenance } from "../data/rule-provenance.js";
import { dragonbornBreath, speciesDarkvision, speciesMagic } from "./species.js";
import { abilityMod } from "./math.js";

const dataFor=ruleset=>ruleset==="2014"?RAW_2014:RAW_2024,refsFor=ruleset=>ruleset==="2014"?REFERENCE_2014:REFERENCE_2024;
export function buildQuickReference(character){
  try{
    const rules=refsFor(character.ruleset),items=[];
    for(const trait of character.speciesTraits||character.species.traits||[])push(character,items,`species:${trait}`,trait,dynamicSpeciesTrait(character,trait)||required(rules.species?.[trait],trait));
    if(character.background.feature)push(character,items,`background:${character.background.feature}`,character.background.feature,required(rules.background?.[character.background.feature],character.background.feature));
    for(const feat of character.feats||[])push(character,items,`feat:${feat.id}`,feat.name,dynamicFeat(character,feat)||required(rules.feat?.[feat.name],feat.name));
    const styles=character.fightingStyles?.length?character.fightingStyles:(character.fightingStyle?[character.fightingStyle]:[]);
    for(const style of styles)push(character,items,`style:${style.name}`,style.name,required(rules.style?.[style.name],style.name));
    for(const name of character.features||[]){if(name==="Fighting Style"||name.startsWith("Fighting Style:"))continue;push(character,items,`feature:${name}`,name,dynamicFeature(character,name)||required(rules.feature?.[name],name));}
    for(const mastery of masteryEntries(character))push(character,items,`mastery:${mastery.weaponId}`,`${mastery.weaponName} — ${mastery.property}`,required(MASTERY_REFERENCE[mastery.property],mastery.property));
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate quick-reference entries detected.");return items;
  }catch(error){console.error("[reference] build failed",error);throw error;}
}
export function masteryEntries(character){
  try{if(character.ruleset!=="2024"||!character.masteryIds?.length)return[];const data=dataFor(character.ruleset);return character.masteryIds.map(weaponId=>{const weapon=data.weapons[weaponId];if(!weapon)throw new Error(`Unknown mastery weapon ${weaponId}.`);if(!weapon.mastery)throw new Error(`${weapon.name} is missing its Weapon Mastery property.`);if(!MASTERY_REFERENCE[weapon.mastery])throw new Error(`Missing quick reference for ${weapon.mastery}.`);return{weaponId,weaponName:weapon.name,property:weapon.mastery};});}catch(error){console.error("[reference] mastery lookup failed",error);throw error;}
}
function dynamicSpeciesTrait(character,name){
  try{
    if(character.ruleset!=="2024")return null;const species=character.species.id,choices=character.speciesChoices||{},category=character.species.name,pb=character.proficiency;
    if(name==="Darkvision"){const range=speciesDarkvision(character);if(!range)throw new Error(`${category} Darkvision range is unavailable.`);return rr(category,"Passive",`You have Darkvision out to ${range} ft.`);}
    if(species==="dragonborn"){
      if(name==="Draconic Ancestry")return rr(category,"Chosen at creation",`${choices.ancestryName} ancestry determines your ${choices.damageType} Breath Weapon and Damage Resistance.`);
      if(name==="Breath Weapon"){const breath=dragonbornBreath(character);return rr(category,"Replace one Attack",`When you take the Attack action, replace one attack with a 15-ft Cone or 30-ft-by-5-ft Line. Dexterity save DC ${breath.dc}; failure takes ${breath.dice} ${breath.damageType}, success half. ${breath.uses} uses; regain all after a Long Rest.`);}
      if(name==="Damage Resistance")return rr(category,"Passive",`You have Resistance to ${choices.damageType} damage from your ${choices.ancestryName} ancestry.`);
      if(name==="Draconic Flight")return rr(category,"Bonus Action",`Sprout spectral wings for 10 minutes, gaining a Fly Speed equal to your ${character.speed}-ft Speed. The wings end if retracted or you become Incapacitated. One use; regain it after a Long Rest.`);
    }
    if(species==="dwarf"){
      if(name==="Dwarven Toughness")return rr(category,"Applied",`Your Hit Point maximum is increased by ${character.speciesHpBonus} from Dwarven Toughness at level ${character.level}; this bonus is already included in Hit Points.`);
      if(name==="Stonecunning")return rr(category,"Bonus Action",`While on or touching stone, gain Tremorsense 60 ft for 10 minutes. ${pb} uses; regain all after a Long Rest.`);
    }
    if(species==="elf"){
      if(name==="Elven Lineage"){const magic=speciesMagic(character),parts=[...magic.cantrips,...magic.spells];return rr(category,"Lineage magic",`${choices.lineageName}; ${abilityName(magic.ability)} is your lineage spellcasting ability. Current lineage magic: ${parts.join(", ")||"none"}.${choices.lineage==="high"?" Your current High Elf Wizard cantrip can be replaced with another Wizard cantrip after a Long Rest.":""} Level 3+ and 5+ lineage spells are always prepared and each can be cast once without a slot per Long Rest, or with appropriate spell slots.`);}
      if(name==="Keen Senses")return rr(category,"Applied",`Keen Senses grants proficiency in ${pretty(choices.keenSense)}; it is already included in Skills.`);
    }
    if(species==="gnome"&&name==="Gnomish Lineage"){
      const lineage=GNOME_LINEAGES[choices.lineage],magic=speciesMagic(character);if(!lineage)throw new Error("Gnome lineage data is unavailable.");
      if(choices.lineage==="forest")return rr(category,"Lineage magic",`${lineage.name}; ${abilityName(magic.ability)} is your lineage spellcasting ability. You know ${magic.cantrips.join(", ")} and always have ${magic.spells.join(", ")} prepared. Cast Speak with Animals without a slot ${pb} times per Long Rest, or with spell slots.`);
      return rr(category,"Lineage magic / 10 minutes",`${lineage.name}; ${abilityName(magic.ability)} is your lineage spellcasting ability. You know ${magic.cantrips.join(" and ")}. By spending 10 minutes casting Prestidigitation, create a Tiny AC 5, 1 HP clockwork device based on one of that spell's effects; up to three devices can exist, each lasting 8 hours.`);
    }
    if(species==="goliath"){
      if(name==="Giant Ancestry"){const ancestry=GOLIATH_ANCESTRIES[choices.giantAncestry];if(!ancestry)throw new Error("Goliath ancestry data is unavailable.");return rr(category,"Ancestry benefit",`${ancestry.name} (${ancestry.giant}). ${goliathBenefit(choices.giantAncestry,character)} ${pb} uses; regain all after a Long Rest.`);}
      if(name==="Large Form")return rr(category,"Bonus Action",`Become Large for 10 minutes if space allows. During the form, gain Advantage on Strength checks and your Speed increases from ${character.speed} ft to ${character.speed+10} ft. One use; regain it after a Long Rest.`);
    }
    if(species==="human"){
      if(name==="Skillful")return rr(category,"Applied",`Skillful grants proficiency in ${pretty(choices.skill)}; it is already included in Skills.`);
      if(name==="Versatile"){const feat=character.feats.find(item=>item.category==="Origin"&&item.id!==character.background.feat);return rr(category,"Applied",`Versatile grants an Origin feat. This character selected ${feat?.name||"a legal Origin feat"}, shown in the feat references.`);}
    }
    if(species==="orc"&&name==="Adrenaline Rush")return rr(category,"Bonus Action",`Take the Dash action as a Bonus Action and gain ${pb} Temporary Hit Points. ${pb} uses; regain all after a Short or Long Rest.`);
    if(species==="tiefling"){
      const legacy=TIEFLING_LEGACIES[choices.legacy],magic=speciesMagic(character);if(!legacy||!magic)throw new Error("Tiefling legacy data is unavailable.");
      if(name==="Fiendish Legacy")return rr(category,"Legacy magic",`${legacy.name} legacy grants Resistance to ${legacy.resistance} damage. ${abilityName(magic.ability)} is your legacy spellcasting ability. Current legacy magic: ${magic.cantrips.filter(spell=>spell!=="Thaumaturgy").join(", ")}${magic.spells.length?`, ${magic.spells.join(", ")}`:""}. Level 3+ and 5+ legacy spells are always prepared and each can be cast once without a slot per Long Rest, or with appropriate spell slots.`);
      if(name==="Otherworldly Presence")return rr(category,"Cantrip",`You know Thaumaturgy, using ${abilityName(magic.ability)} as its spellcasting ability.`);
    }
    return null;
  }catch(error){console.error(`[reference] dynamic species trait ${name} failed`,error);throw error;}
}
function dynamicFeat(character,feat){
  try{
    if(character.ruleset==="2024"&&feat.id==="boon-spell-recall")return rr("Epic Boon","Casting level 1–4 spell",`The +1 ${pretty(character.epicBoonAbility)} increase and maximum of 30 are already applied. When you cast a spell using a level 1–4 spell slot, roll 1d4; if the roll equals the slot's level, the slot isn't expended.`);
    return null;
  }catch(error){console.error(`[reference] dynamic feat ${feat?.name} failed`,error);throw error;}
}
function dynamicFeature(character,name){
  try{
    if(name==="Spellcasting")return spellcasting(character);
    if(name==="Second Wind")return secondWind(character);
    if(name==="Action Surge")return actionSurge(character);
    if(name==="Ability Score Improvement")return abilityScoreImprovement(character);
    if(["Extra Attack","Two Extra Attacks","Three Extra Attacks"].includes(name))return extraAttack(character);
    if(name==="Indomitable")return indomitable(character);
    if(name==="Remarkable Athlete")return remarkableAthlete(character);
    if(name==="Additional Fighting Style")return additionalFightingStyle(character);
    if(name==="Superior Critical")return superiorCritical(character);
    if(name==="Weapon Mastery")return{category:"Fighter",timing:"Passive",text:`Use the mastery properties for ${character.masteryIds.length} chosen weapons listed below. After a Long Rest, you can change one chosen weapon.`};
    if(name==="Tactical Shift")return{category:"Fighter",timing:"With Second Wind",text:`After using Second Wind as a Bonus Action, move up to ${Math.floor(character.speed/2)} ft without provoking Opportunity Attacks.`};
    if(name==="Arcane Recovery")return arcaneRecovery(character);
    if(name==="Scholar")return{category:"Wizard",timing:"Passive",text:`Expertise is already applied to ${pretty(character.expertise[0])}.`};
    if(name==="Sculpt Spells"&&character.ruleset==="2024")return rr("Evoker","Evocation spell",`When an Evocation spell affects creatures you can see, protect up to 1 + the spell's level of them. They automatically succeed on their saves against the spell and take no damage if a successful save would normally deal half.`);
    if(name==="Empowered Evocation")return rr("Evoker","Evocation damage",`Add your Intelligence modifier (${abilityMod(character.abilities.int)>=0?"+":""}${abilityMod(character.abilities.int)}) to one damage roll of each Wizard Evocation spell you cast.`);
    if(name==="Overchannel")return rr("Evoker","Wizard spell · slot 1–5",`When a damaging Wizard spell uses a level 1–5 slot, you can maximize its damage on the turn you cast it. First use per Long Rest is safe; the second deals 2d12 Necrotic damage per slot level to you, ignoring Resistance and Immunity, and each further use increases that damage by 1d12 per slot level.`);
    if(name==="Spell Mastery")return spellMastery(character);
    if(name==="Epic Boon")return rr(character.class.name,"Applied",`Your level-19 Epic Boon is ${character.feats.find(feat=>feat.category==="Epic Boon")?.name||"listed separately"}; its legal ability increase is already included.`);
    if(name==="Signature Spells")return signatureSpells(character);
    if(name==="Channel Divinity: Preserve Life"||name==="Preserve Life")return preserveLife(character);
    if(name==="Sear Undead")return searUndead(character);
    if(name==="Survivor")return survivor(character);
    return null;
  }catch(error){console.error(`[reference] dynamic ${name} failed`,error);throw error;}
}
function spellcasting(character){
  try{const base="Use the spell section above for save DC, attack bonus, slots, and prepared spells. Expended spell slots return after a Long Rest.";if(character.ruleset==="2014"&&character.class.id==="wizard")return{category:"Wizard",timing:"Magic / Ritual",text:`${base} A Ritual-tag spell in your spellbook can be cast as a Ritual without being prepared.`};if(character.ruleset==="2014"&&character.class.id==="cleric")return{category:"Cleric",timing:"Magic / Ritual",text:`${base} A prepared Cleric spell with the Ritual tag can be cast as a Ritual.`};if(character.ruleset==="2024"&&character.class.id==="wizard")return{category:"Wizard",timing:"Magic",text:`${base} After a Long Rest, you can replace prepared level 1+ spells with legal spells from your spellbook; Wizard features that are always prepared do not consume this prepared-spell count.`};return{category:"Cleric",timing:"Magic",text:`${base} After a Long Rest, you can replace prepared level 1+ spells with other Cleric spells for which you have slots.`};}catch(error){console.error("[reference] spellcasting failed",error);throw error;}
}
function spellMastery(character){try{const mastery=character.spells?.spellMastery;if(!mastery)throw new Error("Spell Mastery state is missing.");return rr("Wizard","At will / after Long Rest",`${wizardSpellName(character,mastery.level1)} (level 1) and ${wizardSpellName(character,mastery.level2)} (level 2) are always prepared and can be cast at their lowest level without a spell slot. Higher-level casts use slots. After a Long Rest, one mastered spell can be replaced by an eligible same-level spell in the spellbook.`);}catch(error){console.error("[reference] Spell Mastery failed",error);throw error;}}
function signatureSpells(character){try{const ids=character.spells?.signatureSpells||[];if(ids.length!==2)throw new Error("Signature Spell state requires two spells.");return rr("Wizard","Free cast / Short or Long Rest",`${ids.map(id=>wizardSpellName(character,id)).join(" and ")} are always prepared. Each can be cast once at level 3 without a spell slot; each free cast refreshes after a Short or Long Rest. Higher-level casts use slots.`);}catch(error){console.error("[reference] Signature Spells failed",error);throw error;}}
function wizardSpellName(character,id){try{return wizardSpellsFor(character.ruleset).find(spell=>spell.id===id)?.name||id;}catch(error){console.error("[reference] Wizard spell name failed",error);throw error;}}
function secondWind(character){try{const healing=`1d10 + ${character.level} HP`;if(character.ruleset==="2014")return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. One use; regain it after a Short or Long Rest.`};const uses=character.fighter?.secondWindUses;if(!Number.isInteger(uses))throw new Error("2024 Second Wind reference requires Fighter progression data.");return{category:"Fighter",timing:"Bonus Action",text:`Regain ${healing}. ${uses} uses; regain one expended use after a Short Rest and all expended uses after a Long Rest.`};}catch(error){console.error("[reference] Second Wind failed",error);throw error;}}
function actionSurge(character){try{const uses=character.fighter?.actionSurgeUses;if(!Number.isInteger(uses))throw new Error("Action Surge reference requires Fighter progression data.");const restriction=character.ruleset==="2024"?" The additional action cannot be the Magic action.":"";return{category:"Fighter",timing:"On your turn",text:`Take one additional action.${restriction} ${uses} use${uses===1?"":"s"} between rests; regain all uses after a Short or Long Rest${uses>1?", and use it no more than once on the same turn":""}.`};}catch(error){console.error("[reference] Action Surge failed",error);throw error;}}
function abilityScoreImprovement(character){try{const levels=character.class.asiLevels||[4],count=levels.filter(level=>character.level>=level).length;if(count<1)throw new Error("ASI reference requires at least one earned ASI level.");return{category:"Class",timing:"Applied",text:`${count} Ability Score Improvement opportunit${count===1?"y has":"ies have"} been earned at this level and the generated legal increases are already included in the ability scores above.`};}catch(error){console.error("[reference] Ability Score Improvement failed",error);throw error;}}
function extraAttack(character){try{const attacks=character.fighter?.attacksPerAction;if(!Number.isInteger(attacks))throw new Error("Extra Attack reference requires Fighter progression data.");return{category:"Fighter",timing:"Attack action",text:`Attack ${numberWord(attacks)} times instead of once whenever you take the Attack action on your turn.`};}catch(error){console.error("[reference] Extra Attack failed",error);throw error;}}
function indomitable(character){try{const uses=character.fighter?.indomitableUses;if(!Number.isInteger(uses)||uses<1)throw new Error("Indomitable reference requires active Fighter progression data.");const bonus=character.ruleset==="2024"?` with a +${character.level} bonus`:"";return{category:"Fighter",timing:"Failed saving throw",text:`Reroll a failed saving throw${bonus} and use the new roll. ${uses} use${uses===1?"":"s"}; regain all uses after a Long Rest.`};}catch(error){console.error("[reference] Indomitable failed",error);throw error;}}
function remarkableAthlete(character){try{if(character.ruleset==="2014"){const bonus=Math.ceil(character.proficiency/2),jump=abilityMod(character.abilities.str);return{category:"Champion",timing:"Ability checks / running jump",text:`Add +${bonus} to Strength, Dexterity, or Constitution checks that do not already use your Proficiency Bonus. Your running long-jump distance also changes by ${jump} ft from this feature.`};}return{category:"Champion",timing:"Passive / after crit",text:`You have Advantage on Initiative rolls and Strength (Athletics) checks. Immediately after a Critical Hit, move up to ${Math.floor(character.speed/2)} ft without provoking Opportunity Attacks.`};}catch(error){console.error("[reference] Remarkable Athlete failed",error);throw error;}}
function additionalFightingStyle(character){try{const styles=(character.fightingStyles||[]).map(style=>style.name).join(" + ");return{category:"Champion",timing:"Passive",text:`You have a second Fighting Style. Active styles: ${styles}. Each style is listed separately with its own mechanics and source citation.`};}catch(error){console.error("[reference] Additional Fighting Style failed",error);throw error;}}
function superiorCritical(character){try{return character.ruleset==="2014"?{category:"Champion",timing:"Passive",text:"Your weapon attacks score a Critical Hit on a d20 roll of 18–20."}:{category:"Champion",timing:"Passive",text:"Weapon and Unarmed Strike attack rolls score a Critical Hit on a d20 roll of 18–20."};}catch(error){console.error("[reference] Superior Critical failed",error);throw error;}}
function survivor(character){try{const healing=5+abilityMod(character.abilities.con);if(character.ruleset==="2014")return{category:"Champion",timing:"Start of turn",text:`If you have at least 1 HP and no more than half your maximum HP, regain ${healing} HP at the start of each of your turns.`};return{category:"Champion",timing:"Passive / start of turn",text:`You have Advantage on Death Saving Throws, and a death save roll of 18–20 gains the benefit of a 20. While Bloodied with at least 1 HP, regain ${healing} HP at the start of each turn.`};}catch(error){console.error("[reference] Survivor failed",error);throw error;}}
function arcaneRecovery(character){try{const levels=Math.ceil(character.level/2),limit=`up to ${levels} total spell-slot level${levels===1?"":"s"}`;return character.ruleset==="2014"?{category:"Wizard",timing:"After Short Rest",text:`Once per day, recover expended slots totaling ${limit}; none can be level 6+.`}:{category:"Wizard",timing:"After Short Rest",text:`Recover expended slots totaling ${limit}; none can be level 6+. Once used, it returns after a Long Rest.`};}catch(error){console.error("[reference] Arcane Recovery failed",error);throw error;}}
function preserveLife(character){try{const pool=5*character.level;if(character.ruleset==="2014")return{category:"Life Domain",timing:"Action · Channel Divinity",text:`Distribute up to ${pool} HP among creatures within 30 ft, but no creature can be healed above half its maximum. It has no effect on Undead or Constructs.`};return{category:"Life Domain",timing:"Magic action · Channel Divinity",text:`Distribute up to ${pool} HP among Bloodied creatures within 30 ft, including yourself, but no creature can be healed above half its maximum.`};}catch(error){console.error("[reference] Preserve Life failed",error);throw error;}}
function searUndead(character){try{const dice=Math.max(1,abilityMod(character.abilities.wis));return{category:"Cleric",timing:"With Turn Undead",text:`Roll ${dice}d8. Each Undead that fails its Turn Undead save takes that much Radiant damage; this damage does not end the turning effect.`};}catch(error){console.error("[reference] Sear Undead failed",error);throw error;}}
function goliathBenefit(id,character){try{const con=abilityMod(character.abilities.con);return({cloud:"As a Bonus Action, teleport up to 30 ft to an unoccupied space you can see.",fire:"When an attack roll hits and deals damage, deal an extra 1d10 Fire damage.",frost:"When an attack roll hits and deals damage, deal an extra 1d6 Cold damage and reduce the target's Speed by 10 ft until the start of your next turn.",hill:"When an attack roll hits a Large or smaller creature and deals damage, give it the Prone condition.",stone:`As a Reaction when you take damage, reduce that damage by 1d12 ${con>=0?"+":"−"} ${Math.abs(con)} (your Constitution modifier).`,storm:"As a Reaction when a creature within 60 ft damages you, deal 1d8 Thunder damage to it."})[id]||"Unknown Giant Ancestry benefit.";}catch(error){console.error("[reference] Goliath benefit failed",error);throw error;}}
function abilityName(id){try{return({int:"Intelligence",wis:"Wisdom",cha:"Charisma"})[id]||String(id);}catch(error){console.error("[reference] ability name failed",error);throw error;}}
function rr(category,timing,text){return{category,timing,text};}
function numberWord(value){try{return({1:"once",2:"twice",3:"three",4:"four"})[value]||String(value);}catch(error){console.error("[reference] number word failed",error);throw error;}}
function push(character,items,id,name,entry){try{const kind=id.split(":",1)[0],source=referenceProvenance(character,kind,name);items.push({id,name,...entry,source});}catch(error){console.error(`[reference] provenance attach failed for ${name}`,error);throw error;}}
function required(entry,name){try{if(!entry)throw new Error(`Missing quick reference for ${name}.`);return entry;}catch(error){console.error(`[reference] required entry failed for ${name}`,error);throw error;}}
function pretty(value){try{return String(value||"the chosen skill").replace(/([A-Z])/g," $1").replace(/^./,char=>char.toUpperCase());}catch(error){console.error("[reference] pretty label failed",error);throw error;}}
