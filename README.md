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

The Rules Audit is a provenance and validation report for Character Forge's **verified SRD slice**. Core species, background, class, subclass, spellcasting, feature, fighting-style, feat, and Weapon Mastery references in the current slice now carry source locators to the official SRD PDFs. New supported mechanics must add provenance before the quality gate can pass.

## Current verified slice
### RAW 2014 / SRD 5.1
- Human / Acolyte
- Fighter / Champion, levels 1–5
- Wizard / School of Evocation, levels 1–5
- Cleric / Life Domain, levels 1–5

### RAW 2024 / SRD 5.2.1
- Human / Criminal / Soldier
- Fighter / Champion, levels 1–5
- Wizard / Evoker, levels 1–5
- Cleric / Life Domain, levels 1–5

## Playable character sheet
- Core traits/features render concise action/resource/effect cards with SRD source locators.
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
The browser-local foundation includes My Pregens and My Homebrew. SHA-256 mechanical fingerprints block renamed duplicates, and saved entries can be opened/used back in Forge.

## Quality gate
Pull requests and pushes to `main` run JavaScript syntax checks, rules regression tests, the 1,000-character torture test, spell progression/picker tests, exact SRD cantrip-list tests, RAW data/spell duplicate checks, quick-reference completeness tests, exact provenance/page tests, PDF/audit contract tests, and website integrity checks.

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
