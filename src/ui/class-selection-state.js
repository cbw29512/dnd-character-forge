export function classSelectionsFromCharacter(character){
  try{
    const classId=character?.class?.id,advancements=advancementValues(character);
    if(classId==="cleric")return removeEmpty({divineOrder:character.divineOrder,blessedStrikes:character.blessedStrikes,advancements});
    if(classId==="bard")return removeEmpty({instruments:[...(character.bardSelections?.instruments||[])],loreBonusSkills:[...(character.bardSelections?.loreBonusSkills||[])],expertise:[...(character.bardSelections?.expertise||[])],advancements});
    if(classId==="monk")return removeEmpty({monkTool:character.monkSelections?.tool||null,advancements});
    if(classId==="sorcerer")return removeEmpty({metamagic:[...(character.sorcererSelections?.metamagic?.all||[])],draconicAncestry:character.sorcererSelections?.draconic?.ancestry?.id||null,elementalAffinity:character.sorcererSelections?.draconic?.elementalAffinity||null,advancements});
    if(classId==="warlock")return removeEmpty({pactBoon:character.warlockSelections?.pactBoon?.id||null,eldritchInvocations:[...(character.warlockSelections?.invocations?.all||[])],advancements});
    if(classId==="druid")return removeEmpty({...structuredClone(character.druidSelections||{}),advancements});
    if(classId==="ranger")return removeEmpty({...structuredClone(character.rangerSelections||{}),fightingStyle:character.fightingStyle?.id||null,advancements});
    if(classId==="paladin")return removeEmpty({fightingStyle:character.fightingStyle?.id||null,advancements});
    if(classId==="fighter")return removeEmpty({fightingStyle:character.fightingStyles?.[0]?.id||character.fightingStyle?.id||null,additionalFightingStyle:character.fightingStyles?.[1]?.id||null,advancements});
    if(classId==="rogue")return removeEmpty({expertise:[...(character.expertise||[])],advancements});
    if(classId==="wizard"&&character.ruleset==="2024"&&Number(character.level)>=2)return removeEmpty({scholarExpertise:character.expertise?.[0]||null,advancements});
    return removeEmpty({advancements});
  }catch(error){console.error("[class-selection-state] restore failed",error);throw error;}
}
function advancementValues(character){const values=(character?.classAdvancements||[]).map(record=>record?.optionId==="asi"?null:record?.optionId||null);while(values.length&&values.at(-1)==null)values.pop();return values;}
function removeEmpty(object){return Object.fromEntries(Object.entries(object).filter(([,value])=>Array.isArray(value)?value.length>0:value!==null&&value!==undefined&&value!==""));}