# Character Forge RAW Production Release Contract

## Definition of Done

Character Forge is release-ready only when every option exposed in the public UI is mechanically valid, edition-correct, reproducible from the matching System Reference Document, and covered by automated tests.

The public Forge is RAW-only. It does not expose Homebrew mode, accept Homebrew effects, or load Homebrew mechanics into generated characters.

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
- `currentCharacter`

Derived values such as AC, HP, initiative, save bonuses, skill bonuses, passive Perception, spell save DC, spell attack bonus, attack bonuses, damage bonuses, spell slots, and legal prepared/spellbook counts must be calculated from source mechanics.

## State rules

1. Every configurable mechanical choice defaults to `Random`.
2. A player selection becomes a hard generation constraint.
3. Random filling may choose only from the legal pool remaining after all fixed constraints are applied.
4. Impossible combinations produce a visible error; they never produce a best-effort character.
5. Changing editions clears edition-specific selections.
6. Changing class or level clears or revalidates dependent subclass/spell choices.
7. Saved pregens must be revalidated before use.
8. Any character containing Homebrew mechanics is rejected by the RAW production generator.

## Completion gates

### Rules coverage

- All supported SRD species/origins are encoded.
- All supported SRD backgrounds are encoded.
- All supported SRD classes are encoded through level 20.
- The SRD subclass for each class is encoded at the correct acquisition level.
- All SRD feats required by character creation/class progression are encoded.
- Equipment, armor, weapons, fighting styles, masteries, class choices, and spellcasting progression required by those classes are encoded.
- Every spell that the Forge can select has edition-correct spell-list membership and a playable reference entry.

### Validation

- RAW-only enforcement is tested.
- Edition isolation is tested.
- Level 1-20 progression is tested.
- Class/subclass acquisition timing is tested.
- Ability-score maximums are tested.
- Skill/save/language/feat/mastery duplicates are blocked.
- Spell list, spellbook, preparation, always-prepared, and slot-count rules are tested.
- At least 1,000 randomized generations per supported class/ruleset complete without an invalid character.

### Player usability

- A player can forge a valid character with every field left Random.
- A player can lock any supported exposed choice and let Forge legally fill the remainder.
- The generated sheet contains the information needed to play the character at the table without relying on guessed mechanics.
- Print output is usable on paper and mobile layout remains usable at narrow phone widths.

### Release safety

- `npm test` passes.
- GitHub Actions passes on the release branch.
- Main is not updated until the release branch passes the full gate.
- Required SRD Creative Commons attribution remains present in the public site.
