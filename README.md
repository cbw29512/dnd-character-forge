# D&D Character Forge

**Character Forge** is an accuracy-first D&D 5e pre-generated character builder for the verified **2014 SRD 5.1** and **2024 SRD 5.2.1** rules surfaces.

**Live site:** https://cbw29512.github.io/dnd-character-forge/

> Current status: **friend-test / release-candidate hardening** (`0.9.0-audit.1`). The production site is suitable for hands-on beta testing, but it has not yet been promoted to the final 1.0 commercial release.

## What it does

- Supports all **12 SRD classes** across levels **1–20** within the implemented 2014 and 2024 SRD boundaries.
- Lets users fix only the choices they care about; everything else remains **Random** and is resolved legally.
- Validates supported characters before display and fails closed instead of inventing unsupported rules.
- Keeps 2014 and 2024 mechanics isolated.
- Provides source-aware Rules Audit / quick-reference output for supported mechanics.
- Includes complete generated SRD spell-reference catalogs for the supported 2014 and 2024 spell surfaces.
- Supports No / Low / Normal / High starting-magic modes with data-driven item eligibility.
- Saves characters to a local Pregen library with versioned backup/export/import and duplicate protection.
- Produces class-specific **Deluxe** and **Ink Saver** US Letter print/PDF packets.
- Supports class-specific fallback portraits and user-supplied portrait replacement.

## Accuracy contract

Character Forge is deliberately conservative:

- RAW/SRD characters must remain inside the selected edition's verified source boundary.
- Unsupported combinations are rejected rather than guessed.
- Required supported rules references must resolve to source provenance or audited output fails closed.
- Cross-edition feature leakage is treated as a release defect.
- Generated PDF/print output is browser-certified for page count, layout, class identity, and representative rules content.

The site describes its scope as **supported SRD content** rather than claiming every D&D book option is included.

## Automated release gates

The repository currently certifies:

- rules/site regression tests;
- Rules Lawyer browser certification;
- Party Forge browser certification;
- SRD spell-reference source/catalog integrity;
- responsive desktop/tablet/mobile behavior;
- live accessibility;
- Pregen save/reopen and backup/restore behavior;
- class-choice lifecycle;
- premium PDF generation;
- representative class-specific PDF families;
- all 12 Deluxe class identities;
- Ink Saver class identities;
- GitHub Pages deployment and production smoke checks.

See [`docs/PRODUCTION_AUDIT_PLAN.md`](docs/PRODUCTION_AUDIT_PLAN.md) for the production Definition of Done and [`docs/RELEASE_ACCEPTANCE.md`](docs/RELEASE_ACCEPTANCE.md) for the final hands-on acceptance checklist.

## Friend testing

Friend testing should focus on real use rather than trying to reproduce CI:

1. Generate several characters using both 2014 and 2024.
2. Try low, mid, and high levels plus at least one fully Random character.
3. Save and reopen Pregens; export/import a backup.
4. Change a portrait and confirm it survives the expected save/reopen flow.
5. Print or save both Deluxe and Ink Saver packets.
6. Report confusing controls, suspicious rules, missing equipment/spells/features, malformed output, clipping, tiny text, or anything that requires explanation to use.

A friend-test finding becomes a release blocker only when it exposes a real supported-content defect, broken workflow, or serious usability problem. New feature requests are tracked separately from 1.0 release blockers.

## Release status

Before final 1.0 promotion, the remaining release work is intentionally narrow:

- protect `main` with branch protection or a repository ruleset;
- complete the human acceptance pass using the deployed candidate;
- verify commercial PDF/export attribution and licensing presentation;
- promote version/build metadata from the audit channel to the approved production release;
- create the corresponding tag and GitHub Release.

Additional subclass/content expansion and non-defect polish are **not** required to begin friend testing.

## Local development

The project is a static JavaScript application.

```bash
npm test
```

The default test command runs the Node rules/site regression suite. GitHub Actions runs the heavier browser, PDF, accessibility, source-integrity, deployment, and smoke gates.

## Licensing and affiliation

Character Forge is an independent fan-made project and is not affiliated with or endorsed by Wizards of the Coast.

The product uses verified redistributable material from **SRD 5.1** and **SRD 5.2.1** under the applicable **Creative Commons Attribution 4.0 International** licensing terms. The live site contains the project disclosure, SRD source links, and licensing notice.
