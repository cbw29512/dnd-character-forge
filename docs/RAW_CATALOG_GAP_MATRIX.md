# RAW Catalog Coverage Matrix

## Purpose

CharacterForge must never present a partial RAW catalog as complete. This matrix records the verified implementation boundary while the catalog is expanded.

## Authoritative rulesets

- **2014:** SRD 5.1
- **2024:** SRD 5.2.1
- **RAW:** immutable and source-controlled
- **Homebrew:** separate, editable, and unrestricted
- Official source: https://www.dndbeyond.com/srd

Wizards states that SRD 5.2.1 is the current 2024 SRD and that SRD 5.1 remains available separately. The SRD is the content boundary for the built-in RAW catalog; non-SRD book content must not be silently copied into RAW. 

## Core class coverage

| Class | 2014 | 2024 | Status |
|---|---:|---:|---|
| Barbarian | Yes | Yes | Implemented; full-content audit pending |
| Bard | Yes | Yes | Implemented; full-content audit pending |
| Cleric | Yes | Yes | Implemented; full-content audit pending |
| Druid | Yes | Yes | Implemented; full-content audit pending |
| Fighter | Yes | Yes | Implemented; full-content audit pending |
| Monk | Yes | Yes | Implemented; full-content audit pending |
| Paladin | Yes | Yes | Implemented; full-content audit pending |
| Ranger | Yes | Yes | Implemented; full-content audit pending |
| Rogue | Yes | Yes | Implemented; full-content audit pending |
| Sorcerer | Yes | Yes | Implemented; full-content audit pending |
| Warlock | Yes | Yes | Implemented; progression/subclass audit pending |
| Wizard | Yes | Yes | Implemented; full-content audit pending |

**Important:** class presence does not mean the class is complete. A class is only complete when its level 1–20 mechanics, legal subclass choices, spellcasting/resource progression, prerequisites, equipment interactions, and validation coverage are complete for that ruleset.

## Content categories

| Category | 2014 | 2024 | Gate for COMPLETE |
|---|---|---|---|
| Classes | Present | Present | 1–20 mechanical validation |
| Subclasses | Partial | Partial | Every applicable SRD subclass + gating |
| Species/Races | Partial | Partial | Every applicable SRD option + traits |
| Backgrounds | Partial | Present/partial | Every applicable SRD background + origin mechanics |
| Feats | Partial | Partial | Every applicable SRD feat + prerequisites/effects |
| Spells | Partial | Partial | Complete SRD spell catalog + class lists + level rules |
| Weapons | Partial | Partial | Complete SRD equipment inventory + properties |
| Armor | Partial | Partial | Complete inventory + AC rules |
| Adventuring Gear | Partial | Partial | Complete applicable inventory |
| Tools | Partial | Partial | Complete applicable inventory |
| Equipment Packs | Partial | Partial | Complete applicable packages |
| Magic Items | Partial | Partial | Complete applicable SRD magic-item catalog + mechanics |
| Rules glossary/mechanics | Partial | Partial | All generator-relevant mechanics encoded/tested |

## Completion rules

A record cannot be marked `RAW` merely because its name exists. It must have:

- explicit ruleset identity;
- source/provenance;
- complete mechanical data required by the generator;
- prerequisite and level gating where applicable;
- validation coverage;
- no Homebrew mutation path;
- no accidental cross-ruleset dependency.

If an official SRD option is not yet encoded, CharacterForge must report it as unavailable rather than fabricate it.

## Current priority order

1. Finish the 12-class 2014/2024 mechanical audit.
2. Finish subclass coverage and subclass-specific level progression.
3. Build the complete feat catalog with prerequisites and effects.
4. Build the complete spell catalog and class spell-list relationships.
5. Complete weapons, armor, gear, tools, packs, and magic items.
6. Expand species/race and background coverage to the exact applicable SRD boundary.
7. Add automated inventory-count and provenance gates so missing records fail CI.
8. Run 1–20 generation matrices across both rulesets.
9. Run browser/PDF regression tests for representative characters from every class.

Only after those gates pass may the product claim that its built-in RAW catalog is complete.
