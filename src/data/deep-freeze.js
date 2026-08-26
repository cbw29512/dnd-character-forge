/**
 * Deep-freezes authoritative RAW data, including nested records and arrays.
 * Homebrew may copy or extend RAW data, but must never mutate RAW in place.
 */
export function deepFreeze(value) {
  try {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
    return Object.freeze(value);
  } catch (error) {
    console.error("[deep-freeze] failed to freeze RAW data", error);
    throw error;
  }
}
