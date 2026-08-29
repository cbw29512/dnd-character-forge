# Character Forge Production Audit

## Objective
Ship a production-ready D&D Character Forge that is easy for a first-time visitor to use, produces rules-lawyer-clean supported 2014/2024 characters, and prints class-specific sheets worth keeping.

The project is in **improve-without-regressing** mode: preserve working behavior and presentation unless a change is required for RAW accuracy, reliability, accessibility, or clearer UX. Every replacement must retain the useful capability it supersedes.

## Status key
- [x] Verified complete on an exact tested build.
- [ ] Required or still being audited.
- **ACTIVE** means work is currently in the production audit branch/PR and is not complete until its gates pass.

## Non-regression contract
- [ ] Do not remove an existing working control, workflow, rules choice, print field, portrait feature, saved-pregen capability, or customization without an explicit replacement.
- [ ] Do not weaken validation to make a generation failure disappear.
- [ ] Do not silently guess unsupported rules content; unsupported content remains unavailable.
- [ ] Every generated rules feature must have valid quick-reference/provenance coverage where applicable.
- [ ] Every production change must pass the established rules/site tests and browser/print gates before merge.
- [ ] After merge, certify the exact `main` commit and production Pages deployment before calling it live.
- [ ] Human acceptance remains the final gate for visual quality and first-time-user clarity.

## Current production baseline already protected
- [x] 2014/2024 ruleset selection remains explicit.
- [x] Levels 1–20 generation is covered by production-matrix testing.
- [x] Repeatability stress covers randomized generation across both rulesets, all classes, and representative low/mid/high levels.
- [x] Class-specific premium print system is established for all 12 classes.
- [x] Class placeholder portrait art is wired into sheets/dossiers, with uploaded portraits overriding the fallback.
- [x] Deluxe dossier portrait rendering has browser/PDF regression coverage.
- [x] Ink Saver keeps a printable class-identity fallback.
- [x] Pregen library can save generated characters locally and reopen them into the Forge.
- [x] Magic modes exist: No Magic, Low Magic, Normal Magic, High Magic.
- [x] Buy Me a Coffee/support integration exists in the site UI.
- [x] Current owner visual spot-checks are positive; preserve that accepted presentation while improving the product.

## ACTIVE — RAW source reconciliation (PR #86)
Audit generated results directly against the applicable official SRD source instead of relying only on internal consistency tests.

### Confirmed corrections already in the audit branch
- [x] Restore all six legal 2014 Fighter Fighting Styles.
- [x] Add quick-reference coverage for restored Fighter styles.
- [x] Prevent Dueling's +2 damage from applying to two-handed greatsword/greataxe attacks.
- [x] Correct the 2014 Fighter two-handaxe starting-equipment quantity.
- [x] Correct 2024 Fighter package A to the official eight javelins.
- [x] Add source-oracle regressions for Fighter style legality and exact starting-equipment quantities.

### Source checks still required before PR #86 can merge
- [ ] **ACTIVE:** 2014 Ranger Favored Enemy humanoid alternatives and related choice semantics.
- [ ] **ACTIVE:** 2024 Human Origin-feat completeness.
- [ ] **ACTIVE:** Magic Initiate choice completeness and generated spell/ability semantics.
- [ ] **ACTIVE:** Skilled skill/tool choice completeness and legality.
- [ ] Audit spell lists and spell-access rules through spell level 9 for both supported editions.
- [ ] Audit prepared/known/cantrip progression, spell slots, and edition isolation.
- [ ] Audit every supported starting-equipment package and exact quantities.
- [ ] Audit weapon/armor proficiency interactions and generated attack calculations.
- [ ] Audit class, subclass, species, and background edge semantics not already source-certified.
- [ ] Audit ASI/feat progression, prerequisites, ability caps, Origin feats, and Epic Boon handling where applicable.

## Save to Pregens / persistence
- [x] Generated-character Save to Pregens action writes the complete character into the local Pregen library.
- [x] Saved pregens can be reopened into the Forge with ruleset, class/species/background selections, spells, portrait, magic mode, homebrew, and sheet presentation restored.
- [ ] **ACTIVE:** Make successful Save to Pregens feedback unmistakable without creating duplicate-save confusion.
- [ ] Add/retain a regression test for the actual save-button interaction and reopen path.
- [ ] Define and test export/import or another backup path so saved pregens are not dependent only on one browser's local storage.
- [ ] Add export/persistence schema versioning and graceful handling of older/corrupt saved data before commercial release.

## UI / first-time-user acceptance criteria
- [x] The Forge presents a clear purpose and prominent character-generation action.
- [x] The constraint/workflow panel scrolls as one coherent unit.
- [x] The result panel avoids the old nested-scroll trap.
- [x] Existing controls and advanced choice panels remain available.
- [x] Mobile layout has an automated gate protecting access to the Forge controls near the first viewport.
- [ ] Confirm a new visitor can understand Random, 2014 vs. 2024, level, class/species/background, magic mode, Forge, Save, and Print without outside instructions.
- [ ] Confirm persistent top result actions expose the most important next steps without hiding an existing function.
- [ ] Complete keyboard navigation, focus visibility, labels, announcements, and screen-reader audit.
- [ ] Recheck 360px/390px mobile, tablet, and desktop after every material UI change.

## Starting magic / equipment acceptance criteria
- [x] Magic mode is explicit: No Magic, Low Magic, Normal Magic, High Magic.
- [x] No Magic never adds magic items.
- [x] 2014 higher-level starting equipment follows its edition-specific guidance rather than borrowing 2024 rules.
- [x] 2024 uses its own higher-level equipment schedule rather than silently applying 2014 tables.
- [ ] Verify every magic-item candidate is level-appropriate and usable by the generated class/proficiencies; selection need not be optimized.
- [ ] Verify attunement and class restrictions are honored.
- [ ] Verify generated character output records magic mode, gold/equipment guidance, and useful provenance.
- [ ] Reconcile exact starting gold/equipment choices for every class/edition combination.

## Rules audit gate
For every supported class and supported subclass, test levels 1–20 where applicable. Validate:

- [ ] class features and resources;
- [ ] subclass features and subclass-level timing;
- [ ] species and background features;
- [ ] proficiencies, saves, skills, tools, languages, armor, and weapons;
- [ ] ability scores, ASIs, feats, prerequisites, and caps;
- [ ] attacks, damage, AC, initiative, speed, and derived values;
- [ ] equipment, quantities, gold, and higher-level starting gear;
- [ ] spellcasting, spell lists, spell slots, cantrips, known/prepared choices, and casting ability;
- [ ] quick references and source/provenance display;
- [ ] edition isolation so 2014 and 2024 mechanics never silently leak into each other.

## Print / PDF quality gate
- [x] Class-specific sheets exist for all 12 classes.
- [x] Uploaded portrait replacement and class fallback portrait behavior are regression-tested.
- [x] Key browser-print/PDF regressions cover class identity and final printed pixels.
- [ ] Re-run all-12-class Deluxe print gate on the final candidate.
- [ ] Re-run fixed page-count/overflow gates on the final candidate.
- [ ] Human visual spot-check final candidate for Barbarian, Cleric, Fighter, Rogue, Wizard, and one fully random character at minimum.
- [ ] Confirm no clipping, tiny text, blank art, missing quick references, broken borders, or unexpected extra pages.
- [ ] Confirm home-printer friendliness and Ink Saver remain usable.

## Release / commercial readiness
- [ ] Add/verify application version and export schema version.
- [ ] Maintain a concise changelog/release record for production changes.
- [ ] Recheck public SRD attribution/licensing presentation before commercial launch.
- [ ] Audit stale branches, old PRs/issues, dead assets, and obsolete code paths without deleting anything still referenced.
- [ ] Exact-head CI green on release PR.
- [ ] Merge only after all blocking audit items are resolved.
- [ ] Exact-`main` rules/site and browser/print gates green after merge.
- [ ] GitHub Pages production smoke green on that exact `main` commit.
- [ ] Owner performs final first-time-customer acceptance test on the deployed URL.

## When owner testing is required
Do **not** send the owner back for repeated testing after every internal fix. Request testing only when automation has passed and there is a coherent release candidate worth judging as a customer.

Final human test should cover:
1. Open production as a first-time visitor/incognito.
2. Forge at least Barbarian, Cleric, Fighter, Rogue, Wizard, plus one fully random character.
3. Save a character to Pregens and reopen it.
4. Change portrait/sheet presentation and confirm preservation.
5. Print/Export Deluxe and Ink Saver output.
6. Report anything confusing, ugly, clipped, missing, or mechanically suspicious.

## Merge rule
A checkbox is not evidence by itself. Mark an item complete only when its implementation and relevant regression/production gate have actually passed. Preserve accepted behavior first; improve from that baseline rather than rewriting working systems unnecessarily.
