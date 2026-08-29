// Self-contained Cleric portrait placeholder. Player-uploaded portraits still override this asset.
// Vector artwork avoids binary-image corruption in browser/PDF print pipelines.
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 288" role="img" aria-label="Armored cleric with radiant holy symbol and staff">
<rect width="192" height="288" fill="#eee1c3"/>
<rect y="198" width="192" height="90" fill="#57483e"/>
<circle cx="96" cy="67" r="53" fill="#d7b45e" opacity=".42"/>
<g stroke="#b58b2d" stroke-width="5" stroke-linecap="round" opacity=".75"><path d="M96 4v27M96 103v28M33 67h28M131 67h28M51 22l20 20M121 92l20 20M141 22l-20 20M71 92l-20 20"/></g>
<circle cx="96" cy="70" r="32" fill="#f5ead1" stroke="#7d642d" stroke-width="4"/>
<path d="M83 68c0-15 7-24 13-24s13 9 13 24v16H83Z" fill="#6b5746"/>
<circle cx="96" cy="67" r="14" fill="#c98f62"/>
<path d="M70 111h52l22 78-16 74H64l-16-74Z" fill="#e7e3dc" stroke="#4a4d54" stroke-width="5"/>
<path d="M79 111 96 139l17-28 9 80H70Z" fill="#7b5ca6"/>
<path d="M96 129v52M77 148h38" stroke="#d0aa45" stroke-width="9" stroke-linecap="round"/>
<path d="M55 137 29 183l17 11 31-39M137 136l20 39-14 12-28-32" fill="none" stroke="#4a4d54" stroke-width="13" stroke-linecap="round"/>
<path d="M145 39v209" stroke="#5e472f" stroke-width="9" stroke-linecap="round"/>
<path d="M130 43h30M145 27v31" stroke="#d0aa45" stroke-width="9" stroke-linecap="round"/>
<path d="M49 193h41v54H49Z" fill="#6b7180" stroke="#3f424a" stroke-width="5"/>
<path d="M69 202v34M57 219h24" stroke="#d0aa45" stroke-width="7" stroke-linecap="round"/>
<path d="M69 262h54M61 276h70" stroke="#2f2b29" stroke-width="8" stroke-linecap="round"/>
<circle cx="96" cy="154" r="8" fill="#fff7d6"/>
</svg>`;
export default `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
