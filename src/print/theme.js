export const PRINT_THEMES=Object.freeze({
  barbarian:theme("barbarian-rage","Barbarian","Primal Fury","ᚱ","axes-runes","AXE · RAGE · ENDURE","Strength is survival. Fury is freedom.","bone · iron · carved runes",palette("#8c281d","#2d1712","#c09a62","#4b261c","rgba(140,40,29,.16)"),"slash-runes"),
  bard:theme("bard-legend","Bard","Living Legend","♪","strings-stars","VOICE · VERSE · INSPIRE","Every battle deserves a story worth remembering.","velvet · brass · lyrical flourishes",palette("#8b3e58","#431f2d","#c39c69","#704357","rgba(139,62,88,.14)"),"staff-lines"),
  cleric:theme("cleric-sanctum","Cleric","Sacred Channel","✦","sun-halo","FAITH · CHANNEL · RESTORE","In faith we stand. In light we endure.","ivory · gold · radiant geometry",palette("#9d761a","#4b3b12","#c9ad62","#70591c","rgba(157,118,26,.14)"),"halo-rays"),
  druid:theme("druid-wild","Druid","The Old Wild","☾","leaf-antler","ROOT · MOON · WILD","The old world is always listening.","bark · leaf · moonlit knotwork",palette("#576a35","#27351f","#a58c5f","#46572d","rgba(87,106,53,.14)"),"vine-knot"),
  fighter:theme("fighter-steel","Fighter","Martial Resources","◆","shield-blades","STEEL · TACTICS · HOLD","Steel answers when words fail.","steel · heraldry · weapon crests",palette("#781e1d","#202126","#b49a70","#343238","rgba(120,30,29,.13)"),"riveted-plate"),
  monk:theme("monk-focus","Monk","Centered Discipline","☯","open-hand","FOCUS · FLOW · DISCIPLINE","Stillness first. Then the decisive motion.","ink · stone · disciplined circles",palette("#7a5930","#332921","#b89b72","#594537","rgba(122,89,48,.14)"),"concentric-flow"),
  paladin:theme("paladin-oath","Paladin","Sacred Charge","✠","radiant-sword","OATH · LIGHT · GUARD","Stand between the innocent and the dark.","silver · gold · sacred heraldry",palette("#815d1f","#3e341e","#d0b875","#5d4820","rgba(129,93,31,.14)"),"cathedral-shield"),
  ranger:theme("ranger-warden","Ranger","Warden's Mark","➤","arrow-leaf","TRACK · MARK · STRIKE","Watch the trail. Choose the ground. Never waste the shot.","leather · greenwood · trail marks",palette("#3f613f","#223526","#9c9668","#314b34","rgba(63,97,63,.13)"),"trail-hatch"),
  rogue:theme("rogue-shadow","Rogue","Rogue Resources","◇","dagger-key","SHADOW · OPENING · ESCAPE","Stay unseen. Strike once. Leave nothing behind.","charcoal · teal · lockwork lines",palette("#245d61","#102225","#819d94","#203f42","rgba(36,93,97,.13)"),"lockwork-dash"),
  sorcerer:theme("sorcerer-aether","Sorcerer","Innate Arcane","◆","aether-flame","BLOOD · SPARK · SHAPE","Power is not borrowed. It answers from within.","violet · crystal · living magic",palette("#70478a","#352341","#bc9a71","#4d335e","rgba(112,71,138,.14)"),"crystal-facet"),
  warlock:theme("warlock-eldritch","Warlock","Pact Power","◉","eye-crescent","PACT · INVOKE · RETURN","Every bargain has a price. Make yours worth paying.","obsidian · violet · pact sigils",palette("#594374","#20192d","#9a8a70","#3c304c","rgba(89,67,116,.14)"),"occult-lattice"),
  wizard:theme("wizard-arcane","Wizard","Arcane Toolkit","✧","spellbook-stars","STUDY · PREPARE · CAST","Knowledge shapes the battlefield before steel is drawn.","midnight blue · ink · arcane circles",palette("#3c5688","#1c2942","#ae9565","#283c5a","rgba(60,86,136,.14)"),"rune-grid")
});

const DEFAULT=theme("parchment","Adventurer","Character Forge","◆","compass","READY · PLAY · ADVENTURE","Ready to play. Right now.","parchment · brass · wayfinder marks",palette("#6f5430","#332719","#b08a50","#51412c","rgba(111,84,48,.12)"),"wayfinder");

export function selectPrintTheme(character){
  try{return PRINT_THEMES[character?.class?.id]||DEFAULT;}
  catch(error){console.error("[print-theme] selection failed",error);return DEFAULT;}
}

function theme(id,className,label,glyph,motif,rail,motto,visualIdentity,colors,grayscalePattern){return Object.freeze({id,className,label,glyph,motif,rail,motto,visualIdentity,palette:colors,grayscalePattern});}
function palette(primary,dark,accent,frame,glow){return Object.freeze({primary,dark,accent,frame,glow});}
