import { paladinAuraBonus } from "../rules/paladin.js";
import { monkSaveDc } from "../rules/monk.js";
import { abilityMod } from "../rules/math.js";

export function buildClassUtility(character){
  try{
    const builders={barbarian:barbarianUtility,bard:bardUtility,monk:monkUtility,druid:druidUtility,paladin:paladinUtility,ranger:rangerUtility,fighter:fighterUtility,wizard:wizardUtility,cleric:clericUtility,rogue:rogueUtility};
    return (builders[character?.class?.id]||defaultUtility)(character);
  }catch(error){console.error("[class-utility] build failed",error);throw error;}
}

function barbarianUtility(character){
  try{
    const b=character.barbarian;if(!b)return null;const rage=b.unlimitedRage?"∞":b.rageUses,is2014=character.ruleset==="2014",brutal=is2014?(b.brutalCriticalDice?`+${b.brutalCriticalDice}`:"—"):(b.brutalStrikeDice?`${b.brutalStrikeDice}d10`:"—");
    return{title:"Primal Fury",kind:"barbarian",stats:[stat("Rage",rage,b.unlimitedRage?"unlimited":"uses"),stat("Rage Damage",`+${b.rageDamage}`,"damage"),stat("Attacks",b.attacksPerAction,"per action"),stat(is2014?"Crit Dice":"Brutal Strike",brutal,is2014?"weapon dice":"extra damage")],note:character.ruleset==="2024"?`${b.masteryCount} Weapon Masteries${b.brutalStrikeEffectCount?` · ${b.brutalStrikeEffectCount} Brutal Strike effect${b.brutalStrikeEffectCount===1?"":"s"}`:""}${b.frenzy?" · Frenzy active":""}`:`${b.initiativeAdvantage?"Feral Instinct · ":""}${b.frenzy?"Berserker Frenzy · ":""}${b.relentlessRage?"Relentless Rage ready":"Rage ready"}`};
  }catch(error){console.error("[class-utility] Barbarian utility failed",error);throw error;}
}
function bardUtility(character){
  try{
    const b=character.bard;if(!b)return null;const uses=Math.max(1,abilityMod(character.abilities.cha)),spellCount=character.ruleset==="2014"?(character.spells?.known?.all?.length||0):(character.spells?.prepared?.all?.length||0),spellUnit=character.ruleset==="2014"?"known":"prepared";
    return{title:"Living Legend",kind:"bard",stats:[stat("Inspiration",b.bardicInspirationDie,"die"),stat("Inspiration",uses,"uses"),stat("Expertise",b.expertiseCount,"skills"),stat("Spells",spellCount,spellUnit)],note:character.ruleset==="2014"?`${b.songOfRestDie?`Song of Rest ${b.songOfRestDie} · `:""}${b.magicalSecretsCount?`${b.magicalSecretsCount} Magical Secrets`:"Magical Secrets later"}${b.peerlessSkill?" · Peerless Skill":""}`:`${b.magicalDiscoveriesCount?`${b.magicalDiscoveriesCount} Lore Discoveries · `:""}${b.magicalSecrets?"Magical Secrets · ":""}${b.superiorInspiration?`Initiative floor ${b.superiorInspirationFloor}`:"Bardic Inspiration ready"}${b.wordsOfCreation?" · Words of Creation":""}`};
  }catch(error){console.error("[class-utility] Bard utility failed",error);throw error;}
}
function monkUtility(character){
  try{
    const m=character.monk;if(!m)return null;const resource=character.level>=2?m.resourcePoints:"—",resourceUnit=character.level>=2?`${m.resourceName} Points`:"unavailable";
    return{title:"Centered Discipline",kind:"monk",stats:[stat(m.resourceName,resource,resourceUnit),stat("Martial Arts",m.martialArtsDie,"damage die"),stat("Movement",m.unarmoredMovementBonus?`+${m.unarmoredMovementBonus}`:"—","ft unarmored"),stat("Save DC",monkSaveDc(character),"Monk features")],note:character.ruleset==="2014"?`${m.flurryOfBlows?"Flurry / Patient Defense / Step of the Wind":"Martial Arts ready"}${m.allSaveProficiency?" · Diamond Soul":""}${m.quiveringPalm?" · Quivering Palm":""}${character.level>=20?" · Perfect Self":""}`:`${m.flurryOfBlows?"Focus techniques ready":"Martial Arts ready"}${m.heightenedFocus?" · Heightened Focus":""}${m.allSaveProficiency?" · Disciplined Survivor":""}${m.quiveringPalm?" · Quivering Palm":""}${m.bodyAndMind?" · Body and Mind":""}`};
  }catch(error){console.error("[class-utility] Monk utility failed",error);throw error;}
}
function druidUtility(character){
  try{
    const d=character.druid;if(!d)return null;const s=character.druidSelections||{},forms=character.ruleset==="2014"?(s.fieldForms?.length||0):(s.knownForms?.length||0),uses=d.unlimitedWildShape?"∞":d.wildShapeUses;
    return{title:"The Old Wild",kind:"druid",stats:[stat("Wild Shape",uses,d.unlimitedWildShape?"unlimited":"uses"),stat("Max CR",d.maxCr===.25?"1/4":d.maxCr===.5?"1/2":d.maxCr,"Beast"),stat(character.ruleset==="2024"?"Temp HP":"Field Forms",character.ruleset==="2024"?d.wildShapeTempHp:forms,character.ruleset==="2024"?"on transform":"examples"),stat("Duration",d.durationHours,`hour${d.durationHours===1?"":"s"}`)],note:character.ruleset==="2014"?`${prettyChoice(s.circleLand)||"Land Circle"}${d.naturalRecovery?` · Recover ${d.naturalRecovery} slot levels`:""}${d.beastSpells?" · Beast Spells":""}`:`${prettyChoice(s.primalOrder)}${s.circleLand?` · ${prettyChoice(s.circleLand)} Land`:""}${s.elementalFury?` · ${prettyChoice(s.elementalFury)}`:""}${d.archdruid?" · Evergreen Wild Shape":""}`};
  }catch(error){console.error("[class-utility] Druid utility failed",error);throw error;}
}
function paladinUtility(character){
  try{
    const p=character.paladin;if(!p)return null;const aura=p.auraProtection?`+${paladinAuraBonus(character)}`:"—",channel=p.channelDivinityUses||0;
    return{title:"Sacred Charge",kind:"paladin",stats:[stat("Lay On Hands",p.layOnHandsPool,"HP pool"),stat("Channel",channel,"uses"),stat("Aura",aura,p.auraRange?`${p.auraRange} ft`:"inactive"),stat("Attacks",p.attacksPerAction,"per action")],note:character.ruleset==="2024"?`${p.masteryCount} Weapon Masteries${p.paladinsSmite?" · Divine Smite free cast":""}${p.faithfulSteed?" · Find Steed free cast":""}`:`${p.divineSenseUses} Divine Sense use${p.divineSenseUses===1?"":"s"}${p.divineSmite?" · Divine Smite ready":""}${p.improvedDivineSmite?" · +1d8 Improved Smite":""}`};
  }catch(error){console.error("[class-utility] Paladin utility failed",error);throw error;}
}
function rangerUtility(character){
  try{
    const r=character.ranger;if(!r)return null;const s=character.rangerSelections||{};
    if(character.ruleset==="2014")return{title:"Warden's Mark",kind:"ranger",stats:[stat("Favored Enemy",r.favoredEnemyCount,"types"),stat("Terrain",r.naturalExplorerTerrainCount,"favored"),stat("Attacks",r.attacksPerAction,"per action"),stat("Spells Known",r.known,"Ranger")],note:`${prettyChoice(s.huntersPrey)||"Hunter's Prey"}${s.defensiveTactics?` · ${prettyChoice(s.defensiveTactics)}`:""}${r.vanish?" · Vanish ready":""}`};
    return{title:"Warden's Mark",kind:"ranger",stats:[stat("Hunter's Mark",r.hunterMarkFreeCasts,"free casts"),stat("Mark Die",r.hunterMarkDie,"extra damage"),stat("Masteries",r.masteryCount,"weapons"),stat("Attacks",r.attacksPerAction,"per action")],note:`${r.expertiseCount} Expertise${r.roving?` · Speed +${r.speedBonus} ft / climb / swim`:""}${r.natureVeil?` · Nature's Veil ${r.natureVeilUses}/LR`:""}`};
  }catch(error){console.error("[class-utility] Ranger utility failed",error);throw error;}
}
function fighterUtility(character){try{const fighter=character.fighter;if(!fighter)return null;return{title:"Martial Resources",kind:"fighter",stats:[stat("Second Wind",fighter.secondWindUses,"uses"),stat("Action Surge",fighter.actionSurgeUses,"uses"),stat("Indomitable",fighter.indomitableUses,"uses"),stat("Attacks",fighter.attacksPerAction,"per action")],note:character.ruleset==="2024"?`${fighter.masteryCount} Weapon Masteries · Crit ${fighter.criticalMinimum}+`:`Crit ${fighter.criticalMinimum}+ · ${character.fightingStyles?.length||1} Fighting Style${(character.fightingStyles?.length||1)===1?"":"s"}`};}catch(error){console.error("[class-utility] Fighter utility failed",error);throw error;}}
function wizardUtility(character){try{const spells=character.spells;if(!spells)return null;return{title:"Arcane Toolkit",kind:"wizard",stats:[stat("Spellbook",spells.spellbook?.all?.length||0,"spells"),stat("Prepared",spells.prepared?.all?.length||0,"spells"),stat("Recovery",Math.ceil(character.level/2),"slot levels"),stat("Rituals","✓","book")],note:character.level>=20?`Signature Spells: ${(spells.signatureSpells||[]).length} · Spell Mastery active`:character.level>=18?"Spell Mastery active":character.level>=5&&character.ruleset==="2024"?"Memorize Spell active":"Arcane Recovery after a Short Rest"};}catch(error){console.error("[class-utility] Wizard utility failed",error);throw error;}}
function clericUtility(character){try{const cleric=character.cleric;if(!cleric)return null;return{title:"Sacred Channel",kind:"cleric",stats:[stat("Channel",cleric.channelDivinityUses,"uses"),stat("Divine Spark",cleric.divineSparkDice?`${cleric.divineSparkDice}d8`:"—","base"),stat("Prepared",character.spells?.prepared?.all?.length||0,"spells"),stat("Always",character.spells?.alwaysPrepared?.length||0,"spells")],note:character.ruleset==="2014"?(cleric.destroyUndeadCr?`Destroy Undead CR ${cleric.destroyUndeadCr}`:"Turn Undead ready"):`Holy Symbol focus · ${character.divineOrder||"Divine Order"}`};}catch(error){console.error("[class-utility] Cleric utility failed",error);throw error;}}
function rogueUtility(){return null;}
function defaultUtility(){return null;}
function stat(label,value,unit){return{label,value,unit};}
function prettyChoice(value){return value?String(value).replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase()):"";}
