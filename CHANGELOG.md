# Character Forge Changelog

## Unreleased — 0.9.0-audit.1

This audit line identifies the release-candidate build while final production acceptance is in progress.

### Hardened in the current audit line
- Explicit 2014/2024 ruleset support and all-12-class premium print certification.
- Versioned Pregen persistence with malformed/future-entry recovery boundaries.
- Verified Pregen backup/export and transactional restore with duplicate protection.
- Deterministic spell-display regression coverage.
- Generated SRD 5.1 and SRD 5.2.1 spell-reference catalogs with edition-aware fail-closed resolution.
- Pinned official SRD source verification and byte-identical catalog regeneration checks.
- SRD spell-reference integrity certification on relevant pull requests, manual runs, and `main` pushes.
- Party Forge certification required on every pull request and `main` push.
- Data-driven starting magic-item eligibility and verified class-weapon resolution.
- Live browser accessibility certification in the release chain.
- Visible runtime version/build-channel identification.
- Deluxe page-one physical footer-separation geometry certification across all 12 classes.
- Current public README aligned with the actual 12-class, levels 1–20 supported SRD scope.
- Concise privacy disclosure for the current local-storage/no-account architecture.
- Edition-aware standalone SRD/CC attribution embedded in every printed PDF page without changing packet page counts.
- Automated print-attribution contract for both SRD editions.
- Netlify production build support with host-aware canonical rewriting and explicit 404 handling.
- CSP-safe shared styling for Privacy, Share, 404, and public help content.
- Dedicated crawlable pregen workflow guide and FAQ pages with source-accurate supported-SRD language.
- Expanded sitemap discovery for the intentional indexable public support pages.
- Mobile support-page layout with 44px primary actions, one-column small-screen cards, skip navigation, and reduced-motion handling.

### Release gate
A build is not considered production-approved until its exact head passes rules/site, SRD integrity, Rules Lawyer, Party Forge, Pregen backup lifecycle, live accessibility, every premium PDF/class identity gate, post-merge `main` CI, GitHub Pages deployment, production smoke, and final human acceptance.

Branch protection, final human acceptance, and explicit commercial attribution acceptance remain release-audit items until verified closed. The version remains `0.9.0-audit.1` until that release gate is complete.
