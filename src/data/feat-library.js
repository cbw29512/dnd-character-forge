const ORIGINAL_SOURCE=Object.freeze({version:"Character Forge Original",document:"Character Forge Original Game Content",page:"Advancement feat library",license:"Original Character Forge game content"});
const SRD_2014_SOURCE=Object.freeze({version:"SRD 5.1",document:"System Reference Document 5.1",page:"75",license:"CC BY 4.0"});
const SRD_2024_SOURCE=Object.freeze({version:"SRD 5.2.1",document:"System Reference Document 5.2.1",page:"87",license:"CC BY 4.0"});

export const ADVANCEMENT_ASI_ID="asi";

const ASI=Object.freeze({id:ADVANCEMENT_ASI_ID,name:"Ability Score Improvement",displayName:"Ability Score Improvement",kind:"asi",contentKind:"official-srd",repeatable:true,randomEligible:true});

const GRAPPLER_2014=Object.freeze({
  id:"grappler",name:"Grappler",displayName:"Grappler — SRD",kind:"feat",category:"General",contentKind:"official-srd",repeatable:false,randomEligible:true,minLevel:4,
  prerequisites:Object.freeze({str:13}),source:SRD_2014_SOURCE,
  reference:Object.freeze({timing:"Passive / Action",text:"You have advantage on attack rolls against a creature you are grappling. You can use your action to attempt to pin a creature you are grappling; on a successful grapple check, you and that creature are restrained until the grapple ends."})
});
const GRAPPLER_2024=Object.freeze({
  id:"grappler",name:"Grappler",displayName:"Grappler — SRD",kind:"feat",category:"General",contentKind:"official-srd",repeatable:false,randomEligible:true,minLevel:4,
  prerequisiteAnyAbility:Object.freeze(["str","dex"]),prerequisiteMinimum:13,abilityIncreaseChoices:Object.freeze(["str","dex"]),abilityIncrease:1,source:SRD_2024_SOURCE,
  reference:Object.freeze({timing:"Attack / Passive",text:"Increase Strength or Dexterity by 1 (maximum 20). Once per turn when your Unarmed Strike hits as part of the Attack action, you can deal its damage and also use its Grapple option. You have Advantage on attacks against a creature Grappled by you, and moving a same-size-or-smaller creature Grappled by you costs no extra movement."})
});

const ORIGINALS=Object.freeze([
  original("heavy-hand","Heavy Hand","str","Once on each of your turns when you hit with a Strength-based melee weapon attack after moving no more than 5 feet since the start of the turn, you can add 1 to one weapon damage die before totaling the damage.","Once per turn"),
  original("fleet-vanguard","Fleet Vanguard","dex","Your Speed increases by 5 feet. After you take the Dash action on your turn, the first 5 feet of movement you make before that turn ends doesn't provoke Opportunity Attacks.","Passive / after Dash",{speedBonus:5}),
  original("iron-constitution","Iron Constitution","con","Once per Short or Long Rest when you take damage, you can use your Reaction to reduce that damage by your Proficiency Bonus + your Constitution modifier, to a minimum of 0.","Reaction · 1/rest"),
  original("field-scholar","Field Scholar","int","Gain proficiency in one knowledge skill you don't already have and with Cartographer's Tools. When you make an Intelligence check using the granted skill, you can add 1d4 after seeing the d20 roll but before the outcome is determined; once used, regain this benefit after a Short or Long Rest.","Passive / 1/rest",{extraSkillPool:["arcana","history","investigation","nature","religion"],tool:"Cartographer's Tools"}),
  original("resolute-spirit","Resolute Spirit","wis","Once per Long Rest after you fail an Intelligence, Wisdom, or Charisma saving throw, you can add your Proficiency Bonus to the roll, potentially turning the failure into a success.","After failed mental save · 1/long rest"),
  original("commanding-presence","Commanding Presence","cha","Gain proficiency in one presence skill you don't already have. Once per Short or Long Rest when you make a Charisma check using that proficiency, you can roll 1d6 and add it to the check after seeing the d20 roll but before the outcome is determined.","Passive / 1/rest",{extraSkillPool:["deception","intimidation","performance","persuasion"]})
]);

export const ADVANCEMENT_OPTIONS_2014=Object.freeze([ASI,GRAPPLER_2014,...ORIGINALS]);
export const ADVANCEMENT_OPTIONS_2024=Object.freeze([ASI,GRAPPLER_2024,...ORIGINALS]);

export function advancementFeatOptionsFor(ruleset){try{if(ruleset==="2014")return ADVANCEMENT_OPTIONS_2014;if(ruleset==="2024")return ADVANCEMENT_OPTIONS_2024;throw new Error(`Unsupported advancement feat ruleset: ${ruleset}.`);}catch(error){console.error("[feat-library] option lookup failed",error);throw error;}}
export function advancementOptionById(ruleset,id){try{return advancementFeatOptionsFor(ruleset).find(item=>item.id===id)||null;}catch(error){console.error("[feat-library] option lookup by id failed",error);throw error;}}
export function isForgeOriginalFeat(feat){return feat?.contentKind==="forge-original";}
export function advancementFeatSource(feat){try{if(!feat||feat.kind!=="feat")throw new Error("Feat source lookup requires a feat option.");return feat.source||ORIGINAL_SOURCE;}catch(error){console.error("[feat-library] source lookup failed",error);throw error;}}
export function advancementFeatReference(feat){try{if(!feat?.reference)throw new Error(`Missing advancement feat reference for ${feat?.id||"unknown"}.`);return Object.freeze({id:`feat:${feat.id}`,name:feat.name,category:feat.contentKind==="forge-original"?"Forge Original Feat":"General Feat",timing:feat.reference.timing,text:feat.reference.text,source:advancementFeatSource(feat)});}catch(error){console.error("[feat-library] reference lookup failed",error);throw error;}}
export function forgeOriginalFeatSource(){return ORIGINAL_SOURCE;}

function original(id,name,ability,text,timing,effects={}){
  return Object.freeze({id,name,displayName:`${name} — Forge Original`,kind:"feat",category:"General",contentKind:"forge-original",repeatable:false,randomEligible:false,minLevel:4,abilityIncreaseAbility:ability,abilityIncrease:1,source:ORIGINAL_SOURCE,reference:Object.freeze({timing,text}),...effects});
}
