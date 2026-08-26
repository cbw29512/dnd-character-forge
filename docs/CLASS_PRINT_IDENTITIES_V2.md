# Character Forge — Class Print Identities V2

## Objective

Make the printed character immediately recognizable by class without changing validated character mechanics. The class identity layer is presentation-only: it may alter borders, shapes, paper treatment, ornament, portrait framing, resource-panel styling, and print decoration; it may not alter the generated character model.

## Frozen data contract

The source of truth remains the validated character object produced by the rules engine. `src/print/theme.js` maps `character.class.id` to a theme. `src/ui/print-page-one.js` renders the shared information architecture. Class CSS is applied after the shared premium print stack.

No class identity CSS may change ability scores, saves, skills, AC, HP, attacks, equipment, spell selection, resource counts, feature legality, provenance, or audit state.

## V2 identity matrix

| Class | Visual identity | Geometry / print treatment | Primary resource surface |
| --- | --- | --- | --- |
| Barbarian | hide, bone, iron, primal red | broken edges, crossed-weapon corner marks, jagged banners | Primal Fury |
| Bard | manuscript, brass, performance flourishes | ruled manuscript rhythm, double borders, rounded instrument-like forms | Living Legend |
| Cleric | illuminated sacred manuscript | halo/radiant geometry, sacred medallion shapes | Sacred Channel |
| Druid | bark, leaf, moon, organic knotwork | oval/leaf geometry, soft organic borders | The Old Wild |
| Fighter | steel, rivets, heraldry | shield geometry, square/riveted panels, disciplined banners | Martial Resources |
| Monk | ink, stone, disciplined circles | circular stats, restrained borders, deliberate whitespace | Centered Discipline |
| Paladin | oath shield, radiant metal | cathedral/shield geometry, double sacred borders | Sacred Charge |
| Ranger | leather field journal, compass/trail marks | map grid, arrowhead geometry, trail-dash borders | Warden's Mark |
| Rogue | dark leather, lockwork, heist lines | clipped corners, asymmetry, dashed precision lines | Rogue Resources |
| Sorcerer | crystal, living aether | faceted polygons, unstable energy geometry | Sorcerer utility |
| Warlock | pact seal, eye/crescent motifs | occult ovals, pact-circle geometry | Warlock utility |
| Wizard | spellbook, star map, arcane circles | manuscript geometry, arcane pentagonal forms | Arcane Toolkit |

## File organization

- `styles/print/premium-class-martial.css` — Barbarian, Fighter, Monk, Rogue.
- `styles/print/premium-class-divine-wild.css` — Cleric, Druid, Paladin, Ranger.
- `styles/print/premium-class-arcane.css` — Bard, Sorcerer, Warlock, Wizard.
- `styles/print/premium-sorcerer.css` — final print-stack load point so V2 class identity rules override shared generic presentation.
- `tests/class-print-identity-contract.test.js` — prevents any supported class from silently falling back to a generic color swap.

Each presentation file stays intentionally small enough to remain auditable. If a class treatment grows substantially, split that class into its own file rather than allowing a monolithic stylesheet.

## Definition of Done

A class identity is complete only when:

1. The theme is automatically selected from `character.class.id`.
2. The class has unique frame treatment, panel treatment, stat geometry, portrait framing, and primary resource styling.
3. Ink-saver output remains usable and mechanically identical.
4. Existing US Letter page-count gates still pass.
5. PDF text extraction still contains all required character data, active rules, equipment, spells, and RAW-integrity markers.
6. The normal rules/site regression suite passes unchanged.
7. Browser-generated PNG/PDF artifacts show no clipping, overlap, unreadable text, or decorative obstruction.
8. A visual review can distinguish every class without reading the class name.
