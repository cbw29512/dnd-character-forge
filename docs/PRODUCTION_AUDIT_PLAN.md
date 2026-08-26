# Character Forge Production Audit

## Objective
Improve the Forge workflow without removing rules functionality, then audit supported 2014/2024 classes, subclasses, equipment, weapons, spellcasting, gold, and starting magic against the applicable source guidance.

## Current certification status
- Master production tracker: Issue #37.
- Active exhaustive audit: PR #39.
- Warlock 2014/2024 production support and premium print coverage are merged.
- Exhaustive generation covers every supported class at levels 1–20 in both rulesets and every supported subclass from its legal unlock level through 20.
- Warlock has an independent 1–20 progression oracle.
- Starting-magic class-usability coverage includes all 12 supported classes in both rulesets.
- Saved-character persistence now includes Warlock class selections and Starting Resources state.
- Final certification remains blocked until the full rules suite, browser/PDF gates, visual artifact review, post-merge main CI, Pages deployment, live smoke test, and user acceptance pass are all green.

## UI acceptance criteria
- The constraint/workflow panel scrolls as one coherent unit.
- The result panel does not create a nested scroll trap.
- Character creation reads as a numbered progression: Rules → Level → Species → Class → Subclass → Background → Abilities → Equipment → Magic → Review.
- Existing controls and advanced choice panels remain available.

## Starting-magic acceptance criteria
- Magic mode is explicit: No Magic, Low Magic, Normal Magic, High Magic.
- No Magic never adds magic items.
- 2014 higher-level starting equipment uses the DMG Low/Standard/High campaign guidance.
- 2024 uses its own Starting Equipment at Higher Levels guidance rather than silently applying 2014 tables.
- Magic-item candidates must be usable by the generated class/proficiencies and level-appropriate; selection is not optimization.
- The generated character records the magic mode, gold guidance, and item provenance.

## Rules audit gate
For every supported class and supported subclass, test levels 1–20 where that class supports the level. Validate class features, subclass features, resources, proficiencies, attacks, equipment, spellcasting, spell slots, feats/ASIs, gold/equipment, quick references, and provenance. Unsupported content must remain unavailable rather than guessed.

## Safety gate
Do not weaken validation to make a generation error disappear. A generated feature without a valid quick reference remains a production failure.
