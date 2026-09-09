const BACKGROUND_SYMBOLS=Object.freeze({
  acolyte:"unanswered bell",criminal:"coded key",sage:"burned page",soldier:"unlawful order",
  "bounty-hunter":"red warrant","caravan-guard":"scarred route marker","grave-warden":"unmarked grave","hedge-mage":"singed notebook",
  "monster-hunter":"broken trap","pit-fighter":"empty arena","royal-envoy":"broken seal","deep-sailor":"salt-stained chart",
  "field-medic":"mended instrument","treasure-seeker":"stolen relic","wilderness-guide":"lost trail",watchman:"vanished report"
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
    const c=context,b=BACKGROUND_SYMBOLS[c.backgroundId]||"old keepsake",s=SUBCLASS_SYMBOLS[c.subclassId]||CLASS_SYMBOLS[c.classId]||"chosen path",hasSubclass=Boolean(c.subclassName),storyTitle=titleFor(b,s,seed);
    const ideal=`${capitalize(c.bgLit.lesson)}. Power is worth keeping only when it helps ${c.name} ${stripTo(c.bgLit.desire)}.`;
    const fear=hasSubclass?`${c.name} ${c.subLit.cost}. The old wound gives that fear enough evidence to be difficult to dismiss.`:storyArc.fear(c);
    const secret=hasSubclass?`The memory of the ${b} returned at the exact moment ${c.name} ${c.subLit.threshold}. ${c.name} has never told anyone why those two memories feel like one story.`:storyArc.secret(c);
    const hook=hasSubclass?`Someone tied to ${c.bg.bond} has found evidence connecting the ${b} to the first signs of the ${s}. They want ${c.name} to explain the connection before someone else does.`:storyArc.hook(c);
    const resonance=hasSubclass?`${capitalize(c.bgLit.desire)} was once only a hope. ${c.subclassName} made that hope dangerous and practical at once: ${c.subLit.gift}.`:`${capitalize(c.bgLit.desire)} became the reason ${c.name}'s ${c.className} training mattered beyond survival.`;
    const tension=hasSubclass?`The older lesson remains: ${c.bgLit.lesson}. The newer danger is personal: ${c.name} ${c.subLit.cost}. Neither truth has defeated the other.`:`The old lesson remains: ${c.bgLit.lesson}. ${c.name} still has to decide what that lesson costs when the answer is inconvenient.`;
    return Object.freeze({storyTitle,backgroundSymbol:b,pathSymbol:s,ideal,fear,secret,hook,resonance,tension});
  }catch(error){console.error("[dossier-literary-motifs] core build failed",error);throw error;}
}

export function literarySymbolIds(){return Object.freeze({backgrounds:Object.freeze(Object.keys(BACKGROUND_SYMBOLS)),subclasses:Object.freeze(Object.keys(SUBCLASS_SYMBOLS)),classes:Object.freeze(Object.keys(CLASS_SYMBOLS))});}

function titleFor(background,path,seed){
  const b=titleCase(background),p=titleCase(path),styles=[`The ${b} and the ${p}`,`${b} Under the ${p}`,`Between the ${b} and the ${p}`,`${p} After the ${b}`];
  return styles[Math.abs(seed|0)%styles.length];
}
function stripTo(value){return String(value||"").replace(/^to\s+/i,"");}
function capitalize(value){const text=String(value||"");return text?text[0].toUpperCase()+text.slice(1):text;}
function titleCase(value){return String(value||"").replace(/\b\w/g,char=>char.toUpperCase());}
