/**
 * Deep-freezes authoritative RAW data, including nested records and arrays.
 *
 * Important: an object may already be shallow-frozen while still containing
 * mutable nested arrays/objects. Therefore we recurse BEFORE the final freeze
 * instead of returning early for Object.isFrozen(value).
 */
export function deepFreeze(value) {
  try {
    if (value === null || typeof value !== "object") return value;
    for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
    return Object.freeze(value);
  } catch (error) {
    console.error("[deep-freeze] failed to freeze RAW data", error);
    throw error;
  }
}
