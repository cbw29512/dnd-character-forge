import { buildQuickReference as buildCoreQuickReference } from "./reference.js";
import { buildBarbarianQuickReference } from "./barbarian-reference.js";
import { buildBardQuickReference } from "./bard-reference.js";
import { buildMonkQuickReference } from "./monk-reference.js";
import { buildSorcererQuickReference } from "./sorcerer-reference.js";
import { buildWarlockQuickReference } from "./warlock-reference.js";
import { buildDruidQuickReference } from "./druid-reference.js";
import { buildPaladinQuickReference } from "./paladin-reference.js";
import { buildRangerQuickReference } from "./ranger-reference.js";
import { isForgeOriginalSubclass, originalSubclassDefinition, originalSubclassFeatureNamesFor, originalSubclassFeatureRecordsFor, originalSubclassSource } from "../data/original-subclasses.js";

const ORIGINAL_BASE_REFERENCE_OMISSIONS=Object.freeze({
  sorcerer:Object.freeze(new Set(["Sorcerous Origin","Sorcerer Subclass"]))
});

export function buildQuickReference(character){
  try{
    if(character?.class?.id==="barbarian")return buildBarbarianQuickReference(character);
    if(isForgeOriginalSubclass(character?.subclass))return buildForgeOriginalQuickReference(character);
    return routeBaseReference(character);
  }catch(error){console.error("[reference-router] build failed",error);throw error;}
}

function buildForgeOriginalQuickReference(character){
  try{
    const classId=character.class.id;
    const subclassId=character.subclass.id;
    const names=originalSubclassFeatureNamesFor(character.ruleset,classId,subclassId);
    const omissions=ORIGINAL_BASE_REFERENCE_OMISSIONS[classId]||new Set();
    const filtered=(character.features||[]).filter(name=>!names.has(name)&&!omissions.has(name));
    let safe={...character,features:filtered};

    // The mature 2014 Sorcerer reference builder eagerly prepares its Draconic
    // ancestry reference map even when the selected subclass is not Draconic.
    // Supply a private placeholder only to let base-class references resolve;
    // the Dragon Ancestor feature itself is filtered out and never rendered.
    if(classId==="sorcerer"&&character.ruleset==="2014"&&!safe.sorcererSelections?.draconic?.ancestry){
      safe={...safe,sorcererSelections:{...(safe.sorcererSelections||{}),draconic:{...(safe.sorcererSelections?.draconic||{}),ancestry:{name:"Reference placeholder",damageType:"fire"}}}};
    }

    const items=[...routeBaseReference(safe)];
    const definition=originalSubclassDefinition(character.ruleset,classId,subclassId);
    const source=originalSubclassSource(classId);
    if(!definition)throw new Error(`Missing Forge-original definition for ${classId}:${subclassId}.`);
    for(const record of originalSubclassFeatureRecordsFor(character.ruleset,classId,character.level,subclassId))items.push({id:`feature:${record.name}`,name:record.name,category:definition.name,timing:record.timing,text:record.text,source});
    const ids=items.map(item=>item.id);
    if(new Set(ids).size!==ids.length)throw new Error(`Duplicate ${definition.name} quick-reference entries detected.`);
    return items;
  }catch(error){console.error("[reference-router] Forge-original reference build failed",error);throw error;}
}

function routeBaseReference(character){
  if(character?.class?.id==="bard")return buildBardQuickReference(character);
  if(character?.class?.id==="monk")return buildMonkQuickReference(character);
  if(character?.class?.id==="sorcerer")return buildSorcererQuickReference(character);
  if(character?.class?.id==="warlock")return buildWarlockQuickReference(character);
  if(character?.class?.id==="druid")return buildDruidQuickReference(character);
  if(character?.class?.id==="paladin")return buildPaladinQuickReference(character);
  if(character?.class?.id==="ranger")return buildRangerQuickReference(character);
  return buildCoreQuickReference(character);
}
