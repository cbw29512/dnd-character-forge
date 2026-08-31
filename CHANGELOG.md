# Character Forge Changelog

## Unreleased — 0.9.0 audit line

Production remains on the previously released `main` baseline until an audit release is explicitly approved and certified.

### Release-hardening work in draft
- Full verified 2024 spell-reference coverage.
- Party Forge required-CI coverage for every pull request and push to `main`.
- Versioned Pregen persistence recovery and migration.
- Durable Pregen backup export/import.
- Product/build identification and release metadata.

### Release gate
No item above is considered shipped until its exact-head CI passes, approved work is merged, the exact `main` commit passes post-merge rules/browser/print gates, and GitHub Pages production smoke passes that same commit.
