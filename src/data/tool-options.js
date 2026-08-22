// Shared SRD tool option catalogs. Keep ruleset-specific availability explicit at call sites.
// SRD 5.2.1 lists 17 Artisan's Tools and 10 Musical Instrument variants.

export const ARTISAN_TOOLS=Object.freeze([
  "Alchemist's Supplies",
  "Brewer's Supplies",
  "Calligrapher's Supplies",
  "Carpenter's Tools",
  "Cartographer's Tools",
  "Cobbler's Tools",
  "Cook's Utensils",
  "Glassblower's Tools",
  "Jeweler's Tools",
  "Leatherworker's Tools",
  "Mason's Tools",
  "Painter's Supplies",
  "Potter's Tools",
  "Smith's Tools",
  "Tinker's Tools",
  "Weaver's Tools",
  "Woodcarver's Tools"
]);

export const MUSICAL_INSTRUMENTS=Object.freeze([
  "Bagpipes",
  "Drum",
  "Dulcimer",
  "Flute",
  "Horn",
  "Lute",
  "Lyre",
  "Pan Flute",
  "Shawm",
  "Viol"
]);

export const MONK_TOOL_CHOICES=Object.freeze([...ARTISAN_TOOLS,...MUSICAL_INSTRUMENTS]);
