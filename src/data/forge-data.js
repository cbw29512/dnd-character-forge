import { RAW_2014 } from "./raw-2014.js";
import { RAW_2024 } from "./raw-2024.js";
import { BARBARIAN_FORGE_SUBCLASSES_2014, BARBARIAN_FORGE_SUBCLASSES_2024 } from "./barbarian-subclasses.js";
import { FORGE_ORIGINAL_SUBCLASSES_2014, FORGE_ORIGINAL_SUBCLASSES_2024 } from "./original-subclasses.js";
import { FORGE_ORIGINAL_BACKGROUNDS_2014, FORGE_ORIGINAL_BACKGROUNDS_2024 } from "./original-backgrounds.js";
import { BARD_CLASS_2014, BARD_CLASS_2024, BARD_SUBCLASS_2014, BARD_SUBCLASS_2024 } from "./bard-class.js";
import { MONK_CLASS_2014, MONK_CLASS_2024, MONK_SUBCLASS_2014, MONK_SUBCLASS_2024, MONK_WEAPONS_2014, MONK_WEAPONS_2024 } from "./monk-class.js";
import { SORCERER_CLASS_2014, SORCERER_CLASS_2024, SORCERER_SUBCLASS_2014, SORCERER_SUBCLASS_2024 } from "./sorcerer-class.js";
import { WARLOCK_CLASS_2014, WARLOCK_CLASS_2024, WARLOCK_SUBCLASS_2014, WARLOCK_SUBCLASS_2024 } from "./warlock-class.js";

const STARTING_GOLD_2024=Object.freeze({
  barbarian:Object.freeze({gp:75,option:"B",srdPage:28}),
  bard:Object.freeze({gp:90,option:"B",srdPage:31}),
  cleric:Object.freeze({gp:110,option:"B",srdPage:36}),
  druid:Object.freeze({gp:50,option:"B",srdPage:41}),
  fighter:Object.freeze({gp:155,option:"C",srdPage:47}),
  monk:Object.freeze({gp:50,option:"B",srdPage:49}),
  paladin:Object.freeze({gp:150,option:"B",srdPage:53}),
  ranger:Object.freeze({gp:150,option:"B",srdPage:57}),
  rogue:Object.freeze({gp:100,option:"B",srdPage:61}),
  sorcerer:Object.freeze({gp:50,option:"B",srdPage:64}),
  warlock:Object.freeze({gp:100,option:"B",srdPage:70}),
  wizard:Object.freeze({gp:55,option:"B",srdPage:77})
});

function extend(raw,classExtensions,subclassExtensions,backgroundExtensions,weaponAdditions){
  try{
    for(const extension of classExtensions){const classId=extension.id;if(raw.classes.some(item=>item.id===classId)||raw.subclasses.some(item=>item.classId===classId))throw new Error(`Base ${raw.ruleset} RAW catalog already contains ${classId}; remove the extension instead of duplicating it.`);}
    for(const extension of subclassExtensions){if(raw.subclasses.some(item=>item.id===extension.id&&item.classId===extension.classId))throw new Error(`Base ${raw.ruleset} RAW catalog already contains subclass ${extension.id}; remove the extension instead of duplicating it.`);}
    for(const extension of backgroundExtensions){if(raw.backgrounds.some(item=>item.id===extension.id))throw new Error(`Base ${raw.ruleset} RAW catalog already contains background ${extension.id}; remove the extension instead of duplicating it.`);}
    for(const weaponId of Object.keys(weaponAdditions||{}))if(raw.weapons[weaponId])throw new Error(`Base ${raw.ruleset} RAW catalog already contains weapon ${weaponId}; remove the extension instead of duplicating it.`);
    return Object.freeze({...raw,backgrounds:Object.freeze([...raw.backgrounds,...backgroundExtensions]),classes:Object.freeze([...raw.classes,...classExtensions]),subclasses:Object.freeze([...raw.subclasses,...subclassExtensions]),weapons:Object.freeze({...raw.weapons,...weaponAdditions})});
  }catch(error){console.error(`[forge-data] ${raw?.ruleset||"unknown"} extension failed`,error);throw error;}
}
function add2024StartingGoldPackages(data){
  try{
    const classes=data.classes.map(cls=>{
      const config=STARTING_GOLD_2024[cls.id];if(!config)throw new Error(`Missing SRD 5.2.1 starting-gold oracle for ${cls.id}.`);
      const ready=cls.equipmentPackages||[],expectedReady=config.option==="C"?2:1;if(ready.length!==expectedReady)throw new Error(`${cls.name} should encode ${expectedReady} ready-to-play SRD starting-equipment package${expectedReady===1?"":"s"} before the gold option.`);
      const annotated=ready.map((pkg,index)=>Object.freeze({...pkg,srdOption:String.fromCharCode(65+index),source:"SRD 5.2.1",srdPage:config.srdPage,startingGoldOnly:false}));
      const gold=Object.freeze({id:"starting-gold",srdOption:config.option,armor:null,weapons:Object.freeze([]),shield:false,styles:Object.freeze([...(cls.styleChoices||[])]),gear:Object.freeze([`${config.gp} GP`]),startingGoldOnly:true,source:"SRD 5.2.1",srdPage:config.srdPage});
      return Object.freeze({...cls,equipmentPackages:Object.freeze([...annotated,gold])});
    });
    return Object.freeze({...data,classes:Object.freeze(classes)});
  }catch(error){console.error("[forge-data] 2024 starting equipment normalization failed",error);throw error;}
}

export const FORGE_2014=extend(RAW_2014,[BARD_CLASS_2014,MONK_CLASS_2014,SORCERER_CLASS_2014,WARLOCK_CLASS_2014],[...BARBARIAN_FORGE_SUBCLASSES_2014,BARD_SUBCLASS_2014,MONK_SUBCLASS_2014,SORCERER_SUBCLASS_2014,WARLOCK_SUBCLASS_2014,...FORGE_ORIGINAL_SUBCLASSES_2014],FORGE_ORIGINAL_BACKGROUNDS_2014,MONK_WEAPONS_2014);
const FORGE_2024_BASE=extend(RAW_2024,[BARD_CLASS_2024,MONK_CLASS_2024,SORCERER_CLASS_2024,WARLOCK_CLASS_2024],[...BARBARIAN_FORGE_SUBCLASSES_2024,BARD_SUBCLASS_2024,MONK_SUBCLASS_2024,SORCERER_SUBCLASS_2024,WARLOCK_SUBCLASS_2024,...FORGE_ORIGINAL_SUBCLASSES_2024],FORGE_ORIGINAL_BACKGROUNDS_2024,MONK_WEAPONS_2024);
export const FORGE_2024=add2024StartingGoldPackages(FORGE_2024_BASE);
export function forgeDataFor(ruleset){try{if(ruleset==="2014")return FORGE_2014;if(ruleset==="2024")return FORGE_2024;throw new Error(`Unsupported forge ruleset: ${ruleset}.`);}catch(error){console.error("[forge-data] ruleset lookup failed",error);throw error;}}
