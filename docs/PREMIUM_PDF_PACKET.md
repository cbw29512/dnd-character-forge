# Premium PDF Export Contract

Character Forge PDF export is a fixed-format product, not an unbounded rules dump. The output must be fast to use at the table, visually class-specific, and still preserve enough source proof to defend the generated character.

## Hard page profiles

- **Martial / non-caster:** exactly **1 US Letter page**.
- **Caster:** exactly **2 US Letter pages**.
- No sparse spill pages are allowed.
- A layout that cannot satisfy its profile is a quality-gate failure, not permission to append another nearly empty page.

## Page 1 — premium table sheet

Page 1 is the primary character sheet. It contains identity, class-specific portrait area, abilities, defenses, attacks, skills, key features, primary resources, feat state, proficiencies, equipment, and Quick Turn guidance.

For martials, Page 1 also carries a compact sourced Rules Index containing every active `buildQuickReference()` rule name and its verified SRD page locator.

For casters, Page 1 contains the table-use spellcasting summary while the complete generated spell loadout is reserved for Page 2.

## Page 2 — caster spell and proof sheet

Caster Page 2 is deliberately designed rather than appended automatically. It contains:

- every generated spell exactly once;
- spell level and generated preparation-state markers;
- spellcasting ability, save DC, attack bonus, and slot table;
- every active sourced rule name + SRD locator;
- complete Rules Audit identity mechanics and validation checks.

Character Forge does not invent individual spell-text page citations where the verified structured spell-reference layer does not yet contain them.

## Class visual identity

Each class receives its own print skin instead of a generic recolor. Current theme families include Fighter steel/crimson, Rogue shadow/teal, Cleric ivory/gold, Wizard arcane blue, and a Barbarian-ready blood/bone/iron primal skin. Additional classes receive their own theme IDs as their verified rules slices are added.

If the player provides no portrait, the sheet renders original built-in class placeholder artwork. If a local portrait is uploaded, that image replaces the placeholder while remaining presentation-only and outside the mechanical fingerprint.

## Content compression rules

Fixed page count may change presentation density, but it must not change character mechanics.

- Important feature text on Page 1 may be shortened for quick play.
- Every active sourced rule name remains present in the packet Rules Index.
- Every generated caster spell remains present on Page 2.
- Table-critical class requirements such as Rogue Cunning Strike costs/requirements remain visible in the class-resource block.
- Complete mechanical validation still occurs before the export renderer runs.

## Quality gate

A print change is production-ready only when the normal regression suite and real Chrome print gate both pass on the exact PR head.

The browser gate physically verifies:

1. Fighter/Rogue-style martial packets print as exactly 1 Letter page;
2. Wizard/Cleric-style caster packets print as exactly 2 Letter pages;
3. every physical page has meaningful content rather than a sparse spill;
4. every active sourced rule name survives PDF printing;
5. every generated caster spell survives PDF printing;
6. RAW integrity and page-number markers survive PDF printing;
7. representative 2014/2024 edition-specific mechanics remain present or absent as required;
8. generated PDFs and PNG previews are retained as CI artifacts for visual inspection before merge.

The final decision is therefore both mechanical and visual: green text/content checks are necessary, but the generated page previews must also look like a finished Character Forge product.
