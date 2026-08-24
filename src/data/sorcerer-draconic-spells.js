const spell=(id,name,spellLevel,unlockLevel)=>Object.freeze({id,name,spellLevel,unlockLevel,alwaysPrepared:true,countsAsSorcererSpell:true});

export const DRACONIC_SPELLS_2024=Object.freeze([
  spell("alter-self","Alter Self",2,3),
  spell("chromatic-orb","Chromatic Orb",1,3),
  spell("command","Command",1,3),
  spell("dragons-breath","Dragon’s Breath",2,3),
  spell("fear","Fear",3,5),
  spell("fly","Fly",3,5),
  spell("arcane-eye","Arcane Eye",4,7),
  spell("charm-monster","Charm Monster",4,7),
  spell("legend-lore","Legend Lore",5,9),
  spell("summon-dragon","Summon Dragon",5,9)
]);

export function draconicSpellsForLevel(level,subclassId="draconic-sorcery"){
  try{
    const value=Number(level);if(!Number.isInteger(value)||value<1||value>20)throw new Error(`Unsupported Sorcerer level ${level}.`);
    if(subclassId!=="draconic-sorcery"||value<3)return Object.freeze([]);
    return Object.freeze(DRACONIC_SPELLS_2024.filter(item=>value>=item.unlockLevel));
  }catch(error){console.error("[sorcerer-draconic-spells] level lookup failed",error);throw error;}
}
