# Character Forge RAW Production Release Contract

## Definition of Done

Character Forge is release-ready only when every option exposed in the public UI is mechanically valid, edition-correct, reproducible from the matching System Reference Document, and covered by automated tests.

The public Forge is RAW-only. It does not expose Homebrew mode, accept Homebrew effects, or load Homebrew mechanics into generated characters.

A class is not considered complete merely because the generator can create it. It must also produce a class-aware, table-ready character sheet whose displayed resources and reminders are derived from that character's validated RAW mechanics at the selected level.

## Authoritative rules boundaries

- **2014 mode:** System Reference Document 5.1 (Creative Commons release).
- **2024 mode:** System Reference Document 5.2.1.
- Editions never mix mechanics inside one character.
- Content outside the selected SRD is not silently substituted, approximated, or inferred.
- Unsupported content fails closed and remains unavailable until encoded and tested.

## Data schema contract

Every rules record must carry enough structured information for the generator to derive mechanics rather than copy guessed totals.

Core generated-character state:

- `ruleset`
- `sourceMode` (always `RAW` in the public application)
- `constraints`
  - `level`
  - `species`
  - `class`
  - `subclass`
  - `background`
  - `name`
- `spellSelections`
  - `cantrips`
  - `spellbook`
  - `prepared`
- `advancementSelections`
  - keyed by eligible class advancement level
  - every value defaults to `Random`
  - a selected ASI, feat, or Epic Boon becomes a hard generation constraint
- `currentCharacter`

Derived values such as AC, HP, initiative, save bonuses, skill bonuses, passive Perception, spell save DC, spell attack bonus, attack bonuses, damage bonuses, spell slots, legal prepared/spellbook counts, class resource uses, resource scaling, feat-derived ability changes, and class feature scaling must be calculated from source mechanics.

## State rules

1. Every configurable mechanical choice defaults to `Random`.
2. A player selection becomes a hard generation constraint.
3. Random filling may choose only from the legal pool remaining after all fixed constraints are applied.
4. Impossible combinations produce a visible error; they never produce a best-effort character.
5. Changing editions clears edition-specific selections.
6. Changing class or level clears or revalidates dependent subclass, spell, feat, and advancement choices.
7. A locked advancement choice constrains a Random character level to a level where that choice legally exists.
8. Saved pregens must be revalidated before use.
9. Any character containing Homebrew mechanics is rejected by the RAW production generator.

## Completion gates

### Rules coverage

- All supported SRD species/origins are encoded.
- All supported SRD backgrounds are encoded.
- All supported SRD classes are encoded through level 20.
- The SRD subclass for each class is encoded at the correct acquisition level.
- All SRD feats required by character creation/class progression are encoded.
- ASI-versus-feat and Epic Boon decisions are edition-correct, prerequisite-aware, and represented as explicit advancement choices.
- Equipment, armor, weapons, fighting styles, masteries, class choices, and spellcasting progression required by those classes are encoded.
- Every spell that the Forge can select has edition-correct spell-list membership and a playable reference entry.

### Validation

- RAW-only enforcement is tested.
- Edition isolation is tested.
- Level 1-20 progression is tested.
- Class/subclass acquisition timing is tested.
- Ability-score maximums are tested.
- Advancement choice levels, prerequisites, eligibility, uniqueness, and ability-score effects are tested.
- Skill/save/language/feat/mastery duplicates are blocked.
- Spell list, spellbook, preparation, always-prepared, and slot-count rules are tested.
- Class resource counts and level scaling are tested against the correct SRD tables.
- At least 1,000 randomized generations per supported class/ruleset complete without an invalid character.

### Player usability

- A player can forge a valid character with every field left Random.
- A player can lock any supported exposed choice and let Forge legally fill the remainder.
- Feat/ASI/Epic Boon controls show only choices legal for the selected edition, class, and advancement level.
- Generated sheets give active feats and boons a distinct at-table reference section rather than hiding them in level-up bookkeeping.
- The generated sheet contains the information needed to play the character at the table without relying on guessed mechanics.
- Every SRD class has an explicit sheet profile; unknown classes fail closed instead of receiving a generic layout.
- Class identity changes information hierarchy, not rules. Fighter sheets prioritize attacks/actions, caster sheets prioritize spellcasting, and resource-driven classes prioritize their current-level resources.
- A resource is printed only when the validated character model contains that resource and its RAW value.
- No generic placeholder may state a class resource count or scaling value.
- Printed sections and individual rules cards avoid destructive page splits where browser print engines permit it.
- Print output is legible in color and monochrome.
- The first printed page prioritizes at-table information: identity, ability scores, AC, HP, initiative, speed, proficiency, saving throws, active feats/boons, core attacks/spellcasting, and primary class resources.
- Mobile layout remains usable at narrow phone widths.

### Class sheet identity

The twelve SRD classes have dedicated presentation profiles:

- Barbarian: primal/resource-forward
- Bard: performance/support/spell-forward
- Cleric: divine/resource/spell-forward
- Druid: wild/resource/spell-forward
- Fighter: martial/attack-forward
- Monk: discipline/resource/attack-forward
- Paladin: oath/attack/resource/spell-forward
- Ranger: wilderness/attack/spell-forward
- Rogue: cunning/skill/attack-forward
- Sorcerer: innate-arcane/resource/spell-forward
- Warlock: pact/resource/spell/attack-forward
- Wizard: scholarly-arcane/spell-forward

These are presentation identities only. They cannot add, remove, or alter mechanics.

### Release safety

- `npm test` passes.
- GitHub Actions passes on the release branch.
- Main is not updated until the release branch passes the full gate.
- Required SRD Creative Commons attribution remains present in the public site.
