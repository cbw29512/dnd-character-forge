# Character Forge Production Audit

## Definition of Done
Character Forge is production-ready when a first-time visitor can generate, save, reopen, and print a supported D&D 5e character without encountering an invalid rules combination, missing supported rules reference, broken workflow, inaccessible core control, or defective PDF; the exact released build must also pass the repository's automated release gates and a final human acceptance pass.

## Supported data boundary
- Rules editions: **2014 SRD 5.1** and **2024 SRD 5.2.1**.
- Levels: **1–20**.
- Classes: **all 12 supported SRD classes**.
- Content outside the verified redistributable/support boundary remains unavailable rather than guessed.
- Official SRD/RAW, Character Forge Original, and user-supplied/custom content remain visibly distinct.
- Generation fails closed when a required supported rules reference cannot be resolved.

## Release discipline
Character Forge remains in **release-candidate hardening** until the remaining release blockers below are closed.

Do not expand the supported rules surface casually. Preserve working mechanics unless a change is required for correctness, release safety, accessibility, licensing, privacy, verified customer-facing usability, or explicitly approved post-audit polish that does not alter character rules.

## Current exact-main baseline
Current audited `main`: `c552fcc219205eab7c4385d94cd0fbce3fdf0560` (PR #141, 2026-09-03).

That baseline includes the merged release cleanup, premium source-label/readability pass, Pregen trust-boundary hardening, mobile Print/Reforge fixes, social preview fixes, modernized CI actions, deterministic dense-Warlock print coverage, and the standard 24-PDF physical body/footer boundary gate.

Verified on the current baseline:
- [x] Character Forge rules/site regression suite.
- [x] 2014/2024 source isolation and fail-closed rules validation.
- [x] All 12 supported SRD classes across levels 1–20 in the production matrix.
- [x] SRD 5.1 / SRD 5.2.1 spell-reference integrity and regeneration checks.
- [x] Rules Lawyer browser certification.
- [x] Party Forge browser certification.
- [x] Responsive desktop/tablet/compact-phone browser coverage.
- [x] Live accessibility certification.
- [x] Pregen save/reopen, export/import, duplicate protection, and hostile-backup trust restoration.
- [x] Class-choice lifecycle coverage.
- [x] Deluxe and Ink Saver print/PDF generation.
- [x] All 12 Deluxe class identities.
- [x] Ink Saver class identities.
- [x] Deterministic dense-caster and Warlock print geometry.
- [x] Standard 2014/2024 Table PDF physical body/footer-boundary certification.
- [x] Website privacy disclosure, independent-project disclosure, and SRD licensing notice.
- [x] Edition-aware SRD/CC attribution rendered on printed pages by the release-candidate code path.
- [x] GitHub Pages deployment and production smoke on exact `main`.
- [x] Visible audit build/version identification.

## Current polish branch
`polish/seo-mobile-20260909`

Purpose: improve the public release wrapper without changing character mechanics or the supported rules matrix.

Allowed scope:
- CSP-safe static support pages;
- useful crawlable pregen guide / FAQ content;
- mobile readability for those support pages;
- crawl discovery and Netlify canonical-host portability;
- documentation reconciliation and regression coverage.

Stop the branch if a rules, generation, persistence, or certified print behavior changes unexpectedly.

## Remaining release blockers
These are the items that still block promotion from `0.9.0-audit.1` to the initial approved production release unless a new P0/P1 defect is discovered.

### P0 — repository protection
- [ ] Protect `main` with a GitHub branch protection rule or repository ruleset.
- [ ] Require pull-request-based changes and the intended release-critical status checks.
- [ ] Prevent accidental force-push/deletion of `main`.

Current repository state: `main` is not protected. This is an administration/settings task rather than application-code work.

### P0 — human release acceptance
Run once on the coherent final candidate after automation is green:
- [ ] Open the deployed site as a first-time visitor/incognito.
- [ ] Confirm the Forge purpose and primary action are immediately understandable.
- [ ] Forge representative Barbarian, Cleric, Fighter, Rogue, Wizard, and Warlock characters plus one fully Random character.
- [ ] Exercise both 2014 and 2024 and representative low/high levels.
- [ ] Exercise No / Low / Normal / High Magic modes.
- [ ] Save a character to Pregens and reopen it.
- [ ] Export a Pregen backup and restore it without duplicate corruption.
- [ ] Upload/change a portrait and verify saved/restored presentation.
- [ ] Export/print Deluxe and Ink Saver packets.
- [ ] Reject the candidate for clipping, overlap, blank fallback art, unreadable rules text, missing supported quick reference, malformed equipment, impossible option combination, mechanically suspicious output, or confusing first-time workflow.

### P0 for commercial launch — exported-product attribution
- [x] Website carries independent-project disclosure and SRD 5.1 / SRD 5.2.1 CC licensing notice.
- [x] Edition-specific SRD/CC attribution is rendered on printed pages without intentionally adding packet pages.
- [x] Automated attribution contracts exist for both editions.
- [ ] Human commercial acceptance explicitly verifies attribution remains legible in representative 2014/2024 Deluxe and Ink Saver exports and does not create a footer collision.
- [ ] Verify no Wizards logos, protected trade dress, unlicensed book art, or unsupported non-SRD material ships in the standalone commercial product.

### P1 — release promotion
Complete only after all applicable P0 items pass:
- [ ] Change runtime/package version from `0.9.0-audit.1` to the approved production version.
- [ ] Change build channel from `audit` to the approved production channel.
- [ ] Finalize the changelog entry with the release date/version.
- [ ] Create the corresponding Git tag/GitHub Release.
- [ ] Record the exact release SHA and verification evidence in master issue #37.

## Not a 1.0 blocker
Do not hold the initial production release for speculative supported-content expansion. These can continue after a stable release unless they expose an existing supported-content defect:
- additional legally redistributable subclasses;
- new Character Forge Original content;
- broader customization;
- additional convenience workflows;
- cosmetic polish that does not address a verified usability or release-wrapper issue.

## Stop-the-line rule
Any failing release gate, intermittent generator/print failure, cross-edition leak, unsupported guessed rule, corrupt save/restore behavior, or P0/P1 customer-visible defect returns the candidate to hardening. Otherwise, finish the release before expanding the rules surface.
