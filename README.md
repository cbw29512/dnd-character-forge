# D&D Character Forge

Accuracy-first pre-generated character website. Every configurable field defaults to **Random**; anything the user selects becomes a generation constraint, and the engine legally fills the rest.

## Product rules
- **RAW mode:** strictly RAW. Homebrew can never leak into a RAW character.
- **Homebrew mode:** RAW may be extended by explicitly selected structured Homebrew.
- Derived values are recalculated from source mechanics rather than guessed constants.
- Invalid or unsupported combinations fail closed instead of rendering a character.
- The 2024 RAW pools are scoped to **SRD 5.2.1**, not the broader Player's Handbook spell list.
- Duplicate rules choices, RAW records, spell choices, HTML IDs, Homebrew mechanics, and saved pregen mechanics are protected by validation/fingerprinting.

## Rule-proof PDF standard
A finished Character Forge character is intended to be something a player can print, save as PDF, share, and defend at a rules-heavy table.

- PDF/print export is allowed only after character validation passes.
- RAW sheets carry a structured **Rules Audit** showing the SRD boundary, source mode, selected character mechanics, and validation checks.
- RAW audit integrity explicitly requires zero Homebrew mechanics.
- Homebrew sheets disclose Homebrew mode instead of presenting themselves as RAW.
- Every supported core identity choice and every rendered play-reference mechanic must resolve to verified SRD version + printed-page provenance. Missing provenance fails closed instead of producing an uncited audited sheet.
- Source metadata is stored separately from mechanical rules data so citation maintenance cannot silently alter character math.
- The print stylesheet targets US Letter, preserves intentional sheet colors, and protects important reference/audit cards from awkward page splitting where the browser supports it.
- The export document title is generated from the character name, level, class, and subclass to produce a useful default PDF filename.
- Unsupported rules remain unavailable rather than being filled with unverified assumptions.

The Rules Audit is a provenance and validation report for Character Forge's **verified SRD slice**. Core species, background, class, subclass, spellcasting, feature, fighting-style, feat, and Weapon Mastery references in the current slice carry source locators to the official SRD PDFs. New supported mechanics must add provenance before the quality gate can pass.

## Current verified slice
### RAW 2014 / SRD 5.1
- Human / Acolyte
- Fighter / Champion, **levels 1–20**
- Wizard / School of Evocation, **levels 1–20**
- Cleric / Life Domain, **levels 1–20**
- Rogue / Thief, **levels 1–20**

### RAW 2024 / SRD 5.2.1
- **All nine SRD species:** Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling
- **All four SRD backgrounds:** Acolyte, Criminal, Sage, Soldier
- Fighter / Champion, **levels 1–20**
- Wizard / Evoker, **levels 1–20**
- Cleric / Life Domain, **levels 1–20**
- Rogue / Thief, **levels 1–20**

The level picker is class-aware: 2024 Fighter, Wizard, Cleric, and Rogue expose levels 1–20; 2014 Fighter, Wizard, Cleric, and Rogue also expose levels 1–20.

## 2024 species vertical slice
- Species-specific choices are structured state rather than display text: Dragonborn ancestry, Elf lineage/Keen Senses/spell ability, Gnome lineage/spell ability, Goliath Giant Ancestry, Human size/Skillful choice, and Tiefling size/legacy/spell ability.
- The Forge UI exposes these as **Random-by-default** controls only when the selected species has an actual choice to make.
- Saved pregens reopen with the same lineage, ancestry, legacy, size, skill, and spellcasting-ability constraints.
- Character headers and Rules Audits show resolved identities such as `Elf — Wood Elf`, `Dragonborn — Red`, or `Tiefling — Infernal`.
- Dragonborn Breath Weapon derives save DC, Proficiency Bonus uses, damage type, and level scaling; Draconic Flight is unavailable before level 5.
- Dwarven Toughness adds exactly one maximum Hit Point per character level and is independently recalculated after final Constitution changes.
- Drow Darkvision, Wood Elf Speed, Keen Senses, lineage magic, Gnome lineage magic, all six Goliath ancestry benefits, Large Form, Halfling traits, Human Skillful/Versatile, Orc traits, and Tiefling legacy magic are represented as playable references.
- Species choices and variable Small/Medium size participate in mechanical fingerprints so mechanically different pregens do not collapse as duplicates.
- Repeated trait names such as **Darkvision** resolve to the actual species rule page instead of a generic citation.
- Every displayed species rule in this slice resolves to the official SRD 5.2.1 printed species pages 84–86 or fails closed.

**Current species scope note:** Human Versatile draws from Character Forge's currently verified generic Origin-feat pool. Magic Initiate (Cleric) and Magic Initiate (Wizard) are implemented for the SRD backgrounds that require them, while remaining dependency expansion is kept fail-closed. Species-granted spell names and availability are audited here, while the broader full-spell-description reference layer continues to expand separately.

## 2024 background vertical slice
- All four SRD 5.2.1 backgrounds are encoded from printed page 83: Acolyte, Criminal, Sage, and Soldier.
- Background ability-score choices, two fixed skill proficiencies, Origin feat, tool proficiency, and starting equipment are structured RAW data.
- Acolyte grants **Magic Initiate (Cleric)** and Sage grants **Magic Initiate (Wizard)**. Each resolves two distinct cantrips, one level-1 spell, and an Intelligence/Wisdom/Charisma spellcasting ability.
- Magic Initiate's level-1 spell is always prepared, has one free casting per Long Rest, and may also be cast using spell slots. Off-list spells and duplicate cantrip selections fail closed.
- The finished character sheet has a dedicated **Origin Magic** block showing spell list, chosen ability, current save DC, spell attack bonus, the two cantrips, and the level-1 spell.
- Background tool proficiencies are explicit finished-character state and are printed on the character sheet.
- Soldier resolves “one kind of Gaming Set” to an actual SRD equipment choice—Dice Set, Dragonchess Set, Playing Card Set, or Three-Dragon Ante Set—instead of leaving a generic placeholder on the character.
- Background-specific Random-by-default controls appear only when a background has unresolved choices. Saved pregens reopen with the same Magic Initiate or Gaming Set constraints.
- Background choices, tool proficiencies, and Magic Initiate state participate in saved-pregen mechanical fingerprints.
- Background identity cites SRD 5.2.1 p.83; Magic Initiate references cite p.87.

## 2014 Fighter / Champion vertical slice
- Complete level 1–20 Fighter progression: Second Wind, Action Surge, seven Ability Score Improvement opportunities, Extra Attack progression, Indomitable, and four attacks per Attack action at level 20.
- Complete Champion progression in the SRD slice: Improved Critical, Remarkable Athlete, Additional Fighting Style, Superior Critical, and Survivor.
- Edition-specific rules remain isolated: 2014 Fighter has no Weapon Mastery, no Epic Boon, no 2024 Champion Initiative Advantage, and no Fighter-level bonus added to Indomitable rerolls.
- Champion's second Fighting Style arrives at level 10 in 2014, not level 7 as in 2024.
- High-level 2014 Fighter references carry SRD 5.1 printed-page provenance and fail closed if a required locator is missing.

## 2014 Wizard / School of Evocation vertical slice
- Complete Wizard progression through level 20, including the SRD cantrip table, spell slots through level 9, five Ability Score Improvement opportunities at levels 4, 8, 12, 16, and 19, and Intelligence-based preparation.
- The 2014 Wizard spellbook remains acquisition-based: six starting level-1 spells and two Wizard spells gained at every later Wizard level. Fixed spellbook choices must be historically acquirable at the level when they enter the book.
- The complete SRD 5.1 Wizard spell-name catalog through spell level 9 is available for legal spellbook, preparation, Spell Mastery, and Signature Spell generation.
- School of Evocation remains edition-specific: Evocation Savant and Sculpt Spells at 2, Potent Cantrip at 6, Empowered Evocation at 10, and Overchannel at 14.
- **Spell Mastery** at 18 selects one level-1 and one level-2 Wizard spell from the actual spellbook. In 2014 the mastered spells still count against the normal prepared-spell total; while prepared, each can be cast at its lowest level without a slot, and the choices can be replaced after 8 hours of study.
- **Signature Spells** at 20 selects two distinct level-3 spells from the actual spellbook. They are always prepared without consuming the normal prepared count and each receives its own free level-3 casting per Short or Long Rest.
- 2024-only Wizard state such as Scholar, Memorize Spell, and Epic Boon is absent from 2014 characters and the Quick Turn panel is regression-locked against cross-edition wording.
- High-level Wizard and School of Evocation references are sourced to the SRD 5.1 Wizard/Evocation pages; missing provenance blocks audited output.
- The real-browser PDF gate physically prints the level-20 2014 School of Evocation packet and verifies every generated spell and active rules reference survives the final Letter PDF.

## 2014 Cleric / Life Domain vertical slice
- Complete Cleric progression through level 20: exact SRD cantrip counts, spell slots through level 9, five Ability Score Improvement opportunities at levels 4, 8, 12, 16, and 19, and normal prepared spells equal to Cleric level + final Wisdom modifier (minimum 1).
- Channel Divinity is edition-specific: one use at levels 2–5, two at 6–17, three at 18–20, with all expended uses restored after a Short or Long Rest.
- Destroy Undead progresses at the exact SRD thresholds: CR 1/2 at 5, CR 1 at 8, CR 2 at 11, CR 3 at 14, and CR 4 at 17.
- **Divine Intervention** starts at 10 with percentile success at or below Cleric level, locks for 7 days after success, returns after a Long Rest on failure, and becomes automatic at level 20.
- Life Domain always-prepared spells progress through Bless/Cure Wounds, Lesser Restoration/Spiritual Weapon, Beacon of Hope/Revivify, Death Ward/Guardian of Faith, and Mass Cure Wounds/Raise Dead without consuming normal prepared slots.
- Life Domain progression includes Heavy Armor proficiency, Disciple of Life, Preserve Life, Blessed Healer at 6, Divine Strike at 8 with its 2d8 upgrade at 14, and Supreme Healing at 17.
- The 2014 Cleric catalog is locked name-for-name to the **105-spell SRD 5.1 Cleric list** across spell levels 0–9. The PDF spell appendix cites the official Cleric spell-list pages **106–107**.
- 2024-only Cleric systems—Divine Order, Divine Spark, Blessed Strikes, Epic Boon, and Greater Divine Intervention—are explicitly rejected by 2014 validation.
- The real-browser PDF gate physically prints the level-20 2014 Life Domain packet and requires all 40 generated spell records, every active rule reference, and the SRD 5.1 spell-list source range to survive the final Letter PDF.

## 2014 Rogue / Thief vertical slice
- Complete Rogue progression through level 20, including Sneak Attack scaling from 1d6 through 10d6 and six Ability Score Improvement opportunities at levels 4, 8, 10, 12, 16, and 19.
- Expertise begins with two legal choices at level 1 and expands to four at level 6. SRD 5.1 permits proficient skills and Thieves’ Tools; Character Forge now generates that full legal pool, validates the combined choice count, discloses tool Expertise in browser/PDF Rogue Resources, and fingerprints the exact Expertise allocation.
- **Cunning Action** arrives at 2, **Uncanny Dodge** at 5, **Evasion** at 7, and the legacy **Reliable Talent** at 11.
- **Blindsense** arrives at 14 with its 10-foot, able-to-hear requirement. **Slippery Mind** at 15 grants Wisdom saving-throw proficiency only; it does not borrow 2024's Charisma-save proficiency.
- **Elusive** arrives at 18 and **Stroke of Luck** at 20 with both legacy modes: convert a missed in-range attack to a hit, or treat a failed ability-check d20 as 20. It refreshes after a Short or Long Rest.
- Thief progression is edition-specific: Fast Hands and Second-Story Work at 3, Supreme Sneak at 9, Use Magic Device at 13, and Thief’s Reflexes at 17 with a second first-round turn at Initiative minus 10 when not surprised.
- Legacy Use Magic Device uses the SRD 5.1 rule that ignores class, race, and level requirements on magic-item use; 2024 attunement/charge/Spell Scroll mechanics are not imported backward.
- 2014 Rogue has no Weapon Mastery, Steady Aim, Cunning Strike, Improved Cunning Strike, Devious Strikes, or Epic Boon. Validation explicitly rejects those states if they leak into a legacy character.
- Rogue/Thief rules and identity cite SRD 5.1 pp.39–41. The real-browser PDF gate physically prints the level-20 Thief packet and verifies the legacy feature set survives while 2024-only Rogue controls remain absent.

## 2024 Fighter / Champion vertical slice
- Complete level 1–20 Fighter progression: Second Wind, Weapon Mastery, Action Surge, Tactical Mind, six Ability Score Improvement opportunities, Extra Attack progression, Tactical Shift, Indomitable, Tactical Master, Studied Attacks, Epic Boon, and four attacks per Attack action at level 20.
- Complete Champion progression in the SRD slice: Improved Critical, Remarkable Athlete, Additional Fighting Style, Heroic Warrior, Superior Critical, and Survivor.
- Level 19 uses the SRD-recommended **Boon of Combat Prowess**, including its legal +1 ability adjustment with a maximum of 30 and its play-reference effect.
- Fighter resources are represented as structured progression state and independently regression-validated against the level table.
- The character sheet shows current attacks per Attack action, critical range, Second Wind uses, Action Surge uses, Indomitable uses, mastery count, both Champion Fighting Styles when applicable, and Initiative Advantage.
- High-level Fighter references fail closed without verified SRD provenance.

## 2024 Wizard / Evoker vertical slice
- Complete Wizard class-table progression through level 20: cantrips, normal prepared-spell counts, spell slots through 9th level, four Ability Score Improvement opportunities, and the level-19 Epic Boon.
- The spellbook models actual acquisition history: six level-1 starting spells, two Wizard spells per later level, two initial Evocation Savant spells, and one additional Evocation spell at each later new spell-slot level through 9th-level spells.
- The complete SRD 5.2.1 Wizard spell-name pool through level 9 is available for legal spellbook/preparation generation and constraint validation.
- Evoker progression includes Potent Cantrip, Sculpt Spells at 6, Empowered Evocation at 10, and Overchannel at 14 with current character math in its play references.
- **Spell Mastery** at 18 selects one level-1 and one level-2 spell from the actual spellbook with an Action casting time. Both are always prepared and do not consume normal prepared slots. Non-Action choices such as Shield or Misty Step fail closed.
- Level 19 uses the SRD-recommended **Boon of Spell Recall**, including the legal +1 Intelligence/Wisdom/Charisma adjustment, maximum 30, and the level-1–4 spell-slot recall mechanic.
- **Signature Spells** at 20 selects two distinct level-3 spells from the actual spellbook. They are always prepared, do not consume normal prepared slots, and carry their free-cast refresh rule in the play reference.
- Spell Mastery and Signature Spells have dedicated Random-by-default picker controls at the levels where they become available and survive saved-pregen reopen.
- A level-20 Evoker has 25 normal prepared spells plus four feature-granted always-prepared spells; the two sets are independently validated not to overlap.
- The character sheet includes a compact Wizard Resources block and groups the large spellbook by spell level for practical PDF use.
- Wizard class/capstone features cite SRD 5.2.1 pp.77–79, Evoker features cite p.82, and Boon of Spell Recall cites p.88.

**Wizard reference scope note:** this milestone completes Wizard/Evoker mechanics, legal spell access, spellbook history, preparation, slots, class/subclass features, and source-backed feature references through level 20. Full structured description cards for every level-1–9 Wizard spell remain a separate reference-content expansion; the Forge does not claim those missing descriptions are complete.

## 2024 Cleric / Life Domain vertical slice
- Complete Cleric class-table progression through level 20: cantrips, normal prepared-spell counts, spell slots through 9th level, Channel Divinity uses, Divine Spark scaling, four Ability Score Improvement opportunities, and the level-19 Epic Boon.
- The complete SRD 5.2.1 Cleric spell-name pool through level 9 is available for legal preparation generation and constraint validation.
- **Divine Order** is structured Random-by-default state. Protector grants Martial weapon proficiency and Heavy armor training; Thaumaturge grants the extra Cleric cantrip and the Wisdom bonus to Arcana/Religion checks. An extra fixed cantrip can legally constrain a Random Divine Order to Thaumaturge; an incompatible fixed Protector choice fails closed.
- Life Domain always-prepared spells progress through Aid, Bless, Cure Wounds, Lesser Restoration, Mass Healing Word, Revivify, Aura of Life, Death Ward, Greater Restoration, and Mass Cure Wounds without consuming the normal prepared count.
- Life Domain progression includes Disciple of Life, Preserve Life, Blessed Healer at 6, and Supreme Healing at 17.
- **Blessed Strikes** at 7 is a persisted Random-by-default choice between Divine Strike and Potent Spellcasting. Improved Blessed Strikes at 14 renders the correct upgrade for the resolved choice.
- **Divine Intervention** at 10 is represented correctly as an at-use choice of a qualifying Cleric spell rather than incorrectly freezing one spell into character creation.
- Level 19 uses the SRD-recommended **Boon of Fate**, including its legal +1 ability adjustment with a maximum of 30 and Improve Fate's 2d4 D20-Test modifier.
- **Greater Divine Intervention** at 20 exposes Wish and the 2d4-Long-Rest Divine Intervention lockout after using Wish.
- The character sheet includes a compact Cleric Resources block and groups both normal prepared and Life Domain always-prepared spells by spell level for practical PDF use.
- Cleric class features cite SRD 5.2.1 pp.36–38, Life Domain features cite p.40, and Boon of Fate cites p.88.

**Cleric reference scope note:** this milestone completes Cleric/Life Domain mechanics, legal spell access, preparation, slots, class/subclass features, and source-backed feature references through level 20. The separate structured spell-description-card layer remains partial; high-level spells still appear as legal, level-grouped spell names even when a dedicated detailed reference card has not yet been authored.

## 2024 Rogue / Thief vertical slice
- Complete Rogue level 1–20 progression, including Sneak Attack scaling from 1d6 through 10d6, five Ability Score Improvement opportunities, and the level-19 Epic Boon.
- Expertise starts with two proficient skills at level 1 and expands to four total at level 6; the generated sheet marks the actual Expertise choices and recalculates their bonuses.
- Rogue Weapon Mastery tracks two chosen weapons and renders both friendly mastery-property references and the Rogue-specific Long Rest replacement rule.
- **Cunning Action** arrives at 2 and **Steady Aim** at 3 with playable action/timing references.
- **Cunning Strike** at 5 derives its save DC from 8 + Dexterity modifier + Proficiency Bonus and exposes the currently legal effects, Sneak Attack die costs, save types, and the Poison option's Poisoner's Kit-on-person requirement.
- **Evasion** and **Reliable Talent** arrive at 7; Reliable Talent is surfaced in the Rogue Resources block when active.
- Thief progression is encoded at the exact SRD levels: Fast Hands and Second-Story Work at 3, Supreme Sneak / Stealth Attack at 9, Use Magic Device at 13, and Thief's Reflexes at 17.
- **Improved Cunning Strike** at 11 permits up to two effects; **Devious Strikes** at 14 adds Daze, Knock Out, and Obscure with exact costs and save types.
- **Slippery Mind** at 15 adds Wisdom and Charisma saving throw proficiency and the finished save bonuses are recalculated from final ability scores and Proficiency Bonus.
- **Elusive** arrives at 18, level 19 uses **Boon of the Night Spirit** with its legal +1 ability increase/maximum 30, and **Stroke of Luck** arrives at 20.
- The character sheet has a dedicated **Rogue Resources** block showing current Sneak Attack dice, Expertise count, mastery count, Cunning Strike DC, effects allowed per Sneak Attack, Reliable Talent state, and playable details for every currently legal Cunning Strike option.
- Rogue class/features cite SRD 5.2.1 pp.61–63, Thief features cite p.64, Boon of the Night Spirit cites p.88, and mastery properties cite p.90.

## Playable character sheet
- Core traits/features render concise action/resource/effect cards with SRD source locators.
- Fighter sheets include a compact Fighter Resources block so current combat resources do not have to be reconstructed from feature prose.
- Wizard sheets include compact resources for spellbook size, normal/always-prepared counts, Arcane Recovery, Spell Mastery, and Signature Spells; high-level spellbooks are grouped by spell level instead of rendered as one giant paragraph.
- Cleric sheets include current Channel Divinity, normal prepared spells, and Life Domain always-prepared spells; 2024 sheets additionally expose Divine Order, Divine Spark, and Blessed Strikes, while 2014 sheets expose Destroy Undead and Divine Intervention without cross-edition mechanics.
- Rogue sheets include current Sneak Attack dice and Expertise allocation; 2024 additionally shows mastery count, Cunning Strike DC/effect capacity, and current Cunning Strike effects, while 2014 can show Thieves’ Tools as an Expertise choice without importing 2024 mechanics.
- Background tool proficiencies and Magic Initiate Origin Magic are visible rather than hidden in source data.
- 2024 Wizard and Cleric cantrips render structured SRD reference cards with casting time, range, components, duration, resolution, concise effect, and current-level scaling.
- Each structured 2024 spell reference records its SRD 5.2.1 source page for audit traceability.
- Current-level cantrip scaling is calculated for damage, True Strike extra damage, and Spare the Dying range.
- Weapon Mastery choices display friendly weapon/property mechanics and cite the SRD mastery-property page instead of exposing raw IDs.

## SRD spell boundary
The 2024 Wizard and Cleric spell-name pools are regression-tested as SRD 5.2.1 content. **Elementalism is included; Thunderclap is excluded** from the Wizard cantrip pool because Thunderclap is not a Wizard spell entry in SRD 5.2.1. The broader 2024 Player's Handbook/Basic Rules list is not used as the site's redistributable RAW spell pool.

The 2014 Wizard and Cleric spell-name pools are independently scoped to SRD 5.1. The 2014 Cleric list is regression-locked name-for-name at 105 entries and its PDF appendix identifies the official class-list source as SRD 5.1 printed pages 106–107; 2024-only Cleric-list additions are not admitted into the legacy pool.

## Spell picker
- Wizard and Cleric support fixed cantrip/prepared choices with Random filling every remaining legal choice.
- Wizard keeps spellbook and prepared spells separate and rejects impossible acquisition histories.
- Level-18+ Wizard exposes legal Spell Mastery constraints; level 20 exposes Signature Spell constraints. Unspecified capstone choices remain Random.
- If Subclass remains Random but only one verified legal subclass exists, spell-picker limits resolve the same subclass the generator will use, preventing spellbook-count drift.
- Cleric has no spellbook; Life Domain spells are always prepared and never consume normal prepared slots.
- 2014 Cleric prepared-spell count follows final Wisdom; the picker labels this as a dynamic WIS-based limit and the generator fails closed if fixed selections exceed the finished character's legal count. 2024 follows the Cleric class table through level 20.
- A fixed 2024 Cleric cantrip beyond the class-table base count constrains Divine Order to **Thaumaturge**, because that order grants the extra cantrip.

## Libraries
The browser-local foundation includes My Pregens and My Homebrew. SHA-256 mechanical fingerprints block renamed duplicates, and saved entries can be opened/used back in Forge. Fingerprints include resolved species choices and size, background choices/tool proficiencies/Origin Magic, Expertise allocation, Cleric Divine Order/Blessed Strikes choices, and class-specific high-level mechanical state. Wizard capstone spell choices and Cleric class choices are restored when a saved pregen is reopened.

## Quality gate
Pull requests and pushes to `main` run JavaScript syntax checks, rules regression tests, the 1,000-character torture test, spell progression/picker tests, RAW data/spell duplicate checks, quick-reference completeness tests, exact provenance/page tests, both-edition Fighter level-1–20 breakpoint tests, complete 2024 species/lineage/ancestry tests, complete 2024 background/Magic Initiate tests, exhaustive 2014 Wizard/School of Evocation level-1–20 tests, exhaustive 2014 Cleric/Life Domain level-1–20 tests with all 105 spell names locked to SRD 5.1, exhaustive 2014 Rogue/Thief level-1–20 and tool-Expertise tests, exhaustive 2024 Wizard/Evoker level-1–20 tests, exhaustive 2024 Cleric/Life Domain level-1–20 tests, exhaustive 2024 Rogue/Thief level-1–20 tests, cross-edition Quick Turn leakage tests, species/background/class-choice/Wizard UI contract tests, PDF/audit contract tests, website integrity checks, and a real headless-Chrome gate that physically prints the supported level-20 premium packets and verifies their contents.

## Run locally
`python -m http.server 8080`

## Test
`npm test`

## Deployment
GitHub Pages publishes from `main` / repository root.

## Rules note
The 2024 Evocation Savant timing around the subclass's level-3 spell grants and its recurring new-slot-level grant is publicly documented in the website's Rules Notes. Character Forge currently treats the recurring grant as applying to later new spell-slot levels after the subclass is gained, beginning at Wizard 5.

## License attribution
This project uses material from SRD 5.1 and SRD 5.2.1 by Wizards of the Coast LLC under CC BY 4.0. Final public-release attribution should be checked against the current official SRD licensing guidance.
