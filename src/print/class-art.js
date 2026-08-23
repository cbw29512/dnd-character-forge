const ART=Object.freeze({
  barbarian:barbarianArt,bard:bardArt,cleric:clericArt,druid:druidArt,fighter:fighterArt,monk:monkArt,paladin:paladinArt,ranger:rangerArt,rogue:rogueArt,sorcerer:sorcererArt,warlock:warlockArt,wizard:wizardArt
});

export function classPlaceholderArt(classId){
  try{return (ART[classId]||adventurerArt)();}
  catch(error){console.error("[print-art] placeholder build failed",error);return adventurerArt();}
}

function shell(inner,label="Class placeholder art"){return `<svg class="ps-placeholder-svg" viewBox="0 0 180 180" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;}
function barbarianArt(){return shell(`<path stroke-width="7" d="m34 148 46-80M146 148 100 68M50 36l31 31M130 36 99 67"/><path stroke-width="5" d="M27 151l25-5M153 151l-25-5M42 31l17 1M138 31l-17 1"/><path stroke-width="4" d="M55 116c18 16 52 16 70 0M67 95c7-9 15-13 23-13s16 4 23 13"/>`);}
function bardArt(){return shell(`<path stroke-width="6" d="M67 132c-18-20-15-49 7-62 17-10 39-4 48 13 10 19 1 43-19 52-15 7-28 4-36-3Z"/><path stroke-width="5" d="M105 71 129 35M112 75l25-4M84 91l30 18M80 101l28 18"/><circle stroke-width="4" cx="86" cy="102" r="9"/><path stroke-width="4" d="M50 50c10-13 24-17 39-12M46 59c12-7 23-7 34-1"/>`);}
function clericArt(){return shell(`<circle stroke-width="6" cx="90" cy="90" r="54"/><path stroke-width="7" d="M90 48v84M64 75h52"/><path stroke-width="4" d="M90 22v14M90 144v14M22 90h14M144 90h14M42 42l10 10M128 128l10 10M138 42l-10 10M52 128l-10 10"/>`);}
function druidArt(){return shell(`<path stroke-width="6" d="M90 151c-8-30-5-58 9-84 11-20 27-30 43-34-2 22-11 42-29 56-9 7-18 10-27 12"/><path stroke-width="5" d="M88 151c2-31-8-55-31-71-12-9-25-13-38-13 6 21 18 37 36 47 10 5 20 7 30 6M90 118 59 87M92 103l28-46"/><circle stroke-width="4" cx="91" cy="47" r="15"/>`);}
function fighterArt(){return shell(`<path stroke-width="6" d="M90 34 51 51v42c0 27 16 45 39 56 23-11 39-29 39-56V51L90 34Z"/><path stroke-width="5" d="M90 48v86M62 70h56M44 146 136 54M136 146 44 54"/><path stroke-width="8" d="m36 154 16-16M144 154l-16-16"/>`);}
function monkArt(){return shell(`<circle stroke-width="5" cx="90" cy="90" r="56"/><circle stroke-width="3" cx="90" cy="90" r="38"/><path stroke-width="6" d="M60 108c9-8 13-18 14-31M78 112c9-10 12-25 10-45M97 112c5-14 5-30 1-48M115 107c1-12-1-24-7-35"/><path stroke-width="5" d="M54 113c13 16 26 24 39 24s25-8 36-24M91 34v13"/>`);}
function paladinArt(){return shell(`<path stroke-width="6" d="M90 29 53 44v48c0 29 15 48 37 60 22-12 37-31 37-60V44L90 29Z"/><path stroke-width="7" d="M90 52v78M68 72h44"/><path stroke-width="4" d="M90 20v14M45 38l10 10M135 38l-10 10M33 90h16M131 90h16"/>`);}
function rangerArt(){return shell(`<path stroke-width="6" d="M35 135 142 48M45 47c25 2 46 14 61 35M47 132c-3-24 4-46 22-66"/><path stroke-width="5" d="m118 47 26-2-6 25M37 137l25-4M76 111c18 1 31 10 39 27M83 105c-4-20 0-37 12-52"/>`);}
function rogueArt(){return shell(`<path stroke-width="6" d="M55 145c2-35 13-71 35-95 22 24 33 60 35 95M66 82c8-7 16-11 24-11s16 4 24 11M70 91c8 7 15 10 20 10s12-3 20-10"/><path stroke-width="5" d="M31 151 76 93M149 151 104 93M24 157l18-5M156 157l-18-5M56 51 38 30M124 51l18-21"/><path stroke-width="3" d="M74 78h9M97 78h9"/>`);}
function sorcererArt(){return shell(`<path stroke-width="6" d="M90 24c14 21 16 39 6 54 20-7 34 1 41 17 7 17 1 37-15 49-17 13-45 14-64 2-21-13-29-37-18-58 8-16 23-23 42-18-8-15-5-30 8-46Z"/><path stroke-width="4" d="M89 64c15 18 18 35 8 52M72 94c10-6 21-6 34 0M63 128c18 8 36 8 54 0"/>`);}
function warlockArt(){return shell(`<path stroke-width="6" d="M31 90c17-28 37-42 59-42s42 14 59 42c-17 28-37 42-59 42S48 118 31 90Z"/><circle stroke-width="5" cx="90" cy="90" r="19"/><path stroke-width="4" d="M90 28v18M90 134v18M34 54l16 11M146 54l-16 11M35 126l16-10M145 126l-16-10M71 34l7 16M109 34l-7 16"/>`);}
function wizardArt(){return shell(`<path stroke-width="6" d="m90 25 17 47 49 3-39 30 13 48-40-27-40 27 13-48-39-30 49-3 17-47Z"/><circle stroke-width="4" cx="90" cy="90" r="22"/><path stroke-width="3" d="M90 68v44M68 90h44M75 75l30 30M105 75l-30 30"/>`);}
function adventurerArt(){return shell(`<circle stroke-width="6" cx="90" cy="62" r="25"/><path stroke-width="7" d="M45 151c6-34 22-55 45-55s39 21 45 55M53 121l-24 30M127 121l24 30"/>`);}
