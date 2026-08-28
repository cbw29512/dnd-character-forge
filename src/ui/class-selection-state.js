export function classSelectionsFromCharacter(character){
  try{
    const classId=character?.class?.id,base={classSkills:[...(character?.classSkillChoices||[])],weaponMasteries:[...(character?.masteryIds||[])],advancements:advancementValues(character)};
    if(classId==="cleric")return removeEmpty({...base,divineOrder:character.divineOrder,blessedStrikes:character.blessedStrikes});
    if(classId==="bard")return removeEmpty({...base,instruments:[...(character.bardSelections?.instruments||[])],loreBonusSkills:[...(character.bardSelections?.loreBonusSkills||[])],expertise:[...(character.bardSelections?.expertise||[])]});
    if(classId==="monk")return removeEmpty({...base,monkTool:character.monkSelections?.tool||null});
    if(classId==="sorcerer")return removeEmpty({...base,metamagic:[...(character.sorcererSelections?.metamagic?.all||[])],draconicAncestry:character.sorcererSelections?.draconic?.ancestry?.id||null,elementalAffinity:character.sorcererSelections?.draconic?.elementalAffinity||null});
    if(classId==="warlock")return removeEmpty({...base,pactBoon:character.warlockSelections?.pactBoon?.id||null,eldritchInvocations:[...(character.warlockSelections?.invocations?.all||[])]});
    if(classId==="druid")return removeEmpty({...base,...structuredClone(character.druidSelections||{})});
    if(classId==="ranger")return removeEmpty({...base,...structuredClone(character.rangerSelections||{}),fightingStyle:character.fightingStyle?.id||null});
    if(classId==="paladin")return removeEmpty({...base,fightingStyle:character.fightingStyle?.id||null});
    if(classId==="fighter")return removeEmpty({...base,fightingStyle:character.fightingStyles?.[0]?.id||character.fightingStyle?.id||null,additionalFightingStyle:character.fightingStyles?.[1]?.id||null});
    if(classId==="rogue")return removeEmpty({...base,expertise:[...(character.expertise||[])]});
    if(classId==="wizard"&&character.ruleset==="2024"&&Number(character.level)>=2)return removeEmpty({...base,scholarExpertise:character.expertise?.[0]||null});
    return removeEmpty(base);
  }catch(error){console.error("[class-selection-state] restore failed",error);throw error;}
}
function advancementValues(character){const values=(character?.classAdvancements||[]).map(record=>record?.optionId==="asi"?null:record?.optionId||null);while(values.length&&values.at(-1)==null)values.pop();return values;}
function removeEmpty(object){return Object.fromEntries(Object.entries(object).filter(([,value])=>Array.isArray(value)?value.length>0:value!==null&&value!==undefined&&value!==""));}
