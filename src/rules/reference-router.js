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
import { isForgeOriginalBackground, originalBackgroundReference } from "../data/original-backgrounds.js";

const ORIGINAL_BASE_REFERENCE_OMISSIONS=Object.freeze({
  sorcerer:Object.freeze(new Set(["Sorcerous Origin","Sorcerer Subclass"]))
});

export function buildQuickReference(character){
  try{
    if(isForgeOriginalBackground(character?.background)||isForgeOriginalSubclass(character?.subclass))return buildForgeCompatibleQuickReference(character);
    if(character?.class?.id==="barbarian")return buildBarbarianQuickReference(character);
    return routeBaseReference(character);
  }catch(error){console.error("[reference-router] build failed",error);throw error;}
}

function buildForgeCompatibleQuickReference(character){
  try{
    const classId=character.class.id,subclassId=character.subclass?.id,originalSubclass=isForgeOriginalSubclass(character.subclass),originalBackground=isForgeOriginalBackground(character.background);
    const names=originalSubclass?originalSubclassFeatureNamesFor(character.ruleset,classId,subclassId):new Set(),omissions=originalSubclass?(ORIGINAL_BASE_REFERENCE_OMISSIONS[classId]||new Set()):new Set();
    const filtered=(character.features||[]).filter(name=>!names.has(name)&&!omissions.has(name));
    const safeBackground=originalBackground?{...character.background,feature:null}:character.background;
    let safe={...character,background:safeBackground,features:filtered};

    if(originalSubclass&&classId==="sorcerer"&&character.ruleset==="2014"&&!safe.sorcererSelections?.draconic?.ancestry){
      safe={...safe,sorcererSelections:{...(safe.sorcererSelections||{}),draconic:{...(safe.sorcererSelections?.draconic||{}),ancestry:{name:"Reference placeholder",damageType:"fire"}}}};
    }

    const items=[...routeBaseReference(safe)];
    if(originalBackground){const backgroundRef=originalBackgroundReference(character.ruleset,character.background.id);if(backgroundRef)items.push(backgroundRef);}
    if(originalSubclass){
      const definition=originalSubclassDefinition(character.ruleset,classId,subclassId),source=originalSubclassSource(classId);if(!definition)throw new Error(`Missing Forge-original definition for ${classId}:${subclassId}.`);
      for(const record of originalSubclassFeatureRecordsFor(character.ruleset,classId,character.level,subclassId))items.push({id:`feature:${record.name}`,name:record.name,category:definition.name,timing:record.timing,text:record.text,source});
    }
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate compatible-content quick-reference entries detected.");return items;
  }catch(error){console.error("[reference-router] Forge-compatible reference build failed",error);throw error;}
}

function routeBaseReference(character){
  if(character?.class?.id==="barbarian")return buildBarbarianQuickReference(character);
  if(character?.class?.id==="bard")return buildBardQuickReference(character);
  if(character?.class?.id==="monk")return buildMonkQuickReference(character);
  if(character?.class?.id==="sorcerer")return buildSorcererQuickReference(character);
  if(character?.class?.id==="warlock")return buildWarlockQuickReference(character);
  if(character?.class?.id==="druid")return buildDruidQuickReference(character);
  if(character?.class?.id==="paladin")return buildPaladinQuickReference(character);
  if(character?.class?.id==="ranger")return buildRangerQuickReference(character);
  return buildCoreQuickReference(character);
}
