export function emptySpellSelections(){
  return{cantrips:[],known:[],spellbook:[],prepared:[],magicalSecrets:[],loreDiscoveries:[],arcanum6:[],arcanum7:[],arcanum8:[],arcanum9:[],masteryLevel1:null,masteryLevel2:null,signatureSpells:[]};
}

export function spellSelectionsFromCharacter(character){
  try{
    const out=emptySpellSelections(),spells=character?.spells;if(!spells)return out;const classId=character.class?.id;
    out.cantrips=[...(spells.cantrips?.all||[])];
    if(classId==="wizard"){
      out.spellbook=[...(spells.spellbook?.all||[])];out.prepared=[...(spells.prepared?.all||[])];out.masteryLevel1=spells.spellMastery?.level1||null;out.masteryLevel2=spells.spellMastery?.level2||null;out.signatureSpells=[...(spells.signatureSpells||[])];return out;
    }
    if(classId==="bard"){
      out.loreDiscoveries=[...(spells.loreDiscoveries||[])];
      if(character.ruleset==="2014"){
        out.magicalSecrets=[...(spells.magicalSecrets||[])];const special=new Set([...out.magicalSecrets,...out.loreDiscoveries]);out.known=[...(spells.known?.all||[])].filter(id=>!special.has(id));
      }else out.prepared=[...(spells.prepared?.all||[])];
      return out;
    }
    if(classId==="ranger"){if(character.ruleset==="2014")out.known=[...(spells.known?.all||[])];else out.prepared=[...(spells.prepared?.all||[])];return out;}
    if(classId==="sorcerer"){if(character.ruleset==="2014")out.known=[...(spells.known?.all||[])];else out.prepared=[...(spells.prepared?.all||[])];return out;}
    if(classId==="warlock"){
      if(character.ruleset==="2014")out.known=[...(spells.known?.all||[])];else out.prepared=[...(spells.prepared?.all||[])];
      for(const level of [6,7,8,9]){const id=spells.mysticArcanum?.[level];out[`arcanum${level}`]=id?[id]:[];}return out;
    }
    if(["cleric","druid","paladin"].includes(classId)){out.prepared=[...(spells.prepared?.all||[])];return out;}
    return out;
  }catch(error){console.error("[spell-selection-state] restore failed",error);throw error;}
}