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
- Wizard / School of Evocation, levels 1–5
- Cleric / Life Domain, levels 1–5

### RAW 2024 / SRD 5.2.1
- **All nine SRD species:** Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling
- **All four SRD backgrounds:** Acolyte, Criminal, Sage, Soldier
- Fighter / Champion, **levels 1–20**
- Wizard / Evoker, **levels 1–20**
- Cleric / Life Domain, levels 1–5

The level picker is class-aware: 2024 Fighter and Wizard expose levels 1–20; 2014 Fighter exposes levels 1–20; classes whose verified implementation still ends at level 5 never offer unsupported higher levels.

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

## Playable character sheet
- Core traits/features render concise action/resource/effect cards with SRD source locators.
- Fighter sheets include a compact Fighter Resources block so current combat resources do not have to be reconstructed from feature prose.
- Wizard sheets include compact resources for spellbook size, normal/always-prepared counts, Arcane Recovery, Spell Mastery, and Signature Spells; high-level spellbooks are grouped by spell level instead of rendered as one giant paragraph.
- Background tool proficiencies and Magic Initiate Origin Magic are visible rather than hidden in source data.
- 2024 Wizard and Cleric cantrips render structured SRD reference cards with casting time, range, components, duration, resolution, concise effect, and current-level scaling.
- Each structured 2024 spell reference records its SRD 5.2.1 source page for audit traceability.
- Current-level cantrip scaling is calculated for damage, True Strike extra damage, and Spare the Dying range.
- Weapon Mastery choices display friendly weapon/property mechanics and cite the SRD mastery-property page instead of exposing raw IDs.

## SRD spell boundary
The 2024 Wizard spell pool is regression-tested as SRD 5.2.1 content. **Elementalism is included; Thunderclap is excluded** from the Wizard cantrip pool because Thunderclap is not a Wizard spell entry in SRD 5.2.1. The broader 2024 Player's Handbook/Basic Rules list is not used as the site's redistributable RAW spell pool.

## Spell picker
- Wizard and Cleric support fixed cantrip/prepared choices with Random filling every remaining legal choice.
- Wizard keeps spellbook and prepared spells separate and rejects impossible acquisition histories.
- Level-18+ Wizard exposes legal Spell Mastery constraints; level 20 exposes Signature Spell constraints. Unspecified capstone choices remain Random.
- If Subclass remains Random but only one verified legal subclass exists, spell-picker limits resolve the same subclass the generator will use, preventing spellbook-count drift.
- Cleric has no spellbook; Life Domain spells are always prepared and never consume normal prepared slots.
- 2014 Cleric prepared-spell count follows final Wisdom; 2024 follows the Cleric class table.
- A fourth fixed 2024 Cleric cantrip constrains Divine Order to **Thaumaturge**, because that order grants the extra cantrip.

## Libraries
The browser-local foundation includes My Pregens and My Homebrew. SHA-256 mechanical fingerprints block renamed duplicates, and saved entries can be opened/used back in Forge. Fingerprints include resolved species choices and size, background choices/tool proficiencies/Origin Magic, and class-specific high-level mechanical state. Wizard capstone spell choices are restored when a saved pregen is reopened.

## Quality gate
Pull requests and pushes to `main` run JavaScript syntax checks, rules regression tests, the 1,000-character torture test, spell progression/picker tests, RAW data/spell duplicate checks, quick-reference completeness tests, exact provenance/page tests, both-edition Fighter level-1–20 breakpoint tests, complete 2024 species/lineage/ancestry tests, complete 2024 background/Magic Initiate tests, exhaustive 2024 Wizard/Evoker level-1–20 tests, species/background/Wizard UI contract tests, PDF/audit contract tests, and website integrity checks.

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
