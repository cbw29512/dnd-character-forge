function applyPremiumCopyGuard(){
  try{
    const actionCopy=document.querySelector(".forge-action-copy small");
    if(actionCopy&&/complete legal character/i.test(actionCopy.textContent||""))actionCopy.textContent="Leave everything Random for a complete rules-validated character, or set only the choices you care about.";

    const result=document.getElementById("result"),audit=result?.querySelector(".rules-audit");
    if(!result||!audit)return;
    const compatible=/Character Forge Original/i.test(audit.textContent||"");
    if(!compatible)return;

    const badge=result.querySelector(".validation-badge");
    if(badge)badge.textContent="✓ VERIFIED · 5E COMPATIBLE";
    const footer=result.querySelector(".sheet-footer span:first-child");
    if(footer)footer.textContent=(footer.textContent||"").replace(/\bRAW\b/g,"5E COMPATIBLE");
  }catch(error){console.error("[premium-copy-guard] render failed",error);}
}

function bootPremiumCopyGuard(){
  try{
    applyPremiumCopyGuard();
    const result=document.getElementById("result"),shell=document.querySelector(".forge-view");
    const observer=new MutationObserver(applyPremiumCopyGuard);
    if(result)observer.observe(result,{childList:true,subtree:true});
    if(shell)observer.observe(shell,{childList:true,subtree:true});
  }catch(error){console.error("[premium-copy-guard] boot failed",error);}
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bootPremiumCopyGuard,{once:true});
else bootPremiumCopyGuard();
