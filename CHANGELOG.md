# Character Forge Changelog

## Unreleased — 0.9.0-audit.1

This audit line identifies the release-candidate build while final production acceptance is in progress.

### Hardened in the current audit line
- Explicit 2014/2024 ruleset support and all-12-class premium print certification.
- Versioned Pregen persistence with malformed/future-entry recovery boundaries.
- Verified Pregen backup/export and transactional restore with duplicate protection.
- Deterministic spell-display regression coverage.
- Complete generated SRD 5.1 and SRD 5.2.1 spell-reference catalogs with edition-aware fail-closed resolution.
- Pinned official SRD source verification and byte-identical catalog regeneration checks.
- SRD spell-reference integrity certification on relevant pull requests, manual runs, and `main` pushes.
- Party Forge certification required on every pull request and `main` push.
- Data-driven starting magic-item eligibility and verified class-weapon resolution.
- Live browser accessibility certification in the release chain.
- Visible runtime version/build-channel identification.

### Release gate
A build is not considered production-approved until its exact head passes rules/site, SRD integrity, Rules Lawyer, Party Forge, Pregen backup lifecycle, live accessibility, every premium PDF/class identity gate, post-merge `main` CI, GitHub Pages deployment, production smoke, and final human acceptance.

Branch protection and final human acceptance remain explicit release-audit items until verified closed. The version remains `0.9.0-audit.1` until that release gate is complete.
