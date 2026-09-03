# Premium PDF Export Contract — Print V4

Character Forge PDF export is a player-facing table product. Mechanical validation and source provenance remain mandatory inside the rules engine and website, but the printed sheet should read like a familiar 5e character sheet rather than a rules-audit report.

## Hard page profiles

- **Martial / non-caster:** exactly **1 US Letter page**.
- **Caster:** exactly **2 US Letter pages**.
- Deluxe dossier pages remain controlled by the existing packet profile.
- No sparse spill pages are allowed.

## Page 1 — premium table sheet

Page 1 keeps the familiar 5e anchors: identity and portrait, abilities, saving throws, skills, passive Perception, AC, initiative, speed, HP, hit dice, death saves, attacks, class resources, equipment, proficiencies/languages, feats, features, and Quick Turn guidance.

The player sheet shows **active rule names and usable rule text only**. SRD page locators, source-version labels, and audit mechanics remain available in the website/model layer and are not repeated beside every printed feature.

## Page 2 — caster spell sheet

Caster Page 2 is a play surface, not a proof report. It contains:

- every generated spell exactly once;
- spell level and preparation/known markers;
- spellcasting ability, save DC, attack bonus, and slot tracking;
- class-specific spell support;
- active rule names without page/source locator clutter.

The internal Rules Audit remains required before export and is not deleted from the character model.

## Class visual identity

Every class keeps its own original portrait, crest, geometry, and palette. Print V4 strengthens class color while retaining neutral writing surfaces and ink-saver support.

A player should be able to distinguish the class from the portrait, crest, border geometry, and color treatment without needing to read the class name.

## Source and licensing boundary

- Full provenance remains in the validated character/audit data and website reference surfaces.
- The player PDF does not print per-feature source/page locators.
- Required SRD/Creative Commons attribution remains as a small legal footer.
- Forge Original content remains clearly labeled as compatible original content.

## Random-generation quality

Random generation is not blind uniform selection. The Forge may use verified SRD and clearly labeled Forge Original options, with:

- class-aware background affinity;
- recent-background suppression to prevent streaks;
- legality filters before weighting;
- proper Fisher–Yates sampling for multi-choice pools.

Explicit user choices always override Random behavior.

## Quality gate

A Print V4 change is production-ready only when:

1. the normal Node regression suite passes;
2. JavaScript syntax checks pass;
3. real Chrome/PDF page-count gates pass;
4. every required active rule name and generated spell survives printing;
5. source/page locator clutter is absent from player sheets;
6. all 12 class identities remain visually distinct;
7. ink-saver output stays mechanically identical and readable;
8. generated PDF/PNG artifacts show no clipping, overlap, or sparse spill pages.
