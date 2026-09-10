import { FORGE_2014, FORGE_2024 } from "../data/forge-data.js";
import { composedDossierArtFor } from "./dossier-art-layers.js";
import { curatedDossierPortraitFor, curatedDossierPortraitIds } from "./dossier-portrait-assets.js";

const CATALOGS=Object.freeze({"2014":FORGE_2014,"2024":FORGE_2024});

export function supportedDossierVariantCatalog(){
  try{
    const variants=new Map();
    for(const [ruleset,data] of Object.entries(CATALOGS)){
      for(const background of data.backgrounds){
        for(const cls of data.classes){
          if(Number(cls.subclassLevel)>1)addVariant(variants,{ruleset,backgroundId:background.id,classId:cls.id,pathId:cls.id,kind:"class"});
          for(const subclass of data.subclasses.filter(item=>item.classId===cls.id)){
            addVariant(variants,{ruleset,backgroundId:background.id,classId:cls.id,pathId:subclass.id,kind:"subclass"});
          }
        }
      }
    }
    return Object.freeze([...variants.values()].sort((a,b)=>a.variantKey.localeCompare(b.variantKey)).map(freezeVariant));
  }catch(error){
    console.error("[dossier-art-coverage] catalog build failed",error);
    throw error;
  }
}

export function dossierArtCoverage(){
  try{
    const catalog=supportedDossierVariantCatalog(),supported=new Set(catalog.map(item=>item.variantKey));
    const exact=[],composed=[],invalid=[],orphaned=[];
    for(const id of curatedDossierPortraitIds()){
      if(!supported.has(id)){orphaned.push(id);continue;}
      if(curatedDossierPortraitFor(id)){exact.push(id);continue;}
      invalid.push(id);
    }
    const exactSet=new Set(exact);
    for(const item of catalog){
      if(exactSet.has(item.variantKey))continue;
      if(composedDossierArtFor(item.backgroundId,item.pathId))composed.push(item.variantKey);
    }
    const covered=exact.length+composed.length;
    return Object.freeze({
      total:catalog.length,
      exact:exact.length,
      composed:composed.length,
      fallback:catalog.length-covered,
      exactPercent:percent(exact.length,catalog.length),
      coveredPercent:percent(covered,catalog.length),
      invalid:Object.freeze([...invalid]),
      orphaned:Object.freeze([...orphaned]),
      exactIds:Object.freeze([...exact]),
      composedIds:Object.freeze([...composed]),
      catalog
    });
  }catch(error){
    console.error("[dossier-art-coverage] coverage report failed",error);
    throw error;
  }
}

function addVariant(map,{ruleset,backgroundId,classId,pathId,kind}){
  const variantKey=`${backgroundId}--${pathId}`,existing=map.get(variantKey);
  if(existing){
    const semanticCollision=existing.backgroundId!==backgroundId||existing.classId!==classId||existing.pathId!==pathId||existing.kind!==kind;
    if(semanticCollision)throw new Error(`Variant key collision: ${variantKey} maps to ${existing.classId}/${existing.pathId}/${existing.kind} and ${classId}/${pathId}/${kind}.`);
    if(!existing.rulesets.includes(ruleset))existing.rulesets.push(ruleset);
    return;
  }
  map.set(variantKey,{variantKey,backgroundId,classId,pathId,kind,rulesets:[ruleset]});
}

function freezeVariant(item){return Object.freeze({...item,rulesets:Object.freeze([...item.rulesets].sort())});}
function percent(count,total){return total?Number(((count/total)*100).toFixed(2)):0;}
