/**
 * Deeply freezes a RAW rules catalog so no nested record can be edited at runtime.
 *
 * RAW is an authoritative rules source. Homebrew may copy/extend RAW data, but
 * it must never mutate the source catalog in place.
 */
export function deepFreeze(value) {
  try {
    if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
    for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
    return Object.freeze(value);
  } catch (error) {
    console.error("[deep-freeze] failed to freeze rules data", error);
    throw error;
  }
}
