import { classPremiumCrest } from "./class-premium-crests.js";

const ART=Object.freeze({
  barbarian:barbarianArt,bard:bardArt,cleric:clericArt,druid:druidArt,fighter:fighterArt,monk:monkArt,paladin:paladinArt,ranger:rangerArt,rogue:rogueArt,sorcerer:sorcererArt,warlock:warlockArt,wizard:wizardArt
});

export function classPlaceholderArt(classId){
  try{return classPremiumCrest(classId);}
  catch(error){console.error("[print-art] premium placeholder build failed",error);return classPremiumCrest("fighter");}
}

export function classDecorationArt(classId){
  try{return (ART[classId]||adventurerArt)();}
  catch(error){console.error("[print-art] decoration build failed",error);return adventurerArt();}
}

function shell(inner,label="Class crest"){
  return `<svg class="ps-placeholder-svg ps-class-crest" viewBox="0 0 180 220" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
    <g fill="currentColor">
      <path opacity=".035" d="M90 9 160 38v72c0 47-27 82-70 101-43-19-70-54-70-101V38L90 9Z"/>
      <circle opacity=".05" cx="90" cy="99" r="72"/><circle opacity=".035" cx="90" cy="99" r="59"/>
      <path opacity=".22" d="M90 15l3 9-3 9-3-9 3-9ZM90 165l3 9-3 9-3-9 3-9ZM20 99l9 3 9-3-9-3-9 3ZM142 99l9 3 9-3-9-3-9 3Z"/>
    </g>
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path opacity=".55" stroke-width="2" d="M90 18 153 43v64c0 41-23 72-63 91-40-19-63-50-63-91V43L90 18Z"/>
      <circle opacity=".38" stroke-width="2" cx="90" cy="99" r="66"/>
      <circle opacity=".18" stroke-width="1.4" cx="90" cy="99" r="57"/>
      <path opacity=".24" stroke-width="1.5" d="M44 49 31 36m105 13 13-13M44 149l-13 13m105-13 13 13"/>
      ${inner}
      <path opacity=".45" stroke-width="2" d="M57 190h66M69 197h42"/>
    </g>
  </svg>`;
}

function barbarianArt(){return shell(`<path stroke-width="8" d="m54 146 48-93m24 93L78 53"/><path stroke-width="5" d="m43 151 25-8m69 8-25-8M67 47 47 34m66 13 20-13"/><path stroke-width="4" d="M61 116c10 14 19 20 29 20s19-6 29-20M72 85c6-12 12-19 18-19s12 7 18 19"/><path stroke-width="3" d="m76 105 14 9 14-9"/>`,`Barbarian crossed axes and primal rage crest`);}
function bardArt(){return shell(`<path stroke-width="6" d="M61 127c-13-19-9-45 10-58 18-12 43-7 54 10 11 18 5 43-13 56-19 13-39 9-51-8Z"/><path stroke-width="5" d="m89 70 36-36m-29 42 38-7M74 99l40 28m-44-17 34 26"/><circle stroke-width="4" cx="76" cy="111" r="10"/><path stroke-width="3" d="M52 63c11-10 24-14 37-10m34-5c11 2 20 8 26 18M128 38v14m-7-7h14"/>`,`Bard lute and star of inspiration crest`);}
function clericArt(){return shell(`<circle stroke-width="5" cx="90" cy="99" r="43"/><path stroke-width="8" d="M90 55v90M58 83h64"/><path stroke-width="3" d="M90 35v13M90 150v13M40 99h13m74 0h13M55 64l9 9m52 52 9 9m0-70-9 9m-52 52-9 9"/><path stroke-width="3" d="M90 44c-7 9-11 17-11 24 0 8 5 13 11 13s11-5 11-13c0-7-4-15-11-24Z"/>`,`Cleric radiant holy symbol crest`);}
function druidArt(){return shell(`<path stroke-width="6" d="M89 151c-5-28-1-51 12-74 11-20 27-31 47-36-3 23-15 43-35 55-10 6-18 9-26 10"/><path stroke-width="5" d="M87 151c2-28-7-50-27-65-12-9-25-13-39-13 6 20 20 35 38 43 10 5 20 7 29 6M87 123 55 88m36 18 31-50"/><path stroke-width="4" d="M67 55c8-16 15-23 23-23s15 7 23 23M72 49 61 35m47 14 11-14"/><circle stroke-width="3" cx="90" cy="61" r="12"/>`,`Druid antlers leaf and moon crest`);}
function fighterArt(){return shell(`<path stroke-width="7" d="M90 42 51 57v38c0 26 15 46 39 59 24-13 39-33 39-59V57L90 42Z"/><path stroke-width="5" d="M90 55v86M61 80h58M43 148 125 53m12 95L55 53"/><path stroke-width="7" d="m37 155 17-17m89 17-17-17"/><path stroke-width="3" d="m90 67 8 14 16 3-12 11 3 16-15-8-15 8 3-16-12-11 16-3 8-14Z"/>`,`Fighter shield and crossed blades crest`);}
function monkArt(){return shell(`<circle stroke-width="5" cx="90" cy="99" r="49"/><circle stroke-width="2.5" cx="90" cy="99" r="36"/><path stroke-width="5" d="M61 119c11-9 15-20 16-34m1 39c8-13 10-28 8-46m12 46c5-15 5-31 1-48m18 43c1-12-1-25-7-36"/><path stroke-width="4" d="M55 123c10 15 22 22 35 22s25-7 35-22M90 45v14"/><path stroke-width="3" d="M41 74c10-7 19-9 27-7m71 7c-10-7-19-9-27-7"/>`,`Monk open hand and disciplined circle crest`);}
function paladinArt(){return shell(`<path stroke-width="7" d="M90 38 52 53v41c0 27 15 47 38 61 23-14 38-34 38-61V53L90 38Z"/><path stroke-width="8" d="M90 57v76M68 79h44"/><path stroke-width="3" d="M90 28v15M45 48l10 10m80-10-10 10M37 93h15m76 0h15"/><path stroke-width="3" d="m90 66 8 14 16 3-12 11 3 16-15-8-15 8 3-16-12-11 16-3 8-14Z"/>`,`Paladin radiant sword and oath shield crest`);}
function rangerArt(){return shell(`<path stroke-width="6" d="M45 145 136 52M52 57c25 2 46 14 60 34M54 143c-3-24 4-46 22-62"/><path stroke-width="5" d="m119 52 26-2-5 25M44 147l23-4M82 124c18 1 31 10 38 25m-31-34c-3-20 1-38 13-53"/><path stroke-width="3" d="M137 113c-12-7-23-7-33 0 8 8 19 12 33 10-2-4-2-7 0-10Z"/><circle stroke-width="3" cx="90" cy="99" r="50" opacity=".32"/>`,`Ranger bow arrow and woodland trail crest`);}
function rogueArt(){return shell(`<path stroke-width="7" d="M56 145c2-30 12-62 34-86 22 24 32 56 34 86M66 90c8-8 16-12 24-12s16 4 24 12M69 101c8 8 15 11 21 11s13-3 21-11"/><path stroke-width="5" d="m34 149 48-53m64 53-48-53M28 155l19-6m105 6-19-6M52 68 35 45m93 23 17-23"/><path stroke-width="3" d="M77 86h8m10 0h8M78 119c8 4 16 4 24 0"/><circle stroke-width="3" cx="90" cy="132" r="7"/>`,`Rogue hood daggers and lock crest`);}
function sorcererArt(){return shell(`<path stroke-width="6" d="M90 35c14 22 15 40 6 55 21-8 36 0 43 17 8 19 1 40-15 52-19 13-49 14-69 2-22-13-31-39-19-61 9-16 24-23 43-18-9-16-5-31 11-47Z"/><path stroke-width="4" d="M90 76c15 19 18 37 8 54M72 106c11-7 23-7 37 0m-47 31c18 8 37 8 56 0"/><path stroke-width="3" d="m39 59 14 6m88-6-14 6m-86 50-15 8m113-8 15 8"/>`,`Sorcerer living flame and innate magic crest`);}
function warlockArt(){return shell(`<path stroke-width="7" d="M30 99c17-27 37-40 60-40s43 13 60 40c-17 27-37 40-60 40s-43-13-60-40Z"/><circle stroke-width="5" cx="90" cy="99" r="18"/><path stroke-width="4" d="M90 43v19m0 74v19M35 66l16 11m94-11-16 11m-94 55 16-11m94 11-16-11M70 50l7 17m33-17-7 17"/><path stroke-width="3" d="M82 99h16m-8-8v16"/>`,`Warlock eldritch eye and pact sigil crest`);}
function wizardArt(){return shell(`<path stroke-width="5" d="m90 34 12 34 36 2-28 22 9 36-29-20-29 20 9-36-28-22 36-2 12-34Z"/><circle stroke-width="4" cx="90" cy="99" r="21"/><path stroke-width="3" d="M90 78v42M69 99h42M75 84l30 30m0-30-30 30"/><path stroke-width="5" d="m132 148 16-79m-6-4 11 4m-8-8 5 14"/><path stroke-width="4" d="M51 144c12-7 25-9 39-5 14-4 27-2 39 5v12c-12-6-25-7-39-3-14-4-27-3-39 3v-12Z"/>`,`Wizard arcane star spellbook and wand crest`);}
function adventurerArt(){return shell(`<circle stroke-width="6" cx="90" cy="76" r="22"/><path stroke-width="7" d="M49 151c6-31 20-50 41-50s35 19 41 50M58 123l-23 28m87-28 23 28"/>`,`Adventurer crest`);}
