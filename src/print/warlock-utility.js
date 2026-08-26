export function buildWarlockUtility(character){
  try{
    if(character?.class?.id!=="warlock")throw new Error("Warlock utility requires a Warlock character.");
    const w=character.warlock,s=character.spells,choices=character.warlockSelections||{};
    if(!w||!s)throw new Error("Warlock utility requires progression and spellcasting state.");
    const invocations=choices.invocations?.all?.length||0,arcanum=Object.keys(s.mysticArcanum||{}).length,pact=character.ruleset==="2014"?(choices.pactBoon?.name||"No Pact Boon"):(choices.invocations?.all||[]).filter(id=>id.startsWith("pact-of-the-")).map(pretty).join(" · ")||"No Pact invocation";
    const extras=[];
    if(choices.familiarForm)extras.push(`Familiar: ${choices.familiarForm}`);
    if((s.tome?.cantrips||[]).length)extras.push(`Tome: ${s.tome.cantrips.length} cantrips${s.tome.rituals.length?` + ${s.tome.rituals.length} rituals`:""}`);
    if(w.contactPatron)extras.push("Contact Patron");
    if(w.eldritchMaster)extras.push(character.ruleset==="2014"?"Eldritch Master":"Magical Cunning restores all Pact slots");
    return Object.freeze({
      title:"Eldritch Pact",kind:"warlock",
      stats:Object.freeze([
        stat("Pact Slots",w.slotCount,`level ${w.slotLevel}`),
        stat("Invocations",invocations,"active"),
        stat("Arcanum",arcanum,"once / Long Rest"),
        stat("Spell DC",s.saveDc,"Charisma")
      ]),
      note:`${pact}${extras.length?` · ${extras.join(" · ")}`:""}`
    });
  }catch(error){console.error("[warlock-utility] build failed",error);throw error;}
}
function stat(label,value,unit){return Object.freeze({label,value,unit});}
function pretty(value){return String(value||"").replace(/-/g," ").replace(/\b\w/g,char=>char.toUpperCase());}
