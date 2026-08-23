# Premium PDF Packet Contract

Character Forge PDF export has two different jobs: be fast to play from and be complete enough to audit. Those goals must not compete for the same page.

## Page 1 — premium quick-play sheet

Page 1 remains the ornate, class-themed US Letter character sheet. It prioritizes the information a player needs constantly at the table: identity, abilities, defenses, attacks, skills, primary class resources, spellcasting summary, proficiencies, equipment, and Quick Turn guidance.

The quick-play page is intentionally bounded to the existing 10.2-inch printable layout. It may summarize or select the most immediately useful feature cards, but it must never be treated as the complete rule record by itself.

## Rules & Provenance appendix

Every active entry returned by `buildQuickReference()` must appear in the packet appendix exactly once, including species traits, background features, feats, class/subclass features, Fighting Styles, and Weapon Mastery references.

Appendix references preserve the complete Character Forge play-reference text and verified SRD version + printed-page provenance. Appendix pages use explicit deterministic page breaks and must not use line clamping or hidden overflow to make content fit.

## Spell Loadout appendix

Caster packets include every generated spell exactly once in a loadout appendix.

For Wizards, the appendix includes all generated cantrips and the entire generated spellbook, with preparation/Spell Mastery/Signature Spell state marked where applicable. For Clerics, it includes all generated cantrips, normal prepared spells, and always-prepared domain spells.

The loadout appendix proves the exact generated spell state and the SRD source/version used for legality validation. Character Forge must not invent per-spell page citations for high-level spells until the structured spell-reference layer contains verified provenance for those individual spells.

## Rules Audit page

The final packet page preserves the complete Rules Audit, not only the compact Page 1 footer. It includes:

- audit status and source mode
- RAW integrity state
- rules label
- official source document/version
- CC BY 4.0 license
- verified scope statement
- complete audited identity mechanics and their source pages
- every validation check attached by the rules engine
- official SRD source links

## Pagination contract

- Page 1: fixed premium quick-play sheet
- Rules appendix: maximum 5 full rule references per page
- Spell appendix: maximum 22 spell records per page
- Final page: complete Rules Audit
- every page displays its packet page number
- appendix pages must not silently truncate content

The exact packet page count varies by character level, class, species, subclass, feats, masteries, and spell loadout. Completeness takes priority over minimizing the number of appendix pages.

## Quality gate

A packet change is not production-ready unless the regression suite proves that:

1. level-20 Fighter/Champion, Wizard/Evoker, Cleric/Life Domain, and Rogue/Thief packets contain every `buildQuickReference()` ID;
2. every generated Wizard/Cleric spell appears exactly once in the spell appendix;
3. the complete Rules Audit survives into the packet;
4. late-level features that do not fit on Page 1 still render in the appendix;
5. appendix CSS uses explicit print pagination and no line-clamp/hidden-overflow truncation;
6. the full Character Forge rules/site regression suite remains green.
