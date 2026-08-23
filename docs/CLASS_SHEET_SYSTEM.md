# Character Forge — Premium Class Sheet System

## Product rule

Every generated sheet must be recognizable as a fifth-edition character sheet at a glance while looking like a premium class-specific artifact. Presentation may change; validated mechanics may not.

## Immutable information architecture

Page 1 keeps these familiar anchors in stable locations: identity, six abilities, saving throws, skills, AC, initiative, speed, HP, hit dice, death saves, attacks, equipment, proficiencies/languages, features/traits, and passive Perception. Caster Page 2 keeps spellcasting ability, spell save DC, spell attack bonus, levels 0–9, slot tracking, sourced rules, and audit proof.

## Presentation schema

`sheetCustomization` is presentation-only and contains:

- style: ornate | classic | minimal
- paper: ivory | parchment | white
- ornament: rich | balanced | minimal
- frame: class | filigree | clean
- printMode: premium | ink-saver
- portraitVisible: boolean
- portraitX / portraitY: 0–100 focal point
- portraitZoom: 100–165
- portraitFilter: natural | painted | grayscale

No presentation field may alter ability scores, AC, HP, attacks, saves, skills, proficiency, features, spell legality, slots, equipment legality, or audit state.

## Core class art direction

| Class | Visual language | Signature utility emphasis |
| --- | --- | --- |
| Barbarian | bone, iron, carved runes, crossed axes, rough hide geometry | Rage uses/damage, Reckless Attack, resistances, brutal/primal features |
| Bard | velvet, brass, lyrical flourishes, strings, stars, performance marks | Bardic Inspiration, expertise, magical secrets / spell resources |
| Cleric | ivory, gold, radiant geometry, halo/sun motifs, sacred manuscript structure | Channel Divinity, Divine Spark/Turn Undead, prepared/always-prepared spells |
| Druid | bark, leaf, antler, moon, natural knotwork | Wild Shape/Wild Companion, primal spellcasting, subclass form resources |
| Fighter | steel, heraldry, shields, crossed weapons, disciplined geometry | Second Wind, Action Surge, Indomitable, attacks/action, Weapon Mastery |
| Monk | ink, stone, open-hand circles, disciplined brush geometry | Focus resource, Martial Arts die, movement, deflection/stunning tools |
| Paladin | silver, gold, radiant sword, oath heraldry, shield motifs | Lay on Hands, Channel Divinity, aura, smite/spell resources |
| Ranger | leather, greenwood, compass marks, arrow/leaf motifs | mark/quarry support, Weapon Mastery, primal spells, exploration tools |
| Rogue | charcoal, teal, lockwork, dagger/key motifs, heist-map lines | Sneak Attack, Cunning Action, Cunning Strike, expertise, thief resources |
| Sorcerer | violet, crystal, living flame, aether fractures | Sorcery Points, Metamagic, innate spell resources |
| Warlock | obsidian, violet, pact sigils, eye/crescent motifs | Pact Magic slots, invocations, pact boon/resource identity |
| Wizard | midnight blue, ink, spellbook, star maps, arcane circles | spellbook count, prepared spells, Arcane Recovery, rituals, Mastery/Signature Spells |

## Portrait contract

The user may upload JPEG, PNG, or WebP source art. Character Forge normalizes it locally and stores a compressed JPEG data URL. The original file is never required for export. The user may hide the portrait, move the focal point, zoom, and apply a print finish. If the portrait is hidden or absent, original Character Forge class art is used.

Portrait presentation must never change page count or cover rules content.

## Class utility module contract

A class utility panel is intentionally compact: four high-value stats plus one concise rules-facing note. It is not a replacement for sourced Features & Traits.

Current implemented utilities:

- Fighter: Second Wind, Action Surge, Indomitable, attacks/action, mastery or crit note.
- Wizard: spellbook count, prepared count, Arcane Recovery capacity, ritual access, Mastery/Signature note.
- Cleric: Channel Divinity, Divine Spark, prepared and always-prepared counts, holy focus/order note.
- Rogue: existing dedicated Sneak Attack / Cunning Strike resource block remains the class utility surface.

Future classes must receive utility models only when their RAW generator state exists. Never invent mechanics for a presentation-only theme.

## Print modes

### Premium color

Class palette, subtle paper texture, watermark sigil, decorative title ribbon, class-specific header geometry, framed portrait, and restrained ornamentation.

### Ink saver

White paper, grayscale portrait, no watermark, no ribbon, minimal fills, strong black borders, preserved hierarchy.

## Definition of Done

A sheet theme is production-ready only when:

1. Normal rules/site regression suite passes.
2. Presentation schema tests pass.
3. Exact US Letter page count passes in headless Chrome.
4. PDF text extraction contains character name, every printed attack, every equipment item, every sourced rule, every generated spell, and class utility title where applicable.
5. RAW integrity marker survives export.
6. Visual artifact review shows no clipping, overlap, unreadable text, or decorative obstruction.
7. Extreme presentation settings (ornate, minimal, ink-saver, portrait focal extremes) do not change the rules model.

## Research anchors

- Wizards/D&D Beyond official character-sheet resources and the 2014 fillable three-page sheet establish the familiar information architecture.
- Current D&D Beyond class descriptions establish class identity: Barbarian primal Rage; Fighter mastery of arms and armor; Rogue stealth/subterfuge and precise strikes; Cleric divine power and Channel Divinity; Wizard scholarly spellbook-based arcane power; analogous official class descriptions guide the remaining core-class visual identities.
- Character Forge uses original art, borders, ornament, sigils, and layout implementation. Do not copy official logos, trademarks, or copyrighted ornamental artwork.
