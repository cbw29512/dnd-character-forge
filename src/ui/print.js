import { getLastGeneratedParty } from "../rules/party-forge.js";
import { renderPremiumPrintSheet } from "./premium-print.js";
import { renderPartyQuickReference } from "./party-print-summary.js";

function safeTitle(value){
  try{return String(value||"Character").replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim();}
  catch(error){console.error("[print] title sanitization failed",error);throw error;}
}
function printRoot(){
  try{
    let root=document.getElementById("premiumPrintRoot");
    if(!root){root=document.createElement("div");root.id="premiumPrintRoot";root.className="premium-print-root";root.setAttribute("aria-hidden","true");document.body.appendChild(root);}
    return root;
  }catch(error){console.error("[print] premium root failed",error);throw error;}
}

function exportValidatedPackets(characters,title,{summaryHtml=""}={}){
  const originalTitle=document.title,root=printRoot();
  let cleaned=false,cleanupTimer=null;
  const cleanup=()=>{
    if(cleaned)return;
    cleaned=true;
    if(cleanupTimer)window.clearTimeout(cleanupTimer);
    try{document.body.classList.remove("premium-print-active");root.innerHTML="";root.setAttribute("aria-hidden","true");document.title=originalTitle;}
    catch(error){console.error("[print] export cleanup failed",error);}
  };
  try{
    root.innerHTML="";
    document.title=safeTitle(title);
    if(summaryHtml)root.insertAdjacentHTML("beforeend",summaryHtml);
    characters.forEach((character,index)=>{
      const stage=document.createElement("div");
      renderPremiumPrintSheet(character,stage);
      const firstPage=stage.firstElementChild;
      if(index>0&&firstPage){
        firstPage.style.breakBefore="page";
        firstPage.style.pageBreakBefore="always";
        firstPage.dataset.partyPrintStart="true";
      }
      while(stage.firstChild)root.appendChild(stage.firstChild);
    });
    root.setAttribute("aria-hidden","false");
    document.body.classList.add("premium-print-active");

    // Mobile Safari/Chrome require window.print() to run in the same user-gesture
    // turn as the tap. Awaiting image.decode()/timers here can consume that
    // transient activation and make the Print button appear to do nothing.
    // The premium root is hidden outside print media, so it is safe to keep it
    // mounted until afterprint while the browser finishes preparing the sheet.
    primePrintImages(root);
    void root.offsetHeight;
    window.addEventListener("afterprint",cleanup,{once:true});
    window.print();
    if(!cleaned)cleanupTimer=window.setTimeout(cleanup,30000);
  }catch(error){
    cleanup();
    console.error("[print] PDF export failed",error);
    throw error;
  }
}

export function exportCharacterPdf(character){
  try{
    if(!character)throw new Error("Forge a character before exporting a PDF.");
    if(!character.validation?.valid)throw new Error("Only validated characters can be exported.");
    const subclass=character.subclass?.name?` - ${character.subclass.name}`:"";
    exportValidatedPackets([character],`${character.name} - Level ${character.level} ${character.class.name}${subclass} - Character Forge`);
  }catch(error){console.error("[print] character PDF export failed",error);throw error;}
}

export function exportPartyPdf(characters,{title=""}={}){
  try{
    const members=Array.isArray(characters)?characters:[];
    if(!members.length)throw new Error("Forge a party before printing it.");
    if(members.some(character=>!character?.validation?.valid))throw new Error("Only fully validated parties can be printed.");
    const first=members[0],resolvedTitle=title||`Character Forge Party - ${members.length} Characters - Level ${first.level} - ${first.ruleset}`;
    exportValidatedPackets(members,resolvedTitle,{summaryHtml:renderPartyQuickReference(members)});
  }catch(error){console.error("[print] party PDF export failed",error);throw error;}
}

function primePrintImages(root){
  try{
    for(const image of root.querySelectorAll("img")){
      if(typeof image.decode==="function")image.decode().catch(()=>{});
    }
  }catch(error){console.warn("[print] image priming failed; continuing with browser print",error);}
}

function partyPrintStatus(roster,message,isError=false){
  const status=roster.querySelector("#partyRosterStatus");
  if(!status)return;
  status.textContent=message;
  status.classList.toggle("is-error",Boolean(isError));
}

function decoratePartyRoster(roster){
  try{
    if(!roster||roster.dataset.partyPrintReady==="true")return;
    const actions=roster.querySelector(".party-roster-actions");
    if(!actions)return;
    const save=actions.querySelector("#savePartyPregens");
    if(save){save.classList.remove("party-forge-button");save.classList.add("party-member-save");}
    const button=document.createElement("button");
    button.id="printParty";
    button.className="party-forge-button";
    button.type="button";
    button.textContent="Print the Party";
    button.addEventListener("click",()=>{
      try{
        const party=getLastGeneratedParty();
        if(!party?.members?.length)throw new Error("Forge a party before printing it.");
        partyPrintStatus(roster,"Opening the print dialog with a DM quick reference and the full party…");
        exportPartyPdf(party.members,{title:`Character Forge Party - Level ${party.level} - ${party.ruleset}`});
        partyPrintStatus(roster,`Print dialog opened with the DM quick reference plus all ${party.size} validated character packets.`);
      }catch(error){partyPrintStatus(roster,error.message,true);}
    });
    actions.prepend(button);
    const grid=roster.querySelector(".party-member-grid"),status=roster.querySelector("#partyRosterStatus");
    if(grid){
      roster.insertBefore(actions,grid);
      if(status)roster.insertBefore(status,grid);
    }
    roster.dataset.partyPrintReady="true";
  }catch(error){console.error("[print] Party Forge print action failed",error);}
}

function scanPartyRosters(root=document){
  try{
    const rosters=[];
    if(root?.matches?.(".party-roster"))rosters.push(root);
    if(root?.querySelectorAll)rosters.push(...root.querySelectorAll(".party-roster"));
    for(const roster of rosters)decoratePartyRoster(roster);
  }catch(error){console.error("[print] Party Forge roster scan failed",error);}
}

let partyPrintObserver=null;
function startPartyPrintObserver(){
  try{
    const result=document.getElementById("result");
    if(!result)return;
    scanPartyRosters(result);
    if(partyPrintObserver||typeof MutationObserver==="undefined")return;
    partyPrintObserver=new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes)if(node?.nodeType===1)scanPartyRosters(node);
    });
    partyPrintObserver.observe(result,{childList:true,subtree:true});
  }catch(error){console.error("[print] Party Forge print observer failed",error);}
}

if(typeof document!=="undefined"){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startPartyPrintObserver,{once:true});
  else startPartyPrintObserver();
}
