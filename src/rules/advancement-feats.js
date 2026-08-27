import { ADVANCEMENT_ASI_ID, advancementFeatOptionsFor, advancementOptionById, isForgeOriginalFeat } from "../data/feat-library.js";

export function advancementLevelsFor(cls,level){
  try{
    const value=Number(level);if(!cls||!Number.isInteger(value))throw new Error("Advancement level lookup requires a class and integer level.");
    return [...(cls.asiLevels||[4])].filter(required=>value>=required).sort((a,b)=>a-b);
  }catch(error){console.error("[advancement-feats] level lookup failed",error);throw error;}
}

export function resolveClassAdvancements({ruleset,level,cls,abilities,selections={},skills=[]}){
  try{
    const levels=advancementLevelsFor(cls,level),requested=Array.isArray(selections.advancements)?selections.advancements:[],next={...abilities},records=[],feats=[],addedSkills=[],addedTools=[],used=new Set();let speedBonus=0;
    if(requested.length>levels.length)throw new Error(`${cls.name} has only ${levels.length} advancement slot${levels.length===1?"":"s"} at level ${level}.`);
    for(let index=0;index<levels.length;index++){
      const slotLevel=levels[index],id=requested[index]||ADVANCEMENT_ASI_ID,option=advancementOptionById(ruleset,id);if(!option)throw new Error(`Advancement choice "${id}" is unavailable for ${ruleset}.`);
      if((option.minLevel||4)>slotLevel)throw new Error(`${option.name} cannot be selected at class level ${slotLevel}.`);
      if(option.kind==="feat"&&!option.repeatable&&used.has(option.id))throw new Error(`${option.name} cannot be taken more than once.`);
      assertPrerequisites(option,next);
      if(option.kind==="asi"){
        const applied=applySingleAsi(next,cls.abilityPriority||[]);records.push(Object.freeze({level:slotLevel,optionId:ADVANCEMENT_ASI_ID,name:option.name,kind:"asi",contentKind:"official-srd",appliedAbilities:Object.freeze([...applied])}));continue;
      }
      const appliedAbility=applyFeatAbility(next,option,cls.abilityPriority||[]),grantedSkill=grantSkill(option,[...skills,...addedSkills]),grantedTool=option.tool||null;
      if(grantedSkill)addedSkills.push(grantedSkill);if(grantedTool)addedTools.push(grantedTool);speedBonus+=Number(option.speedBonus||0);used.add(option.id);feats.push(option);
      records.push(Object.freeze({level:slotLevel,optionId:option.id,name:option.name,kind:"feat",contentKind:option.contentKind,appliedAbility,grantedSkill,grantedTool,source:option.source}));
    }
    return Object.freeze({scores:Object.freeze(next),records:Object.freeze(records),feats:Object.freeze(feats),addedSkills:Object.freeze(addedSkills),addedTools:Object.freeze(addedTools),speedBonus});
  }catch(error){console.error("[advancement-feats] resolution failed",error);throw error;}
}

export function validateClassAdvancements(character){
  try{
    const errors=[],records=character.classAdvancements||[],levels=advancementLevelsFor(character.class,character.level);if(records.length!==levels.length)errors.push(`${character.class.name} should have ${levels.length} resolved advancement slot${levels.length===1?"":"s"}.`);
    const ids=records.filter(record=>record.kind==="feat").map(record=>record.optionId),seen=new Set();for(const id of ids){const option=advancementOptionById(character.ruleset,id);if(!option){errors.push(`Unknown advancement feat ${id}.`);continue;}if(!option.repeatable&&seen.has(id))errors.push(`${option.name} cannot be taken more than once.`);seen.add(id);}
    for(let index=0;index<Math.min(records.length,levels.length);index++){
      const record=records[index],expectedLevel=levels[index],option=advancementOptionById(character.ruleset,record.optionId);if(record.level!==expectedLevel)errors.push(`Advancement slot ${index+1} should unlock at level ${expectedLevel}.`);if(!option)continue;if(option.kind!==record.kind)errors.push(`Advancement slot ${index+1} has the wrong choice kind.`);if(isForgeOriginalFeat(option)&&record.contentKind!=="forge-original")errors.push(`${option.name} lost its Forge Original source label.`);if(record.grantedSkill&&!character.skills.includes(record.grantedSkill))errors.push(`${option.name} granted skill ${record.grantedSkill} is missing.`);if(record.grantedTool&&!character.toolProficiencies.includes(record.grantedTool))errors.push(`${option.name} granted tool ${record.grantedTool} is missing.`);
    }
    const actualClassFeatIds=new Set(records.filter(record=>record.kind==="feat").map(record=>record.optionId));for(const id of actualClassFeatIds)if(!character.feats.some(feat=>feat.id===id))errors.push(`Advancement feat ${id} is missing from the character feat list.`);
    for(const feat of character.feats.filter(feat=>feat.advancementFeat))if(!actualClassFeatIds.has(feat.id))errors.push(`Feat ${feat.name} appeared without a legal class advancement slot.`);
    const expectedSpeed=records.reduce((sum,record)=>sum+Number(advancementOptionById(character.ruleset,record.optionId)?.speedBonus||0),0);if(Number(character.advancementSpeedBonus||0)!==expectedSpeed)errors.push(`Advancement Speed bonus should be ${expectedSpeed}.`);
    return errors;
  }catch(error){console.error("[advancement-feats] validation failed",error);throw error;}
}

export function advancementChoicesForState(ruleset,cls,level){
  try{
    const levels=advancementLevelsFor(cls,level),options=advancementFeatOptionsFor(ruleset);return levels.map(slotLevel=>Object.freeze({level:slotLevel,options:Object.freeze(options.filter(option=>(option.minLevel||4)<=slotLevel))}));
  }catch(error){console.error("[advancement-feats] UI choices failed",error);throw error;}
}

function applySingleAsi(scores,priority){
  const order=[...new Set(priority)].filter(ability=>Object.hasOwn(scores,ability)),eligible=order.filter(ability=>scores[ability]<20),first=eligible[0];if(!first)return[];
  if(scores[first]<=18){scores[first]+=2;return[first,first];}
  scores[first]+=1;const second=eligible.find(ability=>ability!==first&&scores[ability]<20);if(second){scores[second]+=1;return[first,second];}return[first];
}
function applyFeatAbility(scores,option,priority){
  try{
    if(!option.abilityIncrease)return null;let ability=option.abilityIncreaseAbility||null;if(!ability&&option.abilityIncreaseChoices?.length){const choices=option.abilityIncreaseChoices,ordered=[...priority,...choices].filter((value,index,array)=>choices.includes(value)&&array.indexOf(value)===index);ability=ordered.find(value=>scores[value]<20)||ordered[0];}
    if(!ability||!Object.hasOwn(scores,ability))throw new Error(`${option.name} has no legal ability increase target.`);scores[ability]=Math.min(20,scores[ability]+option.abilityIncrease);return ability;
  }catch(error){console.error(`[advancement-feats] ${option?.name||"feat"} ability increase failed`,error);throw error;}
}
function grantSkill(option,current){
  try{if(!option.extraSkillPool?.length)return null;return option.extraSkillPool.find(skill=>!current.includes(skill))||null;}catch(error){console.error(`[advancement-feats] ${option?.name||"feat"} skill grant failed`,error);throw error;}
}
function assertPrerequisites(option,scores){
  try{
    for(const [ability,minimum] of Object.entries(option.prerequisites||{}))if((scores[ability]||0)<minimum)throw new Error(`${option.name} requires ${ability.toUpperCase()} ${minimum}+.`);
    if(option.prerequisiteAnyAbility?.length){const minimum=option.prerequisiteMinimum||13;if(!option.prerequisiteAnyAbility.some(ability=>(scores[ability]||0)>=minimum))throw new Error(`${option.name} requires ${option.prerequisiteAnyAbility.map(value=>value.toUpperCase()).join(" or ")} ${minimum}+.`);}
  }catch(error){console.error(`[advancement-feats] ${option?.name||"feat"} prerequisite failed`,error);throw error;}
}
