import { CLASS_DOSSIER, BACKGROUND_DOSSIER, STORY_EVENTS, STORY_PLACES } from "./dossier-data.js";

const ABILITIES=["str","dex","con","int","wis","cha"];
const ABILITY_BEARING=Object.freeze({str:"a compact, forceful physical presence",dex:"quick, economical movement and a ready stance",con:"a durable, weather-tested bearing",int:"an analytical gaze that seems to catalog details",wis:"a watchful calm that notices changes in a room",cha:"a presence that draws attention without requiring volume"});
const MANNERISMS=Object.freeze(["checks exits and sightlines on entering a room","keeps important equipment in the same place every time","takes one deliberate breath before a dangerous choice","touches a personal token before committing to a difficult course","watches hands and posture while other people are speaking","maintains gear during conversations that do not require full attention"]);
const LIKES=Object.freeze(["honest work","reliable companions","well-kept equipment","quiet meals after hard travel","plans that leave room for people to survive","people who keep their word"]);
const DISLIKES=Object.freeze(["bullies","wasteful cruelty","careless leadership","boasting without preparation","people who treat allies as expendable","promises made only for appearances"]);

export function buildNarrativeDossier(character,{quickTurn=[]}={}){
  try{
    if(!character?.validation?.valid)throw new Error("Dossier requires a validated character.");
    const classId=character.class?.id||"fighter",classStory=CLASS_DOSSIER[classId]||CLASS_DOSSIER.fighter,bg=backgroundStory(character.background),seed=seedFor(character),event=pick(STORY_EVENTS,seed,11),place=pick(STORY_PLACES,seed,23),awakening=pick(classStory.awakening,seed,37),species=character.species?.name||character.species?.id||"adventurer",background=character.background?.name||"Adventurer",className=character.class?.name||"Adventurer",ability=highestAbility(character.abilities),token=bg.token;
    const backstory=[
      `${character.name} began far from the legends that now seem to gather around every road. ${character.name} ${bg.origin}. That life taught practical habits before heroic ones: show up, learn the work, and understand who pays the price when someone else is careless. ${capitalize(bg.mentor)} became an early model for the kind of competence ${character.name} still respects.`,
      `The path toward becoming a ${className} took shape when ${character.name} ${awakening}. The lesson was not that power solved everything. It was that power mattered most when it was attached to a decision. From then on, ${character.name} tried to ${classStory.duty}. People who judged the future adventurer by appearance, profession, or first impressions usually learned that lesson too late.`,
      `The defining scar came during ${event} near ${place}. The immediate crisis ended, but not cleanly, and ${character.name} still ${classStory.burden}. ${capitalize(bg.bond)} became more important after that experience, while ${token} became a private reminder that choices survive long after the noise of a fight has ended.`,
      `Now ${character.name} adventures because standing still would leave too many unfinished obligations in other people's hands. There are people to protect, questions to answer, and debts that cannot be settled with coin alone. Each new journey is a chance to become more capable without becoming less themselves—and to prove that the next difficult decision can be made better than the last.`
    ];
    return Object.freeze({
      title:`${character.name} — Character Dossier`,subtitle:`${classStory.epithet} · ${species} ${className} · ${background}`,disclaimer:"Generated narrative flavor. This page does not add or change game rules.",backstory,
      personality:Object.freeze({trait:`Steady about ordinary problems and intensely focused when ${classStory.duty} becomes necessary.`,ideal:`Responsibility. Power matters only when it is used to ${classStory.duty}.`,bond:capitalize(bg.bond)+".",flaw:capitalize(classStory.burden)+".",mannerisms:pickMany(MANNERISMS,seed,3,51),likes:pickMany(LIKES,seed,3,71),dislikes:pickMany(DISLIKES,seed,3,91),fear:`Failing at the exact moment someone depends on ${character.name}.`,secret:`${character.name} keeps ${token}, but rarely explains what it represents.`}),
      appearance:Object.freeze([`${species} adventurer with ${ABILITY_BEARING[ability]||ABILITY_BEARING.wis}.`,capitalize(classStory.look)+".",`Carries ${token} among otherwise practical travel gear.`,`Moves like someone accustomed to danger rather than someone trying to look dangerous.`,`First impression: controlled, observant, and more difficult to move from a decision than expected.`]),
      combatNotes:Object.freeze([capitalize(classStory.combat)+".",...quickTurn.slice(0,3)]),
      hooks:Object.freeze([`A message arrives from ${bg.mentor}, asking for help with a problem connected to ${place}.`,`Someone recognizes ${token} and insists it belongs to a story ${character.name} has never heard.`,`A survivor of ${event} remembers the outcome very differently and wants a private conversation.`,`Returning to ${place} would resolve an old obligation—but doing so means confronting what ${character.name} deliberately left unfinished.`]),
      roleplay:Object.freeze({quote:classStory.quote,guidance:`Play ${character.name} as competent before dramatic: observe first, speak plainly, and let emotion show through choices rather than speeches. The ${className} identity should shape how problems are approached, while the ${background} background explains which obligations still feel personal.`})
    });
  }catch(error){console.error("[dossier] build failed",error);throw error;}
}

function backgroundStory(background){const id=String(background?.id||background?.name||"").toLowerCase();for(const [key,value] of Object.entries(BACKGROUND_DOSSIER))if(id.includes(key))return value;return{origin:"learned a trade and a set of obligations before taking up the adventuring life",token:"a small keepsake from home",bond:"the people who trusted them before anyone called them an adventurer",mentor:"an older hand who valued reliability over reputation"};}
function seedFor(character){return hash([character.name,character.ruleset,character.level,character.class?.id,character.species?.id||character.species?.name,character.background?.id||character.background?.name].join("|"));}
function highestAbility(abilities={}){return ABILITIES.reduce((best,id)=>Number(abilities[id]||0)>Number(abilities[best]||0)?id:best,"str");}
function pick(values,seed,salt=0){return values[Math.abs((seed+salt*2654435761)|0)%values.length];}
function pickMany(values,seed,count,salt=0){const pool=[...values],out=[];for(let index=0;index<count&&pool.length;index++){const choice=Math.abs((seed+(salt+index)*1597334677)|0)%pool.length;out.push(pool.splice(choice,1)[0]);}return Object.freeze(out);}
function hash(value){let result=2166136261;for(const char of String(value)){result^=char.charCodeAt(0);result=Math.imul(result,16777619);}return result|0;}
function capitalize(value){const text=String(value||"");return text?text[0].toUpperCase()+text.slice(1):text;}
