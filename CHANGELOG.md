# Character Forge Changelog

## Unreleased — 0.9.0-audit.1

This audit line identifies the candidate build while the final production certification is in progress.

### Hardened in the current audit line
- Explicit 2014/2024 ruleset support and all-12-class premium print certification.
- Versioned Pregen persistence with malformed/future-entry recovery boundaries.
- Verified Pregen backup/export and transactional restore with duplicate protection.
- Deterministic spell-display regression coverage.
- Party Forge certification required on every pull request and `main` push.
- Data-driven starting magic-item eligibility and verified class-weapon resolution.
- Live browser accessibility certification in the release chain.
- Visible runtime version/build-channel identification.

### Release gate
A build is not considered production-approved until its exact head passes rules/site, Rules Lawyer, Party Forge, Pregen backup lifecycle, live accessibility, every premium PDF/class identity gate, post-merge `main` CI, GitHub Pages deployment, production smoke, and final human acceptance. Branch protection and full edition-aware spell-reference completeness remain explicit release-audit items until verified closed.
