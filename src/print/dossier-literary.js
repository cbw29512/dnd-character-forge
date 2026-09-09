export function buildLiteraryBackstory(context,storyArc,seed){
  try{
    const c=context,openings=[
      `Before anyone called ${c.name} a ${c.className}, life was measured in ${c.bgLit.texture}. ${c.name} ${c.bg.origin}. ${capitalize(c.bg.mentor)} taught one lesson that survived every later certainty: ${c.bgLit.lesson}.`,
      `${c.name}'s first education had little to do with heroism. It was made of ${c.bgLit.texture}. There, ${c.name} ${c.bg.origin}, and ${c.bg.mentor} taught that ${c.bgLit.lesson}.`,
      `The oldest version of ${c.name} belongs to a world of ${c.bgLit.texture}. ${c.name} ${c.bg.origin}; the work was ordinary until ordinary responsibility became the standard by which every later choice would be judged.`
    ];
    const fractures=[
      `That life broke open during ${c.event} near ${c.place}. In the confusion, ${c.bgLit.wound}. The cost made ${c.bg.bond} more than a memory. ${capitalize(c.token)} became the object ${c.name} kept when almost everything else from that chapter could be left behind.`,
      `${c.event} near ${c.place} turned old lessons into consequences. ${capitalize(c.bgLit.wound)}. What remained was loyalty to ${c.bg.bond}, and ${c.token}—small enough to carry, heavy enough to remember.`,
      `Then came ${c.event} near ${c.place}, the kind of day that makes every earlier belief prove its weight. ${capitalize(c.bgLit.wound)}. From then on, ${c.bg.bond} became a debt of the heart rather than a pleasant piece of history.`
    ];
    const becoming=c.subclassName?[
      `The path to ${c.subclassName} began when ${c.name} ${c.subLit.threshold}. The gift was immediate: ${c.subLit.gift}. So was the private cost—${c.subLit.cost}. What others later called a subclass, ${c.name} remembers as the moment an old wound finally found a language.`,
      `Becoming ${c.subclassName} was not a promotion. It was a decision made after ${c.name} ${c.awakening}. In that decision, ${c.name} learned to ${c.classStory.duty}; more specifically, ${c.subLit.gift}. The price is quieter: ${c.subLit.cost}.`,
      `${c.name} crossed into the discipline of ${c.subclassName} after ${c.name} ${c.subLit.threshold}. Power did not erase the earlier life; it sharpened it. ${capitalize(c.subLit.gift)}. Yet ${c.name} knows ${c.subLit.cost}.`
    ]:[
      `The ${c.className} path opened when ${c.name} ${c.awakening}. Power mattered because it made an older promise actionable: ${c.classStory.duty}. The burden followed close behind; ${c.classStory.burden}.`,
      `Becoming a ${c.className} gave shape to instincts that had survived the earlier life. After ${c.name} ${c.awakening}, the work became clear: ${c.classStory.duty}. The danger is just as clear—${c.classStory.burden}.`
    ];
    const presents=[
      `Now ${c.name} travels as ${article(storyArc.label)} ${storyArc.label.replace(/^The\s+/i,"").toLowerCase()}, but the old background still decides what feels personal. ${capitalize(c.bgLit.desire)}. The road ahead is not a search for glory; it is an attempt to make the next difficult choice better than the one that still hurts.`,
      `Adventure has become the place where the old life and the new discipline finally meet. ${capitalize(c.bgLit.desire)}. ${c.name} does not expect the past to become clean; the hope is smaller and harder—to become someone whose next chapter does not require pretending the earlier ones never happened.`,
      `The reason ${c.name} keeps moving is specific: ${c.bgLit.desire}. That desire now travels inside the habits of a ${c.className}${c.subclassName?` and the hard-earned identity of ${c.subclassName}`:""}. Whatever comes next, ${c.name} intends to choose it awake.`
    ];
    return Object.freeze([pick(openings,seed,5),pick(fractures,seed,17),pick(becoming,seed,29),pick(presents,seed,43)]);
  }catch(error){console.error("[dossier-literary] backstory build failed",error);throw error;}
}

export function literaryArtDirection(context){
  try{
    const c=context,subclass=c.subclassName?`; subclass signature: ${c.subLit.art}`:"";
    return Object.freeze({
      subject:`${c.species} ${c.className}${c.subclassName?` — ${c.subclassName}`:""}`,
      background:c.bgLit.art,
      subclass:c.subclassName?c.subLit.art:"class identity only",
      brief:`Grounded fantasy character portrait of ${c.name}, a ${c.species} ${c.className}. Background history: ${c.bgLit.art}${subclass}. Practical adventuring gear, lived-in materials, expressive face, narrative environment, no generic glamour pose.`
    });
  }catch(error){console.error("[dossier-literary] art direction failed",error);throw error;}
}

function pick(values,seed,salt){return values[Math.abs((seed+salt*2654435761)|0)%values.length];}
function capitalize(value){const text=String(value||"");return text?text[0].toUpperCase()+text.slice(1):text;}
function article(label){return /^[aeiou]/i.test(String(label||"").replace(/^The\s+/i,""))?"an":"a";}
