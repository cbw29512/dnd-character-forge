# Character Forge Production Print V3

## Objective
Ship a production-ready printable character packet where every supported class has a structurally unique visual identity, the rules layer remains immutable, print readability is materially improved, and the premium export includes a complete character dossier in addition to the table-use sheet.

## Frozen mechanics boundary
This work is presentation-only. Do not change class calculations, spell selection, equipment legality, starting magic, attacks, saves, skills, resources, rules validation, provenance, or RAW audit logic.

Validated character data remains the single mechanical source of truth.

## Data schema

### `SheetCustomizationV3`
Presentation state stored at `character.presentation.sheetCustomization`.

- `packetMode`: `"deluxe" | "table"`
- `style`: `"ornate" | "classic" | "minimal"`
- `paper`: `"ivory" | "parchment" | "white"`
- `ornament`: `"rich" | "balanced" | "minimal"`
- `frame`: `"class" | "filigree" | "clean"`
- `printMode`: `"premium" | "ink-saver"`
- `portraitVisible`: boolean
- `portraitX`: number 0–100
- `portraitY`: number 0–100
- `portraitZoom`: number 100–165
- `portraitFilter`: `"natural" | "painted" | "grayscale"`

Default packet mode is `deluxe`. Table mode preserves the existing compact packet.

### `ExportProfileV3`
Derived presentation state only.

- `id`
- `caster`: boolean
- `packetMode`
- `tablePages`: 1 for martial / 2 for caster
- `dossierPages`: 1 in deluxe / 0 in table
- `maxPages`: `tablePages + dossierPages`

### `NarrativeDossier`
Generated flavor derived only from already-generated identity fields. It is never used by rules validation.

- `title`
- `subtitle`
- `disclaimer`: generated narrative flavor, not rules text
- `backstory`: 4–5 paragraphs
- `personality.trait`
- `personality.ideal`
- `personality.bond`
- `personality.flaw`
- `personality.mannerisms[]`
- `personality.likes[]`
- `personality.dislikes[]`
- `personality.fear`
- `personality.secret`
- `appearance[]`
- `combatNotes[]`
- `hooks[]`
- `roleplay.quote`
- `roleplay.guidance`

Narrative selection is deterministic from character identity so reprinting the same generated character does not silently rewrite its story.

### `ClassPresentationV3`
Selected only from `character.class.id` via the existing print-theme router.

Each supported class must provide unique:
- outer-frame language
- corner ornaments
- portrait geometry
- panel/header geometry
- major-stat geometry
- primary resource treatment
- dossier ornament treatment
- spell-page treatment where applicable

## State flow

```text
Forge state
  -> validated character
  -> presentation.sheetCustomization
  -> normalize customization
  -> derive export profile
  -> select class presentation
  -> build premium print model
  -> build deterministic narrative dossier
  -> render class sheet
  -> render spell page when applicable
  -> render dossier when packetMode=deluxe
  -> Chrome PDF gate
```

No presentation state may flow back into the rules generator.

## Production Definition of Done

1. All 12 supported classes are visually identifiable from the printed page without reading the class name.
2. Barbarian and Paladin are the visual gold standards: Barbarian uses obvious primal/axe/hide language; Paladin uses obvious oath/shield/cathedral language.
3. Every class has distinct frame, panel, stat, portrait, primary-resource, and dossier styling.
4. Premium default export is a Deluxe packet. A Table packet option remains available for compact use.
5. Martial Deluxe packets are exactly 2 US Letter pages: class sheet + dossier.
6. Caster/Half-caster Deluxe packets are exactly 3 US Letter pages: class sheet + spell page + dossier.
7. Table mode remains exactly 1 page for martial and 2 pages for caster/half-caster.
8. Page 1 remains combat-first and visually familiar, but does not read like a generic database report.
9. Core play text is readable at physical Letter size; critical combat text is not dependent on 4–5 pt typography.
10. Dossier contains a full generated backstory, personality, appearance, hooks, combat notes, and roleplay guidance.
11. Generated narrative is explicitly labeled as flavor and never presented as SRD/RAW rules text.
12. Portrait upload remains optional; class art is a production-safe fallback.
13. Ink-saver mode removes decorative toner-heavy elements without losing information.
14. Existing RAW/rules regression suite remains green.
15. Browser/PDF gates validate page counts, Letter size, expected content, RAW integrity markers, and rendered PNG artifacts.
16. A 12-class visual review artifact is generated for release review.
17. No change reaches `main` until all production gates pass.
