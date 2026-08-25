export function createHeroExperience(){
  try{
    const hero=document.querySelector(".hero-copy");
    if(!hero)return;
    if(!hero.querySelector(".pregen-promise")){
      const promise=document.createElement("section");
      promise.className="pregen-promise";
      promise.setAttribute("aria-label","Why Character Forge exists");
      promise.innerHTML='<div class="pregen-promise-heading"><span aria-hidden="true">⚔</span><div><strong>Stop spending your night building pregens.</strong><span>Make one. Make six. Make a whole table.</span></div></div><p>Leave everything Random and Forge a complete, ready-to-play character. Or lock only what matters—like level, class, or species—and Reforge as many new characters as you need.</p><div class="pregen-examples"><div><strong>Need 6 tonight?</strong><span>Forge → Print → Reforge → Print</span></div><div><strong>Need a specific party?</strong><span>Lock your choices. Randomize everything else.</span></div></div>';
      hero.appendChild(promise);
    }
  }catch(error){
    console.error("[app] hero experience failed",error);
  }
}

export function createForgeLoadingState(){
  try{
    const button=document.getElementById("forgeButton"),result=document.getElementById("result");
    if(!button||!result)return null;
    let panel=document.getElementById("forgeLoading");
    if(!panel){
      panel=document.createElement("section");
      panel.id="forgeLoading";
      panel.className="forge-loading";
      panel.setAttribute("aria-live","polite");
      panel.setAttribute("aria-label","Forging character");
      panel.innerHTML='<div class="forge-loading-rune" aria-hidden="true">✦</div><div><p class="section-kicker">FORGING YOUR CHARACTER</p><h3>Building a ready-to-play pregen</h3><div class="forge-loading-steps"><span data-step="build">⚔ Building character</span><span data-step="random">🎲 Randomizing unlocked choices</span><span data-step="rules">📜 Applying your ruleset</span><span data-step="validate">✓ Checking RAW legality</span><span data-step="complete">✨ Preparing your class-themed sheet</span></div></div>';
      result.prepend(panel);
    }
    return panel;
  }catch(error){
    console.error("[app] forge loading state failed",error);
    return null;
  }
}

export function setForgeLoading(isLoading){
  try{
    const panel=document.getElementById("forgeLoading");
    if(panel)panel.classList.toggle("is-active",isLoading);
    const button=document.getElementById("forgeButton");
    if(button){button.setAttribute("aria-busy",String(isLoading));button.disabled=isLoading;}
  }catch(error){
    console.error("[app] forge loading toggle failed",error);
  }
}
