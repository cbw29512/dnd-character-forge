import { bardMagicalSecretsPool } from "../data/bard-magical-secrets.js";
import { warlockSpellsFor } from "../data/warlock-spells.js";
import { speciesMagic } from "./species.js";

const RITUAL_IDS=Object.freeze({
  "2014":new Set(["alarm","comprehend-languages","detect-magic","find-familiar","identify","illusory-script","purify-food-and-drink","speak-with-animals","tensers-floating-disk","unseen-servant"]),
  "2024":new Set(["alarm","comprehend-languages","detect-magic","find-familiar","identify","illusory-script","purify-food-and-drink","speak-with-animals","tensers-floating-disk","unseen-servant"])
});

export function resolveWarlockBonusMagic(character,{baseCantrips=[],baseLeveled=[],alwaysPrepared=[],invocationIds=[]}={}){
  try{
    if(character?.class?.id!=="warlock")throw new Error("Warlock bonus magic requires a Warlock character.");
    const catalog=combinedCatalog(character.ruleset,character.subclass?.id),byId=new Map(catalog.map(spell=>[spell.id,spell])),species=speciesMagic(character)||{cantrips:[],spells:[]},magicInitiate=character.magicInitiate||{};
    const alreadyCantrips=new Set([...baseCantrips,...(magicInitiate.cantrips||[]),...(species.cantrips||[])]),alreadyLeveled=new Set([...baseLeveled,...alwaysPrepared,...(magicInitiate.level1Spell?[magicInitiate.level1Spell]:[]),...(species.spells||[])]);
    const legacyTome=character.ruleset==="2014"&&character.warlockSelections?.pactBoon?.id==="tome",revisedTome=character.ruleset==="2024"&&invocationIds.includes("pact-of-the-tome"),chain=character.ruleset==="2014"?character.warlockSelections?.pactBoon?.id==="chain":invocationIds.includes("pact-of-the-chain"),bookSecrets=character.ruleset==="2014"&&invocationIds.includes("book-of-ancient-secrets");
    const invocationSpells=[];
    if(chain){
      const familiar=byId.get("find-familiar");
      if(!familiar)throw new Error("Find Familiar is unavailable for Pact of the Chain.");
      invocationSpells.push(familiar);alreadyLeveled.add(familiar.id);
    }
    const tomeCantrips=[];
    if(legacyTome||revisedTome){
      const pool=catalog.filter(spell=>spell.level===0&&!alreadyCantrips.has(spell.id));
      tomeCantrips.push(...chooseDistinct(pool,3,"Pact of the Tome cantrips"));
      for(const spell of tomeCantrips)alreadyCantrips.add(spell.id);
    }
    const tomeRituals=[];
    if(revisedTome||bookSecrets){
      let pool=catalog.filter(spell=>spell.level===1&&RITUAL_IDS[character.ruleset].has(spell.id));
      if(revisedTome)pool=pool.filter(spell=>!alreadyLeveled.has(spell.id));
      else pool=pool.filter(spell=>!invocationSpells.some(item=>item.id===spell.id));
      tomeRituals.push(...chooseDistinct(pool,2,"Book of Shadows rituals"));
      for(const spell of tomeRituals)alreadyLeveled.add(spell.id);
    }
    return Object.freeze({tomeCantrips:Object.freeze(tomeCantrips),tomeRituals:Object.freeze(tomeRituals),invocationSpells:Object.freeze(invocationSpells)});
  }catch(error){console.error("[warlock-bonus-magic] resolution failed",error);throw error;}
}

function combinedCatalog(ruleset,subclassId){
  try{
    const map=new Map();
    for(const spell of [...bardMagicalSecretsPool(ruleset),...warlockSpellsFor(ruleset,{subclassId,includeFiend:true})])if(spell?.id&&!map.has(spell.id))map.set(spell.id,spell);
    return[...map.values()];
  }catch(error){console.error("[warlock-bonus-magic] catalog merge failed",error);throw error;}
}

function chooseDistinct(items,count,label){
  try{
    if(!Array.isArray(items))throw new Error(`${label} pool must be a list.`);
    const unique=[...new Map(items.filter(Boolean).map(item=>[item.id,item])).values()];
    if(unique.length<count)throw new Error(`${label} needs ${count} choices but only ${unique.length} verified choices are available.`);
    const pool=[...unique],chosen=[];
    while(chosen.length<count){const index=Math.floor(Math.random()*pool.length);chosen.push(pool.splice(index,1)[0]);}
    return chosen;
  }catch(error){console.error(`[warlock-bonus-magic] ${label} selection failed`,error);throw error;}
}
