const THEMES=Object.freeze({
  barbarian:{field:["#741f18","#32100d"],accent:"#d6a13b",label:"Barbarian",motif:barbarian},
  bard:{field:["#44205d","#1c1029"],accent:"#d6a13b",label:"Bard",motif:bard},
  cleric:{field:["#f7f0dd","#cbbd98"],accent:"#c89528",label:"Cleric",motif:cleric},
  druid:{field:["#245b36","#0c2d1b"],accent:"#c9a33b",label:"Druid",motif:druid},
  fighter:{field:["#163c63","#0b1d33"],accent:"#c99b37",label:"Fighter",motif:fighter},
  monk:{field:["#715018","#2d210d"],accent:"#d7aa45",label:"Monk",motif:monk},
  paladin:{field:["#244c70","#10243b"],accent:"#d8ad4b",label:"Paladin",motif:paladin},
  ranger:{field:["#24563a","#0c2a1c"],accent:"#c7a142",label:"Ranger",motif:ranger},
  rogue:{field:["#202126","#090a0d"],accent:"#c29a42",label:"Rogue",motif:rogue},
  sorcerer:{field:["#722040","#2b1021"],accent:"#d6a344",label:"Sorcerer",motif:sorcerer},
  warlock:{field:["#382044","#130e1c"],accent:"#bd9140",label:"Warlock",motif:warlock},
  wizard:{field:["#173f69","#0a1c34"],accent:"#d6ae50",label:"Wizard",motif:wizard}
});

export function classPremiumCrest(classId){
  try{
    const id=THEMES[classId]?classId:"fighter",theme=THEMES[id];
    return shell(id,theme,theme.motif(id));
  }catch(error){
    console.error("[print-art] premium crest build failed",error);
    return shell("fighter",THEMES.fighter,fighter("fighter"));
  }
}

function shell(id,t,motif){
  const g=`crest-${id}`;
  return `<svg class="ps-premium-class-crest" data-crest-class="${id}" viewBox="0 0 240 260" role="img" aria-label="${t.label} heraldic class crest" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${g}-field" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${t.field[0]}"/><stop offset="1" stop-color="${t.field[1]}"/></linearGradient>
      <linearGradient id="${g}-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff1ac"/><stop offset=".32" stop-color="${t.accent}"/><stop offset=".72" stop-color="#9a681c"/><stop offset="1" stop-color="#f0cd6b"/></linearGradient>
      <linearGradient id="${g}-steel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf1"/><stop offset=".4" stop-color="#b9b9b2"/><stop offset=".72" stop-color="#555b62"/><stop offset="1" stop-color="#e8dfc6"/></linearGradient>
      <filter id="${g}-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="2.2" flood-color="#000" flood-opacity=".42"/></filter>
    </defs>
    <g class="crest-shadow" filter="url(#${g}-shadow)">
      <path class="crest-field crest-line" fill="url(#${g}-field)" stroke="url(#${g}-gold)" stroke-width="8" d="M120 8C93 20 63 22 28 25l7 91c4 58 31 104 85 135 54-31 81-77 85-135l7-91c-35-3-65-5-92-17Z"/>
      <path class="crest-line" fill="none" stroke="#f1d476" stroke-width="2.2" opacity=".8" d="M120 20C96 30 70 31 42 33l6 80c4 50 27 90 72 118 45-28 68-68 72-118l6-80c-28-2-54-3-78-13Z"/>
      <path class="crest-line" fill="none" stroke="${t.accent}" stroke-width="2" opacity=".55" d="M57 47c17 5 31 1 44-8m82 8c-17 5-31 1-44-8M50 171c15 8 26 20 32 36m108-36c-15 8-26 20-32 36"/>
      <path class="crest-metal crest-line" fill="url(#${g}-gold)" stroke="#6d4616" stroke-width="1.4" d="m120 13 7 11 13 3-10 9 2 13-12-6-12 6 2-13-10-9 13-3 7-11Z"/>
      <g class="crest-motif">${motif}</g>
      <g class="crest-filigree crest-line" fill="none" stroke="url(#${g}-gold)" stroke-width="3" stroke-linecap="round">
        <path d="M52 72c-17 10-20 26-8 39 8 8 8 17 2 27M188 72c17 10 20 26 8 39-8 8-8 17-2 27"/>
        <path d="M60 184c8 1 14 6 17 14m103-14c-8 1-14 6-17 14"/>
      </g>
    </g>
  </svg>`;
}

const gold=id=>`url(#crest-${id}-gold)`,steel=id=>`url(#crest-${id}-steel)`;

function barbarian(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <g class="crest-steel crest-line" fill="${steel(id)}" stroke="#29282a" stroke-width="3"><path d="m58 69 35 34-11 11-35-34 7-3 4-8Z"/><path d="m182 69-35 34 11 11 35-34-7-3-4-8Z"/><path d="M46 58c13-9 25-10 35-2l-12 19-22 5 7-11-8-11Zm148 0c-13-9-25-10-35-2l12 19 22 5-7-11 8-11Z"/></g>
  <g class="crest-metal crest-line" fill="${gold(id)}" stroke="#6b451b" stroke-width="3"><path d="M82 105c-19-7-35 6-32 25 2 13 13 22 27 20-10-5-13-14-8-22 5-8 12-10 21-6Z"/><path d="M158 105c19-7 35 6 32 25-2 13-13 22-27 20 10-5 13-14 8-22-5-8-12-10-21-6Z"/></g>
  <path class="crest-steel crest-line" fill="${steel(id)}" stroke="#3b2c21" stroke-width="3" d="M120 88c24 0 39 15 39 38 0 18-9 29-18 38l-5 30-16-13-16 13-5-30c-9-9-18-20-18-38 0-23 15-38 39-38Z"/>
  <path class="crest-dark" fill="#201710" d="m100 126 14 7-12 9-9-5Zm40 0-14 7 12 9 9-5Zm-20 17 8 12-8 8-8-8 8-12Z"/>
  <path class="crest-line" fill="none" stroke="#6a3b20" stroke-width="3" d="M103 168h34M108 177h24"/>
</g>`;}

function bard(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#644319" stroke-width="3" d="M104 67h23l-2 55c18 4 29 17 27 34-2 19-17 32-36 32s-34-13-36-32c-2-17 9-30 27-34l-3-55Z"/>
  <ellipse class="crest-dark crest-line" cx="116" cy="153" rx="13" ry="17" fill="#3b2019" stroke="#e3bd57" stroke-width="3"/>
  <path class="crest-line" d="M112 71v70m7-70v70" stroke="#fff0ac" stroke-width="2"/>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#634319" stroke-width="3" d="m105 61 27-23 6 7-22 28Z"/>
  <path class="crest-metal" fill="${gold(id)}" d="M69 88c0-11 12-13 20-4v36c-17-6-21 18-7 21 13 3 18-8 18-19V79c-17-13-31-3-31 9Zm104 15c0-10-11-12-18-4v31c15-6 19 15 7 18-12 3-17-7-17-17V95c15-12 28-3 28 8Z"/>
  <path class="crest-line" fill="none" stroke="#f3d779" stroke-width="3" d="M64 177c20 13 38 20 56 20s36-7 56-20"/>
</g>`;}

function cleric(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <g class="crest-line" stroke="${gold(id)}" stroke-width="4"><path d="M120 55v-24M120 185v24M55 120H31m178 0h-24M74 74 57 57m109 109 17 17m0-126-17 17M74 166l-17 17"/></g>
  <circle class="crest-line" cx="120" cy="120" r="59" fill="#fff9e9" fill-opacity=".72" stroke="${gold(id)}" stroke-width="4"/>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#805618" stroke-width="3" d="M108 63h24v39h38v24h-38v66h-24v-66H70v-24h38V63Z"/>
  <path class="crest-line" fill="none" stroke="#f6dc7c" stroke-width="3" d="M72 196c13-6 23-15 30-28m66 28c-13-6-23-15-30-28"/>
  <path class="crest-metal" fill="${gold(id)}" d="M59 191c15 1 27 7 36 17-18 4-31-2-36-17Zm122 0c-15 1-27 7-36 17 18 4 31-2 36-17Z"/>
</g>`;}

function druid(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#6d4c1b" stroke-width="3" d="M87 70c-26 11-41 34-40 60 1 35 29 62 64 62 27 0 49-15 59-38-11 9-24 14-39 14-34 0-61-27-61-61 0-14 5-27 17-37Z"/>
  <path class="crest-line" fill="none" stroke="#e0c767" stroke-width="5" d="M123 193v-79m0 12-25-23m25 40 31-29m-31 51-34-24m34 8 32-21"/>
  <path class="crest-line" fill="none" stroke="#d7ad48" stroke-width="4" d="M123 191c-10 7-19 12-29 16m29-16c10 7 19 12 29 16M99 103c-4-14-1-25 11-34m36 44c8-12 9-23 2-35"/>
  <g class="crest-metal" fill="${gold(id)}"><ellipse cx="96" cy="100" rx="7" ry="13" transform="rotate(-40 96 100)"/><ellipse cx="151" cy="111" rx="7" ry="13" transform="rotate(38 151 111)"/><ellipse cx="89" cy="142" rx="7" ry="13" transform="rotate(-55 89 142)"/><ellipse cx="157" cy="139" rx="7" ry="13" transform="rotate(55 157 139)"/></g>
</g>`;}

function fighter(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <path class="crest-steel crest-line" fill="${steel(id)}" stroke="#42464c" stroke-width="4" d="M120 60 76 77v47c0 31 16 56 44 75 28-19 44-44 44-75V77l-44-17Z"/>
  <path class="crest-line" fill="none" stroke="${gold(id)}" stroke-width="4" d="M120 72 88 84v38c0 25 11 44 32 60 21-16 32-35 32-60V84l-32-12Z"/>
  <path class="crest-steel crest-line" fill="${steel(id)}" stroke="#34383e" stroke-width="3" d="m114 45 12 0 3 100-9 21-9-21 3-100Z"/>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#694716" stroke-width="3" d="M91 92h58v10H91zM106 42h28l-14-17-14 17Z"/>
  <path class="crest-line" fill="none" stroke="#e0c15e" stroke-width="5" d="M79 164c-15-5-24-15-29-30m111 30c15-5 24-15 29-30"/>
  <path class="crest-metal" fill="${gold(id)}" d="M52 137c7 4 13 10 17 18-12 1-20-5-17-18Zm136 0c-7 4-13 10-17 18 12 1 20-5 17-18Z"/>
</g>`;}

function monk(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <circle class="crest-line" cx="120" cy="114" r="61" fill="none" stroke="${gold(id)}" stroke-width="4"/>
  <circle class="crest-line" cx="120" cy="114" r="49" fill="none" stroke="#e6c76d" stroke-width="2" opacity=".8"/>
  <path class="crest-steel crest-line" fill="#f6e7bb" stroke="#6c501d" stroke-width="3" d="M105 129V83c0-7 10-7 10 0v30-42c0-7 10-7 10 0v42-36c0-7 10-7 10 0v39-25c0-7 10-7 10 0v42c0 25-12 39-33 39-18 0-30-11-34-27l-6-23c-2-8 9-11 13-4l10 18v-7Z"/>
  <g class="crest-metal crest-line" fill="${gold(id)}" stroke="#6e4c18" stroke-width="2"><path d="M120 175c-19 0-35 12-42 30 17 1 31-4 42-15 11 11 25 16 42 15-7-18-23-30-42-30Z"/><path d="M120 177c-7 8-10 17-8 28h16c2-11-1-20-8-28Z"/><path d="M94 181c-11 3-20 10-27 20 13 4 25 2 35-7l-8-13Zm52 0c11 3 20 10 27 20-13 4-25 2-35-7l8-13Z"/></g>
</g>`;}

function paladin(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <path class="crest-line" fill="none" stroke="#e2c267" stroke-width="6" d="M77 89c-19 7-34 18-44 33 16 2 30 9 42 22m88-55c19 7 34 18 44 33-16 2-30 9-42 22"/>
  <path class="crest-steel crest-line" fill="${steel(id)}" stroke="#3f444b" stroke-width="4" d="M120 56 82 70v48c0 31 13 56 38 76 25-20 38-45 38-76V70l-38-14Z"/>
  <path class="crest-steel crest-line" fill="${steel(id)}" stroke="#34383e" stroke-width="3" d="m114 40 12 0 2 108-8 22-8-22 2-108Z"/>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#724d17" stroke-width="3" d="M91 91h58v10H91zM105 38h30l-15-19-15 19Z"/>
  <path fill="#a51f2e" stroke="#f1cf74" stroke-width="2" d="m120 87 9 10-9 10-9-10 9-10Z"/>
  <path class="crest-line" fill="none" stroke="${gold(id)}" stroke-width="3" d="M88 183c9 7 19 12 32 17 13-5 23-10 32-17"/>
</g>`;}

function ranger(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <path class="crest-line" fill="none" stroke="${gold(id)}" stroke-width="5" d="M73 71c-24 33-24 79 0 112m94-112c24 33 24 79 0 112"/>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#684717" stroke-width="3" d="m68 68 14 7-6 13-13-9 5-11Zm104 0-14 7 6 13 13-9-5-11Z"/>
  <path class="crest-steel crest-line" fill="${steel(id)}" stroke="#41464b" stroke-width="3" d="m71 175 93-93 8 8-93 93-13 4 5-12Z"/>
  <path class="crest-metal" fill="${gold(id)}" d="m164 82 27-9-9 27-7-11-11-7Z"/>
  <path class="crest-line" fill="none" stroke="#d8bc64" stroke-width="4" d="M102 104c-15-9-23-22-24-40m60 40c15-9 23-22 24-40M102 103c5-16 11-28 18-37m18 37c-5-16-11-28-18-37"/>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#6b4819" stroke-width="3" d="M120 104c17 0 28 11 28 27 0 12-6 21-14 27l-14 20-14-20c-8-6-14-15-14-27 0-16 11-27 28-27Z"/>
  <path class="crest-dark" fill="#182819" d="m106 130 10 5-9 7-7-5Zm28 0-10 5 9 7 7-5Z"/>
</g>`;}

function rogue(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <g class="crest-steel crest-line" fill="${steel(id)}" stroke="#34373d" stroke-width="3"><path d="m61 75 11-11 89 103-12 10L61 75Z"/><path d="m179 75-11-11-89 103 12 10 88-102Z"/></g>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#5f4219" stroke-width="3" d="M91 112h58v54H91zM102 112V96c0-25 36-25 36 0v16h-11V97c0-11-14-11-14 0v15h-11Z"/>
  <path class="crest-dark" fill="#17181b" d="M120 128c7 0 10 8 5 13l4 13h-18l4-13c-5-5-2-13 5-13Z"/>
  <g class="crest-metal crest-line" fill="${gold(id)}" stroke="#654618" stroke-width="2"><circle cx="72" cy="186" r="8"/><path d="M80 186h29v7H97v9h-8v-9h-9Z"/><circle cx="168" cy="186" r="8"/><path d="M160 186h-29v7h12v9h8v-9h9Z"/></g>
</g>`;}

function sorcerer(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#704416" stroke-width="3" d="M120 61c20 25 27 43 20 58 18-5 34 8 35 27 1 29-24 52-55 52s-56-23-55-52c1-19 17-32 35-27-7-15 0-33 20-58Z"/>
  <path fill="#a82156" stroke="#f5d272" stroke-width="3" d="m120 105 17 25-17 32-17-32 17-25Z"/>
  <path fill="#ff7847" stroke="#ffdf84" stroke-width="3" d="M120 54c8 23 5 38-8 47 14 1 24 10 25 24 1 13-5 23-17 32-12-9-18-19-17-32 1-14 11-23 25-24-13-9-16-24-8-47Z" opacity=".95"/>
  <path class="crest-line" fill="none" stroke="#f7d578" stroke-width="3" d="M77 181c12 15 26 23 43 23s31-8 43-23M70 99l-17-13m117 13 17-13"/>
</g>`;}

function warlock(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#654619" stroke-width="3" d="M56 120c17-27 39-41 64-41s47 14 64 41c-17 27-39 41-64 41s-47-14-64-41Z"/>
  <path class="crest-dark crest-line" fill="#25122e" stroke="#e0bd62" stroke-width="3" d="M72 120c14-17 30-25 48-25s34 8 48 25c-14 17-30 25-48 25s-34-8-48-25Z"/>
  <ellipse fill="#b78b4d" stroke="#f0d37a" stroke-width="3" cx="120" cy="120" rx="18" ry="25"/><path fill="#140b18" d="M120 99c9 9 9 33 0 42-9-9-9-33 0-42Z"/>
  <g class="crest-line" fill="none" stroke="${gold(id)}" stroke-width="5"><path d="M83 160c-20 10-27 26-20 48m37-43c-13 15-16 30-8 46m65-51c20 10 27 26 20 48m-37-43c13 15 16 30 8 46"/><path d="M87 79c-15-12-18-27-8-43m74 43c15-12 18-27 8-43"/></g>
</g>`;}

function wizard(id){return `<g stroke-linecap="round" stroke-linejoin="round">
  <circle class="crest-line" cx="120" cy="102" r="58" fill="none" stroke="${gold(id)}" stroke-width="3"/><circle class="crest-line" cx="120" cy="102" r="45" fill="none" stroke="#e5c873" stroke-width="2" opacity=".8"/>
  <path class="crest-metal crest-line" fill="${gold(id)}" stroke="#674619" stroke-width="2" d="m120 42 9 39 36-18-25 31 35 19-40-3 4 40-19-35-19 35 4-40-40 3 35-19-25-31 36 18 9-39Z"/>
  <circle class="crest-dark" cx="120" cy="102" r="10" fill="#142b4c"/>
  <path class="crest-steel crest-line" fill="#f4ead0" stroke="#6f5526" stroke-width="3" d="M62 164c20-8 39-6 58 5 19-11 38-13 58-5v46c-20-7-39-5-58 6-19-11-38-13-58-6v-46Z"/>
  <path class="crest-line" fill="none" stroke="#a48237" stroke-width="2" d="M120 170v43M75 177c13-3 25-1 36 5m-36 11c13-3 25-1 36 5m54-21c-13-3-25-1-36 5m36 11c-13-3-25-1-36 5"/>
</g>`;}
