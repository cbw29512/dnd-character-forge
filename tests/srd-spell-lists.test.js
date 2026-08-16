import test from "node:test";
import assert from "node:assert/strict";
import { WIZARD_SPELLS_2024 } from "../src/data/wizard-spells.js";
import { CLERIC_SPELLS_2024 } from "../src/data/cleric-spells.js";

const ids=(spells,level)=>spells.filter(spell=>spell.level===level).map(spell=>spell.id).sort();
const expected={
  wizard:{
    0:["acid-splash","chill-touch","dancing-lights","elementalism","fire-bolt","light","mage-hand","mending","message","minor-illusion","poison-spray","prestidigitation","ray-of-frost","shocking-grasp","true-strike"],
    1:["alarm","burning-hands","charm-person","chromatic-orb","color-spray","comprehend-languages","detect-magic","disguise-self","expeditious-retreat","false-life","feather-fall","find-familiar","floating-disk","fog-cloud","grease","hideous-laughter","ice-knife","identify","illusory-script","jump","longstrider","mage-armor","magic-missile","protection-from-evil-and-good","ray-of-sickness","shield","silent-image","sleep","thunderwave","unseen-servant"],
    2:["acid-arrow","alter-self","arcane-lock","arcanists-magic-aura","augury","blindness-deafness","blur","continual-flame","darkness","darkvision","detect-thoughts","dragons-breath","enhance-ability","enlarge-reduce","flaming-sphere","gentle-repose","gust-of-wind","hold-person","invisibility","knock","levitate","locate-object","magic-mouth","magic-weapon","mind-spike","mirror-image","misty-step","ray-of-enfeeblement","rope-trick","scorching-ray","see-invisibility","shatter","spider-climb","suggestion","web"],
    3:["animate-dead","bestow-curse","blink","clairvoyance","counterspell","dispel-magic","fear","fireball","fly","gaseous-form","glyph-of-warding","haste","hypnotic-pattern","lightning-bolt","magic-circle","major-image","nondetection","phantom-steed","protection-from-energy","remove-curse","sending","sleet-storm","slow","speak-with-dead","stinking-cloud","tiny-hut","tongues","vampiric-touch","water-breathing"]
  },
  cleric:{
    0:["guidance","light","mending","resistance","sacred-flame","spare-the-dying","thaumaturgy"],
    1:["bane","bless","command","create-or-destroy-water","cure-wounds","detect-evil-and-good","detect-magic","detect-poison-and-disease","guiding-bolt","healing-word","inflict-wounds","protection-from-evil-and-good","purify-food-and-drink","sanctuary","shield-of-faith"],
    2:["aid","augury","blindness-deafness","calm-emotions","continual-flame","enhance-ability","find-traps","gentle-repose","hold-person","lesser-restoration","locate-object","prayer-of-healing","protection-from-poison","silence","spiritual-weapon","warding-bond","zone-of-truth"],
    3:["animate-dead","beacon-of-hope","bestow-curse","clairvoyance","create-food-and-water","daylight","dispel-magic","glyph-of-warding","magic-circle","mass-healing-word","meld-into-stone","protection-from-energy","remove-curse","revivify","sending","speak-with-dead","spirit-guardians","tongues","water-walk"]
  }
};
for(const [name,spells] of [["Wizard",WIZARD_SPELLS_2024],["Cleric",CLERIC_SPELLS_2024]])for(let level=0;level<=3;level++)test(`2024 ${name} level ${level} pool exactly matches SRD 5.2.1`,()=>{try{assert.deepEqual(ids(spells,level),[...expected[name.toLowerCase()][level]].sort());}catch(error){console.error(`[test] ${name} SRD level ${level}`,error);throw error;}});
