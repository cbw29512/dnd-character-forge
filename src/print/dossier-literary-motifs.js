const BACKGROUND_SYMBOLS=Object.freeze({
  acolyte:"unanswered bell",criminal:"coded key",sage:"burned page",soldier:"unlawful order",
  "bounty-hunter":"red warrant","caravan-guard":"scarred route marker","grave-warden":"unmarked grave","hedge-mage":"singed notebook",
  "monster-hunter":"broken trap","pit-fighter":"empty arena","royal-envoy":"broken seal","deep-sailor":"salt-stained chart",
  "field-medic":"mended instrument","treasure-seeker":"stolen relic","wilderness-guide":"lost trail",watchman:"vanished report"
});

const BACKGROUND_CUES=Object.freeze({
  acolyte:{memory:"They learned who arrived before dawn, who stayed after prayer, and which acts of service mattered when nobody praised them.",habit:"straightens candles, cups, or small objects before a difficult conversation",comfort:"quiet rooms before dawn",aversion:"piety performed for an audience"},
  criminal:{memory:"They learned which doors were watched, which silences were warnings, and how quickly a favor could become a chain.",habit:"checks exits before choosing where to sit",comfort:"private codes shared only with trusted people",aversion:"unexpected favors with no stated price"},
  sage:{memory:"They learned to distrust clean conclusions, because the useful truth was often waiting in a margin somebody else had skipped.",habit:"annotates margins and corrects labels almost without noticing",comfort:"well-kept archives and orderly worktables",aversion:"confident claims offered without evidence"},
  soldier:{memory:"They learned that the person giving an order and the person paying for it are often standing in different places.",habit:"lays out gear in the same order whenever there is time",comfort:"clear watches, clear responsibilities, and competent preparation",aversion:"orders nobody is willing to own afterward"},
  "bounty-hunter":{memory:"They learned to read worn boots, interrupted routines, and the difference between someone fleeing justice and someone fleeing a story told about them.",habit:"studies routes and footwear before accepting anyone's account",comfort:"a trail that grows clearer under patient work",aversion:"easy stories about who deserves punishment"},
  "caravan-guard":{memory:"They learned to count people before wagons, because cargo can be replaced and an empty bedroll cannot.",habit:"counts heads at departures and after every hard stop",comfort:"a camp settling safely after the last perimeter check",aversion:"shortcuts taken to impress people who do not bear the risk"},
  "grave-warden":{memory:"They learned that saying a dead person's name aloud can be a form of resistance when institutions prefer forgetting.",habit:"quietly repeats names so they are not reduced to labels",comfort:"lantern light among tended stones",aversion:"nameless burials and records deliberately erased"},
  "hedge-mage":{memory:"They learned magic beside leaking roofs and sick livestock, where a spell mattered only if it solved the problem in front of someone.",habit:"saves scraps, labels mixtures, and writes down every failed correction",comfort:"a cluttered workbench with herbs drying overhead",aversion:"magic performed only to prove superiority"},
  "monster-hunter":{memory:"They learned to sketch tracks before naming the creature, because fear becomes dangerous when it decides the answer first.",habit:"records evidence before offering a theory",comfort:"the quiet after a dangerous pattern finally makes sense",aversion:"crowds that become certain before the facts arrive"},
  "pit-fighter":{memory:"They learned how a crowd can mistake pain for entertainment and endurance for consent.",habit:"controls breathing and rolls tension from the shoulders before entering a tense room",comfort:"an empty arena after the crowd has gone home",aversion:"applause that celebrates cruelty"},
  "royal-envoy":{memory:"They learned that the second meaning of a sentence often matters more than the first, especially when a seal is attached.",habit:"notices seals, seating, and who waits for someone else to speak first",comfort:"precise correspondence whose promises can survive rereading",aversion:"courtesy used to disguise cowardice"},
  "deep-sailor":{memory:"They learned that confidence means little when nobody aboard can say where the ship actually is.",habit:"checks knots, wind, and horizon whenever thought needs settling",comfort:"a deck at first light after a difficult watch",aversion:"certainty without a bearing or position fix"},
  "field-medic":{memory:"They learned that mercy is often ugly, hurried work done while everyone nearby is still afraid.",habit:"counts usable supplies without realizing they are doing it",comfort:"clean bandages, hot water, and five uninterrupted minutes",aversion:"preventable suffering dismissed as fate"},
  "treasure-seeker":{memory:"They learned to mark the exit before admiring the chamber, because wonder is no excuse for becoming another warning carved into a ruin.",habit:"marks exits and structural hazards before studying valuables",comfort:"lamplight over an old map with one unanswered mark",aversion:"the claim that finding something automatically makes it yours"},
  "wilderness-guide":{memory:"They learned that the strongest traveler is not always the one nearest collapse, which makes watching the whole group a form of navigation.",habit:"checks weather and other people's condition before discussing distance",comfort:"a trail sign confirmed exactly where judgment expected it",aversion:"travelers who hide exhaustion until it becomes everyone's emergency"},
  watchman:{memory:"They learned how much trouble announces itself through one dark window, one missing vendor, or one familiar door standing open at the wrong hour.",habit:"notices windows, lamps, exits, and who is pretending not to watch",comfort:"streets just before dawn when a quiet night has truly stayed quiet",aversion:"reports that disappear because the truth is inconvenient"}
});

const CLASS_SYMBOLS=Object.freeze({
  barbarian:"banked fury",bard:"unfinished song",cleric:"kept flame",druid:"old root",fighter:"worn blade",monk:"measured breath",
  paladin:"sworn light",ranger:"marked trail",rogue:"open lock",sorcerer:"inner ember",warlock:"sealed bargain",wizard:"living formula"
});

const SUBCLASS_SYMBOLS=Object.freeze({
  berserker:"red fury",champion:"unbroken blade","school-evocation":"controlled flame",evoker:"controlled flame","life-domain":"keeper's light","circle-land":"old root","oath-devotion":"unbroken oath",hunter:"marked trail",thief:"open lock",
  "college-lore":"forbidden verse","open-hand":"empty hand","draconic-bloodline":"dragon's ember","draconic-sorcery":"dragon's ember",fiend:"burning contract","fiend-patron":"burning contract",
  "iron-tempest":"iron storm",stoneheart:"standing stone","college-resonance":"living chord","college-wayfaring":"road song","hearth-domain":"banked hearth","vigil-domain":"watch lantern","circle-ash":"green shoot in ash","circle-tides":"turning tide",
  vanguard:"held line","iron-marshal":"raised signal","falling-star":"falling star","still-river":"still river","oath-beacon":"beacon in smoke","oath-iron-ward":"iron gate",trailwarden:"crossed trail","tempest-scout":"storm road",
  "night-courier":"midnight message","fortune-blade":"edgewise coin",aetherbound:"glass storm",emberheart:"banked ember","lantern-beyond":"impossible lantern","deep-archive":"redacted page",spellwright:"living sigil","veil-scholar":"missing outline"
});

export function buildLiteraryCore(context,storyArc,seed){
  try{
    const c=context,b=BACKGROUND_SYMBOLS[c.backgroundId]||"old keepsake",cue=BACKGROUND_CUES[c.backgroundId]||fallbackCue(),s=SUBCLASS_SYMBOLS[c.subclassId]||CLASS_SYMBOLS[c.classId]||"chosen path",hasSubclass=Boolean(c.subclassName),storyTitle=titleFor(b,s,seed);
    const ideal=`${capitalize(c.bgLit.lesson)}. Power is worth keeping only when it helps ${c.name} ${stripTo(c.bgLit.desire)}.`;
    const fear=hasSubclass?`${c.name} ${c.subLit.cost}. The old wound gives that fear enough evidence to be difficult to dismiss.`:storyArc.fear(c);
    const secret=hasSubclass?`The memory of the ${b} returned at the exact moment ${c.name} ${c.subLit.threshold}. ${c.name} has never told anyone why those two memories feel like one story.`:storyArc.secret(c);
    const hook=hasSubclass?`Someone tied to ${c.bg.bond} has found evidence connecting the ${b} to the first signs of the ${s}. They want ${c.name} to explain the connection before someone else does.`:storyArc.hook(c);
    const resonance=hasSubclass?`${capitalize(c.bgLit.desire)} was once only a hope. ${c.subclassName} made that hope dangerous and practical at once: ${c.subLit.gift}.`:`${capitalize(c.bgLit.desire)} became the reason ${c.name}'s ${c.className} training mattered beyond survival.`;
    const tension=hasSubclass?`The older lesson remains: ${c.bgLit.lesson}. The newer danger is personal: ${c.name} ${c.subLit.cost}. Neither truth has defeated the other.`:`The old lesson remains: ${c.bgLit.lesson}. ${c.name} still has to decide what that lesson costs when the answer is inconvenient.`;
    const roleplay=`Let the ${c.background} history show in small habits: ${cue.habit}. ${c.name} finds comfort in ${cue.comfort} and reacts sharply to ${cue.aversion}. In hard choices, begin from the belief that ${c.bgLit.lesson}.${hasSubclass?` Under pressure, ${c.subclassName} adds a second truth: ${c.subLit.gift}, even while ${c.name} ${c.subLit.cost}.`:``}`;
    return Object.freeze({storyTitle,backgroundSymbol:b,pathSymbol:s,backgroundMemory:cue.memory,habit:cue.habit,comfort:cue.comfort,aversion:cue.aversion,ideal,fear,secret,hook,resonance,tension,roleplay});
  }catch(error){console.error("[dossier-literary-motifs] core build failed",error);throw error;}
}

export function literarySymbolIds(){return Object.freeze({backgrounds:Object.freeze(Object.keys(BACKGROUND_SYMBOLS)),subclasses:Object.freeze(Object.keys(SUBCLASS_SYMBOLS)),classes:Object.freeze(Object.keys(CLASS_SYMBOLS))});}

function titleFor(background,path,seed){
  const b=titleCase(background),p=titleCase(path),styles=[`The ${b} and the ${p}`,`${b} Under the ${p}`,`Between the ${b} and the ${p}`,`${p} After the ${b}`];
  return styles[Math.abs(seed|0)%styles.length];
}
function fallbackCue(){return{memory:"They learned to notice the small obligations that make ordinary lives hold together.",habit:"checks practical details before committing to a plan",comfort:"a quiet place where equipment can be put in order",aversion:"confidence that has not earned its certainty"};}
function stripTo(value){return String(value||"").replace(/^to\s+/i,"");}
function capitalize(value){const text=String(value||"");return text?text[0].toUpperCase()+text.slice(1):text;}
function titleCase(value){return String(value||"").replace(/\b\w/g,char=>char.toUpperCase());}
