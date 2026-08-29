const normalize = value => String(value ?? "").trim().toLowerCase();

export function uniqueStrings(values) {
  try {
    const seen = new Set();
    return values.filter(value => {
      const key = normalize(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) { console.error("[duplicates] uniqueStrings failed", error); throw error; }
}

export function uniqueBy(items, keyFn) {
  try {
    const seen = new Set();
    return items.filter(item => {
      const key = normalize(keyFn(item));
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) { console.error("[duplicates] uniqueBy failed", error); throw error; }
}

export function duplicateValues(items, keyFn = value => value) {
  try {
    const seen = new Set(), duplicates = new Set();
    for (const item of items) {
      const key = normalize(keyFn(item));
      if (!key) continue;
      if (seen.has(key)) duplicates.add(key);
      seen.add(key);
    }
    return [...duplicates];
  } catch (error) { console.error("[duplicates] duplicateValues failed", error); throw error; }
}

export function consolidateInventory(items) {
  try {
    const inventory = new Map();
    for (const raw of items.filter(Boolean)) {
      const parsed = parseQuantity(raw), key = normalizeBase(parsed.name);
      const current = inventory.get(key);
      if (current) current.quantity += parsed.quantity;
      else inventory.set(key, { name:parsed.name, quantity:parsed.quantity });
    }
    return [...inventory.values()];
  } catch (error) { console.error("[duplicates] consolidateInventory failed", error); throw error; }
}

function parseQuantity(value) {
  const text = String(value).trim();
  if (/^\d+\s+(?:CP|SP|EP|GP|PP)$/i.test(text)) return { quantity:1, name:text };
  const prefix = text.match(/^(\d+)\s+(.+)$/);
  if (prefix) return { quantity:Number(prefix[1]), name:prefix[2].trim() };
  const suffix = text.match(/^(.+?)\s+x(\d+)$/i);
  if (suffix) return { quantity:Number(suffix[2]), name:suffix[1].trim() };
  return { quantity:1, name:text };
}

function normalizeBase(value) {
  const key = normalize(value);
  return key.endsWith("s") && !key.endsWith("ss") ? key.slice(0,-1) : key;
}
