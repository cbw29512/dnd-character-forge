# Character Forge Final Release Acceptance

Use this checklist only after the release candidate is fully green in CI. Record failures as release defects; do not compensate for them with manual workarounds.

## First-time customer flow
- [ ] Open the deployed Character Forge in an incognito/private window.
- [ ] The purpose of the Forge and the primary Forge Character action are immediately understandable.
- [ ] 2014 vs. 2024, level, class, species, subclass, background, magic mode, Save, and Print are understandable without external instructions.
- [ ] The supported-SRD boundary is clear and does not imply unsupported book content is included.
- [ ] Privacy and licensing disclosures are discoverable and understandable.

## Representative generation
- [ ] 2024 Barbarian.
- [ ] 2014 Fighter.
- [ ] Cleric.
- [ ] Rogue.
- [ ] Wizard.
- [ ] Warlock.
- [ ] One fully Random character.
- [ ] At least one low-level and one high-level character.
- [ ] No / Low / Normal / High Magic modes sampled.

For every generated character:
- [ ] Validation/audit passes.
- [ ] Attacks, AC, HP, speed, initiative, saves, skills, equipment, class resources, spells, and quick references look mechanically plausible.
- [ ] No cross-edition feature leakage is visible.
- [ ] Unsupported content is not silently invented.

## Persistence
- [ ] Save to Pregens gives clear success feedback.
- [ ] Reopen the saved character and confirm rules-critical selections are preserved.
- [ ] Export a Pregen backup.
- [ ] Import the backup and confirm duplicate handling is safe.
- [ ] Portrait/sheet customization survives the expected save/reopen workflow.

## Print / PDF
For both Deluxe and Ink Saver, and for at least one 2014 and one 2024 character:
- [ ] Correct US Letter page count.
- [ ] No clipping, overlap, orphan heading, blank fallback portrait, malformed equipment, or unexpected extra page.
- [ ] Text remains readable at normal print size.
- [ ] Class identity is obvious.
- [ ] Spell/resource pages remain usable at the table.
- [ ] Footer certification remains readable and separated from page content.
- [ ] Visible standalone attribution names Wizards of the Coast LLC, CC BY 4.0, the correct SRD source, and the CC license URL.
- [ ] Attribution remains legible in Ink Saver and does not create a new page or footer collision.

## Repository / release controls
- [ ] `main` is protected by the intended branch protection/ruleset.
- [ ] Pull-request-based changes and intended release-critical checks are required.
- [ ] Force-push/deletion protections are enabled for `main`.

## Release decision
- [ ] No known P0/P1 defect remains.
- [ ] All automated release gates are green on the exact release SHA.
- [ ] GitHub Pages and production smoke are green on the exact release SHA.
- [ ] Version/changelog/release metadata matches the approved production release.
- [ ] Exact release SHA and verification evidence are recorded in master issue #37.

When every item above is checked, Character Forge can be promoted from the audit channel to the production release.
