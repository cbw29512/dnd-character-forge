const r=(category,timing,text)=>({category,timing,text});
export const REFERENCE_2014={
  species:{
    "Ability Score Increase":r("Human","Passive","Already applied: all six ability scores increased by 1."),
    "Extra Language":r("Human","Passive","Your additional Human language is already included in Languages.")
  },
  background:{"Shelter of the Faithful":r("Acolyte","Downtime","Temples of your faith can provide free care and healing; you can receive modest personal support and nonhazardous temple assistance while in good standing.")},
  style:{
    "Defense":r("Fighting Style","Passive","While wearing armor, gain +1 AC; this bonus is already included above."),
    "Archery":r("Fighting Style","Passive","Gain +2 on attack rolls made with ranged weapons; this is already included in ranged attacks above."),
    "Great Weapon Fighting":r("Fighting Style","On damage","When a qualifying two-handed or versatile melee weapon damage die shows 1 or 2, reroll that die once and use the new roll.")
  },
  feature:{
    "Action Surge":r("Fighter","On your turn","Take one additional action. One use; regain it after a Short or Long Rest."),
    "Improved Critical":r("Champion","Passive","Your weapon attacks score a Critical Hit on a d20 roll of 19 or 20."),
    "Extra Attack":r("Class","Attack action","Attack twice instead of once when you take the Attack action."),
    "Ability Score Improvement":r("Class","Applied","The generated level-4 ability increase is already included in the ability scores above."),
    "Evocation Savant":r("School of Evocation","Spellbook","Copying an Evocation spell into your spellbook takes half the normal time and gold."),
    "Sculpt Spells":r("School of Evocation","When casting","For an Evocation spell that affects other creatures you can see, protect up to 1 + spell level creatures. They automatically succeed on saves and take no damage when a successful save would normally halve damage."),
    "Divine Domain: Life Domain":r("Life Domain","Passive","Your Life Domain spells are always prepared and do not count against your normal prepared-spell total."),
    "Bonus Proficiency: Heavy Armor":r("Life Domain","Passive","You are proficient with Heavy armor; the generated armor and AC already account for this."),
    "Disciple of Life":r("Life Domain","Healing spell","When a level 1+ spell restores Hit Points, the target regains an extra 2 + the spell's level."),
    "Channel Divinity (1/rest)":r("Cleric","Resource","One Channel Divinity use fuels Turn Undead or Preserve Life; regain it after a Short or Long Rest."),
    "Turn Undead":r("Cleric","Action","Undead within 30 ft that can see or hear you make a Wisdom save. A failure turns the creature for 1 minute or until damaged: it must move away, cannot willingly come within 30 ft or take Reactions, and normally can only Dash or escape movement restraints; with nowhere to move, it can Dodge."),
    "Destroy Undead (CR 1/2)":r("Cleric","Turn Undead","An Undead of CR 1/2 or lower that fails its save against Turn Undead is destroyed instead."),
    "Life Domain":r("Life Domain","Passive","Life Domain features and always-prepared spells are reflected elsewhere on this sheet.")
  }
};
export const REFERENCE_2024={
  species:{
    "Resourceful":r("Human","Long Rest","After you finish a Long Rest, gain Heroic Inspiration."),
    "Skillful":r("Human","Passive","Your extra Human skill proficiency is already included in Skills."),
    "Versatile":r("Human","Passive","Your extra Origin feat is listed in your feat/reference entries.")
  },
  feat:{
    "Alert":r("Origin Feat","Initiative","Add your Proficiency Bonus to Initiative; already included above. Immediately after Initiative, you may swap with a willing ally in the same combat if neither of you is Incapacitated."),
    "Savage Attacker":r("Origin Feat","Once per turn","When you hit with a weapon, roll the weapon's damage dice twice and use either roll."),
    "Skilled":r("Origin Feat","Passive","Three chosen skill proficiencies are already included in Skills.")
  },
  style:{
    "Defense":r("Fighting Style","Passive","While wearing Light, Medium, or Heavy armor, gain +1 AC; already included above."),
    "Archery":r("Fighting Style","Passive","Gain +2 on attack rolls with ranged weapons; already included in ranged attacks above."),
    "Great Weapon Fighting":r("Fighting Style","On damage","For a qualifying two-handed or versatile melee weapon, treat a weapon damage die result of 1 or 2 as 3."),
    "Two-Weapon Fighting":r("Fighting Style","Light extra attack","Add your ability modifier to the damage of the extra attack from the Light property when it would otherwise be omitted.")
  },
  feature:{
    "Action Surge":r("Fighter","On your turn","Take one additional action other than the Magic action. One use; regain it after a Short or Long Rest."),
    "Tactical Mind":r("Fighter","After failed check","Spend a Second Wind use to add 1d10 to the failed ability check. If it still fails, that Second Wind use is not spent."),
    "Improved Critical":r("Champion","Passive","Weapon and Unarmed Strike attack rolls score a Critical Hit on a d20 roll of 19 or 20."),
    "Remarkable Athlete":r("Champion","Passive / after crit","You have Advantage on Initiative and Athletics checks. After a Critical Hit, move up to half your Speed without provoking Opportunity Attacks."),
    "Extra Attack":r("Class","Attack action","Attack twice instead of once when you take the Attack action."),
    "Ability Score Improvement":r("Class","Applied","The generated level-4 ability increase is already included in the ability scores above."),
    "Ritual Adept":r("Wizard","Ritual","A Ritual-tag spell in your spellbook can be cast as a Ritual without being prepared, but you must read it from the spellbook."),
    "Evocation Savant":r("Evoker","Spellbook","The free Evocation spells from this feature are already included in your spellbook; later grants follow the Forge Rules Note for the published timing ambiguity."),
    "Potent Cantrip":r("Evoker","Damaging cantrip","If a damaging cantrip's attack misses or its target succeeds on the save, the target still takes half the cantrip's damage, with no additional effect."),
    "Memorize Spell":r("Wizard","After Short Rest","Replace one prepared level 1+ Wizard spell with another level 1+ spell from your spellbook."),
    "Divine Order: Protector":r("Cleric","Passive","You gain Martial weapon proficiency and Heavy armor training."),
    "Divine Order: Thaumaturge":r("Cleric","Passive","You know one extra Cleric cantrip. Add your Wisdom modifier (minimum +1) to Intelligence (Arcana) and Intelligence (Religion) checks; already included above."),
    "Channel Divinity (2 uses)":r("Cleric","Resource","Two uses fuel Divine Spark, Turn Undead, or a subclass option. Regain one use after a Short Rest and all uses after a Long Rest."),
    "Divine Spark":r("Cleric","Magic action","Choose another creature you can see within 30 ft. Roll 1d8 + Wisdom modifier to heal it, or force a Constitution save for that much Radiant or Necrotic damage; success takes half."),
    "Turn Undead":r("Cleric","Magic action","Each Undead you choose within 30 ft makes a Wisdom save. A failure makes it Frightened and Incapacitated for 1 minute and it tries to move as far from you as it can. The effect ends on that creature if it takes damage, or if you become Incapacitated or die."),
    "Life Domain":r("Life Domain","Passive","Life Domain spells shown above are always prepared and do not count against your normal prepared-spell total."),
    "Disciple of Life":r("Life Domain","Healing spell","When a spell cast with a spell slot restores Hit Points, add 2 + the slot's level to that creature's healing on the turn you cast it.")
  }
};
export const MASTERY_REFERENCE={
  Graze:r("Weapon Mastery","On a miss","Deal damage equal to the ability modifier used for the attack, of the weapon's damage type. Only that ability modifier can increase this Graze damage."),
  Nick:r("Weapon Mastery","Light extra attack","Make the Light property's extra attack as part of the Attack action instead of as a Bonus Action. This can happen only once per turn."),
  Push:r("Weapon Mastery","On hit","Push a Large or smaller target up to 10 feet straight away from you."),
  Sap:r("Weapon Mastery","On hit","The target has Disadvantage on its next attack roll before the start of your next turn."),
  Slow:r("Weapon Mastery","On hit + damage","Reduce the target's Speed by 10 feet until the start of your next turn. Multiple Slow effects do not stack."),
  Topple:r("Weapon Mastery","On hit","The target makes a Constitution save (DC 8 + attack ability modifier + Proficiency Bonus); on a failure, it is Prone."),
  Vex:r("Weapon Mastery","On hit + damage","Gain Advantage on your next attack roll against that target before the end of your next turn.")
};
