export function buildClassUtility(character){
  try{
    const builders={barbarian:barbarianUtility,fighter:fighterUtility,wizard:wizardUtility,cleric:clericUtility,rogue:rogueUtility};
    return (builders[character?.class?.id]||defaultUtility)(character);
  }catch(error){console.error("[class-utility] build failed",error);throw error;}
}

function barbarianUtility(character){
  try{
    const b=character.barbarian;if(!b)return null;const rage=b.unlimitedRage?"∞":b.rageUses,is2014=character.ruleset==="2014",brutal=is2014?(b.brutalCriticalDice?`+${b.brutalCriticalDice}`:"—"):(b.brutalStrikeDice?`${b.brutalStrikeDice}d10`:"—");
    return{
      title:"Primal Fury",kind:"barbarian",
      stats:[stat("Rage",rage,b.unlimitedRage?"unlimited":"uses"),stat("Rage Damage",`+${b.rageDamage}`,"damage"),stat("Attacks",b.attacksPerAction,"per action"),stat(is2014?"Crit Dice":"Brutal Strike",brutal,is2014?"weapon dice":"extra damage")],
      note:character.ruleset==="2024"?`${b.masteryCount} Weapon Masteries${b.brutalStrikeEffectCount?` · ${b.brutalStrikeEffectCount} Brutal Strike effect${b.brutalStrikeEffectCount===1?"":"s"}`:""}${b.frenzy?" · Frenzy active":""}`:`${b.initiativeAdvantage?"Feral Instinct · ":""}${b.frenzy?"Berserker Frenzy · ":""}${b.relentlessRage?"Relentless Rage ready":"Rage ready"}`
    };
  }catch(error){console.error("[class-utility] Barbarian utility failed",error);throw error;}
}
function fighterUtility(character){
  try{
    const fighter=character.fighter;if(!fighter)return null;
    return{
      title:"Martial Resources",kind:"fighter",
      stats:[
        stat("Second Wind",fighter.secondWindUses,"uses"),stat("Action Surge",fighter.actionSurgeUses,"uses"),stat("Indomitable",fighter.indomitableUses,"uses"),stat("Attacks",fighter.attacksPerAction,"per action")
      ],
      note:character.ruleset==="2024"?`${fighter.masteryCount} Weapon Masteries · Crit ${fighter.criticalMinimum}+`:`Crit ${fighter.criticalMinimum}+ · ${character.fightingStyles?.length||1} Fighting Style${(character.fightingStyles?.length||1)===1?"":"s"}`
    };
  }catch(error){console.error("[class-utility] Fighter utility failed",error);throw error;}
}
function wizardUtility(character){
  try{
    const spells=character.spells;if(!spells)return null;
    return{
      title:"Arcane Toolkit",kind:"wizard",
      stats:[stat("Spellbook",spells.spellbook?.all?.length||0,"spells"),stat("Prepared",spells.prepared?.all?.length||0,"spells"),stat("Recovery",Math.ceil(character.level/2),"slot levels"),stat("Rituals","✓","book")],
      note:character.level>=20?`Signature Spells: ${(spells.signatureSpells||[]).length} · Spell Mastery active`:character.level>=18?"Spell Mastery active":character.level>=5&&character.ruleset==="2024"?"Memorize Spell active":"Arcane Recovery after a Short Rest"
    };
  }catch(error){console.error("[class-utility] Wizard utility failed",error);throw error;}
}
function clericUtility(character){
  try{
    const cleric=character.cleric;if(!cleric)return null;
    return{
      title:"Sacred Channel",kind:"cleric",
      stats:[stat("Channel",cleric.channelDivinityUses,"uses"),stat("Divine Spark",cleric.divineSparkDice?`${cleric.divineSparkDice}d8`:"—","base"),stat("Prepared",character.spells?.prepared?.all?.length||0,"spells"),stat("Always",character.spells?.alwaysPrepared?.length||0,"spells")],
      note:character.ruleset==="2014"?(cleric.destroyUndeadCr?`Destroy Undead CR ${cleric.destroyUndeadCr}`:"Turn Undead ready"):`Holy Symbol focus · ${character.divineOrder||"Divine Order"}`
    };
  }catch(error){console.error("[class-utility] Cleric utility failed",error);throw error;}
}
function rogueUtility(){return null;}
function defaultUtility(){return null;}
function stat(label,value,unit){return{label,value,unit};}
