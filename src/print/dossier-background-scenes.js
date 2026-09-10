const SCENES=Object.freeze({
  acolyte:Object.freeze([
    Object.freeze({event:"a winter fever that turned the sanctuary into a ward",place:"the east cloister where the bells had been muffled"}),
    Object.freeze({event:"the night frightened families were barred from shelter by someone quoting doctrine",place:"the rain-black temple steps"}),
    Object.freeze({event:"a fire that destroyed the poorhouse records before dawn",place:"the archive beneath the chapel stairs"})
  ]),
  criminal:Object.freeze([
    Object.freeze({event:"a ledger theft that exposed the wrong household",place:"the back room of a shuttered counting house"}),
    Object.freeze({event:"a handoff that became an ambush because somebody sold the route twice",place:"the covered bridge beyond the night market"}),
    Object.freeze({event:"the disappearance of a runner who knew one name too many",place:"an alley behind the old dye works"})
  ]),
  sage:Object.freeze([
    Object.freeze({event:"the night an archive annex burned after its catalog was quietly altered",place:"the sealed west stack"}),
    Object.freeze({event:"a public lecture built around evidence someone had deliberately forged",place:"the old anatomy hall"}),
    Object.freeze({event:"the discovery of a marginal note that contradicted a celebrated history",place:"a reading room kept locked after sunset"})
  ]),
  soldier:Object.freeze([
    Object.freeze({event:"a retreat ordered after the rearguard had already been promised relief",place:"a flooded ford under a colorless dawn"}),
    Object.freeze({event:"an order to hold ground that command already knew could not be held",place:"a broken wall overlooking churned fields"}),
    Object.freeze({event:"the surrender of a village that had been told help was coming",place:"the road beneath an abandoned signal tower"})
  ]),
  "bounty-hunter":Object.freeze([
    Object.freeze({event:"a capture that proved the warrant had omitted the most important fact",place:"a roadside shrine two days beyond the county line"}),
    Object.freeze({event:"a quarry surrendering voluntarily and asking to be heard before the chains went on",place:"a mill yard before sunrise"}),
    Object.freeze({event:"the discovery that two different clients had issued rewards for the same frightened person",place:"a rented room above a coach house"})
  ]),
  "caravan-guard":Object.freeze([
    Object.freeze({event:"a night attack that came from the direction everyone had called safe",place:"a dry ravine used as an emergency camp"}),
    Object.freeze({event:"the loss of a wagon after a merchant overruled the safer route",place:"a switchback above a river gorge"}),
    Object.freeze({event:"a child's disappearance during a storm halt",place:"a roadside camp where every bell had been tied down"})
  ]),
  "grave-warden":Object.freeze([
    Object.freeze({event:"the burial of a stranger whose name had been removed from every official paper",place:"the oldest row of stones behind the cemetery wall"}),
    Object.freeze({event:"the arrival of an order to reopen a grave before the family could be told",place:"a lantern-lit plot beneath black yew branches"}),
    Object.freeze({event:"the discovery that three headstones had been recut during the same night",place:"the rain-soft ground of the paupers' field"})
  ]),
  "hedge-mage":Object.freeze([
    Object.freeze({event:"a healing charm that worked and revealed a poison nobody expected",place:"a cramped kitchen full of boiled herbs"}),
    Object.freeze({event:"a ward meant for livestock that trapped something far stranger outside",place:"a wind-bent farm at the edge of the moor"}),
    Object.freeze({event:"the failure of a borrowed spell copied without its missing final line",place:"a cottage workshop during a thunderstorm"})
  ]),
  "monster-hunter":Object.freeze([
    Object.freeze({event:"a hunt that ended with tracks proving the accused creature had protected the missing child",place:"a cedar hollow beyond the last pasture"}),
    Object.freeze({event:"the killing of a beast wearing an old iron tag from a noble's menagerie",place:"a ravine littered with sprung traps"}),
    Object.freeze({event:"a village panic built around claw marks that had been carved with a knife",place:"the muddy edge of a sheepfold"})
  ]),
  "pit-fighter":Object.freeze([
    Object.freeze({event:"a championship bout the promoter refused to stop after the opponent could no longer defend themself",place:"the sand beneath the south gallery"}),
    Object.freeze({event:"a fixed fight that became real when the other fighter refused the script",place:"a cellar arena behind a bathhouse"}),
    Object.freeze({event:"the death of a novice sent in to make a veteran look dangerous",place:"a torchlit ring after the paying crowd had gone"})
  ]),
  "royal-envoy":Object.freeze([
    Object.freeze({event:"the delivery of a sealed instruction that ended negotiations nobody knew were still possible",place:"a winter audience chamber with every brazier burning"}),
    Object.freeze({event:"a treaty reading where one altered line changed who would be surrendered",place:"the long table beneath the state gallery"}),
    Object.freeze({event:"the disappearance of a witness after a perfectly courteous private audience",place:"a palace corridor reserved for diplomatic guests"})
  ]),
  "deep-sailor":Object.freeze([
    Object.freeze({event:"a night when the compass, stars, and sounding line all disagreed",place:"the lee rail of a ship running without visible shore"}),
    Object.freeze({event:"a storm decision that saved the hull by abandoning a boat still carrying people",place:"black water beyond the reef lights"}),
    Object.freeze({event:"the discovery of a second set of coordinates written beneath the captain's chart",place:"the chart room during the middle watch"})
  ]),
  "field-medic":Object.freeze([
    Object.freeze({event:"a triage order that treated rank as if it were a medical fact",place:"a canvas ward shaking under artillery"}),
    Object.freeze({event:"the arrival of wounded civilians after the official casualty count had already been filed",place:"a schoolhouse turned field hospital"}),
    Object.freeze({event:"the loss of a patient because the needed supplies had been locked for inventory",place:"a rain-soaked aid station behind the line"})
  ]),
  "treasure-seeker":Object.freeze([
    Object.freeze({event:"the opening of a chamber whose contents proved the expedition's patron had lied about ownership",place:"a buried hall behind a counterweighted stone door"}),
    Object.freeze({event:"the removal of a relic that caused every route marker in the ruin to change",place:"a dustless vault below the third stair"}),
    Object.freeze({event:"the discovery of recent footprints in a tomb believed sealed for centuries",place:"a mural gallery lit by one failing lantern"})
  ]),
  "wilderness-guide":Object.freeze([
    Object.freeze({event:"a rescue attempt after an experienced traveler concealed the first signs of exposure",place:"a high pass disappearing under fresh snow"}),
    Object.freeze({event:"the discovery that a familiar trail had been deliberately remarked toward dangerous ground",place:"a pine ridge above a flooded valley"}),
    Object.freeze({event:"a river crossing chosen to avoid one danger and expose the group to another",place:"a braided stream beneath storm-dark peaks"})
  ]),
  watchman:Object.freeze([
    Object.freeze({event:"a routine patrol that found every lamp on one street extinguished at the same hour",place:"the merchants' quarter just before midnight"}),
    Object.freeze({event:"a report about an unlocked gate that vanished between the watch desk and the captain",place:"the east gatehouse during a cold rain"}),
    Object.freeze({event:"the third disappearance nobody in authority wanted entered in the ledger",place:"a narrow district of shuttered workshops"})
  ])
});

const FALLBACK=Object.freeze([
  Object.freeze({event:"a local crisis that forced an ordinary responsibility into an irreversible choice",place:"a familiar place made strange by danger"}),
  Object.freeze({event:"a promise tested before anyone was ready",place:"a road that had always seemed safe before that day"})
]);

export function literarySceneFor(background,seed){
  try{
    const id=String(background?.id||background?.name||"").trim().toLowerCase(),pool=SCENES[id]||FALLBACK,index=Math.abs((seed+0x45d9f3b)|0)%pool.length;
    return pool[index];
  }catch(error){console.error("[dossier-background-scenes] scene lookup failed",error);return FALLBACK[0];}
}

export const LITERARY_SCENE_IDS=Object.freeze(Object.keys(SCENES));
