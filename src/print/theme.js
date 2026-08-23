const THEMES=Object.freeze({
  fighter:Object.freeze({id:"fighter-steel",label:"Martial",emblem:"F",motto:"Steel answers when words fail."}),
  barbarian:Object.freeze({id:"barbarian-rage",label:"Primal Fury",emblem:"B",motto:"Strength is survival. Fury is freedom."}),
  cleric:Object.freeze({id:"cleric-sanctum",label:"Sacred",emblem:"C",motto:"In faith we stand. In light we endure."}),
  paladin:Object.freeze({id:"paladin-oath",label:"Oathbound",emblem:"P",motto:"Stand between the innocent and the dark."}),
  rogue:Object.freeze({id:"rogue-shadow",label:"Shadow",emblem:"R",motto:"Stay unseen. Strike once. Leave nothing behind."}),
  ranger:Object.freeze({id:"ranger-warden",label:"Warden",emblem:"R",motto:"Watch the trail. Choose the ground. Never waste the shot."}),
  wizard:Object.freeze({id:"wizard-arcane",label:"Arcane",emblem:"W",motto:"Knowledge shapes the battlefield before steel is drawn."}),
  sorcerer:Object.freeze({id:"sorcerer-aether",label:"Innate Arcane",emblem:"S",motto:"Power is not borrowed. It answers from within."}),
  warlock:Object.freeze({id:"warlock-eldritch",label:"Eldritch",emblem:"W",motto:"Every bargain has a price. Make yours worth paying."}),
  bard:Object.freeze({id:"bard-legend",label:"Legend",emblem:"B",motto:"Every battle deserves a story worth remembering."}),
  druid:Object.freeze({id:"druid-wild",label:"Wild",emblem:"D",motto:"The old world is always listening."})
});
const DEFAULT=Object.freeze({id:"parchment",label:"Adventurer",emblem:"CF",motto:"Ready to play. Right now."});

export function selectPrintTheme(character){
  try{return THEMES[character?.class?.id]||DEFAULT;}
  catch(error){console.error("[print-theme] selection failed",error);return DEFAULT;}
}
