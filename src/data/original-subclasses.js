const SOURCE_BASE=Object.freeze({version:"Character Forge Original",document:"Character Forge Original Game Content",license:"Original Character Forge game content"});
const lvl=(y2014,y2024=y2014)=>Object.freeze({"2014":y2014,"2024":y2024});
const f=(levels,name,timing,text)=>Object.freeze({levels:typeof levels==="number"?lvl(levels):levels,name,timing,text});
const b=(classId,id,name,levels,tagline)=>Object.freeze({classId,id,name,levels,tagline});

const BLUEPRINTS=Object.freeze([
  b("bard","college-resonance","College of Resonance",lvl(3),"Turn inspiration into a protective chorus that keeps the party moving."),
  b("bard","college-wayfaring","College of Wayfaring",lvl(3),"Carry courage down dangerous roads and pull allies through impossible positions."),
  b("cleric","hearth-domain","Hearth Domain",lvl(1,3),"Guard shelter, recovery, and shared endurance."),
  b("cleric","vigil-domain","Vigil Domain",lvl(1,3),"Stand watch against hidden threats and keep allies ready."),
  b("druid","circle-ash","Circle of Ash",lvl(2,3),"Spend primal power on smoke, cinders, and stubborn renewal."),
  b("druid","circle-tides","Circle of Tides",lvl(2,3),"Control the battlefield with surging and retreating primal force."),
  b("fighter","vanguard","Vanguard",lvl(3),"Own the front line through interception and formation fighting."),
  b("fighter","iron-marshal","Iron Marshal",lvl(3),"Turn personal discipline into battlefield orders."),
  b("monk","falling-star","Way of the Falling Star",lvl(3),"Convert speed and disciplined momentum into explosive pressure."),
  b("monk","still-river","Way of the Still River",lvl(3),"Yield, redirect, and return force with patient control."),
  b("paladin","oath-beacon","Oath of the Beacon",lvl(3),"Become a visible point of courage that guides allies through chaos."),
  b("paladin","oath-iron-ward","Oath of the Iron Ward",lvl(3),"Hold the breach and turn endurance into protection for others."),
  b("ranger","trailwarden","Trailwarden",lvl(3),"Control pursuit routes and protect companions while staying on the quarry."),
  b("ranger","tempest-scout","Tempest Scout",lvl(3),"Fight like a moving storm: fast, mobile, and hard to pin down."),
  b("rogue","night-courier","Night Courier",lvl(3),"Exploit movement and cover to deliver decisive strikes."),
  b("rogue","fortune-blade","Fortune Blade",lvl(3),"Turn calculated risk into improbable escapes and moments of certainty."),
  b("sorcerer","aetherbound","Aetherbound",lvl(1,3),"Bend raw magical pressure into wards and displacement."),
  b("sorcerer","emberheart","Emberheart",lvl(1,3),"Store spellfire as protective heat, then release it when battle turns."),
  b("warlock","lantern-beyond","The Lantern Beyond",lvl(1,3),"Borrow impossible light to expose danger and open escape routes."),
  b("warlock","deep-archive","The Deep Archive",lvl(1,3),"Serve an unknowable repository of observation and redaction."),
  b("wizard","spellwright","Spellwright",lvl(2,3),"Engineer resilient spell structures and careful casting."),
  b("wizard","veil-scholar","Veil Scholar",lvl(2,3),"Study the space between attention and absence.")
]);

const FEATURES=Object.freeze({
  "college-resonance":Object.freeze([
    f(3,"Resonant Guard","Reaction · Bardic Inspiration","When a creature you can see within 60 feet takes damage, expend Bardic Inspiration, roll the die, and reduce the damage by the roll + your Charisma modifier."),
    f(3,"Carrying Note","When Bardic Inspiration is used","After a creature rolls one of your Bardic Inspiration dice, it can move up to 10 feet without provoking an opportunity attack from one creature it can see."),
    f(6,"Echo Chamber","Once per turn","When a creature succeeds on an attack roll, ability check, or saving throw after adding your Bardic Inspiration die, a different creature within 30 feet gains temporary hit points equal to the die roll."),
    f(14,"Grand Chorus","Bonus Action · once per Long Rest","For 1 minute, Bardic Inspiration dice rolled by creatures you can see within 60 feet treat results below half the die maximum as half the maximum.")
  ]),
  "college-wayfaring":Object.freeze([
    f(3,"Traveling Verse","When granting Bardic Inspiration","When you give Bardic Inspiration, the target can use its reaction to move up to 10 feet without provoking opportunity attacks."),
    f(3,"Roadsong","Passive aura","While conscious, you and allies within 10 feet ignore nonmagical difficult terrain."),
    f(6,"Crossroads Rescue","Reaction · Bardic Inspiration","When a creature within 60 feet is hit, expend Bardic Inspiration; it can use its reaction to move 15 feet. If that leaves the attack's reach or range, the attack misses."),
    f(14,"Horizon Chorus","Action · once per Long Rest","Teleport up to your Charisma modifier willing creatures within 30 feet to spaces each can see within 30 feet of its starting space.")
  ]),
  "hearth-domain":Object.freeze([
    f(lvl(1,3),"Hearthkeeper","Once per turn · healing spell","When a spell you cast with a spell slot restores hit points to another creature, it also gains temporary hit points equal to your proficiency bonus."),
    f(lvl(2,3),"Channel Divinity: Shelter of Embers","Action · Channel Divinity","Expend Channel Divinity and choose up to your Wisdom modifier creatures within 30 feet; each gains temporary hit points equal to your Cleric level + Wisdom modifier."),
    f(6,"Shared Warmth","Reaction","When a creature within 30 feet with temporary hit points from one of your Cleric features takes damage, give it resistance to that damage. Uses equal proficiency bonus per Long Rest."),
    f(lvl(8,99),"Hearthfire Strike","Once per turn · damage","Once per turn when a weapon attack or Cleric cantrip deals damage, one target takes +1d8 Radiant or Fire damage; +2d8 at Cleric 14."),
    f(17,"Sanctuary Hearth","Passive aura","While conscious, you and allies within 30 feet resist Cold damage. A creature that starts its turn there with temporary hit points from your Cleric features regains 5 hit points.")
  ]),
  "vigil-domain":Object.freeze([
    f(lvl(1,3),"Watcher's Mark","Once per turn","When you damage a creature with a weapon attack or Cleric cantrip, mark it until your next turn; the first attack by another creature against it gains +1d4."),
    f(lvl(2,3),"Channel Divinity: Revealing Watch","Action · Channel Divinity","Expend Channel Divinity; chosen creatures within 30 feet cannot benefit from invisibility against you until the end of your next turn, and your attacks ignore their half and three-quarters cover."),
    f(6,"Unbroken Watch","Passive aura","You cannot be surprised while conscious. Allies within 10 feet have advantage on saves to avoid or end Frightened."),
    f(lvl(8,99),"Watchfire Strike","Once per turn · damage","Once per turn when a weapon attack or Cleric cantrip deals damage, one target takes +1d8 Radiant damage; +2d8 at Cleric 14."),
    f(17,"Eternal Vigil","Passive","Gain truesight 30 feet. If you roll initiative with no Channel Divinity uses, regain one; once per Long Rest.")
  ]),
  "circle-ash":Object.freeze([
    f(lvl(2,3),"Ashen Shroud","Bonus Action · Wild Shape use","Expend one Wild Shape use without transforming. For 1 minute, a 10-foot ash aura deals Fire damage equal to proficiency bonus once per turn when a hostile creature enters or starts there."),
    f(6,"Cinder Step","Reaction","When you take damage, teleport up to 15 feet to a space you can see. Uses equal proficiency bonus per Long Rest."),
    f(10,"Banked Flame","Passive / Reaction","Gain Fire resistance. After you take Fire damage, you can use your reaction to gain temporary hit points equal to Wisdom modifier + proficiency bonus."),
    f(14,"From the Coals","At 0 HP · Wild Shape use","When damage would reduce you to 0 hit points without killing you, expend Wild Shape to drop to 1 hit point and end Charmed, Frightened, or Poisoned on yourself; once per Long Rest.")
  ]),
  "circle-tides":Object.freeze([
    f(lvl(2,3),"Tidal Shape","Bonus Action · Wild Shape use","Expend one Wild Shape use without transforming. For 1 minute, once per turn when you damage a Large or smaller creature within 30 feet, push or pull it 5 feet."),
    f(6,"Ebb and Flow","Reaction","When a willing creature within 30 feet is moved against its will or would provoke an opportunity attack, move it up to 10 feet to a reachable space without provoking opportunity attacks."),
    f(10,"Deepwater Calm","Passive","Gain Cold resistance, hold your breath for 1 hour, and ignore difficult terrain caused by water, mud, ice, or loose earth."),
    f(14,"High Tide","Action · once per Long Rest","For 1 minute, a 20-foot aura around you is difficult terrain for hostiles; chosen allies ignore difficult terrain there and gain temporary hit points equal to Wisdom modifier at the start of their turns.")
  ]),
  "vanguard":Object.freeze([
    f(3,"Intercepting Step","Reaction","When a creature attacks an ally within 10 feet, move up to 10 feet toward the ally without provoking opportunity attacks; if you end within 5 feet, subtract proficiency bonus from the triggering attack roll."),
    f(7,"Press Forward","After Second Wind","Immediately after Second Wind, move up to half your Speed without provoking opportunity attacks."),
    f(10,"Hold the Line","Opportunity attack","When your opportunity attack hits, the target's Speed becomes 0 for the rest of the turn."),
    f(15,"Unbroken Formation","Passive","While conscious, you and allies within 5 feet gain +1 AC while at least two members of that group are standing."),
    f(18,"Vanguard's Answer","Reaction","When an ally within 10 feet is hit, make one weapon attack against the attacker if in range; on a hit, the ally also gains temporary hit points equal to your Fighter level.")
  ]),
  "iron-marshal":Object.freeze([
    f(3,"Field Order","When using Second Wind","When you use Second Wind, one ally within 30 feet either moves 10 feet without provoking opportunity attacks or gains temporary hit points equal to Fighter level + proficiency bonus."),
    f(7,"Tactical Read","After Initiative","After initiative is rolled, up to proficiency bonus willing allies you can see can each move 10 feet without provoking opportunity attacks."),
    f(10,"Rallying Presence","Passive aura","While conscious, allies within 10 feet have advantage on saving throws to avoid or end Frightened."),
    f(15,"Seize Momentum","When using Action Surge","When you use Action Surge, one ally within 30 feet can use its reaction to move half its Speed or make one weapon attack."),
    f(18,"Master of the Field","Start of your turn","Choose Advance or Brace each turn. Until your next turn, allies within 15 feet gain +10 feet Speed with Advance or +1 AC with Brace while you are conscious.")
  ]),
  "falling-star":Object.freeze([
    f(3,"Comet Step","After Step of the Wind","After spending 1 {point} on Step of the Wind, your next Unarmed Strike this turn deals one extra Martial Arts die of Thunder damage and can push a Large or smaller target 5 feet."),
    f(6,"Meteor Guard","After Deflect","When your Monk Deflect feature reduces its triggering damage to 0, move up to 10 feet without provoking opportunity attacks before any redirected attack."),
    f(11,"Starfall Flurry","Flurry of Blows","If two attacks from the same Flurry of Blows hit one creature, it makes a Strength save against your {save}; on a failure it falls Prone and takes one Martial Arts die of Force damage."),
    f(17,"Falling Star Impact","On hit · 3 {pointPlural}","After an Unarmed Strike hits, spend 3 {pointPlural}; Constitution save against your {save}. Failure: four Martial Arts dice Force damage, push 30 feet, and Prone; success: half extra damage.")
  ]),
  "still-river":Object.freeze([
    f(3,"Redirecting Palm","Reaction · 1 {point}","When a creature within 5 feet misses you with a melee attack, spend 1 {point}; Dexterity save against your {save}. On a failure, move it 5 feet to a space you can see."),
    f(6,"Flow Without End","After Patient Defense","After spending 1 {point} on Patient Defense, move up to half your Speed without provoking opportunity attacks."),
    f(11,"Quiet Current","Once per turn · Unarmed Strike","Once per turn when an Unarmed Strike hits, prevent that creature from taking reactions until your next turn."),
    f(17,"River Returns","Reaction · 2 {pointPlural}","When a creature within 5 feet hits you with a melee attack, spend 2 {pointPlural} to reduce damage by three Martial Arts dice + Dexterity modifier; if reduced to 0, make one Unarmed Strike against it.")
  ]),
  "oath-beacon":Object.freeze([
    f(3,"Channel Divinity: Guiding Radiance","Bonus Action · Channel Divinity","Expend Channel Divinity; for 1 minute shed bright light 20 feet. Once per turn, an ally in the light can add 1d4 to one attack roll or saving throw."),
    f(3,"Beacon's Mercy","Lay on Hands","When Lay on Hands restores hit points to another creature, it can immediately end Frightened on itself."),
    f(7,"Aura of Resolve","Passive aura","You and allies in your Aura of Protection ignore Speed reductions caused by Frightened, and standing from Prone costs only 5 feet."),
    f(15,"Light Against the Dark","Failed save","When you fail a save against Charmed or Frightened, choose to succeed instead. Uses equal proficiency bonus per Long Rest."),
    f(20,"Living Beacon","Bonus Action · once per Long Rest","For 1 minute shed bright light 30 feet. Allies starting there with at least 1 hit point regain proficiency bonus hit points; hostile creatures starting there take Radiant damage equal to Charisma modifier.")
  ]),
  "oath-iron-ward":Object.freeze([
    f(3,"Channel Divinity: Stand Fast","Bonus Action · Channel Divinity","Expend Channel Divinity; up to Charisma modifier creatures within 30 feet gain temporary hit points equal to Paladin level and advantage against being moved or knocked Prone for 1 minute."),
    f(3,"Guardian's Vow","Reaction","When an ally within 5 feet takes damage, take half that damage yourself; apply resistance and vulnerability after dividing the damage."),
    f(7,"Aura of Iron","Passive aura","You and allies in your Aura of Protection have advantage on saving throws against being moved against your will or knocked Prone."),
    f(15,"Unyielding Oath","At 0 HP","When damage would reduce you to 0 hit points without killing you, drop to 1 instead; once per Long Rest."),
    f(20,"Bastion Incarnate","Bonus Action · once per Long Rest","For 1 minute you resist Bludgeoning, Piercing, and Slashing damage; allies in your Aura of Protection gain temporary hit points equal to Charisma modifier at the start of their turns.")
  ]),
  "trailwarden":Object.freeze([
    f(3,"Quarry Step","Once per turn · after hit","Once per turn after a weapon attack hits, move up to 10 feet without provoking opportunity attacks from that target."),
    f(7,"Trailguard","Reaction","When a creature within 30 feet attacks an ally and you can see both, impose disadvantage on that attack roll."),
    f(11,"Relentless Pursuit","Once per turn · after movement","Once per turn, if you moved at least 10 feet before a weapon attack hits, deal +1d6 damage of the weapon's type."),
    f(15,"Master of the Line","Reaction","When a creature within 30 feet moves willingly, move up to half your Speed without provoking from it; if you end in weapon range, make one weapon attack against it.")
  ]),
  "tempest-scout":Object.freeze([
    f(3,"Static Charge","Once per turn · after movement","Once per turn, if you moved at least 10 feet before a weapon attack hits, deal +1d4 Lightning damage."),
    f(7,"Windrunner","Passive","Ignore nonmagical difficult terrain; opportunity attacks against you have disadvantage if you moved at least 10 feet that turn."),
    f(11,"Thunder Followthrough","Once per turn","When a weapon attack hits, a different creature within 10 feet of the target takes Thunder damage equal to Wisdom modifier + proficiency bonus."),
    f(15,"Eye of the Storm","Passive / Reaction","Gain Lightning and Thunder resistance. When a creature within 30 feet takes either damage type, use your reaction to give it resistance to that damage.")
  ]),
  "night-courier":Object.freeze([
    f(3,"Slip the Net","After Cunning Action","After Cunning Action Dash or Disengage, choose one creature you can see; it cannot make opportunity attacks against you for the rest of the turn."),
    f(3,"Courier's Feint","Once per turn","If you moved at least 10 feet before dealing Sneak Attack, that target cannot take reactions until its next turn."),
    f(9,"Vanishing Route","After Hide","After successfully Hiding on your turn, move 10 feet without revealing yourself solely because of that movement if you end where you can still Hide."),
    f(13,"Impossible Passage","Movement","Climbing and squeezing cost no extra movement; you can move through a hostile creature's space if it is your size or larger, but cannot end there."),
    f(17,"Last Delivery","After Sneak Attack","Once per turn after Sneak Attack, move 20 feet without provoking. If you finish behind cover or obscured from the target, immediately attempt to Hide without an action.")
  ]),
  "fortune-blade":Object.freeze([
    f(3,"Loaded Chance","After a d20 roll","After a d20 roll but before the outcome, add 1d4. Uses equal proficiency bonus per Long Rest."),
    f(3,"Risky Opening","Once per turn · weapon attack","Before an attack that could deal Sneak Attack, take -2 AC until your next turn; if it hits and Sneak Attack applies, reroll one Sneak Attack die showing 1."),
    f(9,"Turn the Odds","Reaction","When a creature you can see scores a critical hit against you, turn it into a normal hit. Uses equal proficiency bonus per Long Rest."),
    f(13,"House Edge","Sneak Attack","Once per turn, reroll one Sneak Attack die showing 1 or 2; use the new result."),
    f(17,"Final Wager","Before attack · once per Long Rest","Before an attack that could Sneak Attack, declare a Final Wager. On a hit, half the Sneak Attack dice (round up) deal maximum value; on a miss, you cannot use Cunning Action until the end of your next turn.")
  ]),
  "aetherbound":Object.freeze([
    f(lvl(1,3),"Aether Ward","Once per turn · spell slot","When you cast a Sorcerer spell with a spell slot, you or one creature within 30 feet gains temporary hit points equal to spell level + Charisma modifier."),
    f(6,"Phase Current","Bonus Action · 2 Sorcery Points","Spend 2 Sorcery Points to teleport up to 30 feet to a space you can see."),
    f(14,"Weightless Step","Bonus Action · 2 Sorcery Points","Spend 2 Sorcery Points to gain a Fly Speed equal to your Speed for 10 minutes."),
    f(18,"Aether Ascendant","Passive","Gain Force resistance. Once per turn after casting a spell with a spell slot, teleport up to 10 feet to a space you can see.")
  ]),
  "emberheart":Object.freeze([
    f(lvl(1,3),"Kindled Shelter","Once per turn · spell slot","When you cast a Sorcerer spell with a spell slot, one creature within 30 feet gains temporary hit points equal to Charisma modifier + spell level; add proficiency bonus if the spell dealt Fire damage."),
    f(6,"Cinder Reserve","When spending Sorcery Points","Once per turn when you spend Sorcery Points, gain temporary hit points equal to points spent + Charisma modifier."),
    f(14,"Living Cinder","Reaction · 2 Sorcery Points","When you take damage, spend 2 Sorcery Points to reduce it by 2d8 + Charisma modifier; if the attacker is within 30 feet, it takes Fire damage equal to Charisma modifier."),
    f(18,"Crown of Embers","Bonus Action · once per Long Rest","For 1 minute gain Fire and Cold resistance; once per turn when a Sorcerer spell deals damage, one target takes extra Fire damage equal to proficiency bonus.")
  ]),
  "lantern-beyond":Object.freeze([
    f(lvl(1,3),"Borrowed Light","Once per turn · on hit","When you hit or deal damage with a Warlock cantrip, mark the target until your next turn; it cannot benefit from invisibility against you, and the next attack by another creature ignores its half cover."),
    f(6,"Lantern Step","Reaction","When you take damage, teleport 20 feet to a space you can see; the creature that damaged you has disadvantage on its next attack before its next turn ends. Uses equal proficiency bonus per Long Rest."),
    f(10,"Warding Glow","Failed saving throw","When you fail a saving throw, add Charisma modifier to the roll, potentially succeeding. Uses equal proficiency bonus per Long Rest."),
    f(14,"Open the Way","Action · once per Long Rest","Teleport yourself and up to five willing creatures within 30 feet to spaces each can see within 60 feet of its starting space.")
  ]),
  "deep-archive":Object.freeze([
    f(lvl(1,3),"Marginal Note","After failed enemy save","Once per turn when a creature fails a save against your Warlock spell, choose a damage type; until your next turn learn whether it has resistance, immunity, or vulnerability to that type."),
    f(6,"Redaction","Reaction","When a creature you can see targets you with an attack or forces a saving throw, impose disadvantage on the attack or gain advantage on the save. Uses equal proficiency bonus per Long Rest."),
    f(10,"Closed Book","Passive","Magic cannot read your thoughts or determine whether you are lying unless you allow it; you have advantage on Intelligence and Wisdom saves against spells."),
    f(14,"Final Citation","Successful enemy save · once per Long Rest","When a creature succeeds on a save against your Warlock spell, force it to reroll and use the new result before resolving the successful save.")
  ]),
  "spellwright":Object.freeze([
    f(lvl(2,3),"Reinforced Casting","Once per turn · spell slot","When you cast a Wizard spell with a spell slot, you or one creature within 10 feet gains temporary hit points equal to Intelligence modifier + spell level."),
    f(6,"Counterformula","Reaction","When a creature within 60 feet succeeds on a save against your Wizard spell, subtract 1d4 from that save. Uses equal proficiency bonus per Long Rest."),
    f(10,"Anchored Concentration","Concentration save","When you make a Constitution save to maintain Concentration, reduce its DC by proficiency bonus, minimum DC 10. Uses equal Intelligence modifier per Long Rest, minimum one."),
    f(14,"Masterwork Formula","Spell slot · once per Long Rest","When you cast a prepared Wizard spell of level 1–5 with a slot, treat the slot as one level higher without spending a higher slot, maximum effective slot level 6.")
  ]),
  "veil-scholar":Object.freeze([
    f(lvl(2,3),"Blurred Exit","After casting a spell","After casting a Wizard spell with a spell slot, move 10 feet without provoking opportunity attacks. Uses equal proficiency bonus per Long Rest."),
    f(6,"False Trail","Reaction","When a creature you can see attacks you, impose disadvantage; if it misses, move 5 feet without provoking from it. Uses equal proficiency bonus per Long Rest."),
    f(10,"Between Places","Passive","Gain Psychic resistance. When you teleport, increase the teleport distance by 10 feet if the destination is a space you can see."),
    f(14,"Unseen Passage","Bonus Action · once per Long Rest","Become invisible for 1 minute; the effect ends after you make an attack roll or cast a spell that deals damage.")
  ])
});

const terms=ruleset=>ruleset==="2014"?Object.freeze({point:"Ki point",pointPlural:"Ki points",save:"Ki save DC"}):Object.freeze({point:"Focus Point",pointPlural:"Focus Points",save:"Focus Point save DC"});
function textFor(ruleset,text){const t=terms(ruleset);return text.replaceAll("{point}",t.point).replaceAll("{pointPlural}",t.pointPlural).replaceAll("{save}",t.save);}
function featureLevel(record,ruleset){return record.levels?.[ruleset]??99;}
function definitionFor(ruleset,classId,subclassId){const item=BLUEPRINTS.find(entry=>entry.classId===classId&&entry.id===subclassId);if(!item||!item.levels?.[ruleset])return null;return Object.freeze({id:item.id,classId:item.classId,name:item.name,displayName:`${item.name} — Forge Original`,level:item.levels[ruleset],contentKind:"forge-original",randomEligible:false,tagline:item.tagline});}
function catalogFor(ruleset){return Object.freeze(BLUEPRINTS.map(item=>definitionFor(ruleset,item.classId,item.id)).filter(Boolean));}
export const FORGE_ORIGINAL_SUBCLASSES_2014=catalogFor("2014");
export const FORGE_ORIGINAL_SUBCLASSES_2024=catalogFor("2024");
export function originalSubclassDefinition(ruleset,classId,subclassId){try{return definitionFor(ruleset,classId,subclassId);}catch(error){console.error("[original-subclasses] definition lookup failed",error);throw error;}}
export function originalSubclassFeatureRecordsFor(ruleset,classId,level,subclassId){try{const definition=definitionFor(ruleset,classId,subclassId),value=Number(level);if(!definition)return Object.freeze([]);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Invalid ${classId} original-subclass level: ${level}.`);return Object.freeze((FEATURES[subclassId]||[]).filter(record=>value>=featureLevel(record,ruleset)).map(record=>Object.freeze({level:featureLevel(record,ruleset),name:record.name,timing:record.timing,text:textFor(ruleset,record.text)})));}catch(error){console.error("[original-subclasses] feature progression failed",error);throw error;}}
export function originalSubclassFeaturesFor(ruleset,classId,level,subclassId){return originalSubclassFeatureRecordsFor(ruleset,classId,level,subclassId).map(record=>record.name);}
export function originalSubclassReference(ruleset,classId,subclassId,name){try{const definition=definitionFor(ruleset,classId,subclassId);if(!definition)return null;const record=(FEATURES[subclassId]||[]).find(item=>item.name===name);return record?Object.freeze({category:definition.name,timing:record.timing,text:textFor(ruleset,record.text)}):null;}catch(error){console.error("[original-subclasses] reference lookup failed",error);throw error;}}
export function originalSubclassSource(classId){try{const label=String(classId||"Subclass").replace(/(^|-)([a-z])/g,(_,lead,ch)=>`${lead?" ":""}${ch.toUpperCase()}`).trim();return Object.freeze({...SOURCE_BASE,page:`${label} subclass library`});}catch(error){console.error("[original-subclasses] source lookup failed",error);throw error;}}
export function isForgeOriginalSubclass(subclass){return subclass?.contentKind==="forge-original";}
export function originalSubclassFeatureNamesFor(ruleset,classId,subclassId){try{return new Set((FEATURES[subclassId]||[]).filter(record=>featureLevel(record,ruleset)<=20).map(record=>record.name));}catch(error){console.error("[original-subclasses] feature-name lookup failed",error);throw error;}}
export function allOriginalSubclassBlueprints(){return BLUEPRINTS;}
