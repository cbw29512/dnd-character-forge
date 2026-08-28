import { sample } from "./random.js";
import { duplicateValues, uniqueStrings } from "./duplicates.js";
import { canonicalizeSkillValues } from "./skill-ids.js";

export function resolveClassSkillChoices({cls,background,selections={},reservedSkills=[],guaranteedSkills=[],excludedSkills=[]}){
  try{
    if(!cls?.skillCount||!Array.isArray(cls.skillChoices))return[];

    // Saved state from older UI revisions may contain display labels such as
    // "Animal Handling" instead of the canonical engine id "animalHandling".
    // Canonicalize before duplicate and legality checks so equivalent stale state
    // cannot crash generation, while genuinely unsupported values still fail closed.
    const requested=canonicalizeSkillValues([...(selections.classSkills||[])]),
      duplicates=duplicateValues(requested),
      backgroundSkills=canonicalizeSkillValues([...(background?.skills||[])]),
      guaranteed=new Set(canonicalizeSkillValues(guaranteedSkills)),
      excluded=new Set(canonicalizeSkillValues(excludedSkills));

    if(duplicates.length)throw new Error(`Duplicate ${cls.name} class skill choice: ${duplicates.join(", ")}.`);
    if(requested.length>cls.skillCount)throw new Error(`Choose at most ${cls.skillCount} ${cls.name} class skill proficienc${cls.skillCount===1?"y":"ies"}.`);

    const illegal=requested.filter(skill=>!cls.skillChoices.includes(skill));
    if(illegal.length)throw new Error(`Illegal ${cls.name} class skill choice: ${illegal.join(", ")}.`);

    const conflicts=requested.filter(skill=>backgroundSkills.includes(skill)||guaranteed.has(skill)||excluded.has(skill));
    if(conflicts.length)throw new Error(`${cls.name} class skill choices must add new proficiencies: ${conflicts.join(", ")}. Choose a different class skill or change the conflicting background/species/class feature choice.`);

    // An excluded skill is supplied by another verified class feature (for example College of Lore),
    // so an Expertise lock on that skill must not consume a base class proficiency slot.
    const requiredReservations=uniqueStrings(canonicalizeSkillValues(reservedSkills).filter(skill=>!backgroundSkills.includes(skill)&&!guaranteed.has(skill)&&!excluded.has(skill)));
    const illegalReservations=requiredReservations.filter(skill=>!cls.skillChoices.includes(skill));
    if(illegalReservations.length)throw new Error(`${cls.name} fixed feature choices require unavailable class skill proficiencies: ${illegalReservations.join(", ")}.`);

    const fixed=uniqueStrings([...requested,...requiredReservations]);
    if(fixed.length>cls.skillCount)throw new Error(`${cls.name} fixed skill and Expertise choices require ${fixed.length} class proficiencies, but the class grants only ${cls.skillCount}.`);

    const pool=cls.skillChoices.filter(skill=>!excluded.has(skill)),random=sample(pool,cls.skillCount-fixed.length,[...backgroundSkills,...guaranteed,...fixed]);
    return uniqueStrings([...fixed,...random]);
  }catch(error){
    console.error("[class-skills] resolution failed",error);
    throw error;
  }
}
