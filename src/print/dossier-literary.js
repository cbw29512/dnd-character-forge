export function buildLiteraryBackstory(context,storyArc,seed,core){
  try{
    const c=context,k=core,openings=[
      `Before anyone called ${c.name} a ${c.className}, life was measured in ${c.bgLit.texture}. ${c.name} ${c.bg.origin}. ${k.backgroundMemory} ${capitalize(c.bg.mentor)} taught one lesson that survived every later certainty: ${c.bgLit.lesson}.`,
      `${c.name}'s first education had little to do with heroism. It was made of ${c.bgLit.texture}. There, ${c.name} ${c.bg.origin}. ${k.backgroundMemory} ${capitalize(c.bg.mentor)} taught that ${c.bgLit.lesson}.`,
      `The oldest version of ${c.name} belongs to a world of ${c.bgLit.texture}. ${c.name} ${c.bg.origin}; the work was ordinary until ordinary responsibility became the standard by which every later choice would be judged. ${k.backgroundMemory}`
    ];
    const fractures=[
      `That life broke open during ${c.event} near ${c.place}. In the confusion, ${c.name} ${c.bgLit.wound}. The cost made ${c.bg.bond} more than a memory. ${capitalize(c.token)} became the object ${c.name} kept when almost everything else from that chapter could be left behind.`,
      `${capitalize(c.event)} near ${c.place} turned old lessons into consequences. ${c.name} ${c.bgLit.wound}. What remained was loyalty to ${c.bg.bond}, and ${c.token}—small enough to carry, heavy enough to remember.`,
      `Then came ${c.event} near ${c.place}, the kind of day that makes every earlier belief prove its weight. ${c.name} ${c.bgLit.wound}. From then on, ${c.bg.bond} became a debt of the heart rather than a pleasant piece of history.`
    ];
    const becoming=c.subclassName?[
      `The path to ${c.subclassName} began when ${c.name} ${c.subLit.threshold}. ${k.resonance} ${k.tension}`,
      `Becoming ${c.subclassName} was not a promotion. It was a decision made after ${c.name} ${c.awakening}. The discipline gave ${c.name} a way to ${c.classStory.duty}. ${k.resonance} ${k.tension}`,
      `${c.name} crossed into the discipline of ${c.subclassName} after ${c.name} ${c.subLit.threshold}. Power did not erase the earlier life; it sharpened it. ${k.resonance} ${k.tension}`
    ]:[
      `The ${c.className} path opened when ${c.name} ${c.awakening}. Power mattered because it made an older promise actionable: ${c.classStory.duty}. ${k.resonance} The burden followed close behind; ${c.classStory.burden}.`,
      `Becoming a ${c.className} gave shape to instincts that had survived the earlier life. After ${c.name} ${c.awakening}, the work became clear: ${c.classStory.duty}. ${k.resonance} ${k.tension}`
    ];
    const presents=[
      `Now ${c.name} travels as ${article(storyArc.label)} ${storyArc.label.replace(/^The\s+/i,"").toLowerCase()}, but the old life still decides what feels personal. What matters now is ${c.bgLit.desire}. The road ahead is not a search for glory; it is a chance to make the next difficult choice better than the one that still hurts.`,
      `Adventure is where the old life and the new discipline finally meet. The unfinished aim is ${c.bgLit.desire}. ${c.name} does not expect the past to become clean; only to make the next chapter more honest than the last.`,
      `The reason ${c.name} keeps moving is specific: ${c.bgLit.desire}. It now travels inside the habits of a ${c.className}${c.subclassName?` and the hard-earned identity of ${c.subclassName}`:""}. Whatever comes next, ${c.name} intends to choose it awake.`
    ];
    return Object.freeze([pick(openings,seed,5),pick(fractures,seed,17),pick(becoming,seed,29),pick(presents,seed,43)]);
  }catch(error){console.error("[dossier-literary] backstory build failed",error);throw error;}
}

export function literaryArtDirection(context,core){
  try{
    const c=context,k=core,subclass=c.subclassName?`; subclass signature: ${c.subLit.art}`:"",pathId=c.subclassId||c.classId;
    return Object.freeze({
      subject:`${c.species} ${c.className}${c.subclassName?` — ${c.subclassName}`:""}`,
      background:c.bgLit.art,
      subclass:c.subclassName?c.subLit.art:"class identity only",
      backgroundId:c.backgroundId,
      pathId,
      backgroundSymbol:k.backgroundSymbol,
      pathSymbol:k.pathSymbol,
      symbolicAnchor:`${k.backgroundSymbol}; ${k.pathSymbol}`,
      composition:"single character, three-quarter portrait, story moment rather than combat pose",
      continuity:"show one visible keepsake from the background and one restrained visual signature from the class path",
      avoid:"generic glamour pose, random tavern backdrop, logos, written text, duplicate weapons, costume-like pristine gear",
      variantKey:`${c.backgroundId}--${pathId}`,
      brief:`Grounded fantasy portrait of ${c.name}, a ${c.species} ${c.className}${c.subclassName?` of ${c.subclassName}`:""}. Story title: ${k.storyTitle}. Background history: ${c.bgLit.art}${subclass}. Anchor the image with the ${k.backgroundSymbol} and the ${k.pathSymbol}; use practical lived-in gear, an expressive face, and a narrative environment. Depict a consequential quiet moment, not a generic glamour pose.`
    });
  }catch(error){console.error("[dossier-literary] art direction failed",error);throw error;}
}

function pick(values,seed,salt){return values[Math.abs((seed+salt*2654435761)|0)%values.length];}
function capitalize(value){const text=String(value||"");return text?text[0].toUpperCase()+text.slice(1):text;}
function article(label){return /^[aeiou]/i.test(String(label||"").replace(/^The\s+/i,""))?"an":"a";}
