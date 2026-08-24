export function buildSorcererUtility(character){
  try{
    if(character?.class?.id!=="sorcerer")return null;
    const s=character.sorcerer,selections=character.sorcererSelections;
    if(!s||!selections)throw new Error("Sorcerer print utility requires progression and selection state.");
    const draconic=selections.draconic||{},spellCount=character.ruleset==="2014"?(character.spells?.known?.all?.length||0):(character.spells?.prepared?.all?.length||0),spellUnit=character.ruleset==="2014"?"known":"prepared";
    return Object.freeze({
      title:"Innate Arcane",kind:"sorcerer",
      stats:Object.freeze([
        stat("Sorcery Points",s.sorceryPoints,s.sorceryPoints?"maximum":"unavailable"),
        stat("Metamagic",s.metamagicCount,"options"),
        stat("Spell DC",character.spells?.saveDc??"—","Charisma"),
        stat("Spells",spellCount,spellUnit)
      ]),
      note:character.ruleset==="2014"?legacyNote(character,s,draconic):revisedNote(character,s,draconic)
    });
  }catch(error){console.error("[sorcerer-utility] build failed",error);throw error;}
}

function legacyNote(character,s,draconic){
  try{
    const parts=[];
    if(draconic.ancestry)parts.push(`${draconic.ancestry.name} ancestry · ${draconic.ancestry.damageType}`);
    if(s.draconicResilience)parts.push(`Draconic Resilience +${character.draconicHpBonus||0} HP`);
    if(s.elementalAffinity&&draconic.elementalAffinity)parts.push(`${draconic.elementalAffinity} affinity`);
    if(s.sorcerousRestoration)parts.push(`Short Rest +${s.sorcerousRestorationAmount} SP`);
    return parts.join(" · ")||"Spellcasting ready";
  }catch(error){console.error("[sorcerer-utility] 2014 note failed",error);throw error;}
}

function revisedNote(character,s,draconic){
  try{
    const parts=[];
    if(s.innateSorcery)parts.push(`${s.innateSorceryUses} Innate Sorcery/LR`);
    if(s.sorcerousRestoration)parts.push(`Short Rest +${s.sorcerousRestorationAmount} SP, 1/LR`);
    if(s.elementalAffinity&&draconic.elementalAffinity)parts.push(`${draconic.elementalAffinity} affinity`);
    if(s.sorceryIncarnate)parts.push("Sorcery Incarnate");
    if(s.arcaneApotheosis)parts.push("Arcane Apotheosis");
    return parts.join(" · ")||"Innate Sorcery ready";
  }catch(error){console.error("[sorcerer-utility] 2024 note failed",error);throw error;}
}

function stat(label,value,unit){return Object.freeze({label,value,unit});}
