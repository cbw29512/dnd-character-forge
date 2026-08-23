import { druidProgressionFor, legalFormsForProgression, LAND_2014, LAND_2024, PRIMAL_ORDERS_2024, ELEMENTAL_FURY_2024, druidPickerLimits } from "./druid.js";
import { druidAlwaysPrepared } from "./druid-spellcasting.js";

const KEYS=["cantrips","prepared","wildShapeUses","unlimitedWildShape","wildShapeTempHp","knownFormCount","maxCr","allowSwim","allowFly","durationHours","naturalRecovery","beastSpells","archdruid"];

export function validateDruidCharacter(character){
  try{
    const errors=[],actual=character.druid;if(!actual)return["Druid progression data is missing."];const expected=druidProgressionFor(character.ruleset,character.level,character.subclass?.id);
    for(const key of KEYS)if(actual[key]!==expected[key])errors.push(`Druid ${key} should be ${String(expected[key])}.`);if(JSON.stringify(actual.slots)!==JSON.stringify(expected.slots))errors.push("Druid spell-slot progression is incorrect.");
    if(!(character.toolProficiencies||[]).includes("Herbalism Kit"))errors.push("Druid is missing Herbalism Kit proficiency.");
    validateSpellState(errors,character,expected);validateFormState(errors,character,expected);
    if(character.ruleset==="2014")validate2014(errors,character,expected);else if(character.ruleset==="2024")validate2024(errors,character,expected);else errors.push(`Druid is not verified for ruleset ${character.ruleset}.`);
    return errors;
  }catch(error){console.error("[druid-validation] validation failed",error);throw error;}
}
function validateSpellState(errors,c,expected){
  try{
    if(!c.spells){errors.push("Druid spellcasting state is missing.");return;}const limits=druidPickerLimits({ruleset:c.ruleset,level:c.level,subclassId:c.subclass?.id,primalOrder:c.druidSelections?.primalOrder}),preparedExpected=c.ruleset==="2014"?Math.max(1,c.level+Math.floor((c.abilities.wis-10)/2)):expected.prepared;
    if((c.spells.cantrips?.all||[]).length!==limits.cantrips)errors.push(`Druid should have ${limits.cantrips} selected cantrips.`);if((c.spells.prepared?.all||[]).length!==preparedExpected)errors.push(`Druid should have ${preparedExpected} normally prepared spells.`);if((c.spells.known?.all||[]).length)errors.push("Druid cannot contain spells-known class state.");
    const always=druidAlwaysPrepared(c);if(JSON.stringify(c.spells.alwaysPrepared)!==JSON.stringify(always))errors.push("Druid always-prepared spell state is incorrect.");
  }catch(error){console.error("[druid-validation] spell-state validation failed",error);throw error;}
}
function validateFormState(errors,c,expected){
  try{
    const legal=new Set(legalFormsForProgression(c.ruleset,expected).map(form=>form.id)),selected=c.ruleset==="2014"?(c.druidSelections?.fieldForms||[]):(c.druidSelections?.knownForms||[]),required=c.ruleset==="2014"?(c.level<2?0:Math.min(4,legal.size)):expected.knownFormCount;
    if(selected.length!==required)errors.push(`${c.ruleset} Druid should carry ${required} ${c.ruleset==="2014"?"field-form examples":"known Wild Shape forms"}.`);if(new Set(selected).size!==selected.length)errors.push("Druid Wild Shape selections contain duplicates.");for(const id of selected)if(!legal.has(id))errors.push(`Illegal ${c.ruleset} Wild Shape form: ${id}.`);
  }catch(error){console.error("[druid-validation] form-state validation failed",error);throw error;}
}
function validate2014(errors,c,expected){
  try{
    const s=c.druidSelections||{};if(s.knownForms?.length)errors.push("2014 Druid cannot contain 2024 known-form state.");if(s.primalOrder||s.elementalFury)errors.push("2014 Druid cannot contain Primal Order or Elemental Fury.");
    if(c.subclass?.id==="circle-land"&&c.level>=2&&!LAND_2014.includes(s.circleLand))errors.push("2014 Circle of the Land selection is missing or illegal.");if(c.subclass?.id!=="circle-land"&&s.circleLand)errors.push("2014 Druid has Circle land state without Circle of the Land.");
    if(c.feats.some(feat=>feat.category==="Epic Boon"))errors.push("2014 Druid cannot contain a 2024 Epic Boon.");for(const name of ["Primal Order","Wild Companion","Wild Resurgence","Elemental Fury","Improved Elemental Fury","Epic Boon"])if(c.features.includes(name))errors.push(`2014 Druid cannot contain 2024 feature ${name}.`);
    if(expected.unlimitedWildShape&&c.druid.wildShapeUses!==2)errors.push("2014 Archdruid should preserve the base two-use progression while marking Wild Shape unlimited separately.");if(c.druid.wildShapeTempHp!==null)errors.push("2014 Wild Shape cannot contain 2024 temporary-hit-point state.");
  }catch(error){console.error("[druid-validation] 2014 validation failed",error);throw error;}
}
function validate2024(errors,c,expected){
  try{
    const s=c.druidSelections||{};if(s.fieldForms?.length)errors.push("2024 Druid cannot contain 2014 field-form state.");if(!PRIMAL_ORDERS_2024.includes(s.primalOrder))errors.push("2024 Druid Primal Order is missing or illegal.");
    if(c.subclass?.id==="circle-land"&&c.level>=3&&!LAND_2024.includes(s.circleLand))errors.push("2024 Circle of the Land selection is missing or illegal.");if(c.subclass?.id!=="circle-land"&&s.circleLand)errors.push("2024 Druid has Circle land state without Circle of the Land.");if(c.level>=7&&!ELEMENTAL_FURY_2024.includes(s.elementalFury))errors.push("2024 Druid Elemental Fury choice is missing or illegal.");if(c.level<7&&s.elementalFury)errors.push("Elemental Fury appeared before Druid level 7.");
    if((s.knownForms||[]).includes("giant-eagle"))errors.push("2024 Giant Eagle is not in the verified Beast Wild Shape catalog.");const boon=c.feats.some(feat=>feat.id==="boon-dimensional-travel");if(c.level>=19&&!boon)errors.push("Level 19+ Druid is missing Boon of Dimensional Travel.");if(c.level<19&&boon)errors.push("Boon of Dimensional Travel appeared before Druid level 19.");
    for(const name of ["Timeless Body","Bonus Cantrip","Land's Stride"])if(c.features.includes(name))errors.push(`2024 Druid cannot contain legacy 2014 feature ${name}.`);
    if(expected.archdruid&&c.druid.unlimitedWildShape)errors.push("2024 Archdruid does not grant unlimited Wild Shape uses.");if(c.level>=2&&c.druid.wildShapeTempHp!==c.level)errors.push("2024 Wild Shape temporary hit points must equal Druid level.");
  }catch(error){console.error("[druid-validation] 2024 validation failed",error);throw error;}
}
