# D&D Character Forge

Accuracy-first pre-generated character website. Every configurable field defaults to **Random**; anything the user selects becomes a generation constraint, and the engine legally fills the rest.

## Product rules
- **RAW mode:** strictly RAW. Homebrew can never leak into a RAW character.
- **Homebrew mode:** RAW may be extended by explicitly selected structured Homebrew.
- Derived values are recalculated from source mechanics rather than guessed constants.
- Invalid or unsupported combinations fail closed instead of rendering a character.
- Duplicate rules choices, RAW records, spell choices, HTML IDs, Homebrew mechanics, and saved pregen mechanics are protected by validation/fingerprinting.

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

## Spell picker
- Wizard and Cleric support fixed cantrip/prepared choices with Random filling every remaining legal choice.
- Wizard keeps spellbook and prepared spells separate and rejects impossible acquisition histories.
- Cleric has no spellbook; Life Domain spells are always prepared and never consume normal prepared slots.
- 2014 Cleric prepared-spell count follows final Wisdom; 2024 follows the Cleric class table.
- A fourth fixed 2024 Cleric cantrip constrains Divine Order to **Thaumaturge**, because that order grants the extra cantrip.

## Cleric rules modeled
- Wisdom spellcasting, d8 hit die, Wisdom/Charisma saves, Cleric skill list and starting gear.
- 2014 Life Domain at level 1, heavy armor, Disciple of Life, Preserve Life, Channel Divinity, and Destroy Undead through level 5.
- 2024 Divine Order, Channel Divinity / Divine Spark / Turn Undead, Life Domain at level 3, Sear Undead, and Thaumaturge's Arcana/Religion check bonus through level 5.
- Medium armor uses the RAW Dexterity cap.

## Libraries
The browser-local foundation includes My Pregens and My Homebrew. SHA-256 mechanical fingerprints block renamed duplicates, and saved entries can be opened/used back in Forge.

## Quality gate
Pull requests and pushes to `main` run JavaScript syntax checks, rules regression tests, the 1,000-character torture test, spell progression/picker tests, RAW data/spell duplicate checks, and website integrity checks.

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
