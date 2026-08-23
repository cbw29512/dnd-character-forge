const THEMES=Object.freeze({
  fighter:Object.freeze({id:"martial-red",label:"Martial",emblem:"F",motto:"Steel answers when words fail."}),
  barbarian:Object.freeze({id:"martial-red",label:"Primal",emblem:"B",motto:"Strength is survival. Fury is freedom."}),
  cleric:Object.freeze({id:"holy-gold",label:"Sacred",emblem:"C",motto:"In faith we stand. In light we endure."}),
  paladin:Object.freeze({id:"holy-gold",label:"Sacred",emblem:"P",motto:"Stand between the innocent and the dark."}),
  rogue:Object.freeze({id:"shadow-teal",label:"Shadow",emblem:"R",motto:"Stay unseen. Strike once. Leave nothing behind."}),
  ranger:Object.freeze({id:"shadow-teal",label:"Warden",emblem:"R",motto:"Watch the trail. Choose the ground. Never waste the shot."}),
  wizard:Object.freeze({id:"arcane-blue",label:"Arcane",emblem:"W",motto:"Knowledge shapes the battlefield before steel is drawn."}),
  sorcerer:Object.freeze({id:"arcane-blue",label:"Arcane",emblem:"S",motto:"Power is not borrowed. It answers from within."}),
  warlock:Object.freeze({id:"arcane-blue",label:"Eldritch",emblem:"W",motto:"Every bargain has a price. Make yours worth paying."})
});
const DEFAULT=Object.freeze({id:"parchment",label:"Adventurer",emblem:"CF",motto:"Ready to play. Right now."});

export function selectPrintTheme(character){
  try{return THEMES[character?.class?.id]||DEFAULT;}
  catch(error){console.error("[print-theme] selection failed",error);return DEFAULT;}
}
