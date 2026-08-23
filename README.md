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
- Criminal / Soldier backgrounds
- Fighter / Champion, **levels 1–20**
- Wizard / Evoker, levels 1–5
- Cleric / Life Domain, levels 1–5

The level picker is class-aware in both editions: Fighter exposes levels 1–20; classes whose verified implementation still ends at level 5 never offer unsupported higher levels.

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

**Current scope note:** Human Versatile draws from Character Forge's currently verified Origin-feat pool. Completing the entire SRD Origin-feat catalog is a separate rules-content expansion; unsupported feats are not invented or silently substituted. Species-granted spell names and availability are audited here, while the broader full-spell-description reference layer continues to expand separately.

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

## Playable character sheet
- Core traits/features render concise action/resource/effect cards with SRD source locators.
- Fighter sheets include a compact Fighter Resources block so current combat resources do not have to be reconstructed from feature prose.
- 2024 Wizard and Cleric cantrips render structured SRD reference cards with casting time, range, components, duration, resolution, concise effect, and current-level scaling.
- Each 2024 cantrip reference records its SRD 5.2.1 source page for audit traceability.
- Current-level cantrip scaling is calculated for damage, True Strike extra damage, and Spare the Dying range.
- Weapon Mastery choices display friendly weapon/property mechanics and cite the SRD mastery-property page instead of exposing raw IDs.
- Level 1+ spell descriptions are the next reference layer; spell DC, attack, slots, preparation, always-prepared spells, and Wizard spellbook structure are already displayed.

## SRD spell boundary
The 2024 Wizard cantrip pool is regression-tested against the SRD 5.2.1 Wizard spell list. **Elementalism is included; Thunderclap is excluded** because Thunderclap is not a Wizard spell entry in SRD 5.2.1. The broader 2024 Player's Handbook/Basic Rules list is not used as the site's redistributable RAW spell pool.

## Spell picker
- Wizard and Cleric support fixed cantrip/prepared choices with Random filling every remaining legal choice.
- Wizard keeps spellbook and prepared spells separate and rejects impossible acquisition histories.
- Cleric has no spellbook; Life Domain spells are always prepared and never consume normal prepared slots.
- 2014 Cleric prepared-spell count follows final Wisdom; 2024 follows the Cleric class table.
- A fourth fixed 2024 Cleric cantrip constrains Divine Order to **Thaumaturge**, because that order grants the extra cantrip.

## Libraries
The browser-local foundation includes My Pregens and My Homebrew. SHA-256 mechanical fingerprints block renamed duplicates, and saved entries can be opened/used back in Forge. Fingerprints include resolved species choices and size plus Fighter-specific high-level state where applicable.

## Quality gate
Pull requests and pushes to `main` run JavaScript syntax checks, rules regression tests, the 1,000-character torture test, spell progression/picker tests, exact SRD cantrip-list tests, RAW data/spell duplicate checks, quick-reference completeness tests, exact provenance/page tests, both-edition Fighter level-1–20 breakpoint tests, complete 2024 species/lineage/ancestry tests, species UI contract tests, PDF/audit contract tests, and website integrity checks.

## Run locally
`python -m http.server 8080`

## Test
`npm test`

## Deployment
GitHub Pages publishes from `main` / repository root.

## Rules note
The 2024 Evocation Savant timing around the subclass's level-3 spell grants and its recurring new-slot-level grant is publicly documented in the website's Rules Notes. Character Forge currently treats the recurring grant as applying to later new spell-slot levels after the subclass is gained.

## License attribution
This project uses material from SRD 5.1 and SRD 5.2.1 by Wizards of the Coast LLC under CC BY 4.0. Final public-release attribution should be checked against the current official SRD licensing guidance.
