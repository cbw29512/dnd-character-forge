# Character Forge Production Audit

## Definition of Done
Character Forge is production-ready when a first-time visitor can generate, save, reopen, and print a supported D&D 5e character without encountering an invalid rules combination, missing supported rules reference, broken workflow, inaccessible core control, or defective PDF; the exact released build must also pass the repository's automated release gates and a final human acceptance pass.

## Supported data boundary
- Rules editions: 2014 SRD 5.1 and 2024 SRD 5.2.1.
- Levels: 1–20.
- Classes: all 12 supported SRD classes.
- Content outside the verified redistributable/support boundary remains unavailable rather than guessed.
- Official SRD/RAW, Forge Original, and user-supplied/custom content must remain visibly distinct.
- Generation must fail closed when a required supported rules reference cannot be resolved.

## Release discipline
Character Forge is in **release-candidate hardening**, not feature-expansion mode.

Do not add new classes, subclasses, generators, or major UI concepts until the release blockers below are closed. Preserve existing working behavior unless a change is required for correctness, release safety, accessibility, licensing, or a verified customer-facing defect.

## Verified production foundation
- [x] Explicit 2014/2024 ruleset selection.
- [x] Levels 1–20 generation coverage.
- [x] Production-matrix coverage across all 12 classes.
- [x] Repeatability stress across both editions and representative low/mid/high levels.
- [x] Edition/source isolation and fail-closed rules validation.
- [x] Complete generated SRD 5.1 and SRD 5.2.1 spell-reference catalogs for the supported production spell surface.
- [x] Pinned official SRD source identity and byte-identical spell-catalog regeneration checks.
- [x] 2024 starting-equipment choice support and edition-specific starting-equipment handling.
- [x] No / Low / Normal / High Magic modes with data-driven eligibility checks.
- [x] Class-specific premium print system for all 12 classes.
- [x] User portrait replacement plus class-specific fallback portrait behavior.
- [x] Deluxe and Ink Saver class identity gates.
- [x] Fixed Letter-page print/PDF browser certification.
- [x] Pregen save/reopen lifecycle.
- [x] Versioned Pregen persistence and backup export/import with duplicate protection.
- [x] Responsive desktop/tablet/compact-phone browser coverage.
- [x] Live browser accessibility certification.
- [x] Rules Lawyer certification.
- [x] Party Forge certification.
- [x] GitHub Pages deployment gate.
- [x] Public production smoke gate after deployment.
- [x] Website SRD attribution and independent-project disclosure.
- [x] Visible audit build/version identification.

## Final hardening branch
`release/final-hardening-20260831`

Purpose: close release-process gaps without changing character mechanics.

- [x] Close stale/superseded spell-reference PR #95.
- [x] Close stale/superseded Barbarian certification PR #58 without merging its divergent branch wholesale.
- [x] Add SRD spell-reference integrity certification for relevant `main` pushes.
- [x] Add a regression contract protecting the exact-`main` SRD integrity trigger.
- [x] Reconcile the changelog with completed spell-reference work.
- [ ] Exact-head CI green on the final-hardening PR.
- [ ] Merge only after exact-head CI is green.
- [ ] Exact-`main` rules/site, SRD integrity, browser/print, Rules Lawyer, Party Forge, Pages, and production-smoke gates green after merge.

## Remaining release blockers
These are the only items that should block promotion from the audit build to a production release unless a new P0/P1 defect is discovered.

### P0 — repository protection
- [ ] Protect `main` with a GitHub branch protection rule or repository ruleset.
- [ ] Require pull-request-based changes and the release-critical status checks supported by the repository configuration.
- [ ] Prevent accidental direct force-push/deletion of `main`.

### P0 — human release acceptance
Run once, on the coherent final candidate after automation is green:
- [ ] Open the deployed site as a first-time visitor/incognito.
- [ ] Forge representative Barbarian, Cleric, Fighter, Rogue, Wizard, and Warlock characters plus one fully Random character.
- [ ] Exercise both 2014 and 2024 and representative low/high levels.
- [ ] Exercise No / Low / Normal / High Magic modes.
- [ ] Save a character to Pregens and reopen it.
- [ ] Export a Pregen backup and restore it without duplicate corruption.
- [ ] Upload/change a portrait and verify saved/restored presentation.
- [ ] Export/print Deluxe and Ink Saver packets.
- [ ] Reject the candidate for any clipping, overlap, blank fallback art, unreadable rules text, missing supported quick reference, malformed equipment, impossible option combination, or mechanically suspicious output.

### P0 for commercial launch — exported-product attribution
- [ ] Verify the distributed PDF/export surface carries sufficient source/provenance and required attribution for the material actually included.
- [ ] Verify no Wizards logos, protected trade dress, unlicensed book art, or unsupported non-SRD material ships in the standalone commercial product.

### P1 — release promotion
Complete only after all applicable P0 items pass:
- [ ] Change runtime/package version from `0.9.0-audit.1` to the approved production version.
- [ ] Change build channel from `audit` to the approved production channel.
- [ ] Finalize the changelog entry with the release date/version.
- [ ] Create the corresponding Git tag/GitHub Release.
- [ ] Record the exact release SHA and verification evidence in master issue #37.

## Not a 1.0 blocker
Do not hold the initial production release for speculative scope expansion. These can continue after a stable release unless they expose an existing supported-content defect:
- additional legally redistributable subclasses;
- new Forge Original content;
- broader customization;
- additional convenience workflows;
- visual polish that does not address a verified defect.

## Stop-the-line rule
Any failing release gate, intermittent generator/print failure, cross-edition leak, unsupported guessed rule, corrupt save/restore behavior, or P0/P1 customer-visible defect returns the candidate to hardening. Otherwise, stop adding features and finish the release.
