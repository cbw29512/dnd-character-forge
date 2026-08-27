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
import { advancementFeatReference } from "../data/feat-library.js";

const ORIGINAL_BASE_REFERENCE_OMISSIONS=Object.freeze({
  sorcerer:Object.freeze(new Set(["Sorcerous Origin","Sorcerer Subclass"]))
});

export function buildQuickReference(character){
  try{
    const advancementFeats=(character?.feats||[]).filter(feat=>feat.advancementFeat),safeCharacter=advancementFeats.length?{...character,feats:(character.feats||[]).filter(feat=>!feat.advancementFeat)}:character;
    const originalBackground=isForgeOriginalBackground(safeCharacter?.background);let items;
    if(safeCharacter?.class?.id==="barbarian")items=originalBackground?buildBarbarianWithOriginalBackground(safeCharacter):buildBarbarianQuickReference(safeCharacter);
    else if(originalBackground||isForgeOriginalSubclass(safeCharacter?.subclass))items=buildForgeCompatibleQuickReference(safeCharacter);
    else items=routeBaseReference(safeCharacter);
    for(const feat of advancementFeats)items.push(advancementFeatReference(feat));
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate routed quick-reference entries detected.");
    return enhanceMagicInitiate(items,character);
  }catch(error){console.error("[reference-router] build failed",error);throw error;}
}

function buildBarbarianWithOriginalBackground(character){
  try{
    const safe={...character,background:{...character.background,feature:null}},items=[...buildBarbarianQuickReference(safe)],backgroundRef=originalBackgroundReference(character.ruleset,character.background.id);
    if(backgroundRef)items.push(backgroundRef);
    const ids=items.map(item=>item.id);if(new Set(ids).size!==ids.length)throw new Error("Duplicate Barbarian/background quick-reference entries detected.");return items;
  }catch(error){console.error("[reference-router] Barbarian compatible background build failed",error);throw error;}
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

function enhanceMagicInitiate(items,character){
  try{
    const magic=character?.magicInitiate;if(!magic)return items;
    const featId=character.background?.feat,ability=({int:"Intelligence",wis:"Wisdom",cha:"Charisma"})[magic.spellcastingAbility]||String(magic.spellcastingAbility||"").toUpperCase();
    let found=false;const next=items.map(item=>{if(item.id!==`feat:${featId}`)return item;found=true;return{...item,category:`Magic Initiate (${magic.spellListName})`,timing:"At will cantrips · 1 free level-1 cast / Long Rest",text:`${ability} is your spellcasting ability. Cantrips: ${magic.cantripNames.join(", ")}. Level-1 spell: ${magic.level1SpellName}. You can cast that level-1 spell once without a spell slot, regaining that free cast after a Long Rest, and you can also cast it using spell slots you have.`};});
    if(!found)throw new Error(`Magic Initiate reference ${featId} is missing.`);return next;
  }catch(error){console.error("[reference-router] Magic Initiate reference enhancement failed",error);throw error;}
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
