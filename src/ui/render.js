import { renderCharacter as renderCoreCharacter } from "./render-core.js";

export function renderCharacter(character,target){
  try{
    renderCoreCharacter(character,target);
    renderProficiencies(character,target);
  }catch(error){console.error("[ui] renderCharacter wrapper failed",error);throw error;}
}

function renderProficiencies(character,target){
  try{
    const section=target.querySelector(".sheet-section-equipment");if(!section)throw new Error("Equipment section is required for proficiency rendering.");
    const heading=section.querySelector("h3");if(heading)heading.textContent="Equipment & Proficiencies";
    const block=document.createElement("div");block.className="proficiency-summary";
    block.append(summaryRow("Languages",character.languages||[]));
    block.append(summaryRow("Tool Proficiencies",character.tools||[]));
    heading?.insertAdjacentElement("afterend",block);
  }catch(error){console.error("[ui] proficiency rendering failed",error);throw error;}
}
function summaryRow(label,values){const row=document.createElement("p"),strong=document.createElement("strong");strong.textContent=`${label}: `;row.append(strong,document.createTextNode(values.length?values.join(", "):"None"));return row;}
