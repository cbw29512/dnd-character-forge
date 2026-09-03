import { CLASS_DOSSIER, BACKGROUND_DOSSIER } from "./dossier-data.js";
import { ORIGINAL_BACKGROUND_DOSSIER } from "./original-background-dossier.js";
import { DOSSIER_DISLIKES, DOSSIER_FIRST_IMPRESSIONS, DOSSIER_LIKES, DOSSIER_MANNERISMS, DOSSIER_STORY_EVENTS, DOSSIER_STORY_PLACES } from "./dossier-flavor.js";
import { narrativeArcFor } from "./dossier-narratives.js";

const ABILITIES=["str","dex","con","int","wis","cha"];
const ABILITY_BEARING=Object.freeze({str:"a compact, forceful physical presence",dex:"quick, economical movement and a ready stance",con:"a durable, weather-tested bearing",int:"an analytical gaze that seems to catalog details",wis:"a watchful calm that notices changes in a room",cha:"a presence that draws attention without requiring volume"});

export function buildNarrativeDossier(character,{quickTurn=[]}={}){
  try{
    if(!character?.validation?.valid)throw new Error("Dossier requires a validated character.");
    const classId=character.class?.id||"fighter",classStory=CLASS_DOSSIER[classId]||CLASS_DOSSIER.fighter,bg=backgroundStory(character.background),seed=seedFor(character),event=pick(DOSSIER_STORY_EVENTS,seed,11),place=pick(DOSSIER_STORY_PLACES,seed,23),awakening=pick(classStory.awakening,seed,37),species=character.species?.name||character.species?.id||"adventurer",background=character.background?.name||"Adventurer",className=character.class?.name||"Adventurer",ability=highestAbility(character.abilities),token=bg.token,storyArc=narrativeArcFor(seed+101),context={name:character.name,bg,classStory,event,place,awakening,species,background,className,token};
    const backstory=storyArc.backstory.map(builder=>builder(context));
    return Object.freeze({
      title:`${character.name} — Character Dossier`,subtitle:`${classStory.epithet} · ${species} ${className} · ${background}`,disclaimer:"Generated narrative flavor. This page does not add or change game rules.",storyArc:Object.freeze({id:storyArc.id,label:storyArc.label}),backstory:Object.freeze(backstory),
      personality:Object.freeze({trait:storyArc.trait(context),ideal:storyArc.ideal(context),bond:capitalize(bg.bond)+".",flaw:capitalize(classStory.burden)+".",mannerisms:pickMany(DOSSIER_MANNERISMS,seed,3,51),likes:pickMany(DOSSIER_LIKES,seed,3,71),dislikes:pickMany(DOSSIER_DISLIKES,seed,3,91),fear:storyArc.fear(context),secret:storyArc.secret(context)}),
      appearance:Object.freeze([`${species} adventurer with ${ABILITY_BEARING[ability]||ABILITY_BEARING.wis}.`,capitalize(classStory.look)+".",`Carries ${token} among otherwise practical travel gear.`,`Moves like someone accustomed to danger rather than someone trying to look dangerous.`,`First impression: ${pick(DOSSIER_FIRST_IMPRESSIONS,seed,113)}.`]),
      combatNotes:Object.freeze([capitalize(classStory.combat)+".",...quickTurn.slice(0,3)]),
      hooks:Object.freeze([storyArc.hook(context),`A message arrives from ${bg.mentor}, asking for help with a problem connected to ${place}.`,`Someone recognizes ${token} and insists it belongs to a story ${character.name} has never heard.`,`A survivor of ${event} remembers the outcome very differently and wants a private conversation.`]),
      roleplay:Object.freeze({quote:classStory.quote,guidance:`Play ${character.name} as a ${storyArc.label.replace(/^The\s+/i,"").toLowerCase()} whose competence matters more than theatrics. Let the ${className} identity shape how problems are approached, while the ${background} background explains which obligations still feel personal. Observe first, speak with purpose, and let emotion show through choices rather than speeches.`})
    });
  }catch(error){console.error("[dossier] build failed",error);throw error;}
}

function backgroundStory(background){const id=String(background?.id||background?.name||"").toLowerCase(),original=ORIGINAL_BACKGROUND_DOSSIER[id];if(original)return original;for(const [key,value] of Object.entries(BACKGROUND_DOSSIER))if(id.includes(key))return value;return{origin:"learned a trade and a set of obligations before taking up the adventuring life",token:"a small keepsake from home",bond:"the people who trusted them before anyone called them an adventurer",mentor:"an older hand who valued reliability over reputation"};}
function seedFor(character){return hash([character.name,character.ruleset,character.level,character.class?.id,character.species?.id||character.species?.name,character.background?.id||character.background?.name].join("|"));}
function highestAbility(abilities={}){return ABILITIES.reduce((best,id)=>Number(abilities[id]||0)>Number(abilities[best]||0)?id:best,"str");}
function pick(values,seed,salt=0){return values[Math.abs((seed+salt*2654435761)|0)%values.length];}
function pickMany(values,seed,count,salt=0){const pool=[...values],out=[];for(let index=0;index<count&&pool.length;index++){const choice=Math.abs((seed+(salt+index)*1597334677)|0)%pool.length;out.push(pool.splice(choice,1)[0]);}return Object.freeze(out);}
function hash(value){let result=2166136261;for(const char of String(value)){result^=char.charCodeAt(0);result=Math.imul(result,16777619);}return result|0;}
function capitalize(value){const text=String(value||"");return text?text[0].toUpperCase()+text.slice(1):text;}
