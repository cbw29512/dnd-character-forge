import { generateParty, PARTY_COMPOSITIONS } from "../rules/party-forge.js";
import { FORGE_BUILD, buildRulesLawyerCertification } from "../rules/certification.js";
import { savePregen } from "../library/local-library.js";

function ensureHeroStyles(){
  try{
    if(document.querySelector('link[data-hero-experience-style]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="styles/hero-experience.css";
    link.dataset.heroExperienceStyle="true";
    document.head.appendChild(link);
  }catch(error){
    console.error("[app] hero styles failed",error);
  }
}

function ensurePartyStyles(){
  try{
    if(document.querySelector('link[data-party-forge-style]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="styles/party-forge.css";
    link.dataset.partyForgeStyle="true";
    document.head.appendChild(link);
  }catch(error){
    console.error("[party-forge] styles failed",error);
  }
}

function ensureCertificationStyles(){
  try{
    if(document.querySelector('link[data-rules-lawyer-style]'))return;
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="styles/certification.css";
    link.dataset.rulesLawyerStyle="true";
    document.head.appendChild(link);
  }catch(error){
    console.error("[certification] styles failed",error);
  }
}

let certificationObserver=null;
function applyRulesLawyerCertification(root=document){
  try{
    const sheets=[];
    if(root?.matches?.(".character-sheet"))sheets.push(root);
    if(root?.querySelectorAll)sheets.push(...root.querySelectorAll(".character-sheet"));
    for(const sheet of sheets){
      if(sheet.dataset.rulesLawyerCertification)return;
      const audit=sheet.querySelector(".rules-audit-card"),pass=/PASS/i.test(sheet.querySelector(".audit-pass")?.textContent||""),sourceMode=sheet.querySelector(".audit-mode b")?.textContent?.trim()||"",auditText=audit?.textContent||"",forgeOriginal=/Character Forge Original/i.test(auditText),homebrew=Boolean(sheet.querySelector(".validation-badge.hb"))||/Homebrew mode is explicit/i.test(auditText),rawCertified=pass&&sourceMode==="RAW"&&!forgeOriginal&&!homebrew;
      if(!audit||!pass)continue;
      const sourceVersion=(auditText.match(/SRD\s+\d+(?:\.\d+)+/i)||[])[0]||"Verified SRD",ruleset=(sheet.querySelector(".sheet-footer span:first-child")?.textContent.match(/\b(2014|2024)\b/)||[])[1]||"",citations=audit.querySelectorAll(".audit-cite").length,checks=audit.querySelectorAll(".audit-checks li").length,status=rawCertified?"RULES LAWYER CERTIFIED":forgeOriginal?"AUDITED 5E COMPATIBLE":"AUDITED CUSTOM CONTENT";
      const seal=document.createElement("section");
      seal.className=`rules-lawyer-cert ${rawCertified?"is-raw":"is-compatible"}`;
      seal.setAttribute("aria-label",status);
      seal.innerHTML=`<div class="rules-lawyer-mark" aria-hidden="true">${rawCertified?"⚖":"✓"}</div><div class="rules-lawyer-copy"><strong>${status}</strong><span>${ruleset?`${ruleset} · `:""}${sourceVersion} · ${citations} sourced mechanics · ${checks} integrity checks</span></div><span class="rules-lawyer-build">BUILD ${FORGE_BUILD.id}</span>`;
      sheet.querySelector(".character-topline")?.insertAdjacentElement("afterend",seal);
      sheet.dataset.rulesLawyerCertification=rawCertified?"raw":"compatible";
    }
  }catch(error){console.error("[certification] UI seal failed",error);}
}

function ensureRulesLawyerCertification(){
  try{
    ensureCertificationStyles();
    const result=document.getElementById("result");
    if(!result)return;
    applyRulesLawyerCertification(result);
    if(certificationObserver)return;
    certificationObserver=new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes)if(node?.nodeType===1)applyRulesLawyerCertification(node);
    });
    certificationObserver.observe(result,{childList:true,subtree:true});
  }catch(error){console.error("[certification] observer setup failed",error);}
}

function partyEditionLabel(){
  const ruleset=document.getElementById("ruleset")?.value||"2024";
  return ruleset==="2014"?"2014 · SRD 5.1":"2024 · SRD 5.2.1";
}

function currentMagicMode(){
  return document.querySelector('input[name="magicMode"]:checked')?.value||"random";
}

function setPartyStatus(message,isError=false){
  const status=document.getElementById("partyForgeStatus");
  if(!status)return;
  status.textContent=message||"";
  status.classList.toggle("is-error",Boolean(isError));
}

function memberSubclassLabel(member){return member.subclass?.name?` · ${member.subclass.name}`:"";}
function memberRoleLabel(role){return role==="random"?"Random role":role.charAt(0).toUpperCase()+role.slice(1);}

function renderPartyRoster(party){
  try{
    const result=document.getElementById("result");
    if(!result)throw new Error("Party Forge result stage is unavailable.");
    const certifications=party.members.map(buildRulesLawyerCertification),rawCertifiedCount=certifications.filter(item=>item.rawCertified).length,proof=rawCertifiedCount===party.size?`⚖ ${party.size}/${party.size} RULES LAWYER CERTIFIED · ${FORGE_BUILD.id}`:`✓ ${party.size}/${party.size} audited · ${rawCertifiedCount} RAW certified · ${FORGE_BUILD.id}`;
    result.innerHTML="";
    const roster=document.createElement("section");
    roster.className="party-roster";
    roster.setAttribute("aria-label","Generated party roster");
    roster.innerHTML=`<div class="party-roster-head"><div><p class="section-kicker">PARTY FORGE RESULT</p><h2>${party.size} ready-to-play characters</h2><p>Level ${party.level} · ${partyEditionLabel()} · ${party.composition===PARTY_COMPOSITIONS.BALANCED?"Balanced roles":"Fully random classes"}</p></div><span class="party-roster-proof rules-lawyer-proof">${proof}</span></div><div class="party-member-grid"></div><div class="party-roster-actions"><button id="savePartyPregens" class="party-forge-button" type="button">Save all to My Pregens</button><button id="openPartyPregens" class="party-member-save" type="button">Open My Pregens</button></div><div id="partyRosterStatus" class="party-status" aria-live="polite"></div>`;
    const grid=roster.querySelector(".party-member-grid");
    party.members.forEach((member,index)=>{
      const card=document.createElement("article");
      card.className="party-member-card";
      card.innerHTML=`<div class="party-member-top"><div><span class="party-role">${memberRoleLabel(member.partyRole)}</span><h3>${member.name}</h3></div><span class="party-role">#${index+1}</span></div><div class="party-member-meta">Level ${member.level} ${member.class.name}${memberSubclassLabel(member)}<br>${member.species.name} · ${member.background.name}</div><div class="party-member-stats"><div class="party-member-stat"><strong>${member.ac}</strong><span>AC</span></div><div class="party-member-stat"><strong>${member.hp}</strong><span>HP</span></div><div class="party-member-stat"><strong>+${member.proficiency}</strong><span>PB</span></div></div><button class="party-member-save" type="button" data-save-party-member="${index}">Save to My Pregens</button>`;
      grid.appendChild(card);
    });
    result.appendChild(roster);
    const status=roster.querySelector("#partyRosterStatus");
    async function saveMember(index,button){
      const member=party.members[index];
      if(!member)throw new Error("Party member is unavailable.");
      try{
        await savePregen(member);
      }catch(error){
        if(!/mechanically identical/i.test(error.message))throw error;
      }
      if(button){button.textContent="✓ Saved";button.classList.add("is-saved");button.disabled=true;}
    }
    grid.addEventListener("click",async event=>{
      const button=event.target.closest("[data-save-party-member]");
      if(!button)return;
      try{button.disabled=true;button.textContent="Saving…";await saveMember(Number(button.dataset.savePartyMember),button);status.textContent="Saved. Open My Pregens to view, customize, or print the full sheet.";}catch(error){button.disabled=false;button.textContent="Save to My Pregens";status.textContent=error.message;status.classList.add("is-error");}
    });
    roster.querySelector("#savePartyPregens").addEventListener("click",async event=>{
      const button=event.currentTarget;
      try{
        button.disabled=true;button.textContent="Saving party…";status.classList.remove("is-error");
        const memberButtons=[...grid.querySelectorAll("[data-save-party-member]")];
        for(let index=0;index<party.members.length;index+=1)await saveMember(index,memberButtons[index]);
        button.textContent="✓ Party saved";
        status.textContent=`All ${party.size} characters are in My Pregens. Open any member there for the full class sheet and PDF controls.`;
      }catch(error){button.disabled=false;button.textContent="Save all to My Pregens";status.textContent=error.message;status.classList.add("is-error");}
    });
    roster.querySelector("#openPartyPregens").addEventListener("click",()=>document.querySelector('[data-tab="pregens"]')?.click());
  }catch(error){console.error("[party-forge] roster render failed",error);throw error;}
}

function ensurePartyForge(){
  try{
    ensurePartyStyles();
    const launch=document.querySelector(".launch-cta");
    if(!launch||document.getElementById("partyForgePanel"))return;
    const toggle=document.createElement("button");
    toggle.id="partyForgeToggle";
    toggle.className="party-forge-toggle";
    toggle.type="button";
    toggle.setAttribute("aria-expanded","false");
    toggle.setAttribute("aria-controls","partyForgePanel");
    toggle.textContent="⚔ Forge a Party";
    launch.appendChild(toggle);

    const panel=document.createElement("section");
    panel.id="partyForgePanel";
    panel.className="party-forge-panel";
    panel.hidden=true;
    panel.innerHTML='<div class="party-forge-heading"><div><span class="section-kicker">DM PARTY FORGE</span><h3>Build the whole table at once.</h3><p>Every member goes through the same RAW generator and validation path as a normal Forge character.</p></div><span class="party-forge-badge">PARTY MVP</span></div><div class="party-forge-grid"><label>Party size<select id="partySize"><option value="2">2 characters</option><option value="3">3 characters</option><option value="4" selected>4 characters</option><option value="5">5 characters</option><option value="6">6 characters</option></select></label><label>Level<select id="partyLevel"></select></label><label>Composition<select id="partyComposition"><option value="balanced">Balanced roles</option><option value="random">Fully random classes</option></select></label><label>Rules edition<input id="partyRulesetLabel" value="" readonly aria-label="Party rules edition"></label><label class="party-duplicate-option"><input id="partyAllowDuplicates" type="checkbox"><span>Allow duplicate classes</span></label></div><div class="party-forge-actions"><button id="forgePartyButton" class="party-forge-button" type="button">Forge the Party</button><span id="partyForgeStatus" class="party-forge-note" aria-live="polite"></span></div>';
    launch.insertAdjacentElement("afterend",panel);
    const level=panel.querySelector("#partyLevel");
    for(let value=1;value<=20;value+=1){const option=document.createElement("option");option.value=String(value);option.textContent=`Level ${value}`;if(value===5)option.selected=true;level.appendChild(option);}
    const updateEdition=()=>{panel.querySelector("#partyRulesetLabel").value=partyEditionLabel();};
    updateEdition();
    document.getElementById("ruleset")?.addEventListener("change",updateEdition);
    toggle.addEventListener("click",()=>{panel.hidden=!panel.hidden;toggle.setAttribute("aria-expanded",String(!panel.hidden));toggle.textContent=panel.hidden?"⚔ Forge a Party":"Close Party Forge";if(!panel.hidden)updateEdition();});
    panel.querySelector("#forgePartyButton").addEventListener("click",event=>{
      const button=event.currentTarget;
      try{
        button.disabled=true;button.textContent="Forging party…";setPartyStatus("Building and validating every member…");
        const party=generateParty({ruleset:document.getElementById("ruleset")?.value||"2024",level:Number(level.value),size:Number(panel.querySelector("#partySize").value),composition:panel.querySelector("#partyComposition").value,allowDuplicateClasses:panel.querySelector("#partyAllowDuplicates").checked,magicMode:currentMagicMode()});
        renderPartyRoster(party);
        window.requestAnimationFrame(()=>document.querySelector(".result-stage")?.scrollIntoView({block:"start"}));
        setPartyStatus(`✓ ${party.size} audited characters forged.`);
      }catch(error){console.error("[party-forge] UI generation failed",error);setPartyStatus(error.message,true);}finally{button.disabled=false;button.textContent="Forge the Party";}
    });
  }catch(error){console.error("[party-forge] experience setup failed",error);}
}

export function createHeroExperience(){
  try{
    ensureHeroStyles();
    ensurePartyForge();
    ensureRulesLawyerCertification();
    const hero=document.querySelector(".hero-copy");
    if(!hero)return;
    // The polished landing page owns its hero messaging. Keep the legacy
    // promise block only as a fallback for older/custom shells that do not
    // already provide the static three-step hero experience.
    if(hero.querySelector(".hero-flow"))return;
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
    ensureHeroStyles();
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
