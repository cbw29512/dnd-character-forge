export function partyAuditScript(){
  try{
    return `<script>(()=>{
      const state={stage:"boot",auditError:"",togglePresent:false,panelVisible:false,rosterPresent:false,memberCount:0,validatedProof:false,proofText:"",ruleset:"",horizontalOverflow:999,scrollY:0,rosterTop:9999,panelTop:9999};
      let result=null;
      const publish=patch=>{
        try{
          Object.assign(state,patch||{});
          if(!result){result=document.createElement("pre");result.id="partyAuditResult";result.hidden=true;}
          result.textContent=JSON.stringify(state);
          if(!result.isConnected)(document.body||document.documentElement).append(result);
        }catch(error){console.error("[party-audit] publish failed",error);}
      };
      const failure=error=>{const message=error?.message||String(error||"audit failure");publish({stage:"error",auditError:message});};
      window.addEventListener("error",event=>failure(event?.error||new Error(event?.message||"window error")));
      window.addEventListener("unhandledrejection",event=>failure(event?.reason||new Error("unhandled rejection")));
      publish({stage:"waiting-dom"});
      const waitFor=(label,probe,limit=3000)=>new Promise((resolve,reject)=>{
        const started=Date.now();
        const check=()=>{
          try{
            const value=probe();
            if(value){resolve(value);return;}
            if(Date.now()-started>=limit){reject(new Error(label+" was not ready within "+limit+"ms"));return;}
            setTimeout(check,50);
          }catch(error){reject(error);}
        };
        check();
      });
      const run=async()=>{
        try{
          publish({stage:"waiting-ui"});
          const rules=await waitFor("ruleset control",()=>document.getElementById("ruleset"));
          const toggle=await waitFor("Party Forge toggle",()=>document.getElementById("partyForgeToggle"));
          const panel=await waitFor("Party Forge panel",()=>document.getElementById("partyForgePanel"));
          const button=await waitFor("Party Forge action",()=>document.getElementById("forgePartyButton"));
          const params=new URLSearchParams(location.search),ruleset=params.get("ruleset")||"2024";
          rules.value=ruleset;
          rules.dispatchEvent(new Event("change",{bubbles:true}));
          if(panel.hidden)toggle.click();
          publish({stage:"configuring",togglePresent:true,panelVisible:!panel.hidden,ruleset});
          const size=document.getElementById("partySize"),level=document.getElementById("partyLevel"),composition=document.getElementById("partyComposition");
          if(!size||!level||!composition)throw new Error("Party Forge controls are incomplete");
          size.value="4";level.value="5";composition.value="balanced";
          button.click();
          publish({stage:"waiting-roster"});
          const roster=await waitFor("four-member Party Forge roster",()=>document.querySelectorAll(".party-member-card").length===4?document.querySelector(".party-roster"):null,4000);
          await new Promise(resolve=>requestAnimationFrame(()=>resolve()));
          const root=document.documentElement,body=document.body,proof=document.querySelector(".party-roster-proof"),proofText=proof?.textContent||"",currentPanel=document.getElementById("partyForgePanel");
          publish({stage:"complete",auditError:"",togglePresent:Boolean(toggle),panelVisible:Boolean(currentPanel&&!currentPanel.hidden),rosterPresent:Boolean(roster),memberCount:document.querySelectorAll(".party-member-card").length,validatedProof:Boolean(proof&&/4\\/4 RULES LAWYER CERTIFIED/.test(proofText)),proofText,ruleset:document.getElementById("ruleset")?.value||"",horizontalOverflow:Math.max(0,Math.max(root.scrollWidth,body.scrollWidth)-root.clientWidth),scrollY:Math.round(window.scrollY),rosterTop:Math.round(roster.getBoundingClientRect().top*100)/100,panelTop:currentPanel?Math.round(currentPanel.closest('.forge-panel').getBoundingClientRect().top*100)/100:9999});
        }catch(error){failure(error);}
      };
      if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run,{once:true});else run();
    })();<\/script>`;
  }catch(error){
    console.error("[party-forge-browser-audit] script fixture build failed",error);
    throw error;
  }
}

export function decodePartyAuditHtml(value){
  try{return String(value||"").replaceAll("&quot;",'"').replaceAll("&amp;","&").replaceAll("&lt;","<").replaceAll("&gt;",">");}
  catch(error){console.error("[party-forge-browser-audit] HTML decode failed",error);throw error;}
}

export function partyAuditMime(file){
  try{
    const ext=String(file||"").toLowerCase().match(/\.[^.]+$/)?.[0]||"";
    return ({".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json; charset=utf-8"})[ext]||"application/octet-stream";
  }catch(error){console.error("[party-forge-browser-audit] MIME lookup failed",error);return"application/octet-stream";}
}
