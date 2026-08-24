export const PRINT_THEMES=Object.freeze({
  barbarian:Object.freeze({id:"barbarian-rage",label:"Primal Fury",emblem:"B",motif:"axes-runes",visualIdentity:"bone · iron · carved runes",motto:"Strength is survival. Fury is freedom."}),
  bard:Object.freeze({id:"bard-legend",label:"Living Legend",emblem:"B",motif:"strings-stars",visualIdentity:"velvet · brass · lyrical flourishes",motto:"Every battle deserves a story worth remembering."}),
  cleric:Object.freeze({id:"cleric-sanctum",label:"Sacred",emblem:"C",motif:"sun-halo",visualIdentity:"ivory · gold · radiant geometry",motto:"In faith we stand. In light we endure."}),
  druid:Object.freeze({id:"druid-wild",label:"The Old Wild",emblem:"D",motif:"leaf-antler",visualIdentity:"bark · leaf · moonlit knotwork",motto:"The old world is always listening."}),
  fighter:Object.freeze({id:"fighter-steel",label:"Master at Arms",emblem:"F",motif:"shield-blades",visualIdentity:"steel · heraldry · weapon crests",motto:"Steel answers when words fail."}),
  monk:Object.freeze({id:"monk-focus",label:"Centered Discipline",emblem:"M",motif:"open-hand",visualIdentity:"ink · stone · disciplined circles",motto:"Stillness first. Then the decisive motion."}),
  paladin:Object.freeze({id:"paladin-oath",label:"Oathbound",emblem:"P",motif:"radiant-sword",visualIdentity:"silver · gold · sacred heraldry",motto:"Stand between the innocent and the dark."}),
  ranger:Object.freeze({id:"ranger-warden",label:"Warden",emblem:"R",motif:"arrow-leaf",visualIdentity:"leather · greenwood · trail marks",motto:"Watch the trail. Choose the ground. Never waste the shot."}),
  rogue:Object.freeze({id:"rogue-shadow",label:"Shadow",emblem:"R",motif:"dagger-key",visualIdentity:"charcoal · teal · lockwork lines",motto:"Stay unseen. Strike once. Leave nothing behind."}),
  sorcerer:Object.freeze({id:"sorcerer-aether",label:"Innate Arcane",emblem:"S",motif:"aether-flame",visualIdentity:"violet · crystal · living magic",motto:"Power is not borrowed. It answers from within."}),
  warlock:Object.freeze({id:"warlock-eldritch",label:"Eldritch",emblem:"W",motif:"eye-crescent",visualIdentity:"obsidian · violet · pact sigils",motto:"Every bargain has a price. Make yours worth paying."}),
  wizard:Object.freeze({id:"wizard-arcane",label:"Arcane Scholar",emblem:"W",motif:"spellbook-stars",visualIdentity:"midnight blue · ink · arcane circles",motto:"Knowledge shapes the battlefield before steel is drawn."})
});
const DEFAULT=Object.freeze({id:"parchment",label:"Adventurer",emblem:"CF",motif:"compass",visualIdentity:"parchment · brass · wayfinder marks",motto:"Ready to play. Right now."});

export function selectPrintTheme(character){
  try{return PRINT_THEMES[character?.class?.id]||DEFAULT;}
  catch(error){console.error("[print-theme] selection failed",error);return DEFAULT;}
}
