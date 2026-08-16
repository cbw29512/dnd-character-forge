# D&D Character Forge

Accuracy-first pre-generated character website. Every configurable field defaults to **Random**; anything the user selects or types becomes a generation constraint.

## Product rules
- **RAW mode:** strictly RAW. Homebrew is never allowed into a RAW character.
- **Homebrew mode:** RAW may be extended by explicitly selected structured Homebrew.
- Derived values are calculated from source mechanics rather than guessed constants.
- Invalid or unsupported combinations fail closed instead of rendering a character.
- The public UI is designed as a premium, simple web product rather than a developer-facing form.

## Current verified slice
- RAW 2014 / SRD 5.1: Human Fighter, Acolyte, Champion, levels 1–5.
- RAW 2024 / SRD 5.2.1: Human Fighter, Criminal/Soldier, Champion, levels 1–5.
- Homebrew mode: RAW plus structured homebrew ability modifiers.

This is deliberately a narrow vertical slice. Unsupported content is not guessed.

## Run
From the project directory: `python -m http.server 8080`

## Test
Run `npm test`.

## License attribution
This project uses material from SRD 5.1 and SRD 5.2.1 by Wizards of the Coast LLC under CC BY 4.0. Confirm the final required attribution language against the current official SRD source page before public release.
