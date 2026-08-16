# D&D Character Forge

Accuracy-first pre-generated character website. Every configurable field defaults to **Random**; anything the user selects becomes a generation constraint, and the engine legally fills the rest.

## Product rules
- **RAW mode:** strictly RAW. Homebrew can never leak into a RAW character.
- **Homebrew mode:** RAW may be extended by explicitly selected structured Homebrew.
- Derived values are recalculated from source mechanics rather than guessed constants.
- Invalid or unsupported combinations fail closed instead of rendering a character.
- Duplicate rules choices, RAW records, spell choices, HTML IDs, Homebrew mechanics, and saved pregen mechanics are protected by validation/fingerprinting.
- The public UI is designed as a premium, simple web product rather than a developer-facing form.

## Current verified slice
### RAW 2014 / SRD 5.1
- Human
- Acolyte
- Fighter / Champion, levels 1–5
- Wizard / School of Evocation, levels 1–5

### RAW 2024 / SRD 5.2.1
- Human
- Criminal / Soldier
- Fighter / Champion, levels 1–5
- Wizard / Evoker, levels 1–5

## Wizard spell picker
- No spell choices: Forge randomizes the complete legal loadout.
- Some choices: those choices stay fixed and every remaining legal slot is randomized.
- Complete selection: no random fill for that bucket.
- Cantrips, spellbook, and prepared spells are modeled separately.
- Impossible historical spellbook choices, duplicates, illegal spell IDs, and excessive selections fail closed.
- 2014 prepared-spell count follows final Intelligence; 2024 follows the class table.

## Libraries
The current browser-local foundation includes:
- **My Pregens:** save/search/filter pregens; SHA-256 mechanical fingerprints block renamed duplicates.
- **My Homebrew:** structured ability-effect Homebrew; duplicate names and mechanically identical rename-only copies are blocked.

The storage adapter is intentionally separated from the UI so a shared community backend can replace localStorage later without rewriting the Forge.

## Quality gate
Every push to `main` runs GitHub Actions with:
- JavaScript syntax checks
- rules regression tests
- 1,000-character random-generation torture test
- Wizard spell progression / picker tests
- RAW data and spell-catalog duplicate checks
- website duplicate-ID and missing-local-asset checks

## Run locally
From the project directory:

```bash
python -m http.server 8080
```

## Test

```bash
npm test
```

## Deployment
GitHub Pages publishes from `main` / repository root.

## Rules note
The 2024 Evocation Savant timing around the subclass's level-3 spell grants and its recurring new-slot-level grant is publicly documented in the website's Rules Notes. Character Forge currently treats the recurring grant as applying to later new spell-slot levels after the subclass is gained.

## License attribution
This project uses material from SRD 5.1 and SRD 5.2.1 by Wizards of the Coast LLC under CC BY 4.0. Final public-release attribution should be checked against the current official SRD licensing guidance.
