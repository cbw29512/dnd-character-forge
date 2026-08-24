const SLOTS=Object.freeze({1:{1:2},2:{1:3},3:{1:4,2:2},4:{1:4,2:3},5:{1:4,2:3,3:2},6:{1:4,2:3,3:3},7:{1:4,2:3,3:3,4:1},8:{1:4,2:3,3:3,4:2},9:{1:4,2:3,3:3,4:3,5:1},10:{1:4,2:3,3:3,4:3,5:2},11:{1:4,2:3,3:3,4:3,5:2,6:1},12:{1:4,2:3,3:3,4:3,5:2,6:1},13:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},14:{1:4,2:3,3:3,4:3,5:2,6:1,7:1},15:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},16:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1},17:{1:4,2:3,3:3,4:3,5:2,6:1,7:1,8:1,9:1},18:{1:4,2:3,3:3,4:3,5:3,6:1,7:1,8:1,9:1},19:{1:4,2:3,3:3,4:3,5:3,6:2,7:1,8:1,9:1},20:{1:4,2:3,3:3,4:3,5:3,6:2,7:2,8:1,9:1}});
const CANTRIPS=Object.freeze({1:2,2:2,3:2,4:3,5:3,6:3,7:3,8:3,9:3,10:4,11:4,12:4,13:4,14:4,15:4,16:4,17:4,18:4,19:4,20:4});
const KNOWN_2014=Object.freeze({1:4,2:5,3:6,4:7,5:8,6:9,7:10,8:11,9:12,10:14,11:15,12:15,13:16,14:18,15:19,16:19,17:20,18:22,19:22,20:22});
const PREPARED_2024=Object.freeze({1:4,2:5,3:6,4:7,5:9,6:10,7:11,8:12,9:14,10:15,11:16,12:16,13:17,14:17,15:18,16:18,17:19,18:20,19:21,20:22});

export function bardProgressionFor(ruleset,level,subclassId=null){
  try{
    const value=Number(level);if(!["2014","2024"].includes(ruleset)||!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported ${ruleset} Bard level ${level}.`);
    const lore=subclassId==="college-lore";
    if(ruleset==="2014")return Object.freeze({
      cantrips:CANTRIPS[value],known:KNOWN_2014[value],prepared:null,slots:Object.freeze({...SLOTS[value]}),bardicInspirationDie:inspirationDie(value),bardicInspirationRecovery:value>=5?"Short or Long Rest":"Long Rest",jackOfAllTrades:value>=2,expertiseCount:value<3?0:value<10?2:4,songOfRestDie:songOfRestDie(value),fontOfInspiration:value>=5,countercharm:value>=6,magicalSecretsCount:value<10?0:value<14?2:value<18?4:6,superiorInspiration:value>=20,superiorInspirationFloor:value>=20?1:0,wordsOfCreation:false,epicBoon:false,loreBonusSkills:lore&&value>=3?3:0,cuttingWords:lore&&value>=3,loreMagicalSecretsCount:lore&&value>=6?2:0,peerlessSkill:lore&&value>=14
    });
    return Object.freeze({
      cantrips:CANTRIPS[value],known:null,prepared:PREPARED_2024[value],slots:Object.freeze({...SLOTS[value]}),bardicInspirationDie:inspirationDie(value),bardicInspirationRecovery:value>=5?"Short or Long Rest":"Long Rest",jackOfAllTrades:value>=2,expertiseCount:value<2?0:value<9?2:4,songOfRestDie:null,fontOfInspiration:value>=5,countercharm:value>=7,magicalSecrets:value>=10,superiorInspiration:value>=18,superiorInspirationFloor:value>=18?2:0,wordsOfCreation:value>=20,epicBoon:value>=19,loreBonusSkills:lore&&value>=3?3:0,cuttingWords:lore&&value>=3,magicalDiscoveriesCount:lore&&value>=6?2:0,peerlessSkill:lore&&value>=14
    });
  }catch(error){console.error("[bard] progression lookup failed",error);throw error;}
}
export function maxBardSpellLevel(level){try{const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported Bard level ${level}.`);return Math.min(9,Math.ceil(value/2));}catch(error){console.error("[bard] max spell level lookup failed",error);throw error;}}
export function bardPickerLimits({ruleset,level,subclassId=null}={}){try{const p=bardProgressionFor(ruleset,level,subclassId);return{cantrips:p.cantrips,known:p.known,prepared:p.prepared,magicalSecrets:p.magicalSecretsCount||0,loreDiscoveries:p.loreMagicalSecretsCount||p.magicalDiscoveriesCount||0};}catch(error){console.error("[bard] picker-limit lookup failed",error);throw error;}}
function inspirationDie(level){return level>=15?"d12":level>=10?"d10":level>=5?"d8":"d6";}
function songOfRestDie(level){if(level<2)return null;if(level>=17)return"d12";if(level>=13)return"d10";if(level>=9)return"d8";return"d6";}
