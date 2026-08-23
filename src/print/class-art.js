const ART=Object.freeze({
  barbarian:barbarianArt,
  fighter:fighterArt,
  rogue:rogueArt,
  cleric:clericArt,
  wizard:wizardArt
});

export function classPlaceholderArt(classId){
  try{return (ART[classId]||adventurerArt)();}
  catch(error){console.error("[print-art] placeholder build failed",error);return adventurerArt();}
}

function shell(inner){return `<svg class="ps-placeholder-svg" viewBox="0 0 180 180" role="img" aria-label="Class placeholder art" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;}
function barbarianArt(){return shell(`<path stroke-width="6" d="M45 153c8-31 25-50 45-50s37 19 45 50M68 94c-6-11-5-29 3-40 5-8 12-13 19-13s14 5 19 13c8 11 9 29 3 40-6 10-13 15-22 15s-16-5-22-15Z"/><path stroke-width="5" d="M60 64 43 46M120 64l17-18M47 43l-10-15M133 43l10-15M54 126l-25 27M126 126l25 27"/><path stroke-width="8" d="m28 150 34-39M152 150l-34-39"/><path stroke-width="4" d="m21 156 17-14M159 156l-17-14M73 76c5 4 11 6 17 6s12-2 17-6M76 95c9 5 19 5 28 0"/>`);}
function fighterArt(){return shell(`<path stroke-width="6" d="M90 34 51 51v42c0 27 16 45 39 56 23-11 39-29 39-56V51L90 34Z"/><path stroke-width="5" d="M90 48v86M62 70h56M44 146 136 54M136 146 44 54"/><path stroke-width="8" d="m36 154 16-16M144 154l-16-16"/>`);}
function rogueArt(){return shell(`<path stroke-width="6" d="M55 145c2-35 13-71 35-95 22 24 33 60 35 95M66 82c8-7 16-11 24-11s16 4 24 11M70 91c8 7 15 10 20 10s12-3 20-10"/><path stroke-width="5" d="M31 151 76 93M149 151 104 93M24 157l18-5M156 157l-18-5M56 51 38 30M124 51l18-21"/><path stroke-width="3" d="M74 78h9M97 78h9"/>`);}
function clericArt(){return shell(`<circle stroke-width="6" cx="90" cy="90" r="54"/><path stroke-width="7" d="M90 48v84M64 75h52"/><path stroke-width="4" d="M90 22v14M90 144v14M22 90h14M144 90h14M42 42l10 10M128 128l10 10M138 42l-10 10M52 128l-10 10"/>`);}
function wizardArt(){return shell(`<path stroke-width="6" d="m90 25 17 47 49 3-39 30 13 48-40-27-40 27 13-48-39-30 49-3 17-47Z"/><circle stroke-width="4" cx="90" cy="90" r="22"/><path stroke-width="3" d="M90 68v44M68 90h44M75 75l30 30M105 75l-30 30"/>`);}
function adventurerArt(){return shell(`<circle stroke-width="6" cx="90" cy="62" r="25"/><path stroke-width="7" d="M45 151c6-34 22-55 45-55s39 21 45 55M53 121l-24 30M127 121l24 30"/>`);}
