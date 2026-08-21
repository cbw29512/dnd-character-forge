# D&D Character Forge

Accuracy-first RAW pre-generated character website. Every configurable field defaults to **Random**; anything the player selects becomes a hard generation constraint, and the engine legally fills the rest.

## Public product rule

Character Forge is **RAW-only**.

- **2014 mode** uses SRD 5.1 mechanics.
- **2024 mode** uses SRD 5.2.1 mechanics.
- Editions never mix inside one character.
- Homebrew is not exposed by the production Forge and is rejected by the generator.
- Derived values are recalculated from source mechanics rather than guessed constants.
- Invalid or unsupported combinations fail closed instead of rendering a character.
- Duplicate rules choices, RAW records, spell choices, HTML IDs, and saved pregen mechanics are protected by validation/fingerprinting.

The release requirements and state/data contract are locked in [`RAW_RELEASE_CONTRACT.md`](RAW_RELEASE_CONTRACT.md).

## Current verified slice

The branch is being expanded toward complete SRD coverage. Until a rules slice is encoded **and tested**, it remains unavailable in the UI.

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

## Generation model

1. The player chooses an edition.
2. Every mechanical field begins as `Random`.
3. Any player selection becomes fixed.
4. The generator chooses only from the remaining legal SRD pool.
5. Derived mechanics are calculated.
6. The completed character is validated.
7. A failed validation blocks display.

## Spell picker

- Wizard and Cleric support fixed cantrip/prepared choices with Random filling every remaining legal choice.
- Wizard keeps spellbook and prepared spells separate and rejects impossible acquisition histories.
- Cleric has no spellbook; Life Domain spells are always prepared and never consume normal prepared slots.
- 2014 Cleric prepared-spell count follows final Wisdom; 2024 follows the Cleric class table.
- A fourth fixed 2024 Cleric cantrip constrains Divine Order to **Thaumaturge**, because that order grants the extra cantrip.

## Playable character sheet

- Core traits/features render concise action/resource/effect references.
- 2024 Wizard and Cleric cantrips have structured SRD reference data with current-level scaling.
- 2024 Cleric level-1 spells have structured playable reference data.
- Weapon Mastery choices display weapon/property mechanics rather than raw IDs.
- Spell DC, spell attack, slots, preparation, always-prepared spells, and Wizard spellbook structure are derived and displayed.

## My Pregens

The browser-local library stores **RAW pregens only** in the production app. Mechanical SHA-256 fingerprints block exact renamed duplicates. Saved characters are checked again before they are opened in Forge.

## Quality gate

Pull requests and pushes to `main` run JavaScript syntax checks plus the rules/site regression suite. The existing suite covers generation torture tests, class spell progression, picker constraints, exact SRD spell-list checks, duplicate detection, reference completeness, licensing, math, and website integrity.

The production release gate is stricter: complete supported SRD coverage, levels 1–20, class/ruleset torture testing, mobile usability, and printable output must all pass before the completion PR leaves draft status.

## Run locally

`python -m http.server 8080`

## Test

`npm test`

## Deployment

GitHub Pages publishes from `main` / repository root. The RAW completion work remains isolated on its feature branch until the release contract passes.

## License attribution

This project uses material from SRD 5.1 and SRD 5.2.1 by Wizards of the Coast LLC under CC BY 4.0. The exact public attribution statements are regression-tested in the site.
