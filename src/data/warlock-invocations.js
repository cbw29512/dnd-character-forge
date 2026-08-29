const i=(id,name,minLevel,summary,{pact=null,requiresInvocation=null,targetCantrip=null,repeatable=false,timing="Feature"}={})=>Object.freeze({id,name,minLevel,summary,pact,requiresInvocation,targetCantrip,repeatable,timing});

const INVOCATIONS_2014=Object.freeze([
  i("agonizing-blast","Agonizing Blast",2,"Add your Charisma modifier to the damage dealt by Eldritch Blast on a hit.",{targetCantrip:"eldritch-blast",timing:"Eldritch Blast hit"}),
  i("armor-of-shadows","Armor of Shadows",2,"Cast Mage Armor on yourself at will without expending a spell slot or material components.",{timing:"At will"}),
  i("ascendant-step","Ascendant Step",9,"Cast Levitate on yourself at will without expending a spell slot or material components.",{timing:"At will"}),
  i("beast-speech","Beast Speech",2,"Cast Speak with Animals at will without expending a spell slot.",{timing:"At will"}),
  i("beguiling-influence","Beguiling Influence",2,"Gain proficiency in Deception and Persuasion.",{timing:"Passive"}),
  i("bewitching-whispers","Bewitching Whispers",7,"Cast Compulsion once using a Warlock spell slot; regain this invocation after a Long Rest.",{timing:"Once per Long Rest"}),
  i("book-of-ancient-secrets","Book of Ancient Secrets",3,"Your Book of Shadows can hold ritual spells; begin with two level-1 rituals from any class and add eligible rituals you discover.",{pact:"tome",timing:"Ritual"}),
  i("chains-of-carceri","Chains of Carceri",15,"Cast Hold Monster at will against a celestial, fiend, or elemental; after targeting a creature, you must finish a Long Rest before targeting that creature again.",{pact:"chain",timing:"At will"}),
  i("devils-sight","Devil's Sight",2,"See normally in magical and nonmagical darkness out to 120 feet.",{timing:"Passive"}),
  i("dreadful-word","Dreadful Word",7,"Cast Confusion once using a Warlock spell slot; regain this invocation after a Long Rest.",{timing:"Once per Long Rest"}),
  i("eldritch-sight","Eldritch Sight",2,"Cast Detect Magic at will without expending a spell slot.",{timing:"At will"}),
  i("eldritch-spear","Eldritch Spear",2,"Eldritch Blast has a range of 300 feet.",{targetCantrip:"eldritch-blast",timing:"Passive"}),
  i("eyes-of-the-rune-keeper","Eyes of the Rune Keeper",2,"You can read all writing.",{timing:"Passive"}),
  i("fiendish-vigor","Fiendish Vigor",2,"Cast False Life on yourself at will as a level-1 spell without a spell slot or material components.",{timing:"At will"}),
  i("gaze-of-two-minds","Gaze of Two Minds",2,"Touch a willing humanoid and perceive through its senses while maintaining the connection with your action; your own surroundings are obscured while doing so.",{timing:"Action"}),
  i("lifedrinker","Lifedrinker",12,"When you hit with your pact weapon, deal extra necrotic damage equal to your Charisma modifier, minimum 1.",{pact:"blade",timing:"Pact weapon hit"}),
  i("mask-of-many-faces","Mask of Many Faces",2,"Cast Disguise Self at will without expending a spell slot.",{timing:"At will"}),
  i("master-of-myriad-forms","Master of Myriad Forms",15,"Cast Alter Self at will without expending a spell slot.",{timing:"At will"}),
  i("minions-of-chaos","Minions of Chaos",9,"Cast Conjure Elemental once using a Warlock spell slot; regain this invocation after a Long Rest.",{timing:"Once per Long Rest"}),
  i("mire-the-mind","Mire the Mind",5,"Cast Slow once using a Warlock spell slot; regain this invocation after a Long Rest.",{timing:"Once per Long Rest"}),
  i("misty-visions","Misty Visions",2,"Cast Silent Image at will without expending a spell slot or material components.",{timing:"At will"}),
  i("one-with-shadows","One with Shadows",5,"In dim light or darkness, use your action to become invisible until you move or take an action or reaction.",{timing:"Action"}),
  i("otherworldly-leap","Otherworldly Leap",9,"Cast Jump on yourself at will without expending a spell slot.",{timing:"At will"}),
  i("repelling-blast","Repelling Blast",2,"When Eldritch Blast hits a creature, push it up to 10 feet away from you in a straight line.",{targetCantrip:"eldritch-blast",timing:"Eldritch Blast hit"}),
  i("sculptor-of-flesh","Sculptor of Flesh",7,"Cast Polymorph once using a Warlock spell slot; regain this invocation after a Long Rest.",{timing:"Once per Long Rest"}),
  i("sign-of-ill-omen","Sign of Ill Omen",5,"Cast Bestow Curse once using a Warlock spell slot; regain this invocation after a Long Rest.",{timing:"Once per Long Rest"}),
  i("thief-of-five-fates","Thief of Five Fates",2,"Cast Bane once using a Warlock spell slot; regain this invocation after a Long Rest.",{timing:"Once per Long Rest"}),
  i("thirsting-blade","Thirsting Blade",5,"Attack with your pact weapon twice, instead of once, when you take the Attack action.",{pact:"blade",timing:"Attack action"}),
  i("visions-of-distant-realms","Visions of Distant Realms",15,"Cast Arcane Eye at will without expending a spell slot.",{timing:"At will"}),
  i("voice-of-the-chain-master","Voice of the Chain Master",3,"Communicate telepathically with your familiar and perceive through its senses while on the same plane; you can also speak through it in your own voice.",{pact:"chain",timing:"Familiar"}),
  i("whispers-of-the-grave","Whispers of the Grave",9,"Cast Speak with Dead at will without expending a spell slot.",{timing:"At will"}),
  i("witch-sight","Witch Sight",15,"See the true form of shapechangers and creatures concealed by illusion or transmutation magic within 30 feet and line of sight.",{timing:"Passive"})
]);

const INVOCATIONS_2024=Object.freeze([
  i("agonizing-blast","Agonizing Blast",2,"Choose a known damaging Warlock cantrip; add your Charisma modifier to that spell's damage rolls.",{targetCantrip:"eldritch-blast",repeatable:true,timing:"Cantrip damage"}),
  i("armor-of-shadows","Armor of Shadows",1,"Cast Mage Armor on yourself without expending a spell slot.",{timing:"At will"}),
  i("ascendant-step","Ascendant Step",5,"Cast Levitate on yourself without expending a spell slot.",{timing:"At will"}),
  i("devils-sight","Devil's Sight",2,"See normally in dim light and darkness, magical or nonmagical, within 120 feet.",{timing:"Passive"}),
  i("devouring-blade","Devouring Blade",12,"Thirsting Blade now gives two extra pact-weapon attacks rather than one.",{requiresInvocation:"thirsting-blade",timing:"Attack action"}),
  i("eldritch-mind","Eldritch Mind",1,"You have Advantage on Constitution saving throws made to maintain Concentration.",{timing:"Concentration save"}),
  i("eldritch-smite","Eldritch Smite",5,"Once per turn when your pact weapon hits, expend a Pact Magic slot for extra Force damage equal to 1d8 plus 1d8 per slot level; a Huge-or-smaller target can also be knocked Prone.",{requiresInvocation:"pact-of-the-blade",timing:"Pact weapon hit"}),
  i("eldritch-spear","Eldritch Spear",2,"Choose a known damaging Warlock cantrip with at least 10-foot range; increase its range by 30 feet per Warlock level.",{targetCantrip:"eldritch-blast",repeatable:true,timing:"Passive"}),
  i("fiendish-vigor","Fiendish Vigor",2,"Cast False Life on yourself without a spell slot; when cast this way, use the maximum result for its Temporary Hit Points die.",{timing:"At will"}),
  i("gaze-of-two-minds","Gaze of Two Minds",5,"Use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn; Bonus Actions can maintain the link, and nearby spellcasting can originate from its space.",{timing:"Bonus Action"}),
  i("gift-of-the-depths","Gift of the Depths",5,"Breathe underwater and gain a Swim Speed equal to your Speed; cast Water Breathing once without a slot per Long Rest.",{timing:"Passive / Long Rest"}),
  i("gift-of-the-protectors","Gift of the Protectors",9,"Your Book of Shadows can hold names up to your Charisma modifier; once per Long Rest, a named creature that would drop to 0 Hit Points drops to 1 instead.",{requiresInvocation:"pact-of-the-tome",timing:"Triggered"}),
  i("investment-of-the-chain-master","Investment of the Chain Master",5,"Enhance your familiar with a 40-foot Fly or Swim Speed, Bonus Action attacks, alternate Necrotic/Radiant damage, your spell save DC, and a Reaction to grant it Resistance.",{requiresInvocation:"pact-of-the-chain",timing:"Familiar"}),
  i("lessons-of-the-first-ones","Lessons of the First Ones",2,"Gain one Origin feat for which you qualify.",{repeatable:true,timing:"Passive"}),
  i("lifedrinker","Lifedrinker",9,"Once per turn on a pact-weapon hit, deal an extra 1d6 Necrotic, Psychic, or Radiant damage; you can also expend one Hit Point Die to heal the roll plus Constitution modifier.",{requiresInvocation:"pact-of-the-blade",timing:"Pact weapon hit"}),
  i("mask-of-many-faces","Mask of Many Faces",2,"Cast Disguise Self without expending a spell slot.",{timing:"At will"}),
  i("master-of-myriad-forms","Master of Myriad Forms",5,"Cast Alter Self without expending a spell slot.",{timing:"At will"}),
  i("misty-visions","Misty Visions",2,"Cast Silent Image without expending a spell slot.",{timing:"At will"}),
  i("one-with-shadows","One with Shadows",5,"While in dim light or darkness, cast Invisibility on yourself without expending a spell slot.",{timing:"At will in dim light/darkness"}),
  i("otherworldly-leap","Otherworldly Leap",2,"Cast Jump on yourself without expending a spell slot.",{timing:"At will"}),
  i("pact-of-the-blade","Pact of the Blade",1,"Conjure or bond with a Simple or Martial melee weapon; you are proficient with it, can use it as a focus, and can use Charisma for its attack and damage rolls.",{timing:"Bonus Action"}),
  i("pact-of-the-chain","Pact of the Chain",1,"Learn Find Familiar and cast it as a Magic action without a spell slot; special familiar forms become available, and you can trade one attack for the familiar's Reaction attack.",{timing:"Magic action"}),
  i("pact-of-the-tome","Pact of the Tome",1,"At the end of a Short or Long Rest, conjure a Book of Shadows containing three cantrips and two level-1 Ritual spells from any class; while the book is on your person, those spells are prepared Warlock spells for you.",{timing:"Short or Long Rest"}),
  i("repelling-blast","Repelling Blast",2,"Choose a known attack-roll Warlock cantrip; when it hits a Large-or-smaller creature, push the target up to 10 feet straight away.",{targetCantrip:"eldritch-blast",repeatable:true,timing:"Cantrip hit"}),
  i("thirsting-blade","Thirsting Blade",5,"Gain Extra Attack for your pact weapon, allowing two attacks when you take the Attack action.",{requiresInvocation:"pact-of-the-blade",timing:"Attack action"}),
  i("visions-of-distant-realms","Visions of Distant Realms",9,"Cast Arcane Eye without expending a spell slot.",{timing:"At will"}),
  i("whispers-of-the-grave","Whispers of the Grave",7,"Cast Speak with Dead without expending a spell slot.",{timing:"At will"}),
  i("witch-sight","Witch Sight",15,"You have Truesight with a range of 30 feet.",{timing:"Passive"})
]);

const TARGET_POOLS_2024=Object.freeze({
  "agonizing-blast":Object.freeze(["chill-touch","eldritch-blast","poison-spray","true-strike"]),
  "eldritch-spear":Object.freeze(["eldritch-blast","poison-spray"]),
  "repelling-blast":Object.freeze(["chill-touch","eldritch-blast","poison-spray","true-strike"])
});

export function warlockInvocationsFor(ruleset){try{if(ruleset==="2014")return INVOCATIONS_2014;if(ruleset==="2024")return INVOCATIONS_2024;throw new Error(`Unsupported Warlock invocation ruleset: ${ruleset}.`);}catch(error){console.error("[warlock-invocations] lookup failed",error);throw error;}}
export function warlockInvocationById(ruleset,id){try{const option=warlockInvocationsFor(ruleset).find(item=>item.id===id);if(!option)throw new Error(`Unknown ${ruleset} Warlock invocation: ${id}.`);return option;}catch(error){console.error("[warlock-invocations] invocation lookup failed",error);throw error;}}
export function invocationOptionsAtLevel(ruleset,level,{pactBoon=null,selectedIds=[]}={}){try{const selected=new Set(selectedIds);return warlockInvocationsFor(ruleset).filter(option=>option.minLevel<=Number(level)&&(ruleset!=="2014"||!option.pact||option.pact===pactBoon)&&(ruleset!=="2024"||!option.requiresInvocation||selected.has(option.requiresInvocation)));}catch(error){console.error("[warlock-invocations] legal option lookup failed",error);throw error;}}
export function invocationCantripTargetIds(ruleset,id){try{const option=warlockInvocationById(ruleset,id);if(!option.targetCantrip)return Object.freeze([]);if(ruleset==="2014")return Object.freeze([option.targetCantrip]);return TARGET_POOLS_2024[id]||Object.freeze([option.targetCantrip]);}catch(error){console.error("[warlock-invocations] target pool lookup failed",error);throw error;}}
export function resolveInvocationCantripTargets(ruleset,ids=[],preferences=[]){
  try{
    const usedByInvocation=new Map(),records=[];
    ids.forEach((id,slot)=>{
      const pool=invocationCantripTargetIds(ruleset,id);if(!pool.length)return;
      const used=usedByInvocation.get(id)||new Set(),requested=preferences[slot]||null,option=warlockInvocationById(ruleset,id);
      if(requested&&(!pool.includes(requested)||used.has(requested)))throw new Error(`${option.name} target ${requested} is unavailable or already used by another copy.`);
      const target=requested||(pool.includes(option.targetCantrip)&&!used.has(option.targetCantrip)?option.targetCantrip:pool.find(cantrip=>!used.has(cantrip)));
      if(!target)throw new Error(`${option.name} has no different eligible cantrip remaining for repeat copy ${used.size+1}.`);
      used.add(target);usedByInvocation.set(id,used);records.push(Object.freeze({slot,invocationId:id,targetCantrip:target}));
    });
    return Object.freeze(records);
  }catch(error){console.error("[warlock-invocations] cantrip target resolution failed",error);throw error;}
}
export function invocationTargetCantripIds(ruleset,ids=[]){try{return Object.fromEntries([...new Set(ids)].map(id=>warlockInvocationById(ruleset,id)).filter(option=>option.targetCantrip).map(option=>[option.id,option.targetCantrip]));}catch(error){console.error("[warlock-invocations] cantrip target lookup failed",error);throw error;}}
