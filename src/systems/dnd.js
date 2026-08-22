import { registerSystem } from "./registry.js";

export const DND_SYSTEM_ID="dnd";

export const DND_SYSTEM=registerSystem({
  id:DND_SYSTEM_ID,
  name:"Dungeons & Dragons",
  characterLabel:"Character",
  licenseLabel:"SRD Creative Commons",
  editions:[
    {id:"2014",label:"2014 · SRD 5.1",source:"SRD 5.1"},
    {id:"2024",label:"2024 · SRD 5.2.1",source:"SRD 5.2.1"}
  ],
  capabilities:{
    randomGeneration:true,
    constrainedGeneration:true,
    printableSheets:true,
    savedPregens:true,
    spellSelection:true,
    levelProgression:true
  }
});
