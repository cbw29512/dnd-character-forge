# RAW Catalog Coverage Matrix

## Purpose

CharacterForge must never present a partial RAW catalog as complete. This document records the current verified coverage boundary while the catalog is expanded.

## Rulesets

- **2014:** SRD 5.1
- **2024:** SRD 5.2.1
- RAW source: immutable
- Homebrew source: unrestricted and separate

Official source: https://www.dndbeyond.com/srd

## Current class coverage

| Class | 2014 | 2024 | Status |
|---|---:|---:|---|
| Barbarian | Yes | Yes | Implemented |
| Bard | Yes | Yes | Implemented |
| Cleric | Yes | Yes | Implemented |
| Druid | Yes | Yes | Implemented |
| Fighter | Yes | Yes | Implemented |
| Monk | Yes | Yes | Implemented |
| Paladin | Yes | Yes | Implemented |
| Ranger | Yes | Yes | Implemented |
| Rogue | Yes | Yes | Implemented |
| Sorcerer | Yes | Yes | Implemented |
| Warlock | **Missing** | **Missing** | Priority P0 |
| Wizard | Yes | Yes | Implemented |

The SRD contains Warlock for both rulesets. The current Forge catalog therefore must not be called complete until Warlock is implemented and validated. The 2014 SRD explicitly includes Warlock; the 2024 SRD conversion guide documents revised Warlock mechanics including Pact Magic, Eldritch Invocations, subclass timing, and Epic Boon progression.

## Current content boundary

The existing repository contains additional verified class-specific modules, spell data, provenance data, validation, printing, and production tests. Those systems should be reused rather than replaced.

The next content expansion should proceed in this order:

1. Warlock 2014 foundation + Pact Magic.
2. Warlock 2024 foundation + revised Pact Magic.
3. Warlock subclass data for every subclass actually present in the applicable SRD.
4. Eldritch Invocation model with prerequisites and level gating.
5. Warlock spell-list integration for both rulesets.
6. Class-specific validation and 1-20 test matrices.
7. Then expand the catalog systematically for feats, equipment, magic items, spells, backgrounds, species, and subclasses.

## Accuracy rule

A record is not marked `RAW` merely because its name exists. It must have:

- ruleset identity;
- source/provenance;
- mechanical data required by the generator;
- prerequisite/level gating where applicable;
- validation coverage;
- no Homebrew mutation path.

If an official option is not yet encoded, CharacterForge should say it is unavailable rather than fabricate it.
