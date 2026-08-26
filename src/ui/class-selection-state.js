export function classSelectionsFromCharacter(character){
  try{
    const classId=character?.class?.id;
    if(classId==="cleric")return removeEmpty({divineOrder:character.divineOrder,blessedStrikes:character.blessedStrikes});
    if(classId==="bard")return removeEmpty({instruments:[...(character.bardSelections?.instruments||[])],loreBonusSkills:[...(character.bardSelections?.loreBonusSkills||[])],expertise:[...(character.bardSelections?.expertise||[])]});
    if(classId==="monk")return removeEmpty({monkTool:character.monkSelections?.tool||null});
    if(classId==="sorcerer")return removeEmpty({metamagic:[...(character.sorcererSelections?.metamagic?.all||[])],draconicAncestry:character.sorcererSelections?.draconic?.ancestry?.id||null,elementalAffinity:character.sorcererSelections?.draconic?.elementalAffinity||null});
    if(classId==="warlock")return removeEmpty({pactBoon:character.warlockSelections?.pactBoon?.id||null,eldritchInvocations:[...(character.warlockSelections?.invocations?.all||[])]});
    if(classId==="druid")return removeEmpty(structuredClone(character.druidSelections||{}));
    if(classId==="ranger")return removeEmpty({...structuredClone(character.rangerSelections||{}),fightingStyle:character.fightingStyle?.id||null});
    if(classId==="paladin")return removeEmpty({fightingStyle:character.fightingStyle?.id||null});
    return{};
  }catch(error){console.error("[class-selection-state] restore failed",error);throw error;}
}
function removeEmpty(object){return Object.fromEntries(Object.entries(object).filter(([,value])=>Array.isArray(value)?value.length>0:value!==null&&value!==undefined&&value!==""));}
